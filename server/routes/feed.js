import dayjs from 'dayjs'
import fg from 'fast-glob'
import fs from 'fs-extra'
import matter from 'gray-matter'
import RSS from 'rss'
import { siteConfig } from '../../site.config'
import { parseAsset } from '../utils.js'

function resolveSiteBaseUrl() {
  const rawUrl = siteConfig.url

  if (typeof rawUrl === 'string') {
    const trimmedUrl = rawUrl.trim()

    if (trimmedUrl !== '') {
      let normalizedUrl = null
      if (trimmedUrl.endsWith('/')) {
        normalizedUrl = trimmedUrl.slice(0, -1)
      } else {
        normalizedUrl = trimmedUrl
      }

      return normalizedUrl
    } else {
      throw createError({ statusCode: 500, statusMessage: 'siteConfig.url is required' })
    }
  } else {
    throw createError({ statusCode: 500, statusMessage: 'siteConfig.url is required' })
  }
}

function joinUrl(baseUrl, path) {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  } else if (path.startsWith('/')) {
    return `${baseUrl}${path}`
  } else {
    return `${baseUrl}/${path}`
  }
}

function normalizeTags(rawTags) {
  if (Array.isArray(rawTags)) {
    return rawTags
  } else if (rawTags) {
    return [rawTags]
  } else {
    return []
  }
}

function extractPostSlug(filePath) {
  const match = filePath.match(/content\/posts\/([^\/]+)\//)
  let slug = null
  if (match) {
    slug = match[1]
  } else {
    slug = null
  }

  if (slug) {
    return slug
  } else {
    throw createError({ statusCode: 500, statusMessage: `Invalid post path: ${filePath}` })
  }
}

function setNotModifiedResponse(event, lastModified, etag) {
  setResponseStatus(event, 304)
  setResponseHeaders(event, {
    'Last-Modified': lastModified,
    'ETag': etag,
  })
}

function resolveLatestPost(posts) {
  const latestPost = posts[0]

  if (latestPost) {
    return latestPost
  } else {
    throw createError({ statusCode: 500, statusMessage: 'No posts available' })
  }
}

export default defineEventHandler(async (event) => {
  const files = await fg('content/posts/*/*.md')

  if (files.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'No posts found' })
  } else {
    const processedFiles = await Promise.all(
      files.map(async (file) => {
        const slug = extractPostSlug(file)
        const raw = await fs.readFile(file, 'utf-8')
        const { data: metaData } = matter(raw)
        const stats = await fs.stat(file)

        return {
          path: slug,
          title: metaData.title,
          date: metaData.date,
          mtime: stats.mtime,
          cover: metaData.cover,
          abstract: metaData.abstract,
          tags: normalizeTags(metaData.tags),
        }
      })
    )

    processedFiles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const posts = processedFiles.slice(0, 10)
    const latestPost = resolveLatestPost(posts)

    const lastModified = latestPost.mtime.toUTCString()
    const etag = `"feed-${latestPost.mtime.getTime()}"`

    const ifModifiedSince = getRequestHeader(event, 'if-modified-since')
    let isNotModifiedSince = false
    if (ifModifiedSince && new Date(ifModifiedSince) >= new Date(lastModified)) {
      isNotModifiedSince = true
    } else {
      isNotModifiedSince = false
    }
    const ifNoneMatch = getRequestHeader(event, 'if-none-match')
    let isNotModifiedByEtag = false
    if (ifNoneMatch === etag) {
      isNotModifiedByEtag = true
    } else {
      isNotModifiedByEtag = false
    }

    if (isNotModifiedSince) {
      setNotModifiedResponse(event, lastModified, etag)
      return null
    } else if (isNotModifiedByEtag) {
      setNotModifiedResponse(event, lastModified, etag)
      return null
    } else {
      const baseUrl = resolveSiteBaseUrl()

      let language = 'zh-CN'
      if (siteConfig.lang) {
        language = siteConfig.lang
      } else {
        language = 'zh-CN'
      }

      const feed = new RSS({
        title: siteConfig.title,
        description: siteConfig.description,
        feed_url: joinUrl(baseUrl, '/feed'),
        site_url: baseUrl,
        language,
        copyright: `? ${new Date().getFullYear()} ${siteConfig.author}`,
        managingEditor: siteConfig.email,
        webMaster: siteConfig.email,
        pubDate: latestPost.date,
        ttl: 60,
      })

      posts.forEach((post) => {
        const postUrl = joinUrl(baseUrl, `/posts/${post.path}`)

        let description = ''
        if (post.abstract) {
          description = post.abstract
        } else {
          description = ''
        }

        let enclosure = undefined
        if (post.cover) {
          const coverPath = parseAsset(post.path, post.cover, 'posts')
          const coverUrl = joinUrl(baseUrl, coverPath)
          enclosure = { url: coverUrl }
        } else {
          enclosure = undefined
        }

        feed.item({
          title: post.title,
          description,
          url: postUrl,
          date: dayjs(post.date).toISOString(),
          guid: `post-${post.path}`,
          enclosure,
          categories: post.tags,
          author: siteConfig.author,
        })
      })

      setResponseHeaders(event, {
        'Content-Type': 'application/xml; charset=utf-8',
        'Last-Modified': lastModified,
        'ETag': etag,
      })

      return feed.xml({ indent: true })
    }
  }
})
