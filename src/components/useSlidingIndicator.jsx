import { useEffect, useLayoutEffect, useRef, useState } from 'react'

// egy csúszó "kapszula" pozícióját/méretét számolja ki az aktív elem alapján,
// villanás nélkül jelenik meg először, és bármilyen layout-változásra újraméri magát
export const useSlidingIndicator = (items, activeKey, getKey = (item) => item) => {
  const containerRef = useRef(null)
  const itemRefs = useRef([])
  const [style, setStyle] = useState({ opacity: 0 })
  const isFirstMeasure = useRef(true)

  const measure = () => {
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
      // a layout még nem állt be (pl. első render), próbáljuk újra a köv. frame-ben
      requestAnimationFrame(measure)
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
    // egy frame-et várunk, hogy a flex/grid layout biztosan a végleges méretekkel álljon
    const raf = requestAnimationFrame(measure)
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

    // minden olyan esetet lefed, amikor a konténer vagy a gombok mérete változhat
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