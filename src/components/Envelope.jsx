import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { getLenis } from '../lib/lenis'
import envelopeBack from '../assets/about/envelope-back.webp'
import clover from '../assets/about/clover.webp'
import polaroid from '../assets/about/polaroid.webp'
import envelopeFront from '../assets/about/envelope-front.webp'
import styles from './Envelope.module.css'

const ITEMS = {
  clover: {
    src: clover,
    label: 'Enlarge the fun facts clover',
    alt:
      'Four-leaf clover card titled "Fun facts about me": My favorite hobbies are making matchas and trying new cafes. ' +
      'I have a deep love for cats. I am a Rilakkuma and Miffy lover. My favorite artists are Keshi, BTS, and Beabadoobee.',
  },
  polaroid: {
    src: polaroid,
    label: 'Enlarge the polaroid',
    alt: 'Polaroid photo of Niki sipping an iced matcha latte',
  },
}

// Layered envelope illustration on the About page. The four layers are
// separate images cropped to their own artwork, so each is placed with
// percentages of the wrapper (measured against the Figma reference) and the
// whole thing scales as one unit via the wrapper's aspect-ratio. Stacking
// order is the DOM order: back → clover → polaroid → front pocket, so the
// card and photo read as tucked inside. On desktop hover the clover and
// polaroid slide up out of the pocket (CSS only; see the module); clicking
// either one opens it enlarged in an overlay.
function Envelope({ className = '' }) {
  const [open, setOpen] = useState(null)
  const openerRef = useRef(null)
  const closeRef = useRef(null)

  const show = (key, e) => {
    openerRef.current = e.currentTarget
    setOpen(key)
  }

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(null)
    }
    document.addEventListener('keydown', onKey)
    getLenis()?.stop()
    closeRef.current?.focus()
    const opener = openerRef.current
    return () => {
      document.removeEventListener('keydown', onKey)
      getLenis()?.start()
      opener?.focus()
    }
  }, [open])

  return (
    <>
      <div className={`${styles.envelope} ${className}`}>
        <img src={envelopeBack} alt="" className={`${styles.layer} ${styles.back}`} decoding="async" />
        {Object.entries(ITEMS).map(([key, item]) => (
          <button
            key={key}
            type="button"
            className={`${styles.layer} ${styles.item} ${styles[key]}`}
            aria-label={item.label}
            onClick={(e) => show(key, e)}
          >
            <img src={item.src} alt={item.alt} decoding="async" />
          </button>
        ))}
        {/* Ignores clicks so the clover/polaroid stay clickable through it. */}
        <img src={envelopeFront} alt="" className={`${styles.layer} ${styles.front}`} decoding="async" />
      </div>

      {open &&
        createPortal(
          <div
            className={styles.overlay}
            role="dialog"
            aria-modal="true"
            aria-label={ITEMS[open].alt}
            onClick={() => setOpen(null)}
          >
            <img src={ITEMS[open].src} alt={ITEMS[open].alt} className={`${styles.enlarged} ${styles[`${open}Enlarged`]}`} />
            <button ref={closeRef} type="button" className={styles.close} onClick={() => setOpen(null)}>
              Close
            </button>
          </div>,
          document.body,
        )}
    </>
  )
}

export default Envelope
