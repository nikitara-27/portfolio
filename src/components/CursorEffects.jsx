import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import styles from './CursorEffects.module.css'

// Custom dot cursor, mounted once for the whole app (outside the routed
// pages) so it persists across every page. No-ops entirely on touch/coarse
// pointers, where there's no real cursor to replace. Pauses while the tab
// is hidden so it isn't burning frames in the background.
function CursorEffects() {
  const dotRef = useRef(null)

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return undefined

    let target = null

    document.documentElement.classList.add('cursor-hidden')

    const onMove = (e) => {
      target = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('pointermove', onMove)

    const tick = () => {
      if (target && dotRef.current) {
        dotRef.current.style.transform = `translate3d(${target.x}px, ${target.y}px, 0) translate(-50%, -50%)`
      }
    }

    // Driven by gsap's shared ticker (already running for Lenis/DraggableSticker)
    // instead of a second independent requestAnimationFrame loop.
    let ticking = false
    const start = () => {
      if (!ticking) {
        ticking = true
        gsap.ticker.add(tick)
      }
    }
    const stop = () => {
      if (ticking) {
        ticking = false
        gsap.ticker.remove(tick)
      }
    }
    const onVisibilityChange = () => (document.hidden ? stop() : start())

    document.addEventListener('visibilitychange', onVisibilityChange)
    if (!document.hidden) start()

    return () => {
      document.documentElement.classList.remove('cursor-hidden')
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      stop()
    }
  }, [])

  return <div ref={dotRef} className={styles.dot} aria-hidden="true" />
}

export default CursorEffects
