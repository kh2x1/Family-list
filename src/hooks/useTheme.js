import { useEffect, useState, useCallback } from 'react'

const STORAGE_KEY = 'fsl-theme'

// تحديد السمة الابتدائية من التخزين المحلي أو تفضيل النظام
function getInitialTheme() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * خطّاف الوضع الليلي/النهاري — يخزّن الاختيار ويطبّقه على عنصر <html>.
 */
export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }, [])

  return { theme, toggleTheme }
}
