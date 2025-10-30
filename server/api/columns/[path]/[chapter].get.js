import fs from 'fs-extra'
import { parseMarkdown } from '../../../utils.js'

export default defineEventHandler(async (event) => {
  const { path, chapter } = event.context.params

  const chapterPath = `content/columns/${path}/${chapter}`

  if (!await fs.pathExists(chapterPath)) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  const chapterContent = await fs.readFile(chapterPath, 'utf-8')
  const htmlContent = parseMarkdown(chapterContent, path, true, 'columns')

  // 从 Markdown 内容中提取第一个一级标题作为章节标题
  const h1Match = chapterContent.match(/^#\s+(.+)$/m)
  const title = h1Match ? h1Match[1].trim() : chapter

  return {
    metaData: { title },
    htmlContent,
    fileName: chapter
  }
})
