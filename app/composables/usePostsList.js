const parsePage = (value, fallback) => {
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10)

    if (Number.isNaN(parsed)) {
      return fallback
    } else {
      return parsed
    }
  } else {
    return fallback
  }
}

const parseSearch = (value) => {
  if (typeof value === 'string') {
    return value.trim()
  } else {
    return ''
  }
}

const buildSearchQuery = (keyword, page, pageSize) => {
  if (keyword.length > 0) {
    return {
      keyword,
      page,
      pageSize
    }
  } else {
    return {
      page,
      pageSize
    }
  }
}

const buildPostsUrl = (keyword) => {
  if (keyword.length > 0) {
    return '/api/posts/search'
  } else {
    return '/api/posts'
  }
}

export const usePostsList = async (options) => {
  const route = useRoute()
  const router = useRouter()
  const pageSize = typeof options?.pageSize === 'number' ? options.pageSize : 5
  const { groupByYear } = useGroupBy()

  const searchQuery = computed(() => {
    return parseSearch(route.query.search)
  })

  const pageQuery = computed(() => {
    return parsePage(route.query.page, 1)
  })

  const queryParams = computed(() => {
    return buildSearchQuery(searchQuery.value, pageQuery.value, pageSize)
  })

  const { data: result, status, error } = await useAsyncData(
    () => `posts-${searchQuery.value}-${pageQuery.value}-${pageSize}`,
    () => $fetch(buildPostsUrl(searchQuery.value), { query: queryParams.value }),
    {
      watch: [searchQuery, pageQuery],
      default: () => ({
        data: [],
        page: 1,
        pageSize,
        totalPages: 0,
        totalItems: 0
      })
    }
  )

  const posts = computed(() => {
    return result.value.data
  })

  const groupedPosts = computed(() => {
    return groupByYear(posts.value)
  })

  const currentPage = computed(() => {
    return result.value.page
  })

  const totalPages = computed(() => {
    return result.value.totalPages
  })

  const totalItems = computed(() => {
    return result.value.totalItems
  })

  const isLoading = computed(() => {
    return status.value === 'pending'
  })

  const isSearchMode = computed(() => {
    return searchQuery.value.length > 0
  })

  const goToPage = async (page) => {
    if (page >= 1 && page <= totalPages.value) {
      await router.push({ query: { ...route.query, page } })
    } else {
      return
    }
  }

  const applySearch = async (keyword) => {
    const trimmed = keyword.trim()

    if (trimmed.length > 0) {
      await router.push({ query: { ...route.query, search: trimmed, page: 1 } })
    } else {
      await router.push({ query: { page: 1 } })
    }
  }

  const clearSearch = async () => {
    await router.push({ query: { page: 1 } })
  }

  return {
    status,
    error,
    posts,
    groupedPosts,
    currentPage,
    totalPages,
    totalItems,
    isLoading,
    isSearchMode,
    searchQuery,
    goToPage,
    applySearch,
    clearSearch
  }
}
