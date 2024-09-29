import Parser from 'rss-parser'
import { siteConfig } from '@/site.config'

// todo：有些站点请求太慢了，看看能不能让友链先显示，然后再异步加载



export default defineEventHandler(async (event) => {
    const parser = new Parser({
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0'
        },
    })

    const fetchFeeds = siteConfig.moments.map(async (moment) => {
        try {
            const feed = await parser.parseURL(moment.rss)
            const items = feed.items.slice(0, 5).map(item => ({
                title: item.title,
                link: item.link,
                pubDate: item.pubDate,
                // author: item.author,
                // contentSnippet: item.contentSnippet,
            }))
            return {
                siteName: moment.name,
                siteUrl: moment.url,
                siteLogo: moment.logo,
                articles: items
            }
        } catch (error) {
            console.error(`Error fetching RSS feed for ${moment.name}: ${error.message}`)
            return null
        }
    })

    const results = (await Promise.all(fetchFeeds)).filter(result => result !== null)

    return {
        results
    }
})
