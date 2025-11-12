import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = parseInt(query.page) || 1
  const pageSize = parseInt(query.pageSize) || 3

  try {
    const dataPath = join(process.cwd(), 'content', 'projects.json')

    if (!existsSync(dataPath)) {
      throw createError({
        statusCode: 404,
        statusMessage: '未找到项目数据文件',
      })
    }

    const fileContent = readFileSync(dataPath, 'utf-8')
    const data = JSON.parse(fileContent)

    // 获取所有分类的所有项目
    const allProjects = []
    Object.entries(data.categories).forEach(([catKey, catData]) => {
      catData.projects.forEach(project => {
        allProjects.push({
          ...project,
          categoryKey: catKey,
          categoryName: catData.name,
        })
      })
    })

    // 按日期排序
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
        projects: paginatedProjects,
      },
    }
  } catch (error) {
    console.error('获取所有项目失败:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || '获取所有项目失败',
    })
  }
})
