type ProjectItem = {
  name: string
  description?: string
  cover?: string
  techStack?: string[]
  link?: string
  date?: string
  categoryName?: string
}

type CategoryItem = {
  key: string
  name: string
  icon?: string
  count?: number
}

type ProjectsResponse = {
  data: {
    projects: ProjectItem[]
  }
  total: number
  hasMore: boolean
}

type CategoriesResponse = {
  data: CategoryItem[]
}

const createEmptyProjectsResponse = (): ProjectsResponse => {
  return {
    data: {
      projects: []
    },
    total: 0,
    hasMore: false
  }
}

const createEmptyCategoriesResponse = (): CategoriesResponse => {
  return {
    data: []
  }
}

const shuffleProjects = (projects: ProjectItem[]) => {
  const shuffled = [...projects]

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const current = shuffled[i]
    shuffled[i] = shuffled[j]
    shuffled[j] = current
  }

  return shuffled
}

const buildErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message || '加载失败'
  } else {
    return '加载失败'
  }
}

export const useProjectsPage = async () => {
  const activeTab = ref('all')
  const categories = ref<CategoryItem[]>([])
  const totalCount = ref(0)
  const allProjects = ref<ProjectItem[]>([])
  const categoryProjects = ref<ProjectItem[]>([])
  const allPage = ref(1)
  const categoryPage = ref(1)
  const allHasMore = ref(true)
  const categoryHasMore = ref(false)
  const allLoadingMore = ref(false)
  const categoryLoadingMore = ref(false)

  const { data: categoriesData, status: categoriesStatus, error: categoriesError } = await useFetch<CategoriesResponse>(
    '/api/projects/categories',
    {
      default: createEmptyCategoriesResponse
    }
  )

  watch(
    categoriesData,
    (data) => {
      if (data && Array.isArray(data.data)) {
        categories.value = data.data
      } else {
        categories.value = []
      }
    },
    { immediate: true }
  )

  const activeCategoryKey = computed(() => {
    if (activeTab.value === 'all') {
      return ''
    } else {
      return activeTab.value
    }
  })

  const { data: allResult, status: allStatus, error: allError, refresh: refreshAll } = await useAsyncData<ProjectsResponse>(
    () => `projects-all-${allPage.value}`,
    () => $fetch('/api/projects', { query: { page: allPage.value, pageSize: 3 } }),
    {
      watch: [allPage],
      default: createEmptyProjectsResponse
    }
  )

  const { data: categoryResult, status: categoryStatus, error: categoryError, refresh: refreshCategory } = await useAsyncData<ProjectsResponse>(
    () => `projects-category-${activeCategoryKey.value}-${categoryPage.value}`,
    () => {
      if (activeCategoryKey.value.length > 0) {
        return $fetch('/api/projects/categories', {
          query: {
            category: activeCategoryKey.value,
            page: categoryPage.value,
            pageSize: 10
          }
        })
      } else {
        return createEmptyProjectsResponse()
      }
    },
    {
      watch: [activeCategoryKey, categoryPage],
      default: createEmptyProjectsResponse
    }
  )

  const updateAllProjects = (result: ProjectsResponse) => {
    const projects = Array.isArray(result.data?.projects) ? result.data.projects : []

    if (allPage.value === 1) {
      allProjects.value = shuffleProjects(projects)
    } else {
      allProjects.value = [...allProjects.value, ...projects]
    }

    if (typeof result.total === 'number') {
      totalCount.value = result.total
    } else {
      totalCount.value = totalCount.value
    }

    allHasMore.value = Boolean(result.hasMore)
  }

  const updateCategoryCount = (key: string, count: number) => {
    const index = categories.value.findIndex((category) => category.key === key)

    if (index >= 0) {
      const current = categories.value[index]
      categories.value[index] = { ...current, count }
    } else {
      return
    }
  }

  const updateCategoryProjects = (result: ProjectsResponse) => {
    const projects = Array.isArray(result.data?.projects) ? result.data.projects : []

    if (categoryPage.value === 1) {
      categoryProjects.value = projects
    } else {
      categoryProjects.value = [...categoryProjects.value, ...projects]
    }

    if (typeof result.total === 'number' && activeCategoryKey.value.length > 0) {
      updateCategoryCount(activeCategoryKey.value, result.total)
    } else {
      categoryHasMore.value = categoryHasMore.value
    }

    categoryHasMore.value = Boolean(result.hasMore)
  }

  watch(
    allResult,
    (result) => {
      if (result) {
        updateAllProjects(result)
      } else {
        updateAllProjects(createEmptyProjectsResponse())
      }
    },
    { immediate: true }
  )

  watch(
    categoryResult,
    (result) => {
      if (result) {
        updateCategoryProjects(result)
      } else {
        updateCategoryProjects(createEmptyProjectsResponse())
      }
    },
    { immediate: true }
  )

  watch(
    allStatus,
    (value) => {
      if (value === 'pending') {
        return
      } else {
        allLoadingMore.value = false
      }
    },
    { immediate: true }
  )

  watch(
    categoryStatus,
    (value) => {
      if (value === 'pending') {
        return
      } else {
        categoryLoadingMore.value = false
      }
    },
    { immediate: true }
  )

  const tabs = computed(() => {
    const baseTabs = [
      {
        key: 'all',
        label: '全部',
        icon: '+',
        count: totalCount.value
      }
    ]

    categories.value.forEach((category) => {
      baseTabs.push({
        key: category.key,
        label: category.name,
        icon: category.icon || '*',
        count: category.count
      })
    })

    return baseTabs
  })

  const isAllTab = computed(() => {
    return activeTab.value === 'all'
  })

  const allErrorMessage = computed(() => {
    if (allError.value) {
      return buildErrorMessage(allError.value)
    } else {
      return ''
    }
  })

  const categoryErrorMessage = computed(() => {
    if (categoryError.value) {
      return buildErrorMessage(categoryError.value)
    } else {
      return ''
    }
  })

  const isAllLoading = computed(() => {
    return allStatus.value === 'pending' && isAllTab.value
  })

  const isCategoryLoading = computed(() => {
    return categoryStatus.value === 'pending' && !isAllTab.value
  })

  const refreshAllProjects = async () => {
    allPage.value = 1
    allProjects.value = []
    allHasMore.value = true
    await refreshAll()
  }

  const refreshCategoryProjects = async () => {
    categoryPage.value = 1
    categoryProjects.value = []
    categoryHasMore.value = true
    await refreshCategory()
  }

  const switchTab = async (tabKey: string) => {
    if (activeTab.value === tabKey) {
      return
    } else {
      activeTab.value = tabKey
    }

    if (tabKey === 'all') {
      await refreshAllProjects()
    } else {
      await refreshCategoryProjects()
    }
  }

  const loadMoreAll = () => {
    if (!allLoadingMore.value && allHasMore.value) {
      allLoadingMore.value = true
      allPage.value = allPage.value + 1
    } else {
      return
    }
  }

  const loadMoreCategory = () => {
    if (!categoryLoadingMore.value && categoryHasMore.value) {
      categoryLoadingMore.value = true
      categoryPage.value = categoryPage.value + 1
    } else {
      return
    }
  }

  return {
    activeTab,
    tabs,
    categoriesStatus,
    categoriesError,
    isAllTab,
    isAllLoading,
    isCategoryLoading,
    allErrorMessage,
    categoryErrorMessage,
    allProjects: readonly(allProjects),
    categoryProjects: readonly(categoryProjects),
    allHasMore: readonly(allHasMore),
    categoryHasMore: readonly(categoryHasMore),
    allLoadingMore: readonly(allLoadingMore),
    categoryLoadingMore: readonly(categoryLoadingMore),
    totalCount,
    switchTab,
    refreshAllProjects,
    refreshCategoryProjects,
    loadMoreAll,
    loadMoreCategory
  }
}
