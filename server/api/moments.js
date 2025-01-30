import { siteConfig } from '@/site.config';
import Parser from 'rss-parser';

// Fisher-Yates 洗牌算法
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 内存缓存与过期时间
let cacheData = { baseResults: [], articleMap: {} }
let lastCacheTime = 0
const CACHE_DURATION = 10 * 60 * 1000

export default defineEventHandler(async (event) => {
    const now = Date.now()
    const isCacheValid = now - lastCacheTime < CACHE_DURATION
    const query = getQuery(event)
    const urlQuery = query.url

    // 无 url 参数：返回基础信息
    if (!urlQuery) {
        // 若缓存有效则直接返回
        if (isCacheValid && cacheData.baseResults?.length) {
            return { results: cacheData.baseResults }
        }
        const baseInfo = siteConfig.moments.map(moment => ({
            siteName: moment.name,
            siteUrl: moment.url,
            siteLogo: moment.logo,
            description: moment.description,
            articles: []
        }))
        cacheData.baseResults = shuffle(baseInfo)
        lastCacheTime = now
        return { results: cacheData.baseResults }
    }

    // 有 url 参数：请求指定站点
    if (isCacheValid && cacheData.articleMap[urlQuery]) {
        return { results: [cacheData.articleMap[urlQuery]] }
    }

    const target = siteConfig.moments.find(m => m.url === urlQuery)
    // 如果没有设置 rss 或为空,直接跳过
    if (!target || !target.rss) {
        return { results: [] }
    }

    const parser = new Parser({
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0'
        },
    })

    try {
        const feed = await parser.parseURL(target.rss)
        // 获取前5篇文章
        const items = feed.items.slice(0, 5).map(item => ({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
        }))
        const siteData = {
            siteName: target.name,
            siteUrl: target.url,
            siteLogo: target.logo,
            articles: items
        }
        cacheData.articleMap[urlQuery] = siteData
        lastCacheTime = now
        return {
            results: [siteData]
        }
    } catch (error) {
        console.error('Error fetching RSS feed:', error)
        return { results: [] }
    }
})
