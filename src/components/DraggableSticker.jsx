import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Draggable } from 'gsap/Draggable'
import styles from './DraggableSticker.module.css'

gsap.registerPlugin(Draggable)

// Matches the site's own mobile ceiling everywhere else (Nav's hamburger
// cutover, About's stacked layout, etc.) — "mobile" here means the same
// ≤720px range those already treat as mobile, with tablet grouped in with
// desktop rather than with mobile.
const MOBILE_QUERY = '(max-width: 720px)'

// bubbleText is the desktop/tablet wording (always a single line — see
// Hero.jsx's cat/matcha bubbles, which pass nothing else and so render
// identically at every breakpoint). bubbleTextMobile is an optional
// mobile-only override (mango/camera) for icons whose mobile bubble should
// read differently — typically the same words with a "\n" line break
// inserted, though it isn't required to match otherwise.
function resolveBubbleText(text, mobileText, isMobile) {
  if (isMobile && mobileText) return mobileText
  return text
}

// Shared across every DraggableSticker instance on the site (About's Facts
// section, Hero's landing icons) — one "have you ever seen the drag hint"
// flag rather than a separate one per page, so it doesn't repeat itself
// just because the visitor's first sticker encounter happened to be on a
// different page than their second.
export const STICKER_HINT_SEEN_KEY = 'stickerHintSeen'

