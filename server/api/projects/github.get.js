import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const username = query.username || 'dyedd'
  const sort = query.sort || 'updated'
  const limit = parseInt(query.limit) || 20

  try {
    // 调用GitHub API
    const response = await $fetch(`https://api.github.com/users/${username}/repos`, {
      params: {
        sort,
        direction: 'desc',
        per_page: limit,
        type: 'owner',
      },
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'nuxt-app',
      },
    })

    // 读取补充项目信息
    let customProjects = []
    const customPath = join(process.cwd(), 'app', 'data', 'custom-projects.json')
    if (existsSync(customPath)) {
      const fileContent = readFileSync(customPath, 'utf-8')
      customProjects = JSON.parse(fileContent)
    }

    // 处理数据并合并补充信息
    const projects = response.map(repo => {
      // 查找是否有补充信息
      const customInfo = customProjects.find(cp => cp.name === repo.name)

      return {
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description: customInfo?.description || repo.description || '暂无描述',
        url: repo.html_url,
        cloneUrl: repo.clone_url,
        language: repo.language,
        languageColor: getLanguageColor(repo.language),
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        issues: repo.open_issues_count,
        size: repo.size,
        isPrivate: repo.private,
        isFork: repo.fork,
        isArchived: repo.archived,
        createdAt: repo.created_at,
        updatedAt: repo.updated_at,
        pushedAt: repo.pushed_at,
        defaultBranch: repo.default_branch,
        // 补充信息
        customDescription: customInfo?.description,
        customTechStack: customInfo?.techStack,
        customCover: customInfo?.cover,
        customStatus: customInfo?.status,
      }
    })

    return {
      total: projects.length,
      data: projects,
      username,
    }
  } catch (error) {
    console.error('获取GitHub项目失败:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || '获取GitHub项目失败',
    })
  }
})

// 获取编程语言对应的颜色
function getLanguageColor(language) {
  const colors = {
    'JavaScript': '#f1e05a',
    'TypeScript': '#3178c6',
    'Python': '#3572A5',
    'Java': '#b07219',
    'C++': '#f34b7d',
    'C': '#555555',
    'C#': '#239120',
    'PHP': '#4F5D95',
    'Ruby': '#701516',
    'Go': '#00ADD8',
    'Rust': '#dea584',
    'Vue': '#4FC08D',
    'Shell': '#89e051',
    'CSS': '#563d7c',
    'HTML': '#e34c26',
    'Swift': '#ffac45',
    'Kotlin': '#A97BFF',
    'Dart': '#0175C2',
    'Scala': '#c22d40',
    'R': '#198CE7',
    'Jupyter Notebook': '#DA5B0B',
    'Objective-C': '#438eff',
    'Perl': '#0298c3',
    'Lua': '#000080',
    'Elixir': '#6e4a7e',
    'Haskell': '#5e5086',
    'Objective-C++': '#6866fb',
    'TeX': '#3D6117',
    'Groovy': '#4298b8',
  }
  return colors[language] || '#586069'
}
