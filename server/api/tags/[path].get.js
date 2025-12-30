import fg from 'fast-glob'
import {
  formatDate,
  normalizeTags,
  paginate,
  parsePagination,
  processMarkdownFiles
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

const getTagName = (event) => {
  const { path } = event.context?.params ?? {}

  if (typeof path === 'string') {
    return path
  } else {
    return ''
  }
}

const buildPostSummary = (file, metaData) => {
  const { title, date, cover, abstract } = metaData
  const formattedDate = formatDate(date)

  return {
    path: file.split('/').pop(),
    title,
    date: formattedDate,
    cover,
    abstract
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
    const matchedFiles = await processMarkdownFiles(files, ({ file, metaData }) => {
      const tags = normalizeTags(metaData.tags)
      const hasTag = tags.includes(tagName)

      if (hasTag) {
        return buildPostSummary(file, metaData)
      } else {
        return null
      }
    })

    const filteredFiles = matchedFiles.filter((file) => file !== null)

    if (filteredFiles.length === 0) {
      return emptyResponse
    } else {
      const sortedFiles = [...filteredFiles].sort((a, b) => {
        return new Date(b.date) - new Date(a.date)
      })
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
