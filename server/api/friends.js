import { promises as fs } from 'fs'
import { join } from 'path'
import Parser from 'rss-parser'

const shuffle = (items) => {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[items[i], items[j]] = [items[j], items[i]]
  }

  return items
}

const loadFriendsData = async () => {
  const dataPath = join(process.cwd(), 'content', 'friends.json')
  const fileContent = await fs.readFile(dataPath, 'utf-8')

  try {
    return JSON.parse(fileContent)
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw createError({
        statusCode: 500,
        statusMessage: '友链数据解析失败'
      })
    } else {
      throw error
    }
  }
}

const buildBaseInfo = (friend) => ({
  siteName: friend.name,
  siteUrl: friend.url,
  siteLogo: friend.logo,
  description: friend.description,
  articles: [],
  hasRSS: Boolean(friend.rss)
})

const buildSiteResult = (friend, overrides) => ({
  siteName: friend.name,
  siteUrl: friend.url,
  siteLogo: friend.logo,
  articles: [],
  hasRSS: Boolean(friend.rss),
  ...overrides
})

const normalizeFeedItems = (items) => {
  const limitedItems = items.slice(0, 5)
  const validItems = limitedItems.filter((item) => item.title && item.link)

  return validItems.map((item) => {
    const title =
      typeof item.title === 'string' && item.title.length > 0
        ? item.title
        : '未知标题'
    const link =
      typeof item.link === 'string' && item.link.length > 0
        ? item.link
        : '#'
    const pubDate =
      typeof item.pubDate === 'string' && item.pubDate.length > 0
        ? item.pubDate
        : new Date().toISOString()
    const description =
      typeof item.description === 'string' && item.description.length > 0
        ? item.description
        : ''

    return {
      title,
      link,
      pubDate,
      description
    }
  })
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const urlQuery = query.url

  if (!urlQuery) {
    const friendsData = await loadFriendsData()
    const baseInfo = friendsData.map((friend) => buildBaseInfo(friend))

    return { results: shuffle(baseInfo) }
  } else {
    const friendsData = await loadFriendsData()
    const target = friendsData.find((friend) => friend.url === urlQuery)

    if (!target) {
      return { results: [] }
    } else {
      if (!target.rss) {
        return {
          results: [
            buildSiteResult(target, {
              hasRSS: false
            })
          ]
        }
      } else {
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
          const items = Array.isArray(feed.items) ? feed.items : []

          if (items.length === 0) {
            return {
              results: [
                buildSiteResult(target, {
                  hasRSS: true,
                  isEmpty: true
                })
              ]
            }
          } else {
            const normalizedItems = normalizeFeedItems(items)

            return {
              results: [
                buildSiteResult(target, {
                  articles: normalizedItems,
                  hasRSS: true
                })
              ]
            }
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '未知错误'

          return {
            results: [
              buildSiteResult(target, {
                hasRSS: true,
                error: true,
                errorMessage
              })
            ]
          }
        }
      }
    }
  }
})
