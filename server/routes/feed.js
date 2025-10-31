import { siteConfig } from '@/site.config'
import dayjs from 'dayjs'
import fg from 'fast-glob'
import fs from 'fs-extra'
import matter from 'gray-matter'
import RSS from 'rss'

export default defineEventHandler(async (event) => {
  const files = await fg('content/posts/*/*.md')
  if (files.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  const processedFiles = await Promise.all(files.map(async (file) => {
    const raw = await fs.readFile(file, 'utf-8')
    const { data: metaData } = matter(raw)
    return {
      // 提取文章路径：content/posts/[文章名]/
      path: file.match(/content\/posts\/([^\/]+)\//)?.[1],
      title: metaData.title,
      date: metaData.date,
      formattedDate: dayjs(metaData.date).format('MMMM D, YYYY'),
      cover: metaData.cover,
      abstract: metaData.abstract,
      tags: typeof metaData.tags === 'string' ? [metaData.tags] : metaData.tags,
    }
  }))

  // 按日期降序排序，取最新的10篇文章
  processedFiles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const posts = processedFiles.slice(0, 10)

  const feed = new RSS({
    title: siteConfig.title,
    feed_url: `https://${event.node.req.headers.host}/feed`,
    site_url: `https://${event.node.req.headers.host}`,
  })

  posts.forEach((post) => {
    feed.item({
      title: post.title,
      description: post.abstract,
      url: `https://${event.node.req.headers.host}/posts/${post.path}`,
      date: dayjs(post.date).toISOString(),
      enclosure: { url: post.cover },
    })
  })

  event.node.res.setHeader('Content-Type', 'application/xml')
  return feed.xml({ indent: true })
})
