export const useDarkMode = () => {
  const isDark = useState('darkMode', () => false)
  const isClient = import.meta.client

  const updateDomClass = () => {
    if (isClient) {
      document.documentElement.classList.toggle('dark', isDark.value)
    } else {
      return
    }
  }

  const savePreference = () => {
    if (isClient) {
      localStorage.setItem('darkMode', isDark.value ? 'dark' : 'light')
    } else {
      return
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
    if (isClient) {
      const saved = localStorage.getItem('darkMode')
      if (saved === 'dark') {
        isDark.value = true
      } else if (saved === 'light') {
        isDark.value = false
      } else {
        isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
      }
      updateDomClass()
    } else {
      return
    }
  }

  return {
    isDark: readonly(isDark),
    toggle,
    set,
    load
  }
}
