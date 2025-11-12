import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const category = query.category
  const page = parseInt(query.page) || 1
  const pageSize = parseInt(query.pageSize) || 10

  try {
    // 如果没有 category 参数，返回所有分类列表
    if (!category) {
      const dataPath = join(process.cwd(), 'content', 'projects.json')

      if (!existsSync(dataPath)) {
        throw createError({
          statusCode: 404,
          statusMessage: '未找到项目数据文件',
        })
      }

      const fileContent = readFileSync(dataPath, 'utf-8')
      const data = JSON.parse(fileContent)

      const categories = Object.entries(data.categories).map(([key, cat]) => ({
        key,
        name: cat.name,
        icon: cat.icon,
        count: cat.projects.length,
      }))

      return {
        total: categories.length,
        data: categories,
      }
    }
    const dataPath = join(process.cwd(), 'content', 'projects.json')

    if (!existsSync(dataPath)) {
      throw createError({
        statusCode: 404,
        statusMessage: '未找到项目数据文件',
      })
    }

    const fileContent = readFileSync(dataPath, 'utf-8')
    const data = JSON.parse(fileContent)

    // 获取特定分类
    const categoryData = data.categories[category]
    if (!categoryData) {
      throw createError({
        statusCode: 404,
        statusMessage: '未找到该分类',
      })
    }

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
        projects: paginatedProjects,
      },
    }
  } catch (error) {
    console.error('获取分类项目失败:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || '获取分类项目失败',
    })
  }
})
