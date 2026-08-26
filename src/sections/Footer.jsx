import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import BackgroundAnimation from '../components/BackgroundAnimation'
import { useWorkLinkHandler } from '../hooks/useWorkLinkHandler'
import catSleepIcon from '../assets/icons/cat-sleep.svg'
import catSleep1Icon from '../assets/icons/cat-sleep-1.svg'
import catSleep2Icon from '../assets/icons/cat-sleep-2.svg'
import catSleep3Icon from '../assets/icons/cat-sleep-3.svg'
import catUpIcon from '../assets/icons/cat-up-1.svg'
import matchaCheersIcon from '../assets/icons/matcha-cheers.svg'
import matchaCheersClinkIcon from '../assets/icons/matcha-cheers-clink.svg'
import styles from './Footer.module.css'

gsap.registerPlugin(ScrollTrigger)

const EMAIL = 'nikitaradash@gmail.com'
const LINKEDIN_URL = 'https://www.linkedin.com/in/nikitaradash/'
const INSTAGRAM_URL = 'https://www.instagram.com/niikiai/'

// Idle-cycle sleep frames, in order. The "z" rises a little further in each
// successive frame (see cat-sleep-1/2/3.svg), so cycling through them reads
// as a slow, breathing sleep animation.
const SLEEP_FRAMES = [catSleepIcon, catSleep1Icon, catSleep2Icon, catSleep3Icon]
const SLEEP_FRAME_MS = 1000

