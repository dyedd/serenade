import fg from 'fast-glob'
import fs from 'fs-extra'
import matter from 'gray-matter'
import { getReadmeFiles, formatDate, parseMarkdown } from '../../utils.js'

export default defineEventHandler(async (event) => {
  const name = event.context.params?.path

  const columnPath = `content/columns/${name}`
  const readmeFiles = await getReadmeFiles(columnPath)

  if (readmeFiles.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  // 优先选择大写 README.md，以保持一致性
  const targetReadmePath = readmeFiles.find(i => i.includes('/README.md')) || readmeFiles[0]
  const readmeContent = await fs.readFile(targetReadmePath, 'utf-8')
  const { data: readmeMeta, content: readmeMarkdown } = matter(readmeContent)

  const readmeHtml = parseMarkdown(readmeMarkdown, name, true, 'columns')
  readmeMeta.date = formatDate(readmeMeta.date)

  const chapters = []
  const chapterFiles = await fg(`${columnPath}/*.md`)

  for (const file of chapterFiles) {
    const fileName = file.split('/').pop()
    if (fileName.toLowerCase() === 'readme.md') continue

    const chapterContent = await fs.readFile(file, 'utf-8')
    const h1Match = chapterContent.match(/^#\s+(.+)$/m)
    const title = h1Match ? h1Match[1].trim() : fileName

    chapters.push({
      metaData: { title },
      fileName
    })
  }

  chapters.sort((a, b) => parseInt(a.fileName) - parseInt(b.fileName))

  return {
    metaData: readmeMeta,
    readmeHtml,
    chapters
  }
})
