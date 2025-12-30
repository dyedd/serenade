import fg from 'fast-glob'
import {
  extractPath,
  formatDate,
  paginate,
  processMarkdownFiles,
  parsePagination
} from '../utils.js'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { page, pageSize } = parsePagination(query, 1, 10)

  const files = await fg('content/columns/*/{readme,README}.md')

  if (files.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  } else {
    const processedFiles = await processMarkdownFiles(files, ({ file, metaData }) => {
      const columnPath = extractPath(file, /content\/columns\/([^\/]+)\//)
      const image = metaData.image ? `/assets/columns/${columnPath}/${metaData.image}` : null

      return {
        path: columnPath,
        title: metaData.title,
        date: formatDate(metaData.date),
        image,
        description: metaData.description,
        type: metaData.type
      }
    })

    processedFiles.sort((a, b) => new Date(b.date) - new Date(a.date))

    const docCounts = await Promise.all(
      files.map(async (file) => {
        const columnPath = file.includes('/README.md')
          ? file.replace('/README.md', '')
          : file.replace('/readme.md', '')
        const chapterFiles = await fg(`${columnPath}/*.md`)
        return chapterFiles.length - 1
      })
    )

    const totalDocs = docCounts.reduce((sum, count) => sum + count, 0)
    const { data, totalPages, totalItems } = paginate(processedFiles, page, pageSize)

    return {
      page,
      pageSize,
      totalPages,
      totalItems,
      totalDocs,
      data
    }
  }
})
