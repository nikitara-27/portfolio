import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Draggable } from 'gsap/Draggable'
import { HOVER_CAPABLE_QUERY } from '../utils/mediaQueries'
import envelopeBack from '../assets/about/envelope-back.webp'
import clover from '../assets/about/clover.webp'
import polaroid from '../assets/about/polaroid.webp'
import envelopeFront from '../assets/about/envelope-front.webp'
import styles from './Envelope.module.css'

gsap.registerPlugin(Draggable)

const ITEMS = [
  {
    key: 'clover',
    src: clover,
    alt:
      'Four-leaf clover card titled "Fun facts about me": My favorite hobbies are making matchas and trying new cafes. ' +
      'I have a deep love for cats. I am a Rilakkuma and Miffy lover. My favorite artists are Keshi, BTS, and Beabadoobee.',
  },
  { key: 'polaroid', src: polaroid, alt: 'Polaroid photo of Niki sipping an iced matcha latte' },
]

// Picked-up items stack just under the nav (z-index 10): the most recently
// grabbed one on top, the other one out of the envelope just below it.
const Z_TOP = 9
const Z_BELOW = 8
const HINT_DELAY_MS = 600
const TOUCH_HINT_MS = 3500
// Lift while held: slight scale, and a tilt that follows the drag direction.
const HELD_SCALE = 1.03
const MAX_TILT = 6

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Layered envelope illustration on the About page. The four layers are
// separate images cropped to their own artwork, so each is placed with
// percentages of the wrapper (measured against the Figma reference) and the
// whole thing scales as one unit via the wrapper's aspect-ratio. Stacking
// order is the DOM order: back → clover → polaroid → front pocket, so the
// card and photo read as tucked inside.
//
// On desktop hover the clover and polaroid slide up out of the pocket (CSS,
// see the module). Either one can be picked up and dragged anywhere on the
// page, where it stays (it's positioned inside the envelope, so it scrolls
// with the page); "put back" returns both.
function Envelope({ className = '' }) {
  const rootRef = useRef(null)
  const itemRefs = useRef({})
  const imgRefs = useRef({})
  const draggablesRef = useRef({})
  const outRef = useRef({})
  const [out, setOut] = useState({})
  const [bubbleFor, setBubbleFor] = useState(null)
  const [touchMode, setTouchMode] = useState(false)
  const hintTimerRef = useRef(0)

  const anyOut = Object.values(out).some(Boolean)

  const clearHint = () => {
    window.clearTimeout(hintTimerRef.current)
    setBubbleFor(null)
  }

  // Touch vs. mouse, kept in sync if a hybrid device switches.
  useEffect(() => {
    const mq = window.matchMedia(HOVER_CAPABLE_QUERY)
    const sync = () => setTouchMode(!mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  // Touch: show "tap and drag" once, the first time the envelope scrolls
  // into view on this page visit.
  useEffect(() => {
    if (!touchMode) return undefined
    const root = rootRef.current
    let hideTimer = 0
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        setBubbleFor('clover')
        hideTimer = window.setTimeout(() => setBubbleFor(null), TOUCH_HINT_MS)
      },
      { threshold: 0.6 },
    )
    io.observe(root)
    return () => {
      io.disconnect()
      window.clearTimeout(hideTimer)
    }
  }, [touchMode])

  useEffect(() => {
    const raise = (key) => {
      for (const { key: other } of ITEMS) {
        const el = itemRefs.current[other]
        if (other === key) el.style.zIndex = Z_TOP
        else if (outRef.current[other]) el.style.zIndex = Z_BELOW
      }
    }

    const instances = ITEMS.map(({ key }) => {
      const el = itemRefs.current[key]
      const img = imgRefs.current[key]
      const [draggable] = Draggable.create(el, {
        type: 'x,y',
        zIndexBoost: false,
        minimumMovement: 3,
        onPress() {
          window.clearTimeout(hintTimerRef.current)
          setBubbleFor(null)
          raise(key)
        },
        onDragStart() {
          document.documentElement.classList.add('is-grabbing')
          el.dataset.dragging = 'true'
          if (!outRef.current[key]) {
            outRef.current = { ...outRef.current, [key]: true }
            setOut(outRef.current)
          }
          if (prefersReducedMotion()) gsap.set(img, { scale: HELD_SCALE })
          else gsap.to(img, { scale: HELD_SCALE, duration: 0.2, ease: 'power2.out' })
        },
        onDrag() {
          if (prefersReducedMotion()) return
          const tilt = gsap.utils.clamp(-MAX_TILT, MAX_TILT, this.deltaX * 0.6)
          gsap.to(img, { rotation: tilt, duration: 0.3, ease: 'power2.out', overwrite: 'auto' })
        },
        onRelease() {
          document.documentElement.classList.remove('is-grabbing')
          delete el.dataset.dragging
          // A press that never became a drag drops back into the pocket.
          if (!outRef.current[key]) el.style.zIndex = ''
          if (prefersReducedMotion()) gsap.set(img, { scale: 1, rotation: 0 })
          else gsap.to(img, { scale: 1, rotation: 0, duration: 0.6, ease: 'elastic.out(1, 0.6)', overwrite: 'auto' })
        },
      })
      draggablesRef.current[key] = draggable
      return draggable
    })

    return () => {
      instances.forEach((d) => d.kill())
      document.documentElement.classList.remove('is-grabbing')
    }
  }, [])

  useEffect(() => () => window.clearTimeout(hintTimerRef.current), [])

  const onItemEnter = (key, e) => {
    if (e.pointerType !== 'mouse' || document.documentElement.classList.contains('is-grabbing')) return
    window.clearTimeout(hintTimerRef.current)
    hintTimerRef.current = window.setTimeout(() => setBubbleFor(key), HINT_DELAY_MS)
  }

  const putBack = () => {
    clearHint()
    const reduced = prefersReducedMotion()
    const finish = () => {
      outRef.current = {}
      setOut({})
      for (const { key } of ITEMS) {
        itemRefs.current[key].style.zIndex = ''
        draggablesRef.current[key]?.update()
      }
    }
    const targets = ITEMS.map(({ key }) => itemRefs.current[key])
    if (reduced) {
      gsap.set(targets, { x: 0, y: 0 })
      finish()
    } else {
      gsap.to(targets, { x: 0, y: 0, duration: 0.7, ease: 'power3.inOut', stagger: 0.08, onComplete: finish })
    }
  }

  return (
    <div className={`${styles.wrap} ${className}`}>
      <div ref={rootRef} className={styles.envelope}>
        <img src={envelopeBack} alt="" className={`${styles.layer} ${styles.back}`} decoding="async" />
        {ITEMS.map(({ key, src, alt }) => (
          <div
            key={key}
            ref={(el) => {
              itemRefs.current[key] = el
            }}
            className={`${styles.layer} ${styles.item} ${styles[key]} ${out[key] ? styles.out : ''}`}
            data-grab=""
            onPointerEnter={(e) => onItemEnter(key, e)}
            onPointerLeave={() => {
              if (!touchMode) clearHint()
            }}
          >
            <span className={`${styles.bubble} ${bubbleFor === key ? styles.bubbleVisible : ''}`} aria-hidden="true">
              {touchMode ? 'tap and drag' : 'click and drag'}
            </span>
            <div className={styles.lift}>
              <img
                ref={(el) => {
                  imgRefs.current[key] = el
                }}
                src={src}
                alt={alt}
                className={styles.itemImage}
                decoding="async"
              />
            </div>
          </div>
        ))}
        <img src={envelopeFront} alt="" className={`${styles.layer} ${styles.front}`} decoding="async" />
      </div>

      <button
        type="button"
        className={`${styles.putBack} accent-2 ${anyOut ? styles.putBackVisible : ''}`}
        onClick={putBack}
        tabIndex={anyOut ? 0 : -1}
        aria-hidden={!anyOut}
      >
        put back
      </button>
    </div>
  )
}

export default Envelope
