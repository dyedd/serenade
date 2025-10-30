import fg from 'fast-glob'
import { processMarkdownFiles, formatDate, parseAsset, paginate } from '../utils.js'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = parseInt(query.page) || 1
  const pageSize = parseInt(query.pageSize) || 10

  const files = await fg('content/posts/*/*.md')
  if (files.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  const processedFiles = await processMarkdownFiles(files, ({ file, metaData }) => {
    // 提取文章路径：content/posts/[文章名]/
    const path = file.match(/content\/posts\/([^\/]+)\//)?.[1]
    return {
      path,
      title: metaData.title,
      date: formatDate(metaData.date),
      cover: metaData.cover ? parseAsset(path, metaData.cover) : '',
      abstract: metaData.abstract,
      tags: typeof metaData.tags === 'string' ? [metaData.tags] : metaData.tags,
    }
  })

  // 按日期降序排序（最新的在前面）
  processedFiles.sort((a, b) => new Date(b.date) - new Date(a.date))

  const { data, totalPages, totalItems } = paginate(processedFiles, page, pageSize)

  return {
    page,
    pageSize,
    totalPages,
    totalItems,
    data,
  }
})
