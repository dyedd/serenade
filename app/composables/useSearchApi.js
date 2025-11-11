// 搜索API Hook
export const useSearchApi = (url, options = {}) => {
  const {
    pageSize = 10,
    onSuccess,
    onError
  } = options

  const loading = ref(false)
  const data = ref([])
  const error = ref(null)
  const currentPage = ref(1)
  const totalPages = ref(0)
  const totalItems = ref(0)
  const searchKeyword = ref('')
  const searchMode = ref(false)

  const search = async (keyword, page = 1, size = pageSize) => {
    if (!keyword?.trim()) {
      return
    }

    loading.value = true
    error.value = null
    searchKeyword.value = keyword
    searchMode.value = true

    try {
      const result = await $fetch(url, {
        query: {
          keyword: keyword.trim(),
          page,
          pageSize: size
        }
      })

      data.value = result.data
      currentPage.value = result.page
      totalPages.value = result.totalPages
      totalItems.value = result.totalItems

      onSuccess?.(result)
      return result
    } catch (err) {
      error.value = err
      console.error('Search error:', err)
      onError?.(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearSearch = () => {
    searchKeyword.value = ''
    searchMode.value = false
    data.value = []
  }

  return {
    loading: readonly(loading),
    data: readonly(data),
    error: readonly(error),
    currentPage: readonly(currentPage),
    totalPages: readonly(totalPages),
    totalItems: readonly(totalItems),
    searchKeyword: readonly(searchKeyword),
    searchMode: readonly(searchMode),
    search,
    clearSearch
  }
}
