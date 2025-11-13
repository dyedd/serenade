import fg from 'fast-glob'
import fs from 'fs-extra'
import matter from 'gray-matter'
import dayjs from 'dayjs'
import { marked } from 'marked'
import markedKatex from 'marked-katex-extension'

export const parseAsset = (slug, href, type = 'posts') => {
  if (!href || typeof href !== 'string') return href
  if (/^https?:\/\//.test(href) || href.startsWith('/')) return href
  return `/assets/${type}/${slug}/${href.replace(/^\.\//, '')}`
}

export const createRenderer = (path, assetType = 'posts') => {
  const headingIds = new Map()

  return {
    heading(token) {
      const text = token.text
      const level = token.depth
      // 将标题文本转换为 URL 友好的 ID（小写、短横线连接）
      let id = text.replace(/\s+/g, '-').toLowerCase()

      // 处理重复的 ID，添加序号后缀（如 heading-1, heading-2）
      if (headingIds.has(id)) {
        const count = headingIds.get(id) + 1
        headingIds.set(id, count)
        id = `${id}-${count}`
      } else {
        headingIds.set(id, 0)
      }

      return `
      <h${level} class="relative group" id="${id}">
        ${text}
        <span class="absolute top-0 w-6 transition-opacity opacity-0 -start-10 not-prose group-hover:opacity-100">
          <a class="group-hover:text-neutral-400 dark:group-hover:text-neutral-500" href="#${id}" aria-label="Anchor">#</a>
        </span>
      </h${level}>`
    },
    image(token) {
      const { href, title = '', text = '' } = token
      if (!href) return `<img alt="${text}"${title ? ` title="${title}"` : ''} loading="lazy">`
      // 解析图片路径，转换为正确的静态资源路径
      const imageUrl = parseAsset(path, href.trim(), assetType)
      return `<img src="${imageUrl}" alt="${text}"${title ? ` title="${title}"` : ''} loading="lazy">`
    }
  }
}

export const readMarkdownFiles = async (pattern) => {
  const files = await fg(pattern)
  return files.map(file => ({
    path: file,
    raw: null,
    meta: null,
    content: null
  }))
}

export const processMarkdownFiles = async (files, transformFn) => {
  // 批量读取和解析 Markdown 文件，然后应用转换函数
  return Promise.all(files.map(async (file) => {
    const raw = await fs.readFile(file, 'utf-8')
    const { data: metaData, content } = matter(raw)

    return transformFn({
      file,
      raw,
      metaData,
      content
    })
  }))
}

export const formatDate = (date) => {
  return dayjs(date).format('MMMM D, YYYY')
}

export const normalizeTags = (tags) => {
  return typeof tags === 'string' ? [tags] : tags || []
}

export const paginate = (data, page, pageSize) => {
  // 计算分页起始和结束位置
  const start = (page - 1) * pageSize
  const end = start + pageSize
  return {
    data: data.slice(start, end),
    totalPages: Math.ceil(data.length / pageSize),
    totalItems: data.length
  }
}

export const sortByDateDesc = (a, b) => {
  return new Date(b.date) - new Date(a.date)
}

export const getReadmeFiles = async (columnPath) => {
  return fg(`${columnPath}/{readme,README}.md`)
}

export const parseMarkdown = (content, path, enableKatex = false, assetType = 'posts') => {
  marked.use({ renderer: createRenderer(path, assetType) })

  if (enableKatex) {
    marked.use(markedKatex({
      throwOnError: false,
      nonStandard: true,
      output: 'mathml'
    }))
  }

  return marked(content)
}

export const extractPath = (filePath, pattern) => {
  // 从文件路径中提取捕获组的内容，用于获取文章/专栏路径
  const match = filePath.match(pattern)
  return match ? match[1] : null
}

export const calculateReadingTime = (content) => {
  // 移除 Markdown 语法标记
  const plainText = content
    .replace(/`{1,3}[^`]*`{1,3}/g, '') // 移除代码块和行内代码
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '') // 移除图片
    .replace(/\[[^\]]*\]\([^)]+\)/g, '$1') // 移除链接，保留文本
    .replace(/#{1,6}\s*/g, '') // 移除标题标记
    .replace(/[*_~>`>-]/g, '') // 移除其他 Markdown 标记
    .replace(/\n+/g, ' ') // 移除换行符
    .trim()

  // 计算中文字符和英文字符
  const chineseChars = plainText.match(/[\u4e00-\u9fa5]/g) || []
  const englishWords = plainText.match(/[a-zA-Z]+/g) || []

  // 中文按每分钟 300 字计算，英文按每分钟 200 词计算
  const chineseWords = chineseChars.length
  const englishWordsCount = englishWords.length

  const totalWords = chineseWords + englishWordsCount * 5 // 英文单词按 5 个字符换算成中文字符数

  const minutes = Math.max(1, Math.ceil(totalWords / 300))

  return {
    minutes,
    text: `${minutes} 分钟阅读`
  }
}