function Footer() {
  const footerRef = useRef(null)
  const frameRef = useRef(null)
  const handleWorkClick = useWorkLinkHandler()
  const [catAwake, setCatAwake] = useState(false)
  const [sleepFrame, setSleepFrame] = useState(0)
  const [cheersClinked, setCheersClinked] = useState(false)

  useEffect(() => {
    if (catAwake) return undefined
    const id = setInterval(() => {
      setSleepFrame((frame) => (frame + 1) % SLEEP_FRAMES.length)
    }, SLEEP_FRAME_MS)
    return () => clearInterval(id)
  }, [catAwake])

  const handleCatEnter = () => setCatAwake(true)
  const handleCatLeave = () => {
    setCatAwake(false)
    setSleepFrame(0)
  }

  useLayoutEffect(() => {
    const footer = footerRef.current
    const frame = frameRef.current
    if (!footer || !frame) return

    const ctx = gsap.context(() => {
      // The reverse of the Hero's border-close: starts curved (a dome-like
      // half circle across the top edge) and straightens into a flat
      // rectangle as the footer scrolls into view, scrubbed the same way.
      //
      // A plain percentage radius doesn't work here: on a wide, short
      // element percentage-based corners barely look like they're
      // shrinking until the very end (the horizontal radius stays huge
      // relative to the width for most of the range), so straightening
      // reads as "stuck." Each corner's radius takes a "horizontal
      // vertical" pair, so keeping the horizontal component at 50% (spans
      // the corner smoothly) while tweening only the vertical px keeps
      // the dome's height fixed regardless of viewport width, shrinking
      // at a constant, visible rate as that value tweens to 0.
      gsap.fromTo(
        frame,
        { borderTopLeftRadius: '50% 160px', borderTopRightRadius: '50% 160px' },
        {
          borderTopLeftRadius: '50% 0px',
          borderTopRightRadius: '50% 0px',
          ease: 'none',
          // "top top" (and even "center center") can be unreachable for a
          // last-on-page section: depending on the footer's own height
          // (e.g. the taller stacked mobile layout), the page may run out
          // of room to scroll before that point, permanently stalling the
          // tween mid-curve. "bottom bottom" is the one endpoint that's
          // always reachable — it's the exact scroll position where the
          // page hits its natural max-scroll, since the footer is the
          // last element on the page.
          scrollTrigger: {
            trigger: footer,
            start: 'top bottom',
            end: 'bottom bottom',
            scrub: true,
          },
        },
      )
    }, footer)

    return () => ctx.revert()
  }, [])

  return (
    <footer className={styles.footer} ref={footerRef}>
      <div className={styles.frame} ref={frameRef}>
        <BackgroundAnimation />

        <div className={styles.content}>
          <div className={styles.grid}>
            <div
              className={styles.cheersRow}
              onMouseEnter={() => setCheersClinked(true)}
              onMouseLeave={() => setCheersClinked(false)}
            >
              <h1 className={styles.cheers}>Cheers!</h1>
              <img
                src={cheersClinked ? matchaCheersClinkIcon : matchaCheersIcon}
                alt=""
                aria-hidden="true"
                className={`${styles.cheersIcon} ${styles.cheersIconDesktop}`}
                draggable={false}
                // The footer is always below the fold on every page.
                loading="lazy"
                decoding="async"
              />
              {/* Tablet/mobile always show the "clinked" state statically, with
                  no hover interaction — the desktop-only image above (which
                  swaps on cheersRow's hover handlers) is hidden at that width
                  instead of touching the hover state/handlers themselves. */}
              <img
                src={matchaCheersClinkIcon}
                alt=""
                aria-hidden="true"
                className={`${styles.cheersIcon} ${styles.cheersIconStatic}`}
                draggable={false}
                loading="lazy"
                decoding="async"
              />
            </div>
            <h2 className={styles.connect}>Let&rsquo;s connect.</h2>

            <div className={styles.sitemapSocial}>
              <div className={styles.subColumn}>
                <span className={`${styles.label} body-m`}>Sitemap</span>
                <nav className={styles.linkList}>
                  <Link to="/" className={styles.link}>
                    Home
                  </Link>
                  <Link to="/" className={styles.link} onClick={handleWorkClick}>
                    Work
                  </Link>
                  <Link to="/play" className={styles.link}>
                    Play
                  </Link>
                  <Link to="/about" className={styles.link}>
                    About
                  </Link>
                </nav>
              </div>

              <div className={styles.subColumn}>
                <span className={`${styles.label} body-m`}>Social</span>
                <nav className={styles.linkList}>
                  <a href={LINKEDIN_URL} target="_blank" rel="noreferrer" className={styles.link}>
                    LinkedIn
                  </a>
                  <a href={`mailto:${EMAIL}`} className={styles.link}>
                    Email
                  </a>
                  <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className={styles.link}>
                    Instagram
                  </a>
                </nav>
              </div>
            </div>

            <div className={styles.mascot}>
              <div className={styles.mascotFrames}>
                {/* cat-sleep (frame 0) is an always-visible base layer, not part of
                    the crossfade — so leaving hover reveals it instantly (no fade
                    delay), and idle cycling only ever crossfades frames 1-3 on top
                    of it, never leaving a blank gap between two 0-opacity frames. */}
                <img
                  src={SLEEP_FRAMES[0]}
                  alt="A sleeping cat"
                  className={`${styles.mascotImg} ${styles.mascotFrameBase}`}
                  draggable={false}
                  loading="lazy"
                  decoding="async"
                />
                {SLEEP_FRAMES.slice(1).map((src, i) => (
                  <img
                    key={src}
                    src={src}
                    alt=""
                    aria-hidden="true"
                    className={`${styles.mascotImg} ${styles.mascotFrame} ${
                      !catAwake && i + 1 === sleepFrame ? styles.mascotFrameVisible : ''
                    }`}
                    draggable={false}
                    loading="lazy"
                    decoding="async"
                  />
                ))}
                <img
                  src={catUpIcon}
                  alt="An awake cat"
                  className={`${styles.mascotImg} ${styles.mascotAwake} ${
                    catAwake ? styles.mascotAwakeVisible : ''
                  }`}
                  draggable={false}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className={styles.mascotHitArea} onMouseEnter={handleCatEnter} onMouseLeave={handleCatLeave} />
            </div>

            <p className={`${styles.copyright} body-m`}>&copy; All rights reserved &mdash; Niki Taradash</p>
            <p className={`${styles.madeWithLove} body-m`}>made with love</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
