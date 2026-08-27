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
//
// showDragHint: when true (a visitor's first visit — see About.jsx), hovering
// gives the sticker a small unprompted lift of its own, using the same
// scale/shadow language as the press interaction (just a lighter dose of
// it) so the cue reads as "this is the same kind of lift you get from
// picking it up." Off on every later visit, once the hint has done its job.
function DraggableSticker({ src, alt, className, rotation = 0, bubbleText, bubbleGap, showDragHint = false }) {
  const rootRef = useRef(null)
  const imgRef = useRef(null)
  // Tracks whichever tween (press-lift or release-bounce) is currently
  // running on the image, so unmounting mid-animation (e.g. the page
  // changes while a sticker is still settling from a release) kills it
  // instead of leaving it ticking against a detached node — Draggable.kill()
  // below only tears down the drag listeners, not these separately-issued
  // gsap.to()/timeline() tweens.
  const activeTweenRef = useRef(null)
  // Guards the hover handlers below from fighting with an in-progress drag:
  // onPress/onRelease already own scale/rotation/--lift for the whole
  // press-hold-release lifecycle, so hover must stay hands-off of those
  // while a drag is live, even if the pointer never technically left the
  // element (it usually doesn't — the root translates with the cursor).
  const isDraggingRef = useRef(false)

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
        isDraggingRef.current = true
        gsap.killTweensOf(img)
        activeTweenRef.current = gsap.to(img, {
          scale: 1.1,
          rotation: rotation * 0.4,
          // Explicitly re-zeroed in case a hover-lift tween was killed
          // mid-flight above — without this, whatever `y` it had reached
          // would carry into the drag as a stray offset on top of the
          // root's own drag translation.
          y: 0,
          '--lift': 1,
          duration: 0.2,
          ease: 'power2.out',
        })
      },
      onRelease() {
        isDraggingRef.current = false
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

  // First-visit-only "you can pick this up" cue: a light lift, echoing
  // (at a fraction of the strength) the same scale + '--lift' shadow the
  // press interaction already uses, so hovering reads as a preview of what
  // pressing does. No-ops once the hint's been seen, and defers to an
  // in-progress drag rather than fighting onPress/onRelease for the same
  // properties.
  const handleHoverEnter = () => {
    if (!showDragHint || isDraggingRef.current) return
    gsap.killTweensOf(imgRef.current)
    gsap.to(imgRef.current, {
      y: -8,
      scale: 1.04,
      '--lift': 0.5,
      duration: 0.18,
      ease: 'power2.out',
    })
  }

  const handleHoverLeave = () => {
    if (!showDragHint || isDraggingRef.current) return
    gsap.killTweensOf(imgRef.current)
    gsap.to(imgRef.current, {
      y: 0,
      scale: 1,
      '--lift': 0,
      duration: 0.18,
      ease: 'power2.out',
    })
  }

  return (
    <div
      ref={rootRef}
      className={`${styles.stickerRoot} ${className ?? ''}`}
      style={bubbleGap != null ? { '--bubble-gap': `${bubbleGap}px` } : undefined}
      onMouseEnter={handleHoverEnter}
      onMouseLeave={handleHoverLeave}
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
