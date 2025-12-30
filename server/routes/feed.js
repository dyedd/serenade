import dayjs from 'dayjs'
import fg from 'fast-glob'
import fs from 'fs-extra'
import matter from 'gray-matter'
import RSS from 'rss'
import { siteConfig } from '../../site.config'
import { parseAsset, normalizeTags } from '../utils.js'

const resolveSiteBaseUrl = () => {
  const rawUrl = siteConfig.url

  if (typeof rawUrl === 'string') {
    const normalized = rawUrl.trim().replace(/\/$/, '')

    if (normalized) {
      return normalized
    } else {
      throw createError({ statusCode: 500, statusMessage: 'siteConfig.url is required' })
    }
  } else {
    throw createError({ statusCode: 500, statusMessage: 'siteConfig.url is required' })
  }
}

const joinUrl = (baseUrl, urlPath) =>
  /^https?:\/\//.test(urlPath) ? urlPath : `${baseUrl}/${urlPath.replace(/^\//, '')}`

const extractPostSlug = (filePath) => {
  const slug = filePath.match(/content\/posts\/([^\/]+)\//)?.[1]

  if (slug) {
    return slug
  } else {
    throw createError({ statusCode: 500, statusMessage: `Invalid post path: ${filePath}` })
  }
}

export default defineEventHandler(async (event) => {
  const files = await fg('content/posts/*/*.md')

  if (!files.length) {
    throw createError({ statusCode: 404, statusMessage: 'No posts found' })
  } else {
    const processedFiles = await Promise.all(
      files.map(async (file) => {
        const raw = await fs.readFile(file, 'utf-8')
        const { data } = matter(raw)
        const stats = await fs.stat(file)

        return {
          path: extractPostSlug(file),
          title: data.title,
          date: data.date,
          mtime: stats.mtime,
          cover: data.cover,
          abstract: data.abstract,
          tags: normalizeTags(data.tags)
        }
      })
    )

    const posts = processedFiles
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10)

    const latestPost = posts[0]

    if (!latestPost) {
      throw createError({ statusCode: 500, statusMessage: 'No posts available' })
    } else {
      const lastModified = latestPost.mtime.toUTCString()
      const etag = `"feed-${latestPost.mtime.getTime()}"`
      const ifModifiedSince = getRequestHeader(event, 'if-modified-since')
      const ifNoneMatch = getRequestHeader(event, 'if-none-match')
      const isNotModified =
        ifNoneMatch === etag ||
        (ifModifiedSince && new Date(ifModifiedSince) >= new Date(lastModified))

      if (isNotModified) {
        setResponseStatus(event, 304)
        setResponseHeaders(event, { 'Last-Modified': lastModified, 'ETag': etag })
        return null
      } else {
        const baseUrl = resolveSiteBaseUrl()
        const feed = new RSS({
          title: siteConfig.title,
          description: siteConfig.description,
          feed_url: joinUrl(baseUrl, '/feed'),
          site_url: baseUrl,
          language: siteConfig.lang || 'zh-CN',
          copyright: `? ${new Date().getFullYear()} ${siteConfig.author}`,
          managingEditor: siteConfig.email,
          webMaster: siteConfig.email,
          pubDate: latestPost.date,
          ttl: 60
        })

        posts.forEach((post) => {
          feed.item({
            title: post.title,
            description: post.abstract ?? '',
            url: joinUrl(baseUrl, `/posts/${post.path}`),
            date: dayjs(post.date).toISOString(),
            guid: `post-${post.path}`,
            categories: post.tags,
            author: siteConfig.author,
            enclosure: post.cover
              ? { url: joinUrl(baseUrl, parseAsset(post.path, post.cover, 'posts')) }
              : undefined
          })
        })

        setResponseHeaders(event, {
          'Content-Type': 'application/xml; charset=utf-8',
          'Last-Modified': lastModified,
          'ETag': etag
        })

        return feed.xml({ indent: true })
      }
    }
  }
})
