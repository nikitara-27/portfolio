import { useRef, useState } from 'react'
import { usePlayInView } from '../hooks/usePlayInView'
import PlayCornerCat from '../components/PlayCornerCat'
import Footer from './Footer'
import styles from './Play.module.css'
import systemDesignImage from '../assets/images/play-systemdesign-2.jpg'
import systemDesignApplicationImage from '../assets/images/play-systemdesign-application-2.jpg'
import pockyFrontImage from '../assets/images/play-pocky-front.jpg'
import pockyBackImage from '../assets/images/play-pocky-back.jpg'
import cardsImage from '../assets/images/play-cards.jpg'
import multipleFormatsImage from '../assets/images/play-multiple-formats.jpg'
import lucyAndNikiImage from '../assets/images/play-lucy-and-niki.jpg'

// Served as-is from /public, same reasoning as every other video on this
// site (case study clips, WorkCard hover previews) — large assets that
// don't need Vite's hashing pipeline.
const CONFIG_LOGO_ANIMATION_URL = '/videos/play-logo-animation.mp4'
const CONFIG_DIGITAL_POSTERS_URL = '/videos/play-config-digital-posters.mp4'
const CONFIG_DIGITAL_EVENT_URL = '/videos/play-config-digital-event.mp4'
const CONFIG_DIGITAL_WORKSHOP_URL = '/videos/play-config-digital-workshop.mp4'

// Left to right, per the accordion's default equal-width order. An entry
// can carry its own `focusX` (0-100, default 50/centered) if the image
// isn't centered on what matters (the Glico logo, the nutrition label,
// a face) — since the image is now shown at a fixed natural size rather
// than object-fit-cropped, centering is which horizontal point of the
// image sits in the middle of the container, not a crop position.
const GLICO_ACCORDION_IMAGES = [
  { src: systemDesignImage, alt: 'Glico packaging design system, product photo', aspectRatio: 900 / 675 },
  { src: systemDesignApplicationImage, alt: 'Glico packaging design system, applied in-hand shot', aspectRatio: 900 / 710 },
  { src: pockyFrontImage, alt: 'Pocky package, front', aspectRatio: 900 / 1200 },
  { src: pockyBackImage, alt: 'Pocky package, back, nutrition label', aspectRatio: 900 / 1200 },
]

// sips reports these source files' raw stored pixel dimensions, which
// ignores each photo's EXIF orientation tag — the browser (naturalWidth/
// naturalHeight) applies that rotation, and two of these three are
// actually portrait, not landscape, once it's accounted for.
const GREETING_CARDS_ACCORDION_IMAGES = [
  { src: cardsImage, alt: 'Illustrated greeting cards, assorted spread', aspectRatio: 900 / 1200, zoom: 1.15 },
  { src: multipleFormatsImage, alt: 'Illustrated greeting cards shown across multiple printed formats', aspectRatio: 1200 / 900, zoom: 1.15 },
  { src: lucyAndNikiImage, alt: 'Lucy and Niki with the illustrated greeting cards', aspectRatio: 900 / 1200, zoom: 1.15 },
]

// Dimensions read via macOS's Spotlight metadata (mdls), which — unlike the
// sips mistake on the greeting-card photos — is rotation-aware.
const CONFIG_ACCORDION_VIDEOS = [
  { type: 'video', src: CONFIG_LOGO_ANIMATION_URL, alt: 'Config 2027 logo animation concept', aspectRatio: 1080 / 1080 },
  { type: 'video', src: CONFIG_DIGITAL_POSTERS_URL, alt: 'Config 2027 digital poster concept, speaker spotlight', aspectRatio: 1080 / 1350 },
  { type: 'video', src: CONFIG_DIGITAL_EVENT_URL, alt: 'Config 2027 digital event poster concept', aspectRatio: 1080 / 1350 },
  { type: 'video', src: CONFIG_DIGITAL_WORKSHOP_URL, alt: 'Config 2027 digital workshop poster concept', aspectRatio: 1080 / 1350 },
]

// Caps how much of the row a single expanded image can claim. Without this,
// an unusually wide image (or a narrow mobile row) could compute a target
// width approaching or exceeding the row's own width, leaving the other
// items no room (or a negative flex-grow).
const MAX_EXPANDED_FRACTION = 0.85

