import fg from 'fast-glob'
import {
  processMarkdownFiles,
  formatDate,
  parseAsset,
  paginate,
  normalizeTags,
  parsePagination
} from '../../utils.js'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const rawKeyword = query.keyword
  const keyword = typeof rawKeyword === 'string' ? rawKeyword.trim().toLowerCase() : ''
  const { page, pageSize } = parsePagination(query, 1, 10)

  if (!keyword) {
    return {
      page,
      pageSize,
      totalPages: 0,
      totalItems: 0,
      data: []
    }
  } else {
    const files = await fg('content/posts/*/*.md')

    if (files.length === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Not found' })
    } else {
      const processedFiles = await processMarkdownFiles(
        files,
        ({ file, metaData, content }) => {
          const path = file.match(/content\/posts\/([^\/]+)\//)?.[1]
          const tags = normalizeTags(metaData.tags)

          const titleMatch =
            typeof metaData.title === 'string'
              ? metaData.title.toLowerCase().includes(keyword)
              : false
          const abstractMatch =
            typeof metaData.abstract === 'string'
              ? metaData.abstract.toLowerCase().includes(keyword)
              : false
          const tagsMatch = tags.some(
            (tag) => typeof tag === 'string' && tag.toLowerCase().includes(keyword)
          )
          const contentMatch = content.toLowerCase().includes(keyword)
          const isMatch = titleMatch || abstractMatch || tagsMatch || contentMatch

          if (isMatch) {
            return {
              path,
              title: metaData.title,
              date: formatDate(metaData.date),
              cover: metaData.cover ? parseAsset(path, metaData.cover) : '',
              abstract: metaData.abstract,
              tags
            }
          } else {
            return null
          }
        }
      )

      const filteredFiles = processedFiles.filter((file) => file !== null)
      filteredFiles.sort((a, b) => new Date(b.date) - new Date(a.date))

      const { data, totalPages, totalItems } = paginate(filteredFiles, page, pageSize)

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
