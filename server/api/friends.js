import { promises as fs } from 'fs';
import { join } from 'path';
import Parser from 'rss-parser';

// Fisher-Yates 洗牌算法
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 读取友联数据文件
async function loadFriendsData() {
    const dataPath = join(process.cwd(), 'content', 'friends.json')
    const fileContent = await fs.readFile(dataPath, 'utf-8')
    return JSON.parse(fileContent)
}

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const urlQuery = query.url

    // 无 url 参数：返回基础信息
    if (!urlQuery) {
        const friendsData = await loadFriendsData()
        const baseInfo = friendsData.map(moment => ({
            siteName: moment.name,
            siteUrl: moment.url,
            siteLogo: moment.logo,
            description: moment.description,
            articles: [],
            hasRSS: !!moment.rss
        }))

        return { results: shuffle(baseInfo) }
    }

    // 有 url 参数
    const friendsData = await loadFriendsData()
    const target = friendsData.find(m => m.url === urlQuery)

    // 如果站点不存在
    if (!target) {
        console.warn(`Site not found: ${urlQuery}`)
        return { results: [] }
    }

    // 如果没有设置 rss，返回基础信息（表示没有RSS）
    if (!target.rss) {
        const siteData = {
            siteName: target.name,
            siteUrl: target.url,
            siteLogo: target.logo,
            articles: [],
            hasRSS: false
        }
        return { results: [siteData] }
    }

    const parser = new Parser({
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0'
        },
        timeout: 10000, // 10秒超时
        customFields: {
            item: [
                ['title', 'title'],
                ['link', 'link'],
                ['pubDate', 'pubDate'],
                ['description', 'description']
            ]
        }
    })

    try {
        const feed = await parser.parseURL(target.rss)

        // 验证RSS数据
        if (!feed.items || feed.items.length === 0) {
            console.warn(`No items found in RSS feed for ${urlQuery}`)
            const siteData = {
                siteName: target.name,
                siteUrl: target.url,
                siteLogo: target.logo,
                articles: [],
                hasRSS: true,
                isEmpty: true
            }
            return { results: [siteData] }
        }

        // 获取前5篇文章
        const items = feed.items.slice(0, 5)
            .filter(item => item.title && item.link) // 过滤无效数据
            .map(item => ({
                title: item.title || '未知标题',
                link: item.link || '#',
                pubDate: item.pubDate || new Date().toISOString(),
                description: item.description || ''
            }))

        const siteData = {
            siteName: target.name,
            siteUrl: target.url,
            siteLogo: target.logo,
            articles: items,
            hasRSS: true
        }

        return {
            results: [siteData]
        }

    } catch (error) {
        console.error(`Error fetching RSS feed for ${urlQuery}:`, error.message)

        // 返回错误信息，但仍然返回站点基础信息
        const errorSiteData = {
            siteName: target.name,
            siteUrl: target.url,
            siteLogo: target.logo,
            articles: [],
            hasRSS: true,
            error: true,
            errorMessage: error.message
        }

        return { results: [errorSiteData] }
    }
})