// Expands the hovered slice to its own image's natural aspect ratio at the
// row's fixed height (targetWidth = rowHeight × aspectRatio) rather than a
// shared hardcoded ratio — a landscape image ends up wider than a portrait
// one when hovered, matching how much width it actually needs to show
// fully at that height. The row's real rendered size is measured live
// (via rowRef) since flex-grow only distributes proportions of whatever
// width the row happens to have, which changes with viewport. Resets
// everyone back to equal 1s when the cursor leaves the row (not just the
// image), so moving between slices doesn't flicker back to equal-width
// mid-row.
function AccordionRow({ images }) {
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [hoveredFlexGrow, setHoveredFlexGrow] = useState(3)
  const rowRef = useRef(null)

  const handleEnter = (index, aspectRatio) => {
    setHoveredIndex(index)
    const row = rowRef.current
    if (!row) return
    const { width: rowWidth, height: rowHeight } = row.getBoundingClientRect()
    if (!rowWidth || !rowHeight) return
    const targetWidth = rowHeight * aspectRatio
    const fraction = Math.min(targetWidth / rowWidth, MAX_EXPANDED_FRACTION)
    const otherCount = images.length - 1
    setHoveredFlexGrow((fraction * otherCount) / (1 - fraction))
  }

  return (
    <div className={styles.accordionRow} ref={rowRef} onMouseLeave={() => setHoveredIndex(null)}>
      {images.map((image, index) => {
        const focusX = image.focusX ?? 50
        const zoom = image.zoom ?? 1
        return (
          <div
            key={image.src}
            className={styles.accordionItem}
            style={{ flexGrow: index === hoveredIndex ? hoveredFlexGrow : 1 }}
            onMouseEnter={() => handleEnter(index, image.aspectRatio)}
          >
            <AccordionMedia image={image} focusX={focusX} zoom={zoom} index={index} />
          </div>
        )
      })}
    </div>
  )
}

// Fixed-size media, absolutely positioned and horizontally centered on
// focusX — the container's overflow: hidden is what reveals more or less
// of it, the media itself never rescales. An optional `zoom` scales it
// about its own (already-centered) box, cropping in slightly tighter —
// purely visual, doesn't affect the hover-expand math, which sizes off the
// true, unzoomed aspect ratio. usePlayInView is called unconditionally
// (hooks can't be called per-branch) but its ref only attaches to
// something for video items — same pattern the old Play tiles used. Each
// video's own index staggers its initial autoplay attempt (see
// usePlayInView's startDelayMs) so a row of several videos doesn't all
// request playback in the same instant.
function AccordionMedia({ image, focusX, zoom, index }) {
  const videoRef = usePlayInView(image.type === 'video' ? index * 200 : 0)
  const style = { left: `${focusX}%`, transform: `translateX(-${focusX}%) scale(${zoom})` }

  if (image.type === 'video') {
    return (
      <video
        ref={videoRef}
        className={styles.accordionMedia}
        src={image.src}
        style={style}
        loop
        muted
        playsInline
        preload="metadata"
      />
    )
  }

  return (
    <img
      src={image.src}
      alt={image.alt}
      className={styles.accordionMedia}
      style={style}
      loading="lazy"
      decoding="async"
    />
  )
}

// One Play section entry — an accordion row as its visual centerpiece,
// with a tag pill + title underneath. Shared by every entry rather than
// each repeating the same card/meta markup.
function PlayEntry({ tag, title, images, cat = false }) {
  return (
    <div className={styles.entry}>
      {cat && <PlayCornerCat />}
      <AccordionRow images={images} />
      <div className={styles.entryMeta}>
        <span className={`${styles.tag} body-m`}>{tag}</span>
        <h3 className={styles.entryTitle}>{title}</h3>
      </div>
    </div>
  )
}

function Play() {
  return (
    <>
      <section className={styles.play}>
        <div className={styles.inner}>
          <h1 className={styles.title}>Play</h1>

          <PlayEntry tag="Motion Design" title="Config 2027 Motion Design (concept)" images={CONFIG_ACCORDION_VIDEOS} cat />
          <PlayEntry tag="Illustration" title="Illustrated Greeting Cards" images={GREETING_CARDS_ACCORDION_IMAGES} />
          <PlayEntry tag="Packaging Design" title="Glico Running Man Redesign and Packaging" images={GLICO_ACCORDION_IMAGES} />
        </div>
      </section>

      <Footer />
    </>
  )
}

export default Play
