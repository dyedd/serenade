import fs from 'fs-extra'
import { parseMarkdown } from '../../../utils.js'

export default defineEventHandler(async (event) => {
  const { path, chapter } = event.context.params

  const chapterPath = `content/columns/${path}/${chapter}`
  const exists = await fs.pathExists(chapterPath)

  if (!exists) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  } else {
    const chapterContent = await fs.readFile(chapterPath, 'utf-8')
    const htmlContent = parseMarkdown(chapterContent, path, true, 'columns')
    const h1Match = chapterContent.match(/^#\s+(.+)$/m)
    const title = h1Match ? h1Match[1].trim() : chapter

    return {
      metaData: { title },
      htmlContent,
      fileName: chapter
    }
  }
})