// A free-floating image that can be dragged around like a physical sticker:
// it lifts (scales up, casts a bigger shadow) while held, then settles back
// down flat with a little squash-and-wobble when released. Dragging moves
// the root (so an optional speech-bubble tooltip travels with the icon);
// the tilt/scale/lift animations live on the image itself.
//
// showDragHint: when true (a visitor's first visit — see About.jsx/Hero.jsx),
// hovering gives the sticker a small unprompted lift of its own, using the
// same scale/shadow language as the press interaction (just a lighter dose
// of it) so the cue reads as "this is the same kind of lift you get from
// picking it up." Off on every later visit, once the hint has done its job.
//
// bounceIn: opt-in entrance (off by default, e.g. About's stickers just
// appear normally) — drops in from above (fallDistance/fallDelay) and
// settles with a bounce, the same physics the landing hero's icons used
// before they became draggable stickers. Runs once, on mount, entirely
// separate from the press/hover tweens above (it animates the image's
// translateY/rotation/scale; Draggable only ever touches the root's own
// x/y, so the two never fight over the same property).
//
// inputAware: opt-in (off by default — About's stickers always drag and
// always reveal on :hover, unchanged). When on (the landing hero's icons),
// behavior splits by (hover: hover) and (pointer: fine) — the same feature
// query WorkCard uses for its own hover-vs-touch split, read here via
// matchMedia so it stays in sync with the mirrored CSS media query below,
// and re-checked on 'change' so a hybrid device gaining/losing a mouse
// mid-session flips it without a reload:
//   - hover-capable (desktop): unchanged from non-inputAware — draggable,
//     bubble on :hover — except the bubble is also force-hidden for the
//     duration of a drag (.dragging), so picking the sticker up doesn't
//     leave the tooltip stuck open over wherever it started.
//   - not hover-capable (tablet/mobile): no Draggable instance at all (so
//     nothing to drag), and the bubble is opened/closed by tapping the
//     sticker instead of :hover — tapping elsewhere, or the sticker again,
//     closes it. touch-action reverts to auto in this mode too, so a touch
//     that starts on the icon still scrolls the page normally rather than
//     the (now absent) drag handling swallowing it.
function DraggableSticker({
  src,
  alt,
  className,
  style,
  rotation = 0,
  bubbleText,
  bubbleTextMobile,
  bubbleGap,
  showDragHint = false,
  bounceIn = false,
  fallDistance = 0,
  fallDelay = 0,
  loading = 'lazy',
  inputAware = false,
}) {
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
  // The entrance timeline, if any — separate from activeTweenRef (which
  // tracks whichever of press/release is current) since this one can still
  // be mid-flight the instant a press/hover interrupts it.
  const entranceTweenRef = useRef(null)
  const bubbleRef = useRef(null)

  // Drives resolveBubbleText below — state (not a ref) since it needs to
  // trigger a re-render with the other line-break resolution when the
  // viewport crosses the mobile boundary, not just update something read
  // imperatively later.
  const [isMobileWidth, setIsMobileWidth] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches,
  )

  useEffect(() => {
    const mm = window.matchMedia(MOBILE_QUERY)
    const sync = () => setIsMobileWidth(mm.matches)
    sync()
    mm.addEventListener('change', sync)
    return () => mm.removeEventListener('change', sync)
  }, [])

  // Recomputed fresh every time the bubble is about to be shown (hover or
  // tap — see below), never cached, so a sticker dragged toward an edge
  // since its last reveal is measured at its actual current position, not
  // a stale one from mount. offsetWidth (not getBoundingClientRect) on
  // purpose: the bubble's own resting-state transform includes scale(0.9),
  // and offsetWidth reports the untransformed layout width the same
  // either way, matching what it'll actually measure once shown at
  // scale(1).
  const positionBubble = () => {
    const root = rootRef.current
    const bubble = bubbleRef.current
    if (!root || !bubble) return

    const EDGE_PADDING = 16
    const TAIL_MARGIN = 16
    const rootRect = root.getBoundingClientRect()
    const iconCenterX = rootRect.left + rootRect.width / 2
    const bubbleWidth = bubble.offsetWidth

    let shiftX = 0
    const naturalLeft = iconCenterX - bubbleWidth / 2
    const naturalRight = iconCenterX + bubbleWidth / 2
    if (naturalLeft < EDGE_PADDING) {
      shiftX = EDGE_PADDING - naturalLeft
    } else if (naturalRight > window.innerWidth - EDGE_PADDING) {
      shiftX = window.innerWidth - EDGE_PADDING - naturalRight
    }

    // The tail (.bubble::before/::after) points at the icon from the
    // bubble's own left edge, in px rather than the bubble's own 50% —
    // countering the shift above so it stays visually under the icon even
    // once the bubble body itself has moved to stay on screen. Clamped to
    // TAIL_MARGIN from either edge so an extreme shift (a sticker dragged
    // flush against the very edge) can't push the tail out past the
    // bubble's own rounded corners.
    const idealTailLeft = bubbleWidth / 2 - shiftX
    const tailLeft = Math.min(Math.max(idealTailLeft, TAIL_MARGIN), bubbleWidth - TAIL_MARGIN)

    bubble.style.setProperty('--bubble-shift', `${shiftX}px`)
    bubble.style.setProperty('--bubble-tail-left', `${tailLeft}px`)
  }

  useEffect(() => {
    const root = rootRef.current
    const img = imgRef.current
    if (!root || !img) return

    gsap.set(root, { x: 0, y: 0, opacity: bounceIn ? 0 : 1 })
    if (bounceIn) {
      gsap.set(img, { y: -fallDistance, rotation: rotation * 1.6, scale: 0.94, '--lift': 0 })
    } else {
      gsap.set(img, { rotation, '--lift': 0 })
    }

    // Only relevant when inputAware — non-inputAware always drags,
    // regardless of input (About's touch-drag support, unchanged).
    const mm = inputAware ? window.matchMedia('(hover: hover) and (pointer: fine)') : null
    let draggable = null

    const createDraggable = () => {
      ;[draggable] = Draggable.create(root, {
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
          // Force-hides the bubble for the drag's duration (see the
          // .dragging CSS rule) — :hover alone would otherwise leave it
          // shown the whole time, since the pointer never actually leaves
          // the element while dragging it.
          root.classList.add(styles.dragging)
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
          root.classList.remove(styles.dragging)
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
    }

    const destroyDraggable = () => {
      draggable?.kill()
      draggable = null
      root.classList.remove(styles.dragging)
    }

    // touch-action: none (see .sticker) is what lets Draggable claim touch
    // gestures for itself instead of the browser scrolling — appropriate
    // whenever dragging is actually possible, but wrong once it isn't: a
    // tablet/mobile visitor touching the icon while scrolling past it
    // should just scroll, not have that swallowed by a handler that no
    // longer exists.
    const syncDragMode = () => {
      const enabled = !inputAware || mm.matches
      img.style.touchAction = enabled ? '' : 'auto'
      if (enabled && !draggable) createDraggable()
      else if (!enabled && draggable) destroyDraggable()
    }
    syncDragMode()
    mm?.addEventListener('change', syncDragMode)

    if (bounceIn) {
      const tl = gsap.timeline({ delay: fallDelay })
      tl.to(root, { opacity: 1, duration: 0.2, ease: 'power1.out' }, 0)
        .to(img, { y: 0, duration: 1.15, ease: 'bounce.out' }, 0)
        .to(img, { rotation, duration: 0.9, ease: 'elastic.out(1, 0.55)' }, 0.05)
        .to(img, { scaleY: 0.86, scaleX: 1.08, duration: 0.09, ease: 'power1.out' }, 1.03)
        .to(img, { scaleY: 1, scaleX: 1, duration: 0.4, ease: 'elastic.out(1, 0.4)' }, '>')
        .to(img, { scale: 1, duration: 0.4, ease: 'power2.out' }, '<')
      entranceTweenRef.current = tl
    }

    return () => {
      mm?.removeEventListener('change', syncDragMode)
      destroyDraggable()
      activeTweenRef.current?.kill()
      entranceTweenRef.current?.kill()
    }
  }, [rotation, bounceIn, fallDistance, fallDelay, inputAware])

  // First-visit-only "you can pick this up" cue: a light lift, echoing
  // (at a fraction of the strength) the same scale + '--lift' shadow the
  // press interaction already uses, so hovering reads as a preview of what
  // pressing does. No-ops once the hint's been seen, and defers to an
  // in-progress drag rather than fighting onPress/onRelease for the same
  // properties. Also no-ops for inputAware on a device with no real hover
  // — there's nothing to hint at picking up once dragging itself is off,
  // and some mobile browsers fire a synthetic mouseenter after a tap that
  // would otherwise trigger this unintentionally.
  const handleHoverEnter = () => {
    // Unconditional (unlike the hint below) — every hover-revealed bubble
    // needs this, not just first-visit ones.
    positionBubble()
    if (!showDragHint || isDraggingRef.current) return
    if (inputAware && !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
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
    if (inputAware && !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    gsap.killTweensOf(imgRef.current)
    gsap.to(imgRef.current, {
      y: 0,
      scale: 1,
      '--lift': 0,
      duration: 0.18,
      ease: 'power2.out',
    })
  }

  // Tap-to-reveal for inputAware on a device with no real hover: tapping
  // the sticker toggles the bubble open/closed (via .bubbleOpen — see the
  // CSS, a plain class rather than anything :hover-based, since touch
  // ":hover" after a tap is inconsistent across browsers and would fight
  // with this); tapping anywhere else closes it. No-ops entirely — and
  // closes an already-open bubble — the instant the device is (or
  // becomes) hover-capable, since that path is :hover's job instead.
  useEffect(() => {
    if (!inputAware) return undefined
    const root = rootRef.current
    if (!root) return undefined

    const mm = window.matchMedia('(hover: hover) and (pointer: fine)')
    const closeBubble = () => root.classList.remove(styles.bubbleOpen)

    const onRootClick = () => {
      if (mm.matches) return
      const opening = !root.classList.contains(styles.bubbleOpen)
      if (opening) positionBubble()
      root.classList.toggle(styles.bubbleOpen)
    }
    const onDocumentPointerDown = (e) => {
      if (mm.matches || root.contains(e.target)) return
      closeBubble()
    }
    const syncCapability = () => {
      if (mm.matches) closeBubble()
    }

    root.addEventListener('click', onRootClick)
    document.addEventListener('pointerdown', onDocumentPointerDown)
    mm.addEventListener('change', syncCapability)

    return () => {
      root.removeEventListener('click', onRootClick)
      document.removeEventListener('pointerdown', onDocumentPointerDown)
      mm.removeEventListener('change', syncCapability)
    }
  }, [inputAware])

  const rootStyle =
    style || bubbleGap != null
      ? { ...style, ...(bubbleGap != null ? { '--bubble-gap': `${bubbleGap}px` } : null) }
      : undefined

  return (
    <div
      ref={rootRef}
      className={`${styles.stickerRoot} ${inputAware ? styles.hoverReveal : ''} ${className ?? ''}`}
      style={rootStyle}
      onMouseEnter={handleHoverEnter}
      onMouseLeave={handleHoverLeave}
    >
      {/* Used in About's Facts section and the landing hero, both below/at
          the fold — see the `loading` prop for the one difference that
          actually matters between them. */}
      <img ref={imgRef} src={src} alt={alt} className={styles.sticker} draggable={false} loading={loading} decoding="async" />
      {bubbleText && (
        <div ref={bubbleRef} className={styles.bubble} aria-hidden="true">
          {resolveBubbleText(bubbleText, bubbleTextMobile, isMobileWidth)}
        </div>
      )}
    </div>
  )
}

export default DraggableSticker
