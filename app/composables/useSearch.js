export const useSearch = () => {
  const searchKeyword = ref('')
  const searchMode = ref(false)
  const isSearchVisible = ref(false)
  const searchInput = ref(null)
  const isClient = import.meta.client

  const focusInput = () => {
    const element = searchInput.value

    if (element) {
      element.focus()
    } else {
      return
    }
  }

  const showSearch = () => {
    isSearchVisible.value = true
    nextTick(() => {
      focusInput()
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
    const isShortcut = (e.ctrlKey || e.metaKey) && e.key === 'k'
    const isEscape = e.key === 'Escape'

    if (isShortcut) {
      e.preventDefault()
      showSearch()
    } else if (isEscape && isSearchVisible.value) {
      hideSearch()
    } else {
      return
    }
  }

  onMounted(() => {
    if (isClient) {
      window.addEventListener('keydown', handleKeydown)
    } else {
      return
    }
  })

  onUnmounted(() => {
    if (isClient) {
      window.removeEventListener('keydown', handleKeydown)
    } else {
      return
    }
  })

  return {
    searchKeyword,
    searchMode,
    isSearchVisible,
    searchInput,
    showSearch,
    hideSearch,
    clearSearch
  }
}
