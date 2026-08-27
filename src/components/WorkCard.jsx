import { useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import styles from './WorkCard.module.css'

// Gates the video-preview swap only — border/shadow/scale now applies at
// any width (see WorkCard.module.css), triggered by real hover or, on
// touch-only devices, by press instead (below). Video specifically stays
// desktop-only: a cramped window is a poor place for one to start
// autoplaying, preview clips add real bandwidth cost on what's more likely
// a metered mobile connection below this width, and the crossfade itself
// assumes room for the full card, not a cropped mobile one.
const DESKTOP_HOVER_BREAKPOINT = 1024

function WorkCard({ project, priority = false }) {
  const cardRef = useRef(null)
  // Two stacked <video> elements (not one with a swapped src) — switching a
  // single element's src drops it back to HAVE_NOTHING until the new source
  // re-buffers, showing a black frame for that gap. Instead, whichever clip
  // isn't currently on screen sits ready-and-buffering behind it, so a swap
  // is just an opacity flip between two elements that are both already
  // rendering real video.
  const videoRefA = useRef(null)
  const videoRefB = useRef(null)
  // Which of the two elements (0 = A, 1 = B) is currently the visible one.
  const activeSlotRef = useRef(0)
  // Position of the *visible* clip within previewVideos.
  const previewVideoIndexRef = useRef(0)
  const isMobileRef = useRef(false)
  const previewVideos = project.previewVideos
  // Cards without any previewVideos (none currently — see CaseStudies.jsx —
  // but WorkCard stays able to render one) just get the CSS-only
  // border/shadow/scale hover below, with no video listeners to attach.
  const hasVideoPreview = previewVideos?.length > 0

  useLayoutEffect(() => {
    const card = cardRef.current
    if (!card || !hasVideoPreview) return undefined

    const mm = window.matchMedia(`(max-width: ${DESKTOP_HOVER_BREAKPOINT}px)`)
    const syncMode = () => {
      isMobileRef.current = mm.matches
    }
    syncMode()
    mm.addEventListener('change', syncMode)

    const videoEls = [videoRefA.current, videoRefB.current]

    const showSlot = (slot) => {
      activeSlotRef.current = slot
      videoEls[slot].style.opacity = '1'
      videoEls[1 - slot].style.opacity = '0'
    }

    // Starts buffering a clip on the currently-hidden element well ahead of
    // when it's needed — it's set as soon as the visible clip starts, so it
    // has that whole clip's duration (2.5s+) to reach a playable state.
    const preloadNext = () => {
      const backEl = videoEls[1 - activeSlotRef.current]
      const nextUrl = previewVideos[(previewVideoIndexRef.current + 1) % previewVideos.length]
      if (backEl.getAttribute('src') !== nextUrl) backEl.src = nextUrl
    }

    const onEnter = () => {
      if (isMobileRef.current) return
      previewVideoIndexRef.current = 0
      const front = videoEls[activeSlotRef.current]
      if (front.getAttribute('src') !== previewVideos[0]) front.src = previewVideos[0]
      front.currentTime = 0
      front.play().catch(() => {})
      showSlot(activeSlotRef.current)
      preloadNext()
    }
    const onLeave = () => {
      if (isMobileRef.current) return
      videoEls[0].style.opacity = '0'
      videoEls[1].style.opacity = '0'
      videoEls[0].pause()
      videoEls[1].pause()
    }
    card.addEventListener('pointerenter', onEnter)
    card.addEventListener('pointerleave', onLeave)

    // Swaps to the next clip as each one finishes, wrapping back to the
    // first — runs for as long as the card stays hovered since onLeave just
    // pauses rather than detaching these listeners. The next clip has
    // (ideally) already been buffering in the background since the current
    // one started, via preloadNext — canplay only actually waits on it in
    // the rare case a clip finishes faster than the next one can load.
    const advance = () => {
      const nextSlot = 1 - activeSlotRef.current
      const nextIndex = (previewVideoIndexRef.current + 1) % previewVideos.length
      const nextEl = videoEls[nextSlot]

      const play = () => {
        nextEl.currentTime = 0
        nextEl.play().catch(() => {})
        previewVideoIndexRef.current = nextIndex
        showSlot(nextSlot)
        preloadNext()
      }

      if (nextEl.readyState >= 2) {
        play()
      } else {
        nextEl.addEventListener('canplay', play, { once: true })
      }
    }
    videoEls[0].addEventListener('ended', advance)
    videoEls[1].addEventListener('ended', advance)

    return () => {
      mm.removeEventListener('change', syncMode)
      card.removeEventListener('pointerenter', onEnter)
      card.removeEventListener('pointerleave', onLeave)
      videoEls[0].removeEventListener('ended', advance)
      videoEls[1].removeEventListener('ended', advance)
    }
  }, [previewVideos, hasVideoPreview])

  // Border/shadow/scale on touch: :hover (see WorkCard.module.css) already
  // covers every hover-capable pointer at any width — a mouse/trackpad,
  // including one attached to an otherwise-touch tablet. This effect only
  // has to handle the complementary case, a device with *no* such pointer,
  // where the same feedback has to come from an explicit press instead.
  //
  // (hover: hover) and (pointer: fine) is the same feature-detection query
  // as the CSS media rule, read here via matchMedia so JS and CSS always
  // agree on which devices are "hover-capable" rather than maintaining two
  // separate opinions — and re-checked on change, not just at mount, since
  // it's a live signal: a Surface-style tablet gaining or losing an
  // attached mouse mid-session flips it without a reload. Deliberately not
  // UA-sniffing or checking viewport width for this — width says nothing
  // about whether a pointer is attached, and UA strings are exactly the
  // kind of signal that quietly drifts out of date as new devices ship.
  useLayoutEffect(() => {
    const card = cardRef.current
    if (!card) return undefined

    const mm = window.matchMedia('(hover: hover) and (pointer: fine)')
    let isTouchOnly = !mm.matches

    const addPressed = () => card.classList.add(styles.cardPressed)
    const removePressed = () => card.classList.remove(styles.cardPressed)

    const syncInputMode = () => {
      isTouchOnly = !mm.matches
      // A device that just gained hover capability (mouse attached
      // mid-session) hands off to :hover immediately rather than
      // potentially leaving this class stuck on from an in-progress touch.
      if (!isTouchOnly) removePressed()
    }
    mm.addEventListener('change', syncInputMode)

    const onTouchStart = () => {
      if (isTouchOnly) addPressed()
    }
    const onTouchEnd = () => {
      if (isTouchOnly) removePressed()
    }
    // passive: these never call preventDefault, so telling the browser
    // that up front lets it start scrolling/navigating immediately rather
    // than waiting to see if this handler cancels the touch.
    card.addEventListener('touchstart', onTouchStart, { passive: true })
    card.addEventListener('touchend', onTouchEnd, { passive: true })
    card.addEventListener('touchcancel', onTouchEnd, { passive: true })

    return () => {
      mm.removeEventListener('change', syncInputMode)
      card.removeEventListener('touchstart', onTouchStart)
      card.removeEventListener('touchend', onTouchEnd)
      card.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [])

  const compactHiddenTags = project.compactHiddenTags ?? []
  const CardTag = project.href ? Link : 'article'
  const cardTagProps = project.href ? { to: project.href } : {}

  return (
    <CardTag className={styles.card} ref={cardRef} {...cardTagProps}>
      <div className={styles.media}>
        <img
          src={project.image}
          alt={project.imageAlt}
          className={styles.image}
          // Only the first card in the grid is reliably above the fold —
          // the rest should never compete with it for bandwidth.
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : undefined}
          decoding="async"
        />
        {hasVideoPreview && (
          <>
            <video ref={videoRefA} className={styles.previewVideo} muted playsInline preload="auto" />
            <video ref={videoRefB} className={styles.previewVideo} muted playsInline preload="auto" />
          </>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.cardHeader}>
          <div className={styles.tags}>
            {project.tags.map((tag) => (
              <span key={tag} className={compactHiddenTags.includes(tag) ? `${styles.tag} ${styles.tagHiddenCompact}` : styles.tag}>
                {tag}
              </span>
            ))}
          </div>
          {project.team && <span className={styles.team}>Team</span>}
        </div>

        <h3 className={styles.title}>{project.title}</h3>

        <p className={`${styles.description} body-s`}>
          {project.descriptionLines[0]}
          <br />
          {project.descriptionLines[1]}
        </p>
      </div>
    </CardTag>
  )
}

export default WorkCard
