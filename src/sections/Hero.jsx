import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { FiArrowDown } from 'react-icons/fi'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import TypewriterText from '../components/TypewriterText'
import DraggableSticker, { STICKER_HINT_SEEN_KEY } from '../components/DraggableSticker'
import matchaIcon from '../assets/icons/matcha-latte.svg'
import mangoIcon from '../assets/icons/mango.svg'
import catIcon from '../assets/icons/cat-sit.svg'
import cameraIcon from '../assets/icons/camera.svg'
import styles from './Hero.module.css'

gsap.registerPlugin(ScrollTrigger)

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
    bubbleText: 'i love content creation across all breakpoints',
    bubbleTextMobile: 'i love\ncontent creation',
  },
]

function Hero() {
  const heroRef = useRef(null)
  const scrollHintRef = useRef(null)

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

  useLayoutEffect(() => {
    const hero = heroRef.current
    const hint = scrollHintRef.current
    if (!hero || !hint) return undefined

    const ctx = gsap.context(() => {
      // Toggles on every crossing rather than firing once (unlike the
      // case-study text reveal's ScrollTrigger, which uses once: true and
      // stays revealed permanently) — scrolling back up into the hero
      // should bring this back, not leave it faded out for good.
      //
      // Tracked via onUpdate/progress against the hero itself (top top to
      // bottom top — the hero's full height), not a discrete
      // onEnter/onEnterBack crossing keyed to a fixed point: this needs to
      // fade out at the very first pixel of downward scroll, and a point
      // trigger sitting exactly at the hero's own top coincides with the
      // page's initial scroll position (0), which is ambiguous — a
      // boundary GSAP may or may not treat as "already entered" the
      // moment the trigger is created, faded-out state on load. Checking
      // progress > 0 has no such ambiguity: it's definitively false at
      // scrollY 0 and definitively true the instant scrolling starts, in
      // either direction.
      let isHidden = false
      ScrollTrigger.create({
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        onUpdate: (self) => {
          const shouldHide = self.progress > 0
          if (shouldHide === isHidden) return
          isHidden = shouldHide
          gsap.to(hint, { opacity: shouldHide ? 0 : 1, duration: 0.4, ease: 'power1.out' })
        },
      })
    }, hero)

    return () => ctx.revert()
  }, [])

  return (
    <section className={styles.hero} ref={heroRef}>
      {/* Siblings of .frame, not children of it — .frame has overflow:
          hidden (it clips a couple of other things), which would clip
          these mid-drag the instant they're pulled past the hero's own
          edges. Positioned against .hero instead, whose box .frame's own
          inset: 0 exactly matches, so resting placement is unaffected. */}
      {ILLUSTRATIONS.map((ill) => (
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
      ))}

      <div className={styles.frame}>
        <div className={styles.content}>
          <TypewriterText as="h1" className={styles.headline} text="niki taradash" />

          <p className={styles.body}>
            currently design student @ boston university
            <br />
            product design @ bendi wellness
          </p>
        </div>
      </div>

      <div className={styles.scrollHint} ref={scrollHintRef}>
        <FiArrowDown className={styles.scrollHintArrow} />
        <span>scroll for more</span>
        <FiArrowDown className={styles.scrollHintArrow} />
      </div>
    </section>
  )
}

export default Hero
