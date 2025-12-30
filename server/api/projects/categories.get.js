import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { parsePagination } from '../../utils.js'

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
  const category = query.category
  const { page, pageSize } = parsePagination(query, 1, 10)

  try {
    const data = readProjectsData()

    if (!category) {
      const categories = Object.entries(data.categories).map(([key, cat]) => ({
        key,
        name: cat.name,
        icon: cat.icon,
        count: cat.projects.length
      }))

      return {
        total: categories.length,
        data: categories
      }
    } else {
      const categoryData = data.categories[category]

      if (!categoryData) {
        throw createError({
          statusCode: 404,
          statusMessage: '未找到该分类'
        })
      } else {
        const startIndex = (page - 1) * pageSize
        const endIndex = startIndex + pageSize
        const paginatedProjects = categoryData.projects.slice(startIndex, endIndex)

        return {
          category,
          total: categoryData.projects.length,
          page,
          pageSize,
          hasMore: endIndex < categoryData.projects.length,
          data: {
            ...categoryData,
            projects: paginatedProjects
          }
        }
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('获取分类项目失败:', error)
    } else {
      console.error('获取分类项目失败: 未知错误')
    }

    const { statusCode, statusMessage } = resolveErrorStatus(
      error,
      '获取分类项目失败'
    )

    throw createError({
      statusCode,
      statusMessage
    })
  }
})
