import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export default defineEventHandler(() => {
  const directoryPath = path.join('content/posts')

  function getTagsFromMdFile(filePath) {
    // 从 Markdown 文件的 front-matter 中提取标签
    const raw = fs.readFileSync(filePath, 'utf-8')
    const { data: metaData } = matter(raw)
    return metaData.tags || []
  }

  function getTagsCount(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true })
    const tagCounts = {}

    entries.forEach((entry) => {
      if (entry.isFile() && entry.name.endsWith('.md')) {
        const tags = getTagsFromMdFile(path.join(dirPath, entry.name))
        // 统计每个标签的出现次数
        tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        })
      }
    })

    return tagCounts
  }

  const tagCounts = {}
  const entries = fs.readdirSync(directoryPath, { withFileTypes: true })

  entries.forEach((entry) => {
    if (entry.isDirectory()) {
      const dirPath = path.join(directoryPath, entry.name)
      const directoryTagCounts = getTagsCount(dirPath)
      // 合并每个目录的标签统计
      for (const tag in directoryTagCounts) {
        tagCounts[tag] = (tagCounts[tag] || 0) + directoryTagCounts[tag]
      }
    }
  })

  return tagCounts
})
