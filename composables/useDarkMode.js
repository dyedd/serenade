export const useDarkMode = () => {
  const isDark = useState('darkMode', () => false)

  const updateDomClass = () => {
    if (process.client) {
      document.documentElement.classList.toggle('dark', isDark.value)
    }
  }

  const savePreference = () => {
    if (process.client) {
      localStorage.setItem('darkMode', isDark.value ? 'dark' : 'light')
    }
  }

  const toggle = () => {
    isDark.value = !isDark.value
    updateDomClass()
    savePreference()
  }

  const set = (value) => {
    isDark.value = value
    updateDomClass()
    savePreference()
  }

  const load = () => {
    if (process.client) {
      const saved = localStorage.getItem('darkMode')
      if (saved) {
        isDark.value = saved === 'dark'
      } else {
        // 默认跟随系统
        isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
      }
      updateDomClass()
    }
  }

  return {
    isDark: readonly(isDark),
    toggle,
    set,
    load
  }
}
