import { useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { FiPlayCircle } from 'react-icons/fi'
import styles from './WorkCard.module.css'

// Hover interactivity (the fill/crossfade timeline, video autoplay) is
// desktop-only — tablet renders the same static, scrim-free card as
// desktop (see WorkCard.module.css) but without hover, since tablets have
// no clean hover state to trigger it from.
const DESKTOP_HOVER_BREAKPOINT = 1024
// Mirrors --color-divider-rgb (styles/variables.css) — kept as a literal
// since gsap needs a plain string here, not a CSS custom property.
const CARD_FILL_COLOR = '222, 217, 209'

function WorkCard({ project, priority = false }) {
  const cardRef = useRef(null)
  const staticLayerRef = useRef(null)
  const previewLayerRef = useRef(null)
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
  const timelineRef = useRef(null)
  const isMobileRef = useRef(false)
  const previewVideos = project.previewVideos

  useLayoutEffect(() => {
    const card = cardRef.current
    // disableHoverPreview is an explicit per-project opt-out (used by cards
    // that don't want the crossfade/placeholder treatment at all yet, as
    // opposed to simply not having previewVideos -- which still falls
    // through to the "Video preview" placeholder below) -- skips the whole
    // timeline/listener setup so hover falls back to the plain CSS scale.
    if (!card || project.disableHoverPreview) return undefined

    // The hover timeline (card fill + image/video crossfade) is desktop-only;
    // below the breakpoint the card just stays as its normal, static card,
    // with no hover/video interaction.
    const mm = window.matchMedia(`(max-width: ${DESKTOP_HOVER_BREAKPOINT}px)`)

    const ctx = gsap.context(() => {
      timelineRef.current = gsap
        .timeline({ paused: true, defaults: { duration: 0.4, ease: 'power2.inOut' } })
        .to(card, { backgroundColor: `rgba(${CARD_FILL_COLOR}, 1)` }, 0)
        .to(staticLayerRef.current, { opacity: 0, duration: 0.35 }, 0.05)
        .to(previewLayerRef.current, { opacity: 1, duration: 0.35 }, 0.05)
    }, card)

    const syncMode = () => {
      isMobileRef.current = mm.matches
      if (mm.matches) timelineRef.current?.pause(0)
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
      if (!previewVideos?.length) return
      const backEl = videoEls[1 - activeSlotRef.current]
      const nextUrl = previewVideos[(previewVideoIndexRef.current + 1) % previewVideos.length]
      if (backEl.getAttribute('src') !== nextUrl) backEl.src = nextUrl
    }

    const onEnter = () => {
      if (isMobileRef.current) return
      timelineRef.current?.play()
      if (!previewVideos?.length) return

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
      timelineRef.current?.reverse()
      videoEls[0]?.pause()
      videoEls[1]?.pause()
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
      if (!previewVideos?.length) return
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
    videoEls[0]?.addEventListener('ended', advance)
    videoEls[1]?.addEventListener('ended', advance)

    return () => {
      mm.removeEventListener('change', syncMode)
      card.removeEventListener('pointerenter', onEnter)
      card.removeEventListener('pointerleave', onLeave)
      videoEls[0]?.removeEventListener('ended', advance)
      videoEls[1]?.removeEventListener('ended', advance)
      ctx.revert()
    }
  }, [previewVideos, project.disableHoverPreview])

  const compactHiddenTags = project.compactHiddenTags ?? []
  const CardTag = project.href ? Link : 'article'
  const cardTagProps = project.href ? { to: project.href } : {}

  return (
    <CardTag className={styles.card} ref={cardRef} {...cardTagProps}>
      <div className={styles.scrim} aria-hidden="true" />

      <div className={styles.content}>
        <div className={styles.collapseTop}>
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
        </div>

        <h3 className={styles.title}>{project.title}</h3>

        <p className={`${styles.description} body-s`}>
          {project.descriptionLines[0]}
          <br />
          {project.descriptionLines[1]}
        </p>
      </div>

      <div className={styles.media}>
        <div className={styles.mediaLayer} ref={staticLayerRef}>
          <img
            src={project.image}
            alt={project.imageAlt}
            // Only the first card in the grid is reliably above the fold —
            // the rest should never compete with it for bandwidth.
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : undefined}
            decoding="async"
          />
        </div>
        {!project.disableHoverPreview && (
          <div className={`${styles.mediaLayer} ${styles.mediaPreview}`} ref={previewLayerRef}>
            {previewVideos?.length ? (
              <>
                <video ref={videoRefA} className={styles.previewVideo} muted playsInline preload="auto" style={{ opacity: 1 }} />
                <video ref={videoRefB} className={styles.previewVideo} muted playsInline preload="auto" style={{ opacity: 0 }} />
              </>
            ) : (
              <>
                <FiPlayCircle className={styles.previewIcon} />
                <span className={styles.previewLabel}>Video preview</span>
              </>
            )}
          </div>
        )}
      </div>
    </CardTag>
  )
}

export default WorkCard
