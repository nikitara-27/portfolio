import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { shuffle } from '../utils/shuffle'
import styles from './TypewriterText.module.css'

// A word may contain a literal "\n" marking where it should break onto a
// second line on narrow viewports. Resolved once, right before a word
// starts typing, so the line count is fixed for that whole type/delete
// cycle instead of reflowing mid-animation as the content grows/shrinks.
const WIDE_QUERY = '(min-width: 960px)'
function resolveWord(word) {
  if (!word.includes('\n')) return word
  const isWide = typeof window !== 'undefined' && window.matchMedia(WIDE_QUERY).matches
  return isWide ? word.replace(/\n/g, ' ') : word
}

// Types `first` once, then loops through `words` forever in random order
// (reshuffled each time the list is exhausted), typing and deleting each.
function useTypewriter(elRef, { first, words, typeSpeed, deleteSpeed, holdTime }) {
  useEffect(() => {
    const el = elRef.current
    if (!el || !first || words.length === 0) return

    let cancelled = false
    let activeTween = null
    let queue = []

    const setText = (str) => {
      el.textContent = str
    }

    const nextWord = () => {
      if (queue.length === 0) queue = shuffle(words)
      return queue.shift()
    }

    const animate = (word, from, to, speed) =>
      new Promise((resolve) => {
        if (cancelled) return resolve()
        const state = { i: from }
        activeTween = gsap.to(state, {
          i: to,
          duration: Math.max(Math.abs(to - from), 1) * speed,
          ease: 'none',
          onUpdate: () => setText(word.slice(0, Math.round(state.i))),
          onComplete: resolve,
        })
      })

    const type = (word) => animate(word, 0, word.length, typeSpeed)
    const erase = (word) => animate(word, word.length, 0, deleteSpeed)
    const wait = (seconds) =>
      new Promise((resolve) => {
        if (cancelled) return resolve()
        activeTween = gsap.delayedCall(seconds, resolve)
      })

    async function run() {
      const resolvedFirst = resolveWord(first)
      await type(resolvedFirst)
      if (cancelled) return
      await wait(holdTime * 1.4)
      if (cancelled) return
      await erase(resolvedFirst)
      if (cancelled) return
      await wait(0.3)

      while (!cancelled) {
        const word = resolveWord(nextWord())
        await type(word)
        if (cancelled) break
        await wait(holdTime)
        if (cancelled) break
        await erase(word)
        if (cancelled) break
        await wait(0.3)
      }
    }

    run()

    return () => {
      cancelled = true
      activeTween?.kill()
    }
  }, [elRef, first, words, typeSpeed, deleteSpeed, holdTime])
}

function TypewriterText({
  as: Tag = 'span',
  className,
  first,
  words,
  typeSpeed = 0.055,
  deleteSpeed = 0.03,
  holdTime = 1.4,
}) {
  const typedRef = useRef(null)
  useTypewriter(typedRef, { first, words, typeSpeed, deleteSpeed, holdTime })

  return (
    <Tag className={className}>
      <span ref={typedRef} className={styles.typed} aria-hidden="true" />
      <span className={styles.srOnly}>{first}</span>
    </Tag>
  )
}

export default TypewriterText
