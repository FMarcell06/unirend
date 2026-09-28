import { createContext, useContext, useEffect, useState } from 'react'
import { BACKGROUNDS } from '../backgrounds'

const ThemeContext = createContext()

const readStored = (key, fallback) => {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('theme') || 'light'
    } catch {
      return 'light'
    }
  })
  const [background, setBackground] = useState(() => readStored('background', { id: 'default' }))

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem('theme', theme)
    } catch {
      // nem gond, ha nem menthető
    }
  }, [theme])

  useEffect(() => {
    const root = document.documentElement
    const props = ['--color-bg', '--blob-1', '--blob-2']
    const isDark = theme === 'dark'

    if (background.id === 'default') {
      // az index.css alapértékei érvényesek
      props.forEach((p) => root.style.removeProperty(p))
    } else if (background.id === 'custom' && background.color) {
      const c = background.color
      root.style.setProperty('--color-bg', `color-mix(in srgb, ${c} ${isDark ? 12 : 8}%, ${isDark ? '#0b0b0d' : '#f2f4f8'})`)
      root.style.setProperty('--blob-1', isDark ? `color-mix(in srgb, ${c} 45%, #000000)` : c)
      root.style.setProperty('--blob-2', `color-mix(in srgb, ${c} ${isDark ? 30 : 45}%, ${isDark ? '#3b2a5c' : '#c9b6ff'})`)
    } else {
      const preset = BACKGROUNDS.find((b) => b.id === background.id)
      if (preset) {
        const v = preset[theme]
        root.style.setProperty('--color-bg', v.bg)
        root.style.setProperty('--blob-1', v.a)
        root.style.setProperty('--blob-2', v.b)
      }
    }

    try {
      localStorage.setItem('background', JSON.stringify(background))
    } catch {
      // nem gond
    }
  }, [background, theme])

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, background, setBackground }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)