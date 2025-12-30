import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { normalizeTags } from '../utils.js'

const readTagsFromMarkdown = (filePath) => {
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data: metaData } = matter(raw)
  return normalizeTags(metaData.tags)
}

const countTagsInDirectory = (dirPath) => {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true })
  const markdownFiles = entries.filter(
    (entry) => entry.isFile() && entry.name.endsWith('.md')
  )

  return markdownFiles.reduce((counts, entry) => {
    const tags = readTagsFromMarkdown(path.join(dirPath, entry.name))
    const validTags = tags.filter((tag) => typeof tag === 'string' && tag.length > 0)

    validTags.forEach((tag) => {
      const current = counts[tag] ?? 0
      counts[tag] = current + 1
    })

    return counts
  }, {})
}

export default defineEventHandler(() => {
  const directoryPath = path.join('content/posts')
  const entries = fs.readdirSync(directoryPath, { withFileTypes: true })

  const tagCounts = entries.reduce((counts, entry) => {
    if (entry.isDirectory()) {
      const dirPath = path.join(directoryPath, entry.name)
      const directoryTagCounts = countTagsInDirectory(dirPath)

      Object.entries(directoryTagCounts).forEach(([tag, count]) => {
        const current = counts[tag] ?? 0
        counts[tag] = current + count
      })

      return counts
    } else {
      return counts
    }
  }, {})

  return tagCounts
})
