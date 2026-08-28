import { useLayoutEffect, useRef } from 'react'
import { FiArrowDown } from 'react-icons/fi'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import TypewriterText from '../components/TypewriterText'
import HeroIllustration from '../components/HeroIllustration'
import matchaIcon from '../assets/icons/matcha-latte.svg'
import mangoIcon from '../assets/icons/mango.svg'
import catIcon from '../assets/icons/cat-sit.svg'
import cameraIcon from '../assets/icons/camera.svg'
import styles from './Hero.module.css'

gsap.registerPlugin(ScrollTrigger)

const TAGLINES = [
  'ui/ux',
  'product designer',
  'systems thinker',
  'visual storyteller',
  'problem solver',
]

const ILLUSTRATIONS = [
  { src: mangoIcon, alt: 'A mango', rotation: -10, left: '4%', bottom: '9%', width: 'min(11vw, 90px)', fallDistance: 380, fallDelay: 0.1 },
  { src: catIcon, alt: 'My cat, Gwen, sitting', rotation: 7, left: '16%', bottom: '5%', width: 'min(13vw, 105px)', fallDistance: 460, fallDelay: 0.3 },
  { src: matchaIcon, alt: 'A matcha latte', rotation: -8, left: '72%', bottom: '8%', width: 'min(12vw, 95px)', fallDistance: 420, fallDelay: 0.5 },
  { src: cameraIcon, alt: 'A camera', rotation: 13, left: '84%', bottom: '13%', width: 'min(10vw, 80px)', fallDistance: 340, fallDelay: 0.7 },
]

function Hero() {
  const heroRef = useRef(null)
  const scrollHintRef = useRef(null)

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
      <div className={styles.frame}>
        {ILLUSTRATIONS.map((ill) => (
          <HeroIllustration
            key={ill.alt}
            src={ill.src}
            alt={ill.alt}
            rotation={ill.rotation}
            fallDistance={ill.fallDistance}
            fallDelay={ill.fallDelay}
            style={{ left: ill.left, bottom: ill.bottom, width: ill.width }}
          />
        ))}

        <div className={styles.content}>
          <TypewriterText as="h1" className={styles.headline} first="niki taradash" words={TAGLINES} />

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
