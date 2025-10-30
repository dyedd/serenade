import fg from 'fast-glob'
import fs from 'fs-extra'
import matter from 'gray-matter'
import { formatDate, parseAsset, parseMarkdown } from '../../utils.js'

export default defineEventHandler(async (event) => {
  const name = event.context.params?.path

  const files = await fg('content/posts/*/{readme,README}.md')
  const filteredFiles = files.filter(i => i.includes(name))
  if (filteredFiles.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  // 优先选择大写 README.md，以保持一致性
  const targetFile = filteredFiles.find(i => i.includes('/README.md')) || filteredFiles[0]
  const raw = await fs.readFile(targetFile, 'utf-8')
  const { data: metaData, content } = matter(raw)

  const htmlContent = parseMarkdown(content, name, false, 'posts')

  if (metaData.cover) {
    metaData.cover = parseAsset(name, metaData.cover)
  }
  metaData.date = formatDate(metaData.date)
  const tags = typeof metaData.tags === 'string' ? [metaData.tags] : metaData.tags
  metaData.tags = tags

  return { metaData, htmlContent }
})
