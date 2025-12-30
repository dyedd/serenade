import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { parsePagination } from '../utils.js'

const readProjectsData = () => {
  const dataPath = join(process.cwd(), 'content', 'projects.json')

  if (!existsSync(dataPath)) {
    throw createError({
      statusCode: 404,
      statusMessage: '未找到项目数据文件'
    })
  } else {
    const fileContent = readFileSync(dataPath, 'utf-8')

    try {
      return JSON.parse(fileContent)
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw createError({
          statusCode: 500,
          statusMessage: '项目数据解析失败'
        })
      } else {
        throw error
      }
    }
  }
}

const resolveErrorStatus = (error, fallbackMessage) => {
  if (error && typeof error === 'object' && 'statusCode' in error) {
    return {
      statusCode: error.statusCode,
      statusMessage: error.statusMessage ?? fallbackMessage
    }
  } else {
    return {
      statusCode: 500,
      statusMessage: fallbackMessage
    }
  }
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { page, pageSize } = parsePagination(query, 1, 3)

  try {
    const data = readProjectsData()
    const allProjects = Object.entries(data.categories).flatMap(([catKey, catData]) =>
      catData.projects.map((project) => ({
        ...project,
        categoryKey: catKey,
        categoryName: catData.name
      }))
    )

    allProjects.sort((a, b) => new Date(b.date) - new Date(a.date))

    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedProjects = allProjects.slice(startIndex, endIndex)

    return {
      category: 'all',
      total: allProjects.length,
      page,
      pageSize,
      hasMore: endIndex < allProjects.length,
      data: {
        name: '全部',
        categories: data.categories,
        projects: paginatedProjects
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('获取所有项目失败:', error)
    } else {
      console.error('获取所有项目失败: 未知错误')
    }

    const { statusCode, statusMessage } = resolveErrorStatus(
      error,
      '获取所有项目失败'
    )

    throw createError({
      statusCode,
      statusMessage
    })
  }
})
