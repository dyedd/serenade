export const useDarkMode = () => {
  const isDark = useState('darkMode', () => false)

  const toggleDarkMode = () => {
    isDark.value = !isDark.value
    updateDarkClass()
    saveDarkModePreference()
  }

  const setDarkMode = (value) => {
    isDark.value = value
    updateDarkClass()
    saveDarkModePreference()
  }

  const updateDarkClass = () => {
    if (process.client) {
      if (isDark.value) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }

  const saveDarkModePreference = () => {
    if (process.client) {
      localStorage.setItem('darkMode', isDark.value ? 'dark' : 'light')
    }
  }

  const loadDarkModePreference = () => {
    if (process.client) {
      const saved = localStorage.getItem('darkMode')
      if (saved) {
        isDark.value = saved === 'dark'
      } else {
        // 默认跟随系统
        isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
      }
      updateDarkClass()
    }
  }

  return {
    isDark,
    toggleDarkMode,
    setDarkMode,
    loadDarkModePreference
  }
}
