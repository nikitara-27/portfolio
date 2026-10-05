import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import DraggableSticker, { STICKER_HINT_SEEN_KEY } from '../components/DraggableSticker'
import matchaIcon from '../assets/icons/matcha-latte.svg'
import mangoIcon from '../assets/icons/mango.svg'
import catIcon from '../assets/icons/cat-sit.svg'
import cameraIcon from '../assets/icons/camera.svg'
import { SHOW_LANDING_STICKERS } from '../config/features'
import styles from './Hero.module.css'

/* ---------- Scale-in reveal ---------- */
const REVEAL_DURATION_MS = 1800 // per line
const REVEAL_STAGGER_MS = 250 // each line starts this long after the previous one
const REVEAL_START_SCALE = 1.18 // lines settle from this size down to 1
const REVEAL_EASING = 'cubic-bezier(0.16, 1, 0.3, 1)'
const FONT_WAIT_MAX_MS = 1500 // longest to wait for fonts before revealing anyway

// The reveal plays on every full page load, but not when coming back to the
// homepage within the site (route change or the nav logo remounting the
// landing page) — module state resets only on a real load/refresh.
let playedThisPageLoad = false

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Resolves once the hero's fonts (Manrope, Tchig Mono) are ready, so they
// don't swap mid-animation — or after FONT_WAIT_MAX_MS regardless.
function waitForHeroFonts() {
  const fonts = document.fonts
  if (!fonts) return Promise.resolve()
  const root = getComputedStyle(document.documentElement)
  const families = ['--font-family', '--font-family-accent'].map((v) => root.getPropertyValue(v).trim())
  const loaded = Promise.all(families.map((family) => fonts.load(`500 1em ${family}`))).then(() => fonts.ready)
  const timeout = new Promise((resolve) => window.setTimeout(resolve, FONT_WAIT_MAX_MS))
  return Promise.race([loaded, timeout]).catch(() => {})
}

// Same drop-in-and-bounce entrance these icons had as plain HeroIllustrations
// before they became draggable stickers (see DraggableSticker's bounceIn),
// now paired with bubbleText for the hover speech bubble and a slightly
// larger width than before. left/bottom/rotation/fallDistance/fallDelay are
// all still per-icon, unrelated to the drag/bubble behavior itself.
const ILLUSTRATIONS = [
  {
    src: mangoIcon,
    alt: 'A mango',
    rotation: -10,
    left: '2%',
    bottom: '9%',
    width: 'min(12.5vw, 104px)',
    fallDistance: 380,
    fallDelay: 0.1,
    bubbleText: 'mangoes are my favorite fruit',
    bubbleTextMobile: 'mangoes are\nmy favorite fruit',
  },
  {
    src: catIcon,
    alt: 'My cat, Gwen, sitting',
    rotation: 7,
    left: '20%',
    bottom: '5%',
    width: 'min(14.5vw, 121px)',
    fallDistance: 460,
    fallDelay: 0.3,
    bubbleText: 'i love cats',
  },
  {
    src: matchaIcon,
    alt: 'A matcha latte',
    rotation: -8,
    left: '68%',
    bottom: '8%',
    width: 'min(13.5vw, 109px)',
    fallDistance: 420,
    fallDelay: 0.5,
    bubbleText: 'matcha lattes fuel me',
  },
  {
    src: cameraIcon,
    alt: 'A camera',
    rotation: 13,
    left: '88%',
    bottom: '13%',
    width: 'min(11.5vw, 92px)',
    fallDistance: 340,
    fallDelay: 0.7,
    bubbleText: 'i love content creation',
    bubbleTextMobile: 'i love\ncontent creation',
  },
]

function Hero() {
  const lineRefs = useRef([])
  // Decided once per mount. Reading (not setting) the module flag here keeps
  // it StrictMode-safe; the effect below marks it.
  const [animate] = useState(
    () => !playedThisPageLoad && !prefersReducedMotion() && document.visibilityState === 'visible',
  )

  // Each line fades in while settling from slightly larger to its normal
  // size, staggered. Only transform/opacity animate, and the text is always
  // rendered, so nothing shifts. Lines are hidden (before first paint) only
  // while waiting for fonts; every exit path clears that, so the text can't
  // be left invisible.
  useLayoutEffect(() => {
    playedThisPageLoad = true
    if (!animate) return undefined
    const lines = lineRefs.current.filter(Boolean)
    let cancelled = false
    lines.forEach((el) => {
      el.style.opacity = '0'
    })
    const showNow = () => {
      lines.forEach((el) => {
        el.style.opacity = ''
        el.getAnimations().forEach((a) => a.finish())
      })
    }

    waitForHeroFonts().then(() => {
      if (cancelled) return
      lines.forEach((el, i) => {
        el.style.opacity = ''
        el.animate(
          [
            { opacity: 0, transform: `scale(${REVEAL_START_SCALE})` },
            { opacity: 1, transform: 'scale(1)' },
          ],
          { duration: REVEAL_DURATION_MS, delay: i * REVEAL_STAGGER_MS, easing: REVEAL_EASING, fill: 'backwards' },
        )
      })
    })

    // Skip to the end if the tab is hidden mid-reveal.
    const onVisibility = () => {
      if (document.hidden) {
        cancelled = true
        showNow()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisibility)
      showNow()
    }
  }, [animate])

  const lineRef = (i) => (el) => {
    lineRefs.current[i] = el
  }

  return (
    <section className={styles.hero}>
      {SHOW_LANDING_STICKERS && <HeroStickers />}

      <div className={styles.content}>
        <h1 ref={lineRef(0)} className={styles.line}>
          Niki Taradash
        </h1>

        <p className="accent-1">
          <span ref={lineRef(1)} className={styles.line}>
            Design student @ Boston University
          </span>
          <span ref={lineRef(2)} className={styles.line}>
            Currently product design intern @ Bendi Wellness
          </span>
        </p>
      </div>
    </section>
  )
}

// The draggable stickers, currently switched off (see SHOW_LANDING_STICKERS).
// Their old resting spots (ILLUSTRATIONS' left/bottom) were laid out for the
// previous full-height hero and will need re-tuning if they come back.
function HeroStickers() {
  // Lazy initializer runs synchronously during render — before any of the
  // four sticker instances' own effects fire — so all four (and, on
  // whichever page loads second, About's own three) read the same
  // pre-this-page-view value instead of racing to flip it themselves. See
  // DraggableSticker's STICKER_HINT_SEEN_KEY for why this is one shared
  // flag rather than a page-local one.
  const [showDragHint] = useState(() => {
    try {
      return localStorage.getItem(STICKER_HINT_SEEN_KEY) == null
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STICKER_HINT_SEEN_KEY, '1')
    } catch {
      // Nothing to do if storage isn't writable — worst case the hint
      // shows again next visit.
    }
  }, [])

  return ILLUSTRATIONS.map((ill) => (
    <DraggableSticker
      key={ill.alt}
      src={ill.src}
      alt={ill.alt}
      rotation={ill.rotation}
      bubbleText={ill.bubbleText}
      bubbleTextMobile={ill.bubbleTextMobile}
      bounceIn
      fallDistance={ill.fallDistance}
      fallDelay={ill.fallDelay}
      showDragHint={showDragHint}
      inputAware
      loading="eager"
      style={{ position: 'absolute', zIndex: 0, left: ill.left, bottom: ill.bottom, width: ill.width }}
    />
  ))
}

export default Hero
