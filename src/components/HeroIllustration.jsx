import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import styles from './HeroIllustration.module.css'

// A hero-background sticker that drops in on mount (gravity fall + landing
// bounce) and pops upward like a kernel of popcorn on hover, settling back
// down with the same bounce physics as the entrance.
function HeroIllustration({ src, alt, className, style, rotation = 0, fallDistance = 420, fallDelay = 0 }) {
  const rootRef = useRef(null)
  // Tracks whichever timeline (entrance or hover-pop) is currently running
  // on this element, so unmounting mid-animation (e.g. navigating away
  // while a hover bounce is still playing) kills it instead of leaving it
  // ticking against a detached node.
  const activeTweenRef = useRef(null)

  useEffect(() => {
    const el = rootRef.current
    if (!el) return

    gsap.set(el, { y: -fallDistance, rotation: rotation * 1.6, opacity: 0, scale: 0.94 })

    const tl = gsap.timeline({ delay: fallDelay })
    tl.to(el, { opacity: 1, duration: 0.2, ease: 'power1.out' }, 0)
      .to(el, { y: 0, duration: 1.15, ease: 'bounce.out' }, 0)
      .to(el, { rotation, duration: 0.9, ease: 'elastic.out(1, 0.55)' }, 0.05)
      .to(el, { scaleY: 0.86, scaleX: 1.08, duration: 0.09, ease: 'power1.out' }, 1.03)
      .to(el, { scaleY: 1, scaleX: 1, duration: 0.4, ease: 'elastic.out(1, 0.4)' }, '>')
      .to(el, { scale: 1, duration: 0.4, ease: 'power2.out' }, '<')
    activeTweenRef.current = tl

    return () => tl.kill()
  }, [fallDistance, fallDelay, rotation])

  const handleEnter = () => {
    const el = rootRef.current
    if (!el) return
    gsap.killTweensOf(el)
    const kick = Math.random() > 0.5 ? 1 : -1
    const tl = gsap.timeline()
    tl.to(el, {
      y: -60,
      scale: 1.14,
      rotation: rotation + kick * 10,
      duration: 0.16,
      ease: 'power2.out',
    })
      .to(el, { y: 0, duration: 0.65, ease: 'bounce.out' })
      .to(el, { scale: 1, rotation, duration: 0.5, ease: 'elastic.out(1, 0.5)' }, '<')
    activeTweenRef.current = tl
  }

  useEffect(() => () => activeTweenRef.current?.kill(), [])

  return (
    <div
      ref={rootRef}
      className={`${styles.illustration} ${className ?? ''}`}
      style={style}
      onMouseEnter={handleEnter}
    >
      {/* Only ever used in the landing page's hero, always above the fold —
          fetch immediately rather than deferring like the rest of the page. */}
      <img src={src} alt={alt} className={styles.img} draggable={false} loading="eager" decoding="async" />
    </div>
  )
}

export default HeroIllustration
