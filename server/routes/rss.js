import { siteConfig } from '@/site.config'
import dayjs from 'dayjs'
import fg from 'fast-glob'
import fs from 'fs-extra'
import matter from 'gray-matter'
import RSS from 'rss'

export default defineEventHandler(async (event) => {
    // 读取所有 Markdown 文件
    const files = await fg('content/posts/*/*.md')
    if (files.length === 0) {
        throw createError({ statusCode: 404, statusMessage: 'Article not found' })
    }

    // 处理文件，提取元数据
    const processedFiles = await Promise.all(files.map(async (i) => {
        const raw = await fs.readFile(i, 'utf-8')
        const { data: metaData } = matter(raw)
        const tags = typeof metaData.tags === 'string' ? [metaData.tags] : metaData.tags
        return {
            path: i.match(/content\/posts\/([^\/]+)\//)?.[1],
            title: metaData.title,
            date: metaData.date,
            formattedDate: dayjs(metaData.date).format('MMMM D, YYYY'),
            cover: metaData.cover,
            abstract: metaData.abstract,
            tags: tags,
        }
    }))

    // 按日期排序并获取最新的10篇文章
    processedFiles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const posts = processedFiles.slice(0, 10)


    const feed = new RSS({
        title: siteConfig.title,
        feed_url: `${event.node.req.headers.host}/rss`,
        site_url: `${event.node.req.headers.host}`,
    })


    posts.forEach((post) => {
        feed.item({
            title: post.title,
            description: post.abstract,
            url: `${event.node.req.headers.host}/post/${post.path}`,
            date: dayjs(post.date).toISOString(),
            enclosure: { url: post.cover },
        })
    })

    event.node.res.setHeader('Content-Type', 'application/xml')
    return feed.xml({ indent: true })
})
