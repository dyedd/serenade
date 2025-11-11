// 搜索功能Hook
export const useSearch = () => {
  const searchKeyword = ref('')
  const searchMode = ref(false)
  const isSearchVisible = ref(false)
  const searchInput = ref(null)

  const showSearch = () => {
    isSearchVisible.value = true
    nextTick(() => {
      searchInput.value?.focus()
    })
  }

  const hideSearch = () => {
    isSearchVisible.value = false
  }

  const clearSearch = () => {
    searchKeyword.value = ''
    searchMode.value = false
  }

  const handleKeydown = (e) => {
    // Ctrl+K 或 Cmd+K 打开搜索
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault()
      showSearch()
    }
    // ESC 关闭搜索
    if (e.key === 'Escape' && isSearchVisible.value) {
      hideSearch()
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
    onUnmounted(() => {
      window.removeEventListener('keydown', handleKeydown)
    })
  })

  return {
    searchKeyword: readonly(searchKeyword),
    searchMode: readonly(searchMode),
    isSearchVisible: readonly(isSearchVisible),
    searchInput,
    showSearch,
    hideSearch,
    clearSearch
  }
}
