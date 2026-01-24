import fg from 'fast-glob'
import fs from 'fs-extra'
import matter from 'gray-matter'
import {
  calculateReadingTime,
  formatDate,
  normalizeTags,
  parseAsset,
  parseMarkdown
} from '../../utils.js'

export default defineEventHandler(async (event) => {
  const name = event.context.params?.path

  const files = await fg('content/posts/*/{readme,README}.md')
  const matchedFiles = files.filter((file) => file.includes(name))

  if (matchedFiles.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  } else {
    const targetFile =
      matchedFiles.find((file) => file.includes('/README.md')) ?? matchedFiles[0]
    const raw = await fs.readFile(targetFile, 'utf-8')
    const { data: metaData, content } = matter(raw)

    const htmlContent = parseMarkdown(content, name, false, 'posts')
    const readingTime = calculateReadingTime(content)
    const tags = normalizeTags(metaData.tags)
    const cover = metaData.cover ? parseAsset(name, metaData.cover) : metaData.cover

    const resolvedMeta = {
      ...metaData,
      cover,
      date: formatDate(metaData.date),
      tags,
      readingTime: readingTime.text
    }

    const posts = await Promise.all(
      files.map(async (file) => {
        const postRaw = await fs.readFile(file, 'utf-8')
        const { data: postMeta } = matter(postRaw)
        const postPath = file.match(/content\/posts\/([^\/]+)\//)?.[1]

        if (postPath && postMeta.date) {
          return {
            path: postPath,
            title: postMeta.title,
            date: new Date(postMeta.date)
          }
        } else {
          return null
        }
      })
    )

    const allPosts = posts.filter((post) => post !== null)
    allPosts.sort((a, b) => b.date - a.date)

    const currentIndex = allPosts.findIndex((post) => post.path === name)
    const prevPost =
      currentIndex > 0
        ? {
          path: allPosts[currentIndex - 1].path,
          title: allPosts[currentIndex - 1].title
        }
        : null
    const nextPost =
      currentIndex > -1 && currentIndex < allPosts.length - 1
        ? {
          path: allPosts[currentIndex + 1].path,
          title: allPosts[currentIndex + 1].title
        }
        : null

    return {
      metaData: resolvedMeta,
      htmlContent,
      prevPost,
      nextPost
    }
  }
})
