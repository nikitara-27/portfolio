import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { Draggable } from 'gsap/Draggable'
import styles from './DraggableSticker.module.css'

gsap.registerPlugin(Draggable)

// A free-floating image that can be dragged around like a physical sticker:
// it lifts (scales up, casts a bigger shadow) while held, then settles back
// down flat with a little squash-and-wobble when released. Dragging moves
// the root (so an optional speech-bubble tooltip travels with the icon);
// the tilt/scale/lift animations live on the image itself.
function DraggableSticker({ src, alt, className, rotation = 0, bubbleText, bubbleGap }) {
  const rootRef = useRef(null)
  const imgRef = useRef(null)
  // Tracks whichever tween (press-lift or release-bounce) is currently
  // running on the image, so unmounting mid-animation (e.g. the page
  // changes while a sticker is still settling from a release) kills it
  // instead of leaving it ticking against a detached node — Draggable.kill()
  // below only tears down the drag listeners, not these separately-issued
  // gsap.to()/timeline() tweens.
  const activeTweenRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    const img = imgRef.current
    if (!root || !img) return

    gsap.set(root, { x: 0, y: 0 })
    gsap.set(img, { rotation, '--lift': 0 })

    const [draggable] = Draggable.create(root, {
      // Draggable.create's own bounds calculation can nudge the element's
      // x/y on creation (most visible under StrictMode's double-effect in
      // dev). Re-zero and resync immediately below so it never ships with
      // a stray offset.
      type: 'x,y',
      inertia: false,
      bounds: window,
      cursor: 'grab',
      activeCursor: 'grabbing',
      onPress() {
        gsap.killTweensOf(img)
        activeTweenRef.current = gsap.to(img, {
          scale: 1.1,
          rotation: rotation * 0.4,
          '--lift': 1,
          duration: 0.2,
          ease: 'power2.out',
        })
      },
      onRelease() {
        gsap.killTweensOf(img)
        const tl = gsap.timeline()
        tl.to(img, { scale: 0.93, duration: 0.09, ease: 'power1.out' })
          .to(img, { scale: 1, duration: 0.45, ease: 'elastic.out(1, 0.5)' })
          .to(img, { rotation, duration: 0.5, ease: 'elastic.out(1, 0.55)' }, '<')
          .to(img, { '--lift': 0, duration: 0.3, ease: 'power2.out' }, '<')
        activeTweenRef.current = tl
      },
    })

    gsap.set(root, { x: 0, y: 0 })
    draggable.update()

    return () => {
      draggable.kill()
      activeTweenRef.current?.kill()
    }
  }, [rotation])

  return (
    <div
      ref={rootRef}
      className={`${styles.stickerRoot} ${className ?? ''}`}
      style={bubbleGap != null ? { '--bubble-gap': `${bubbleGap}px` } : undefined}
    >
      {/* Only ever used in About's Facts section, always below the fold. */}
      <img ref={imgRef} src={src} alt={alt} className={styles.sticker} draggable={false} loading="lazy" decoding="async" />
      {bubbleText && (
        <div className={styles.bubble} aria-hidden="true">
          {bubbleText}
        </div>
      )}
    </div>
  )
}

export default DraggableSticker
