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
  } else {
    const targetReadmePath =
      readmeFiles.find((file) => file.includes('/README.md')) ?? readmeFiles[0]
    const readmeContent = await fs.readFile(targetReadmePath, 'utf-8')
    const { data: readmeMeta, content: readmeMarkdown } = matter(readmeContent)

    const readmeHtml = parseMarkdown(readmeMarkdown, name, true, 'columns')
    const resolvedMeta = {
      ...readmeMeta,
      date: formatDate(readmeMeta.date)
    }

    const chapterFiles = await fg(`${columnPath}/*.md`)
    const chapters = await Promise.all(
      chapterFiles.map(async (file) => {
        const fileName = file.split('/').pop() ?? ''
        const isReadme = fileName.toLowerCase() === 'readme.md'

        if (isReadme) {
          return null
        } else {
          const chapterContent = await fs.readFile(file, 'utf-8')
          const h1Match = chapterContent.match(/^#\s+(.+)$/m)
          const title = h1Match ? h1Match[1].trim() : fileName

          return {
            metaData: { title },
            fileName
          }
        }
      })
    )

    const filteredChapters = chapters.filter((chapter) => chapter !== null)
    filteredChapters.sort(
      (a, b) => Number.parseInt(a.fileName, 10) - Number.parseInt(b.fileName, 10)
    )

    return {
      metaData: resolvedMeta,
      readmeHtml,
      chapters: filteredChapters
    }
  }
})
