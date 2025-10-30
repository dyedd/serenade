import fg from 'fast-glob'
import { formatDate, paginate, processMarkdownFiles } from '../../utils.js'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = parseInt(query.page) || 1
  const pageSize = parseInt(query.pageSize) || 10

  const tagName = event.context.params?.path
  const files = await fg('content/posts/*/*.md')
  if (files.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  const matchedFiles = await processMarkdownFiles(files, ({ file, metaData }) => {
    // 查找包含指定标签的文章
    if (metaData.tags && metaData.tags.includes(tagName)) {
      return {
        path: file.split('/').pop(),
        title: metaData.title,
        date: formatDate(metaData.date),
        cover: metaData.cover,
        abstract: metaData.abstract,
      }
    }
    return null
  })

  // 过滤掉 null 值（不包含该标签的文章）
  const filteredFiles = matchedFiles.filter(file => file !== null)
  if (filteredFiles.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  // 按日期降序排序（最新的在前面）
  filteredFiles.sort((a, b) => new Date(b.date) - new Date(a.date))

  const { data, totalPages, totalItems } = paginate(filteredFiles, page, pageSize)

  return {
    page,
    pageSize,
    totalPages,
    totalItems,
    data,
  }
})
