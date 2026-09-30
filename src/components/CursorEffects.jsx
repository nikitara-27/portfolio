import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { SHOW_CURSOR_SPARKLES } from '../config/features'
import styles from './CursorEffects.module.css'

/* ---------- Tuning ---------- */

// Density: a burst spawns each time the cursor travels this many px
// (smaller = more bursts), with this many sparkles per burst.
const BURST_SPACING = 36
const BURST_MIN = 4
const BURST_MAX = 8
// How far from the cursor sparkles appear, in px.
const BURST_RADIUS_MIN = 10
const BURST_RADIUS_MAX = 55
// Hard cap on sparkles alive at once.
const MAX_PARTICLES = 60

// Fade speed: each sparkle's total lifetime in seconds (random in range),
// and how far it drifts outward from the cursor over that time, in px.
const LIFE_MIN = 0.8
const LIFE_MAX = 1.2
const DRIFT_MIN = 8
const DRIFT_MAX = 24

// Opacity range — lower values read as faint, far-away sparkles.
const OPACITY_MIN = 0.3
const OPACITY_MAX = 1

// Size: overall diameter in px per shape, and how often each shape shows
// up (weights are relative). Color comes from --color-cursor-star.
const SHAPES = [
  { type: 'cross', weight: 0.45, size: [6, 20] },
  { type: 'crossRing', weight: 0.15, size: [10, 20] },
  { type: 'ring', weight: 0.15, size: [3, 9] },
  { type: 'dot', weight: 0.25, size: [1, 3] },
]
const STROKE_MIN = 0.75
const STROKE_MAX = 1.25

/* ---------- Sparkle drawing ---------- */

const random = (min, max) => min + Math.random() * (max - min)

function pickShape() {
  let roll = Math.random() * SHAPES.reduce((sum, s) => sum + s.weight, 0)
  for (const shape of SHAPES) {
    roll -= shape.weight
    if (roll <= 0) return shape
  }
  return SHAPES[0]
}

// 4-point sparkle: four long arms that taper from a hairline-thin waist
// out to a point — a filled outline, so the taper stays crisp at any size.
function crossPath(r, waist) {
  return `M0 ${-r} L${waist} ${-waist} L${r} 0 L${waist} ${waist} L0 ${r} L${-waist} ${waist} L${-r} 0 L${-waist} ${-waist} Z`
}

// Returns the sparkle's inline SVG markup, drawn in px around (0, 0).
function sparkleSvg(type, size) {
  const r = size / 2
  const stroke = random(STROKE_MIN, STROKE_MAX).toFixed(2)
  const pad = 1
  const box = `${-r - pad} ${-r - pad} ${size + pad * 2} ${size + pad * 2}`
  let body
  if (type === 'cross') {
    body = `<path d="${crossPath(r, stroke / 2)}" fill="currentColor"/>`
  } else if (type === 'crossRing') {
    body = `<path d="${crossPath(r, stroke / 2)}" fill="currentColor"/><circle r="${(r * 0.28).toFixed(2)}" fill="none" stroke="currentColor" stroke-width="${stroke}"/>`
  } else if (type === 'ring') {
    body = `<circle r="${Math.max(r - stroke / 2, 0.5).toFixed(2)}" fill="none" stroke="currentColor" stroke-width="${stroke}"/>`
  } else {
    body = `<circle r="${r}" fill="currentColor"/>`
  }
  return `<svg width="${size + pad * 2}" height="${size + pad * 2}" viewBox="${box}" aria-hidden="true">${body}</svg>`
}

// Custom dot cursor plus (optionally, see SHOW_CURSOR_SPARKLES) bursts of
// thin-line sparkles around it, mounted once for the whole app (outside the
// routed pages) so both persist across every page. No-ops entirely on
// touch/coarse pointers, where there's no real cursor to replace; sparkles
// are skipped when reduced motion is on.
// Pauses while the tab is hidden so it isn't burning frames in the
// background.
function CursorEffects() {
  const dotRef = useRef(null)
  const layerRef = useRef(null)

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return undefined

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const layer = layerRef.current
    let target = null
    let lastBurst = null
    let alive = 0

    document.documentElement.classList.add('cursor-hidden')

    const onMove = (e) => {
      target = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('pointermove', onMove)

    // Rect-cache for elements that opt out of sparkles (see WorkCard.jsx's
    // data-no-cursor-trail) — read only every few frames, since
    // getBoundingClientRect/elementFromPoint on every frame forces layout.
    let frame = 0
    let noTrailRects = []
    const readNoTrailRects = () => {
      noTrailRects = [...document.querySelectorAll('[data-no-cursor-trail]')].map((el) => el.getBoundingClientRect())
    }
    const isOverNoTrail = (x, y) => noTrailRects.some((r) => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom)
    readNoTrailRects()

    const spawnSparkle = (cx, cy) => {
      const shape = pickShape()
      const size = random(shape.size[0], shape.size[1])
      const angle = random(0, Math.PI * 2)
      const dist = BURST_RADIUS_MIN + Math.sqrt(Math.random()) * (BURST_RADIUS_MAX - BURST_RADIUS_MIN)
      const drift = random(DRIFT_MIN, DRIFT_MAX)
      const life = random(LIFE_MIN, LIFE_MAX)
      const opacity = random(OPACITY_MIN, OPACITY_MAX)
      const x = cx + Math.cos(angle) * dist
      const y = cy + Math.sin(angle) * dist

      const el = document.createElement('div')
      el.className = styles.sparkle
      el.innerHTML = sparkleSvg(shape.type, size)
      layer.appendChild(el)
      alive++

      gsap.set(el, { x, y, xPercent: -50, yPercent: -50, scale: 0.2, opacity: 0, rotation: random(-12, 12) })
      gsap
        .timeline({
          onComplete: () => {
            el.remove()
            alive--
          },
        })
        // Drift outward from the cursor for the whole lifetime…
        .to(el, { x: x + Math.cos(angle) * drift, y: y + Math.sin(angle) * drift, duration: life, ease: 'power1.out' }, 0)
        // …with a quick twinkle pop in…
        .to(el, { scale: 1.25, opacity, duration: life * 0.15, ease: 'power2.out' }, 0)
        .to(el, { scale: 1, duration: life * 0.15, ease: 'power1.inOut' }, life * 0.15)
        // …then a fade out.
        .to(el, { opacity: 0, scale: 0.7, duration: life * 0.6, ease: 'power1.in' }, life * 0.4)
    }

    const tick = () => {
      frame++
      if (frame % 10 === 0) readNoTrailRects()
      if (!target) return

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${target.x}px, ${target.y}px, 0) translate(-50%, -50%)`
      }

      if (!SHOW_CURSOR_SPARKLES) return

      // Bursts are throttled by distance moved: standing still spawns none.
      if (lastBurst && Math.hypot(target.x - lastBurst.x, target.y - lastBurst.y) < BURST_SPACING) return
      lastBurst = { ...target }
      if (reducedMotion.matches || isOverNoTrail(target.x, target.y)) return

      const count = Math.min(Math.round(random(BURST_MIN, BURST_MAX)), MAX_PARTICLES - alive)
      for (let i = 0; i < count; i++) spawnSparkle(target.x, target.y)
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
      gsap.killTweensOf(layer.children)
      layer.replaceChildren()
    }
  }, [])

  return (
    <>
      <div ref={layerRef} className={styles.layer} aria-hidden="true" />
      <div ref={dotRef} className={styles.dot} aria-hidden="true" />
    </>
  )
}

export default CursorEffects
