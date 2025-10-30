import { promises as fs } from 'fs'
import { join } from 'path'
import Parser from 'rss-parser'

// Fisher-Yates 洗牌算法：随机打乱数组顺序
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

async function loadFriendsData() {
  // 读取友联数据配置文件
  const dataPath = join(process.cwd(), 'content', 'friends.json')
  const fileContent = await fs.readFile(dataPath, 'utf-8')
  return JSON.parse(fileContent)
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const urlQuery = query.url

  // 无 url 参数：返回所有友联的基础信息
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

  const friendsData = await loadFriendsData()
  const target = friendsData.find(m => m.url === urlQuery)

  if (!target) {
    return { results: [] }
  }

  // 无 RSS：只返回基础信息
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
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    timeout: 10000,
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

    // RSS 为空的情况
    if (!feed.items || feed.items.length === 0) {
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

    // 提取前5篇文章
    const items = feed.items.slice(0, 5)
      .filter(item => item.title && item.link)
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

    return { results: [siteData] }

  } catch (error) {
    // RSS 解析失败，返回错误信息但保留基础数据
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
