import { useEffect, useLayoutEffect, useRef, useState } from 'react'

export const useSlidingIndicator = (items, activeKey, getKey = (item) => item) => {
  const containerRef = useRef(null)
  const itemRefs = useRef([])
  const [style, setStyle] = useState({ opacity: 0 })
  const isFirstMeasure = useRef(true)

  const measure = (attempt = 0) => {
    const index = items.findIndex((item) => getKey(item) === activeKey)
    const el = itemRefs.current[index]
    const container = containerRef.current
    if (!el || !container) {
      setStyle({ opacity: 0 })
      return
    }

    const elRect = el.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()

    if (elRect.width === 0) {
      // rejtett elem (pl. a felső nav mobilon): néhányszor újrapróbáljuk, aztán feladjuk
      if (attempt < 5) requestAnimationFrame(() => measure(attempt + 1))
      return
    }

    if (isFirstMeasure.current) {
      document.documentElement.classList.add('nav-resizing')
      isFirstMeasure.current = false
      requestAnimationFrame(() => {
        requestAnimationFrame(() => document.documentElement.classList.remove('nav-resizing'))
      })
    }

    setStyle({
      opacity: 1,
      width: elRect.width,
      transform: `translateX(${elRect.left - containerRect.left}px)`,
    })
  }

  useLayoutEffect(() => {
    const raf = requestAnimationFrame(() => measure())
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey, items.length])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const onChange = () => {
      const el = document.documentElement
      el.classList.add('nav-resizing')
      measure()
      requestAnimationFrame(() => {
        requestAnimationFrame(() => el.classList.remove('nav-resizing'))
      })
    }

    const ro = new ResizeObserver(onChange)
    ro.observe(container)
    window.addEventListener('resize', onChange)

    return () => {
      ro.disconnect()
      window.removeEventListener('resize', onChange)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey])

  return { containerRef, itemRefs, style }
}