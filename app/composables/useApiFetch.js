// 通用API调用Hook，处理加载状态、错误和分页
export const useApiFetch = (url, options = {}) => {
  const {
    page = 1,
    pageSize = 10,
    immediate = true,
    onSuccess,
    onError
  } = options

  const loading = ref(false)
  const data = ref(null)
  const error = ref(null)
  const currentPage = ref(page)
  const totalPages = ref(0)
  const totalItems = ref(0)
  const response = ref(null)  // 存储完整响应

  const fetchData = async (pageNum = currentPage.value, size = pageSize) => {
    loading.value = true
    error.value = null

    try {
      const result = await $fetch(url, {
        query: {
          page: pageNum,
          pageSize: size
        }
      })

      response.value = result
      data.value = result.data
      currentPage.value = result.page
      totalPages.value = result.totalPages
      totalItems.value = result.totalItems

      onSuccess?.(result)
      return result
    } catch (err) {
      error.value = err
      console.error('API fetch error:', err)
      onError?.(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  if (immediate) {
    fetchData()
  }

  return {
    loading: readonly(loading),
    data: readonly(data),
    error: readonly(error),
    currentPage: readonly(currentPage),
    totalPages: readonly(totalPages),
    totalItems: readonly(totalItems),
    fetchData,
    response: readonly(response)  // 返回完整响应
  }
}
