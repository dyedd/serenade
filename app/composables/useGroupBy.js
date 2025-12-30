export const useGroupBy = () => {
  const groupByYear = (posts) => {
    if (Array.isArray(posts)) {
      const groups = {}

      posts.forEach((post) => {
        const date = new Date(post.date)
        const yearValue = Number.isNaN(date.getTime()) ? '未知' : String(date.getFullYear())
        const currentGroup = groups[yearValue]

        if (currentGroup) {
          currentGroup.push(post)
        } else {
          groups[yearValue] = [post]
        }
      })

      const sortedYears = Object.keys(groups).sort((a, b) => {
        const first = Number.parseInt(a, 10)
        const second = Number.parseInt(b, 10)

        if (Number.isNaN(first) && Number.isNaN(second)) {
          return 0
        } else if (Number.isNaN(first)) {
          return 1
        } else if (Number.isNaN(second)) {
          return -1
        } else {
          return second - first
        }
      })

      return sortedYears.map((year) => {
        return {
          year,
          posts: groups[year]
        }
      })
    } else {
      return []
    }
  }

  return {
    groupByYear
  }
}
