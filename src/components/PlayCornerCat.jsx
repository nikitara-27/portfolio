import { useEffect, useRef, useState } from 'react'
import sleepFrame from '../assets/icons/cat8bit-sleep.png'
import awakeFrame1 from '../assets/icons/cat8bit-awake-1.png'
import awakeFrame2 from '../assets/icons/cat8bit-awake-2.png'
import styles from './PlayCornerCat.module.css'

const STEP_MS = 275
// One swish = awake1 -> awake2 -> awake1. Two swishes back-to-back share
// their middle boundary frame, then a final step reverts to sleep -- 5
// steps total, ~1.4s at STEP_MS=275, inside the "roughly 1-1.5s" target.
const SEQUENCE = [awakeFrame1, awakeFrame2, awakeFrame1, awakeFrame2, awakeFrame1, sleepFrame]

// The three source PNGs share identical head/body art (measured: the head
// region, excluding the tail on the right, is exactly 270px tall in all
// three) -- but it sits 15px higher in the canvas on the sleep frame than
// on the two awake frames (canvas y 15-284 vs 30-299). At the sprite's
// rendered scale (44px box / 300px canvas ~= 0.1467x), that's a ~2.2px
// gap. Nudging the sleep frame down by that amount lines the body up so
// only the tail visibly changes between states.
const SLEEP_FRAME_OFFSET_PX = 2.2

// Small perched sprite for the first Play card's top-right corner. Sleeps
// by default; a hover or a click/tap plays exactly two tail swishes (a
// fixed, timed sequence, not tied to how long the hover/press lasts) and
// then settles back to sleep on its own. It won't replay on its own just
// because the cursor is still sitting there -- mouseenter only fires once
// per continuous hover, and `firedRef` blocks any stray re-entry within
// that same hover. Leaving and re-entering (or another click, for touch)
// is what re-arms it.
//
// The hover/click handlers live on the outer box, not the <img>, so the
// hit target stays the same fixed size across frames rather than shrinking
// to whatever a given PNG's own contained content happens to occupy.
function PlayCornerCat() {
  const [src, setSrc] = useState(sleepFrame)
  const timeoutsRef = useRef([])
  const firedRef = useRef(false)

  const clearPending = () => {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
  }

  const playSequence = () => {
    // Rapid re-triggers (quick leave/re-enter, or a click mid-sequence)
    // wipe whatever's still pending first, so frames from the old run
    // never land after the new one starts.
    clearPending()
    timeoutsRef.current = SEQUENCE.map((frame, i) => setTimeout(() => setSrc(frame), i * STEP_MS))
  }

  useEffect(() => clearPending, [])

  const handleMouseEnter = () => {
    if (firedRef.current) return
    firedRef.current = true
    playSequence()
  }

  const handleMouseLeave = () => {
    // The in-flight sequence is left to finish on its own (it's time-based,
    // not hover-based) -- this only re-arms the *next* hover.
    firedRef.current = false
  }

  const handleClick = (event) => {
    // Stops here rather than reaching the card underneath -- the accordion
    // itself only reacts to hover, not click, but this keeps the sprite a
    // self-contained trigger regardless. Always allowed (even mid-sequence,
    // even without a prior mouseleave) since it's the touch-device
    // equivalent of a fresh hover.
    event.stopPropagation()
    firedRef.current = true
    playSequence()
  }

  const isSleeping = src === sleepFrame

  return (
    <div
      className={styles.catBox}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className={styles.cat}
        style={isSleeping ? { transform: `translateY(${SLEEP_FRAME_OFFSET_PX}px)` } : undefined}
        draggable={false}
        loading="lazy"
        decoding="async"
      />
    </div>
  )
}

export default PlayCornerCat
