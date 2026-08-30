import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import styles from './TypewriterText.module.css'

// Types `text` once on mount and stops — no erase, no hold, no rotation.
// The caret (TypewriterText.module.css) blinks throughout via .caret (an
// infinite animation), then gets exactly one more full on/off cycle via
// .caretFinal (the same keyframes, but a single iteration) once typing
// finishes, before being removed from the DOM for good.
function useTypewriter(elRef, { text, typeSpeed }) {
  useEffect(() => {
    const el = elRef.current
    if (!el || !text) return undefined

    let cancelled = false
    let finalBlinkTimeout = null
    el.classList.add(styles.caret)
    const state = { i: 0 }
    const tween = gsap.to(state, {
      i: text.length,
      duration: Math.max(text.length, 1) * typeSpeed,
      ease: 'none',
      onUpdate: () => {
        if (!cancelled) el.textContent = text.slice(0, Math.round(state.i))
      },
      onComplete: () => {
        if (cancelled) return
        // Swapping to a dedicated one-shot class (rather than just letting
        // .caret's own infinite animation run for one more cycle) is what
        // makes this read as one clean blink — .caret's animation is
        // already partway through its cycle the instant typing finishes,
        // so restarting fresh is the only way to get a full, discrete
        // on/off cycle rather than whatever fraction was left of the one
        // already in progress. Also a faster cycle than .caret's own 0.9s
        // (see the CSS) — the sign-off blink should feel quick, not match
        // the leisurely pace it had throughout typing.
        el.classList.remove(styles.caret)
        el.classList.add(styles.caretFinal)
        // 400ms, matching .caretFinal's own animation-duration in
        // TypewriterText.module.css — keep these two in sync if either
        // changes.
        finalBlinkTimeout = setTimeout(() => {
          if (!cancelled) el.classList.remove(styles.caretFinal)
        }, 400)
      },
    })

    return () => {
      cancelled = true
      tween.kill()
      if (finalBlinkTimeout) clearTimeout(finalBlinkTimeout)
    }
  }, [elRef, text, typeSpeed])
}

function TypewriterText({ as: Tag = 'span', className, text, typeSpeed = 0.07 }) {
  const typedRef = useRef(null)
  useTypewriter(typedRef, { text, typeSpeed })

  return (
    <Tag className={className}>
      <span ref={typedRef} className={styles.typed} aria-hidden="true" />
      <span className={styles.srOnly}>{text}</span>
    </Tag>
  )
}

export default TypewriterText
