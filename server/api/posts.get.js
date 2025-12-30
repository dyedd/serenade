import fg from 'fast-glob'
import {
  processMarkdownFiles,
  formatDate,
  parseAsset,
  paginate,
  calculateReadingTime,
  normalizeTags,
  parsePagination
} from '../utils.js'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { page, pageSize } = parsePagination(query, 1, 10)

  const files = await fg('content/posts/*/*.md')

  if (files.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  } else {
    const processedFiles = await processMarkdownFiles(
      files,
      ({ file, metaData, content }) => {
        const path = file.match(/content\/posts\/([^\/]+)\//)?.[1]
        const readingTime = calculateReadingTime(content)
        const tags = normalizeTags(metaData.tags)

        return {
          path,
          title: metaData.title,
          date: formatDate(metaData.date),
          cover: metaData.cover ? parseAsset(path, metaData.cover) : '',
          abstract: metaData.abstract,
          tags,
          readingTime: readingTime.text
        }
      }
    )

    processedFiles.sort((a, b) => new Date(b.date) - new Date(a.date))

    const { data, totalPages, totalItems } = paginate(processedFiles, page, pageSize)

    return {
      page,
      pageSize,
      totalPages,
      totalItems,
      data
    }
  }
})
