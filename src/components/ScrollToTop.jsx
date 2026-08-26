import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { getLenis } from '../lib/lenis'

function ScrollToTop() {
  const { pathname, hash, state } = useLocation()
  // A cross-page nav link (e.g. "Work") can ask to land on a specific
  // section via route state instead of a hash, since a hash would leave a
  // stale "#case-studies" in the URL after landing elsewhere.
  const targetId = state?.scrollTargetId || (hash ? hash.slice(1) : null)

  useEffect(() => {
    let cancelled = false

    const scrollToId = (id) => {
      const el = document.getElementById(id)
      if (!el) return false
      const lenis = getLenis()
      if (lenis) {
        // The page may have just grown taller (a section only just mounted),
        // and Lenis caches its own scroll limit separately from the DOM, so
        // it can clamp scrollTo to a stale (too-short) limit unless told to
        // recompute first.
        lenis.resize()
        lenis.scrollTo(el, { immediate: true })
      } else {
        el.scrollIntoView()
      }
      return true
    }

    const scrollToStart = () => {
      const lenis = getLenis()
      if (lenis) {
        lenis.scrollTo(0, { immediate: true })
      } else {
        window.scrollTo(0, 0)
      }
    }

    if (targetId) {
      // The target section's real position can depend on layout that
      // settles a frame or two after mount (a freshly-navigated-to page
      // still mounting its sections, images/fonts loading), so poll for it
      // instead of guessing a fixed delay.
      let attempts = 0
      const waitForTarget = () => {
        if (cancelled) return
        if (scrollToId(targetId) || attempts++ > 30) return
        requestAnimationFrame(waitForTarget)
      }
      waitForTarget()
    } else {
      scrollToStart()
    }

    return () => {
      cancelled = true
    }
  }, [pathname, targetId])

  return null
}

export default ScrollToTop
