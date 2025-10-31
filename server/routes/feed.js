import { siteConfig } from '@/site.config'
import dayjs from 'dayjs'
import fg from 'fast-glob'
import fs from 'fs-extra'
import matter from 'gray-matter'
import RSS from 'rss'
import crypto from 'crypto'

export default defineEventHandler(async (event) => {
  const files = await fg('content/posts/*/*.md')
  if (files.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  const processedFiles = await Promise.all(files.map(async (file) => {
    const raw = await fs.readFile(file, 'utf-8')
    const { data: metaData } = matter(raw)
    const stats = await fs.stat(file)
    return {
      // 提取文章路径：content/posts/[文章名]/
      path: file.match(/content\/posts\/([^\/]+)\//)?.[1],
      title: metaData.title,
      date: metaData.date,
      mtime: stats.mtime, // 文件修改时间
      formattedDate: dayjs(metaData.date).format('MMMM D, YYYY'),
      cover: metaData.cover,
      abstract: metaData.abstract,
      tags: typeof metaData.tags === 'string' ? [metaData.tags] : metaData.tags,
    }
  }))

  // 按日期降序排序，取最新的10篇文章
  processedFiles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const posts = processedFiles.slice(0, 10)

  // 获取最新文章的时间戳，用于 Last-Modified
  const latestPost = posts[0]
  const lastModified = latestPost ? latestPost.mtime.toUTCString() : new Date().toUTCString()

  // 检查是否有 If-Modified-Since 头（支持条件请求）
  const ifModifiedSince = event.node.req.headers['if-modified-since']
  if (ifModifiedSince && new Date(ifModifiedSince) >= new Date(lastModified)) {
    event.node.res.statusCode = 304 // Not Modified
    event.node.res.setHeader('Last-Modified', lastModified)
    event.node.res.setHeader('Cache-Control', 'public, max-age=300') // 5分钟
    return ''
  }

  // 计算 ETag（基于最新文章时间戳）
  const etag = `"feed-${latestPost ? latestPost.mtime.getTime() : Date.now()}"`

  const protocol = event.node.req.headers.host?.includes('localhost') ? 'http' : 'https'
  const host = event.node.req.headers.host

  const feed = new RSS({
    title: siteConfig.title,
    description: siteConfig.description,
    feed_url: `${protocol}://${host}/feed`,
    site_url: `${protocol}://${host}`,
    language: 'zh-CN',
    copyright: `© ${new Date().getFullYear()} ${siteConfig.author}`,
    managingEditor: siteConfig.email,
    webMaster: siteConfig.email,
    pubDate: latestPost ? latestPost.date : new Date(),
    ttl: 60, // 推荐60分钟更新一次
  })

  posts.forEach((post, index) => {
    feed.item({
      title: post.title,
      description: post.abstract,
      url: `${protocol}://${host}/posts/${post.path}`,
      date: dayjs(post.date).toISOString(),
      guid: `post-${post.path}`, // 文章唯一标识符
      enclosure: post.cover ? { url: post.cover } : undefined,
      categories: post.tags || [],
      author: siteConfig.author,
    })
  })

  // 设置响应头
  event.node.res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  event.node.res.setHeader('Last-Modified', lastModified)
  event.node.res.setHeader('ETag', etag)
  event.node.res.setHeader('Cache-Control', 'public, max-age=300') // 5分钟缓存

  return feed.xml({ indent: true })
})
