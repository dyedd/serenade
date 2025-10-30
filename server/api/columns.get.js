import fg from 'fast-glob'
import { extractPath, formatDate, paginate, processMarkdownFiles } from '../utils.js'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = parseInt(query.page) || 1
  const pageSize = parseInt(query.pageSize) || 10

  const files = await fg('content/columns/*/{readme,README}.md')
  if (files.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  const processedFiles = await processMarkdownFiles(files, ({ file, metaData }) => {
    // 提取专栏路径：content/columns/[专栏名]/
    const columnPath = extractPath(file, /content\/columns\/([^\/]+)\//)
    return {
      path: columnPath,
      title: metaData.title,
      date: formatDate(metaData.date),
      image: metaData.image ? `/assets/columns/${columnPath}/${metaData.image}` : null,
      description: metaData.description,
      type: metaData.type,
    }
  })

  // 按日期降序排序（最新的在前面）
  processedFiles.sort((a, b) => new Date(b.date) - new Date(a.date))

  let totalDocs = 0
  for (const file of files) {
    // 去掉 README.md 或 readme.md 后缀，获取专栏目录路径
    const columnPath = file.includes('/README.md') ? file.replace('/README.md', '') : file.replace('/readme.md', '')
    const chapterFiles = await fg(`${columnPath}/*.md`)
    // 减去 README 本身，只统计章节数量
    totalDocs += chapterFiles.length - 1
  }

  // 分页计算：(当前页-1) * 每页数量
  const { data: paginatedFiles, totalPages, totalItems } = paginate(processedFiles, page, pageSize)

  return {
    page,
    pageSize,
    totalPages,
    totalItems,
    totalDocs,
    data: paginatedFiles,
  }
})
