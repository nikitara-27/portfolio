import { useMemo, useRef } from 'react'
import { rand, STAR5_CLIP, STAR4_CLIP } from '../utils/stars'
import './BackgroundAnimation.keyframes.css'
import styles from './BackgroundAnimation.module.css'

function buildStars(speed) {
  const stars = []
  for (let i = 0; i < 22; i++) {
    const x = rand(i * 3.1 + 1) * 100
    const y = rand(i * 7.7 + 2) * 62
    const shapeRoll = rand(i * 5.3 + 3)
    const shape = shapeRoll > 0.8 ? 'dot' : shapeRoll > 0.45 ? 'star4' : 'star5'
    const size = 5 + rand(i * 2.9 + 4) * 7
    const dur = 9 + rand(i * 4.4 + 5) * 8
    const delay = rand(i * 6.6 + 6) * 5
    const maxOp = (0.7 + rand(i * 9.1 + 8) * 0.3) * 0.95
    const shiftDur = 50 + rand(i * 11.4 + 9) * 45
    const dx1 = `${(rand(i * 13.2 + 10) * 16 - 8).toFixed(1)}vw`
    const dy1 = `${(rand(i * 14.8 + 11) * 12 - 6).toFixed(1)}vh`
    const dx2 = `${(rand(i * 16.6 + 12) * 16 - 8).toFixed(1)}vw`
    const dy2 = `${(rand(i * 18.1 + 13) * 12 - 6).toFixed(1)}vh`

    stars.push({
      key: i,
      style: {
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: `${size}px`,
        height: `${size}px`,
        background: 'oklch(98% 0.01 90)',
        clipPath: shape === 'star5' ? STAR5_CLIP : shape === 'star4' ? STAR4_CLIP : 'circle(50% at 50% 50%)',
        filter: `blur(${size * 0.35}px)`,
        animation: `star-twinkle ${dur / speed}s ease-in-out infinite, star-shift ${shiftDur / speed}s ease-in-out infinite`,
        animationDelay: `${delay / speed}s, 0s`,
        '--max-op': maxOp,
        '--dx1': dx1,
        '--dy1': dy1,
        '--dx2': dx2,
        '--dy2': dy2,
      },
    })
  }
  return stars
}

const CLOUD_CONFIGS = [
  { y: 2, w: 48, h: 22, seed: 1, dur: 124, delay: 0, opacity: 0.5 },
  { y: 14, w: 90, h: 41, seed: 2, dur: 184, delay: -36, opacity: 0.45 },
  { y: 28, w: 62, h: 28, seed: 3, dur: 140, delay: -80, opacity: 0.5 },
  { y: 44, w: 100, h: 45, seed: 4, dur: 200, delay: -20, opacity: 0.45 },
  { y: 60, w: 40, h: 18, seed: 5, dur: 112, delay: -60, opacity: 0.42 },
  { y: 70, w: 74, h: 33, seed: 6, dur: 168, delay: -120, opacity: 0.4 },
]

function getCloudSprite(cache, colorStr, seed, blurAmt) {
  const key = `cloud|${colorStr}|${seed}|${blurAmt}`
  if (cache.current[key]) return cache.current[key]

  const W = 640
  const H = 320
  const marginX = W * 0.22
  const marginY = H * 0.28
  const innerW = W - marginX * 2
  const innerH = H - marginY * 2
  const src = document.createElement('canvas')
  src.width = W
  src.height = H
  const sctx = src.getContext('2d')
  const lobes = 10 + (seed % 4)
  sctx.globalCompositeOperation = 'lighter'
  for (let i = 0; i < lobes; i++) {
    const t = i / (lobes - 1)
    const cx = marginX + innerW * (0.1 + t * 0.8) + Math.sin(seed + i * 3.1) * innerW * 0.04
    const cy = marginY + innerH * 0.5 + Math.sin(t * Math.PI * 2.4 + seed) * innerH * 0.14
    const rx = innerW * (0.16 + 0.05 * Math.sin(seed + i * 1.7))
    const ry = innerH * (0.28 + 0.08 * Math.cos(seed + i * 2.1))
    const grad = sctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry))
    grad.addColorStop(0, colorStr)
    grad.addColorStop(0.55, colorStr)
    grad.addColorStop(1, 'transparent')
    sctx.fillStyle = grad
    sctx.beginPath()
    sctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
    sctx.fill()
  }

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  ctx.filter = `blur(${blurAmt}px)`
  ctx.drawImage(src, 0, 0)
  const url = canvas.toDataURL('image/png')
  cache.current[key] = url
  return url
}

function buildClouds(cache, speed) {
  return CLOUD_CONFIGS.map((c, i) => ({
    key: i,
    style: {
      position: 'absolute',
      top: `${c.y}%`,
      left: 0,
      width: `${c.w}vw`,
      height: `${c.h}vw`,
      backgroundImage: `url(${getCloudSprite(cache, '#FFFFFF', c.seed, 15)})`,
      backgroundSize: '100% 100%',
      backgroundRepeat: 'no-repeat',
      opacity: c.opacity,
      mixBlendMode: 'screen',
      animation: `cloud-loop ${c.dur / speed}s linear infinite`,
      animationDelay: `${c.delay / speed}s`,
    },
  }))
}

// Full-bleed, animated sunset-sky background. Sits behind hero content and
// never intercepts pointer events. The gradient's final stop matches
// --color-bg so it blends seamlessly into the rest of the page.
function BackgroundAnimation({ accentColor = '#e8c9c0', speed = 1.3 }) {
  const spriteCache = useRef({})

  const skyGradient = `linear-gradient(180deg, oklch(78% 0.045 250) 0%, oklch(85% 0.03 260) 22%, oklch(90% 0.025 280) 38%, oklch(93% 0.03 40) 58%, oklch(90% 0.05 45) 68%, oklch(86% 0.045 30) 76%, ${accentColor} 84%, var(--color-bg) 100%)`

  const stars = useMemo(() => buildStars(speed), [speed])
  const clouds = useMemo(() => buildClouds(spriteCache, speed), [speed])

  return (
    <div className={styles.background} style={{ background: skyGradient }} aria-hidden="true">
      <div className={styles.sunGlow} style={{ animation: 'sun-pulse 14s ease-in-out infinite' }} />
      {stars.map((st) => (
        <div key={st.key} style={st.style} />
      ))}
      <div className={styles.cloudLayer}>
        {clouds.map((cl) => (
          <div key={cl.key} style={cl.style} />
        ))}
      </div>
    </div>
  )
}

export default BackgroundAnimation
