import { usePlayInView } from '../hooks/usePlayInView'
import styles from './CaseStudyContent.module.css'

// Turns an aspectRatio string ("1194 / 834") into width/height attributes —
// redundant with the CSS aspect-ratio applied alongside it, but the HTML
// attributes let the browser's preload scanner reserve the image's space
// before any CSS has even been parsed, rather than only once CSS loads.
function dimensionsFromRatio(aspectRatio) {
  if (!aspectRatio) return {}
  const [width, height] = aspectRatio.split('/').map((n) => parseFloat(n.trim()))
  return width && height ? { width, height } : {}
}

// Small set of typography primitives shared by every case-study page's
// section content, so "Heading 3", "Body", and the pull-quote style stay
// consistent with the CaseStudyLayout header/nav typography without each
// page re-declaring its own CSS.

// Small muted label sitting above a subheading (e.g. "Phase 1. Survey
// Analysis") — same Body-sized, muted-color treatment as CaseStudyLayout's
// own eyebrow ("CASE STUDY • HOMEWARD"), just reused for in-content labels.
export function Eyebrow({ children }) {
  return <p className={styles.eyebrow}>{children}</p>
}

export function SubHeading({ children }) {
  return <h3 className={styles.subHeading}>{children}</h3>
}

export function Body({ children }) {
  return <p className={styles.body}>{children}</p>
}

export function PullQuote({ children }) {
  return <p className={`body-italic ${styles.pullQuote}`}>{children}</p>
}

export function SideBySide({ left, right }) {
  return (
    <div className={styles.sideBySide}>
      <div>{left}</div>
      <div>{right}</div>
    </div>
  )
}

export function Figure({ src, alt, aspectRatio, shadow, style }) {
  return (
    <div className={styles.figure}>
      <img
        src={src}
        alt={alt}
        className={shadow ? styles.figureImgShadow : undefined}
        style={{ ...(aspectRatio ? { aspectRatio } : null), ...style }}
        // Every Figure sits within a section's body content, well below the
        // fold on every case study page — never the hero, so always lazy.
        loading="lazy"
        decoding="async"
        {...dimensionsFromRatio(aspectRatio)}
      />
    </div>
  )
}

// A full-width looping showcase clip (e.g. the Final Product section's
// screen recordings) — autoplaying/muted/looping like an animated GIF rather
// than a user-controlled player, since each one sits right next to its own
// caption for context instead of needing scrubbing/pause controls. Playback
// is driven by usePlayInView rather than the autoplay attribute, so it only
// runs while actually on-screen.
export function Video({ src, aspectRatio, crop, shadow }) {
  const videoRef = usePlayInView()

  // Opt-in path for a source recording with black letterboxing baked into
  // its pixels (e.g. a screen capture with an OS/browser frame that doesn't
  // fill the recording canvas). `crop` gives the wrapper's true content
  // aspect ratio plus how much to uniformly scale + offset the video inside
  // it so the crop lands exactly on the bars, since object-fit: cover can
  // only crop one axis at a time and can't do an off-center crop to match
  // asymmetric top/bottom bars.
  if (crop) {
    return (
      <div
        className={`${styles.mediaCropFrame} ${shadow ? styles.figureImgShadow : ''}`}
        style={{ aspectRatio: crop.contentAspectRatio }}
      >
        <video
          ref={videoRef}
          className={styles.mediaCropped}
          src={src}
          style={{ width: `${crop.scale}%`, left: `-${crop.left}%`, top: `-${crop.top}%` }}
          loop
          muted
          playsInline
          preload="metadata"
        />
      </div>
    )
  }

  return (
    <video
      ref={videoRef}
      className={`${styles.media} ${shadow ? styles.figureImgShadow : ''}`}
      src={src}
      style={aspectRatio ? { aspectRatio } : undefined}
      loop
      muted
      playsInline
      // usePlayInView only calls .play() once this is substantially
      // scrolled into view, so there's no benefit to fetching any of it
      // sooner — metadata (duration/dimensions) is enough to sit idle on.
      preload="metadata"
      {...dimensionsFromRatio(aspectRatio)}
    />
  )
}

// Small muted caption sitting directly below a Video or Figure (e.g. each
// Final Product media block) — same color as Eyebrow, but positioned after
// its media rather than above a heading.
export function Caption({ children }) {
  return <p className={styles.caption}>{children}</p>
}

// A vertical stack of ReflectionCards (e.g. the Reflection section) — the
// gap and the mismatched corner radii that make the stack read as one
// continuous shape (rather than independent cards) live on this wrapper,
// keyed off :first-child/:last-child, so ReflectionCard itself doesn't need
// to know its own position in the stack.
export function ReflectionStack({ children }) {
  return <div className={styles.reflectionStack}>{children}</div>
}

// background/textColor are optional per-instance overrides (set as CSS
// custom properties the stylesheet falls back from) -- Homeward's usage
// passes neither, so it keeps today's #f1f6f8 / --color-text exactly.
export function ReflectionCard({ title, paragraphs, background, textColor }) {
  const style =
    background || textColor
      ? {
          ...(background && { '--reflection-card-bg': background }),
          ...(textColor && { '--reflection-card-text': textColor }),
        }
      : undefined
  return (
    <div className={styles.reflectionCard} style={style}>
      <p className={styles.body}>
        <span className={styles.reflectionTitle}>{title}</span> — {paragraphs[0]}
      </p>
      <p className={styles.body}>{paragraphs[1]}</p>
    </div>
  )
}

export function TagRow({ tags }) {
  return (
    <div className={styles.tagRow}>
      {tags.map((tag) => (
        <span key={tag} className={`${styles.tag} body-m`}>
          {tag}
        </span>
      ))}
    </div>
  )
}

// A 3-column "process step" row — an optional intro line, then one tile
// (blurred-gradient background + centered white line-icon, no border) per
// step, each with its own Heading 3 + Body. Each case study passes its own
// icon/background image pair and copy per step; the tile layout/typography
// itself doesn't need rebuilding per page.
export function ProcessSteps({ intro, steps }) {
  return (
    <>
      {intro && <Body>{intro}</Body>}
      <div className={styles.processSteps}>
        {steps.map((step) => (
          <div key={step.heading} className={styles.processStep}>
            <div className={styles.processTile}>
              <img
                src={step.background}
                alt=""
                aria-hidden="true"
                className={styles.processTileBg}
                loading="lazy"
                decoding="async"
              />
              <img
                src={step.icon}
                alt=""
                aria-hidden="true"
                className={styles.processTileIcon}
                loading="lazy"
                decoding="async"
              />
            </div>
            <h3 className={styles.processHeading}>{step.heading}</h3>
            <Body>{step.body}</Body>
          </div>
        ))}
      </div>
    </>
  )
}
