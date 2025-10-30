// 分组工具Hook
export const useGroupBy = () => {
  // 按年份分组文章
  const groupByYear = (posts) => {
    const groups = {}
    posts.forEach((post) => {
      const year = new Date(post.date).getFullYear()
      if (!groups[year]) {
        groups[year] = []
      }
      groups[year].push(post)
    })

    // 转换为数组并按年份降序排序
    return Object.keys(groups)
      .sort((a, b) => b - a)
      .map((year) => ({
        year,
        posts: groups[year]
      }))
  }

  return {
    groupByYear
  }
}
