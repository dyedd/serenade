import fg from 'fast-glob'
import fs from 'fs-extra'
import matter from 'gray-matter'
import dayjs from 'dayjs'
import { marked } from 'marked'
import markedKatex from 'marked-katex-extension'
import hljs from 'highlight.js'

export const parseAsset = (slug, href, type = 'posts') => {
  if (!href || typeof href !== 'string') {
    return href
  } else if (/^https?:\/\//.test(href) || href.startsWith('/')) {
    return href
  } else {
    return `/assets/${type}/${slug}/${href.replace(/^\.\//, '')}`
  }
}

export const createRenderer = (path, assetType = 'posts') => {
  const headingIds = new Map()

  return {
    heading(token) {
      const text = token.text
      const level = token.depth
      let id = text.replace(/\s+/g, '-').toLowerCase()

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
      </h${level}>`
    },
    image(token) {
      const { href, title = '', text = '' } = token

      if (!href) {
        return `<img alt="${text}"${title ? ` title="${title}"` : ''} loading="lazy">`
      } else {
        const imageUrl = parseAsset(path, href.trim(), assetType)
        return `<img src="${imageUrl}" alt="${text}"${title ? ` title="${title}"` : ''} loading="lazy">`
      }
    },
    code(token) {
      const text = token.text
      const lang = token.lang || 'text'
      const validLang = !!(token.lang && hljs.getLanguage(token.lang))
      const highlighted = validLang
        ? hljs.highlight(text, { language: token.lang }).value
        : hljs.highlightAuto(text).value
      
      const lines = text.trim().split('\n').length
      const lineNumbers = Array.from({ length: lines }, (_, i) => `<span>${i + 1}</span>`).join('')

      return `
      <div class="code-block-wrapper my-6 rounded-lg overflow-hidden bg-[#282c34] shadow-lg border border-neutral-700/50">
        <div class="code-header flex justify-between items-center px-4 py-1.5 bg-[#21252b] border-b border-neutral-700/50 text-xs text-neutral-300 select-none">
          <span class="font-mono font-medium opacity-80">${lang}</span>
          <button class="copy-btn hover:text-white text-neutral-400 transition-colors cursor-pointer flex items-center gap-1.5 opacity-80 hover:opacity-100" aria-label="Copy code">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            Copy
          </button>
        </div>
        <div class="code-body flex text-sm relative">
          <div class="line-numbers flex flex-col items-end px-3 py-3 text-neutral-500 bg-[#282c34] border-r border-neutral-700/30 select-none font-mono text-right min-w-[2.5rem] leading-relaxed">
            ${lineNumbers}
          </div>
          <pre class="flex-1 !my-0 !p-3 !bg-transparent overflow-x-auto custom-scrollbar"><code class="hljs ${lang} !bg-transparent !p-0 font-mono leading-relaxed block">${highlighted}</code></pre>
        </div>
      </div>`
    }
  }
}

export const readMarkdownFiles = async (pattern) => {
  const files = await fg(pattern)
  return files.map((file) => ({
    path: file,
    raw: null,
    meta: null,
    content: null
  }))
}

export const processMarkdownFiles = async (files, transformFn) => {
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
  if (typeof tags === 'string') {
    return [tags]
  } else if (Array.isArray(tags)) {
    return tags
  } else {
    return []
  }
}

export const parsePagination = (query, defaultPage = 1, defaultPageSize = 10) => {
  const rawPage = Number.parseInt(query?.page, 10)
  const rawPageSize = Number.parseInt(query?.pageSize, 10)

  const page = Number.isNaN(rawPage) ? defaultPage : rawPage
  const pageSize = Number.isNaN(rawPageSize) ? defaultPageSize : rawPageSize

  return { page, pageSize }
}

export const paginate = (data, page, pageSize) => {
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
  const renderer = createRenderer(path, assetType)
  marked.use({ renderer })

  const extensions = enableKatex
    ? [markedKatex({
      throwOnError: false,
      nonStandard: true,
      output: 'mathml'
    })]
    : []

  extensions.forEach((extension) => {
    marked.use(extension)
  })

  return marked(content)
}

export const extractPath = (filePath, pattern) => {
  const match = filePath.match(pattern)

  if (match) {
    return match[1]
  } else {
    return null
  }
}

export const calculateReadingTime = (content) => {
  const plainText = content
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\[[^\]]*\]\([^)]+\)/g, '$1')
    .replace(/#{1,6}\s*/g, '')
    .replace(/[*_~>`>-]/g, '')
    .replace(/\n+/g, ' ')
    .trim()

  const chineseChars = plainText.match(/[\u4e00-\u9fa5]/g) ?? []
  const englishWords = plainText.match(/[a-zA-Z]+/g) ?? []

  const chineseWords = chineseChars.length
  const englishWordsCount = englishWords.length

  const totalWords = chineseWords + englishWordsCount * 5
  const minutes = Math.max(1, Math.ceil(totalWords / 300))

  return {
    minutes,
    text: `${minutes} 分钟阅读`
  }
}
