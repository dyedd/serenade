import fg from 'fast-glob'
import { processMarkdownFiles, formatDate, parseAsset, paginate } from '../../utils.js'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const keyword = query.keyword?.trim().toLowerCase() || ''
  const page = parseInt(query.page) || 1
  const pageSize = parseInt(query.pageSize) || 10

  if (!keyword) {
    return {
      page,
      pageSize,
      totalPages: 0,
      totalItems: 0,
      data: [],
    }
  }

  const files = await fg('content/posts/*/*.md')
  if (files.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  const processedFiles = await processMarkdownFiles(files, ({ file, metaData, content }) => {
    // 提取文章路径：content/posts/[文章名]/
    const path = file.match(/content\/posts\/([^\/]+)\//)?.[1]
    const tags = typeof metaData.tags === 'string' ? [metaData.tags] : metaData.tags

    // 搜索匹配：在标题、摘要、标签或内容中查找关键词（不区分大小写）
    const titleMatch = metaData.title?.toLowerCase().includes(keyword)
    const abstractMatch = metaData.abstract?.toLowerCase().includes(keyword)
    const tagsMatch = tags?.some(tag => tag && typeof tag === 'string' && tag.toLowerCase().includes(keyword))
    const contentMatch = content.toLowerCase().includes(keyword)

    // 任一字段匹配则包含在结果中
    if (titleMatch || abstractMatch || tagsMatch || contentMatch) {
      return {
        path,
        title: metaData.title,
        date: formatDate(metaData.date),
        cover: metaData.cover ? parseAsset(path, metaData.cover) : '',
        abstract: metaData.abstract,
        tags,
      }
    }
    return null
  })

  // 过滤掉 null 值（未匹配的结果）
  const filteredFiles = processedFiles.filter(file => file !== null)
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
