import { useEffect, useState } from 'react'
import DraggableSticker, { STICKER_HINT_SEEN_KEY } from '../components/DraggableSticker'
import matchaIcon from '../assets/icons/matcha-latte.svg'
import mangoIcon from '../assets/icons/mango.svg'
import catIcon from '../assets/icons/cat-sit.svg'
import cameraIcon from '../assets/icons/camera.svg'
import { SHOW_LANDING_STICKERS } from '../config/features'
import styles from './Hero.module.css'

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
  return (
    <section className={styles.hero}>
      {SHOW_LANDING_STICKERS && <HeroStickers />}

      <div className={styles.content}>
        <h1 className={styles.headline}>Niki Taradash</h1>

        <p className={`${styles.body} accent`}>
          Design student @ Boston University
          <br />
          Currently product design intern @ Bendi Wellness
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
