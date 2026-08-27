import { useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import styles from './WorkCard.module.css'

// The hover state (border/shadow/scale, and the video swap below) is
// desktop-only — below this, the card stays exactly as it renders at rest,
// since there's no clean hover trigger on a touch device and a cramped
// window is a poor place for a video to start autoplaying anyway. Matches
// the CSS hover media query's own min-width gate, so the two stay in sync.
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
