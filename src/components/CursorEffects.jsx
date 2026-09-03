import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import gsap from 'gsap'
import { rand, STAR5_CLIP, STAR4_CLIP } from '../utils/stars'
import './CursorEffects.keyframes.css'
import styles from './CursorEffects.module.css'

const TRAIL_DISABLED_ROUTES = ['/about']

const TRAIL_COLORS = ['#B7CAE0', '#D7DBF0', '#DFDEEC', '#F1CDC5', '#F1C7BE', '#FFDBC8', '#FFD6C4']

function pickTrailColor(id) {
  const idx = Math.min(Math.floor(rand(id * 7.7 + 21) * TRAIL_COLORS.length), TRAIL_COLORS.length - 1)
  return TRAIL_COLORS[idx]
}

const CURSOR_STAR_DURATION = 1

function makeCursorStar(id, x, y, overSky) {
  const shapeRoll = rand(id * 5.3 + 3)
  const shape = shapeRoll > 0.8 ? 'dot' : shapeRoll > 0.45 ? 'star4' : 'star5'
  const size = 5 + rand(id * 2.9 + 4) * 7
  const maxOp = overSky ? (0.7 + rand(id * 9.1 + 8) * 0.3) * 0.95 : 1
  const color = pickTrailColor(id)
  return { id, x, y, shape, size, maxOp, dur: CURSOR_STAR_DURATION, color, bornAt: performance.now() }
}

const CURSOR_STAR_SPACING = 24
const CURSOR_STAR_MAX = 30
const CURSOR_STAR_EASE = 0.55
const DOT_COLOR_ON_SKY = 'oklch(98% 0.01 90)'
const DOT_COLOR_OFF_SKY = 'var(--color-text)'

// Custom dot cursor plus its trailing twinkling stars, mounted once for the
// whole app (outside the routed pages) so both persist across every page.
// No-ops entirely on touch/coarse pointers, where there's no real cursor to
// replace. Pauses while the tab is hidden so it isn't burning frames in the
// background.
function CursorEffects() {
  const { pathname } = useLocation()
  const [cursorStars, setCursorStars] = useState([])
  const dotRef = useRef(null)
  const starIdRef = useRef(1)
  const targetRef = useRef(null)
  const currentRef = useRef(null)
  const lastSpawnPosRef = useRef(null)
  const trailDisabledRef = useRef(false)

  trailDisabledRef.current = TRAIL_DISABLED_ROUTES.includes(pathname)

  useEffect(() => {
    if (TRAIL_DISABLED_ROUTES.includes(pathname)) setCursorStars([])
  }, [pathname])

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return undefined

    document.documentElement.classList.add('cursor-hidden')

    const onMove = (e) => {
      targetRef.current = { x: e.clientX, y: e.clientY }
      if (!currentRef.current) currentRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('pointermove', onMove)

    let frame = 0
    let ticking = false
    let skyRect = null
    let dotOverSky = null
    let cardRects = []

    // A rect-based, non-layout-forcing stand-in for elementFromPoint(). Calling
    // elementFromPoint() every frame (or every star spawn) forces a synchronous
    // layout each time, which was stalling the main thread badly enough to make
    // the CSS blur/fade/scale keyframes on the trailing stars skip frames
    // instead of animating smoothly. getBoundingClientRect(), read only
    // periodically, is effectively free by comparison.
    const readSkyRect = () => {
      const el = document.querySelector('[data-sky-zone]')
      skyRect = el ? el.getBoundingClientRect() : null
    }
    const isOverSky = (x, y) => !!skyRect && x >= skyRect.left && x <= skyRect.right && y >= skyRect.top && y <= skyRect.bottom

    // Same rect-cache approach as the sky zone above, but for every case
    // study card at once (see WorkCard.jsx's data-no-cursor-trail) — there
    // can be several on screen, so this checks a list rather than one rect.
    // Only ever matches anything on the landing page, since that's the only
    // place a WorkCard renders; elsewhere the querySelectorAll is just empty.
    const readCardRects = () => {
      cardRects = [...document.querySelectorAll('[data-no-cursor-trail]')].map((el) => el.getBoundingClientRect())
    }
    const isOverCard = (x, y) =>
      cardRects.some((r) => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom)

    readSkyRect()
    readCardRects()

    const tick = () => {
      frame++
      if (frame % 10 === 0) {
        readSkyRect()
        readCardRects()
      }
      if (frame % 20 === 0) {
        const now = performance.now()
        setCursorStars((prev) => {
          const next = prev.filter((st) => now - st.bornAt < st.dur * 1000 + 150)
          return next.length === prev.length ? prev : next
        })
      }

      const target = targetRef.current
      const current = currentRef.current
      if (target && current) {
        if (dotRef.current) {
          dotRef.current.style.transform = `translate3d(${target.x}px, ${target.y}px, 0) translate(-50%, -50%)`
          const overSky = isOverSky(target.x, target.y)
          if (overSky !== dotOverSky) {
            dotOverSky = overSky
            dotRef.current.style.background = overSky ? DOT_COLOR_ON_SKY : DOT_COLOR_OFF_SKY
          }
        }

        current.x += (target.x - current.x) * CURSOR_STAR_EASE
        current.y += (target.y - current.y) * CURSOR_STAR_EASE

        const last = lastSpawnPosRef.current
        const shouldSpawn = !last || Math.hypot(current.x - last.x, current.y - last.y) >= CURSOR_STAR_SPACING
        if (shouldSpawn) {
          lastSpawnPosRef.current = { x: current.x, y: current.y }
          if (!trailDisabledRef.current && !isOverCard(current.x, current.y)) {
            const id = starIdRef.current++
            const overSky = isOverSky(current.x, current.y)
            setCursorStars((prev) => [...prev.slice(-(CURSOR_STAR_MAX - 1)), makeCursorStar(id, current.x, current.y, overSky)])
          }
        }
      }
    }

    // Driven by gsap's shared ticker (already running for Lenis/DraggableSticker)
    // instead of a second independent requestAnimationFrame loop.
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

  return (
    <>
      <div ref={dotRef} className={styles.dot} aria-hidden="true" />
      {cursorStars.map((st) => (
        <div
          key={st.id}
          className={styles.star}
          style={{
            left: st.x,
            top: st.y,
            width: st.size,
            height: st.size,
            background: st.color,
            clipPath: st.shape === 'star5' ? STAR5_CLIP : st.shape === 'star4' ? STAR4_CLIP : 'circle(50% at 50% 50%)',
            filter: `blur(${st.size * 0.35}px)`,
            animation: `cursor-star-life ${st.dur}s ease-in-out forwards`,
            '--max-op': st.maxOp,
          }}
        />
      ))}
    </>
  )
}

export default CursorEffects
