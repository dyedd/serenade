import fg from 'fast-glob'
import {
  calculateReadingTime,
  formatDate,
  normalizeTags,
  parseAsset,
  paginate,
  parsePagination,
  processMarkdownFiles,
  sortByDateDesc
} from '../../utils.js'

const createEmptyResponse = (page, pageSize) => {
  return {
    page,
    pageSize,
    totalPages: 0,
    totalItems: 0,
    data: []
  }
}

const cacheTtlMs = 30000
let cachedPosts = []
let cachedAt = 0
let hasCache = false

const isCacheFresh = () => {
  if (!hasCache) {
    return false
  } else {
    return Date.now() - cachedAt < cacheTtlMs
  }
}

const decodeTagName = (rawTagName) => {
  const hasEncodedChars = rawTagName.includes('%')

  if (hasEncodedChars) {
    try {
      return decodeURIComponent(rawTagName)
    } catch (error) {
      if (error instanceof URIError) {
        return rawTagName
      } else {
        throw error
      }
    }
  } else {
    return rawTagName
  }
}

const getTagName = (event) => {
  const { path } = event.context?.params ?? {}

  if (typeof path === 'string') {
    const trimmed = path.trim()

    if (trimmed.length > 0) {
      return decodeTagName(trimmed)
    } else {
      return ''
    }
  } else {
    return ''
  }
}

const normalizeFilePath = (filePath) => {
  if (typeof filePath === 'string') {
    return filePath.replace(/\\/g, '/')
  } else {
    return ''
  }
}

const extractPostSlug = (filePath) => {
  const normalizedPath = normalizeFilePath(filePath)
  const match = normalizedPath.match(/content\/posts\/([^/]+)\//)

  if (match && match[1]) {
    return match[1]
  } else {
    const segments = normalizedPath.split('/')
    const lastSegment = segments[segments.length - 1]

    if (typeof lastSegment === 'string') {
      return lastSegment
    } else {
      return ''
    }
  }
}

const buildPostSummary = (file, metaData, content, tags) => {
  const { title, date, cover, abstract } = metaData
  const slug = extractPostSlug(file)
  const formattedDate = formatDate(date)
  let coverUrl = ''

  if (cover) {
    coverUrl = parseAsset(slug, cover)
  } else {
    coverUrl = ''
  }
  const readingTime = calculateReadingTime(content)

  return {
    path: slug,
    title,
    date: formattedDate,
    cover: coverUrl,
    abstract,
    tags,
    readingTime: readingTime.text
  }
}

const loadPostsIndex = async (files) => {
  return processMarkdownFiles(files, ({ file, metaData, content }) => {
    const tags = normalizeTags(metaData.tags)
    return buildPostSummary(file, metaData, content, tags)
  })
}

const getPostsIndex = async (files) => {
  const cacheFresh = isCacheFresh()

  if (cacheFresh) {
    return cachedPosts
  } else {
    const posts = await loadPostsIndex(files)
    cachedPosts = posts
    cachedAt = Date.now()
    hasCache = true
    return posts
  }
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { page, pageSize } = parsePagination(query, 1, 10)
  const tagName = getTagName(event)
  const files = await fg('content/posts/*/*.md')
  const emptyResponse = createEmptyResponse(page, pageSize)
  const shouldReturnEmpty = files.length === 0 || tagName.length === 0

  if (shouldReturnEmpty) {
    return emptyResponse
  } else {
    const postsIndex = await getPostsIndex(files)
    const filteredFiles = postsIndex.filter((post) => post.tags.includes(tagName))

    if (filteredFiles.length === 0) {
      return emptyResponse
    } else {
      const sortedFiles = [...filteredFiles].sort(sortByDateDesc)
      const { data, totalPages, totalItems } = paginate(sortedFiles, page, pageSize)

      return {
        page,
        pageSize,
        totalPages,
        totalItems,
        data
      }
    }
  }
})
