import { useEffect, useRef } from 'react'

// A video only plays while it's substantially on-screen, rather than
// running (and burning bandwidth/CPU) the whole time the page is open.
const VISIBILITY_THRESHOLD = 0.5

// Ref for a <video> that autoplays only while it's in view, pausing once it
// scrolls out — and restarts from the beginning on every re-entry rather
// than resuming, so scrolling back to it always replays the intro instead
// of picking up mid-clip. Shared by every <Video> in CaseStudyContent.jsx,
// so any future case-study video gets this behavior for free.
//
// How often to check that an in-view video is actually still playing. Some
// browsers silently reject an autoplay() call (no error, video just stays
// paused) if several videos in the same row all request playback within
// the same instant — this notices "should be playing but isn't" and
// retries, without needing to know why it stopped.
const WATCHDOG_INTERVAL_MS = 1000

// startDelayMs: an optional stagger before the first play() attempt after
// entering view — spreads out several videos' initial autoplay requests
// (e.g. a 4-video accordion row) rather than firing them all in the same
// synchronous burst, which is the likelier trigger for the silent-rejection
// case above than any single video's own state.
export function usePlayInView(startDelayMs = 0) {
  const videoRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return undefined

    let watchdogId = null
    let startTimeoutId = null

    const stopWatchdog = () => {
      if (watchdogId) clearInterval(watchdogId)
      watchdogId = null
    }
    const startWatchdog = () => {
      stopWatchdog()
      watchdogId = setInterval(() => {
        if (video.paused) video.play().catch(() => {})
      }, WATCHDOG_INTERVAL_MS)
    }

    const cancelPendingStart = () => {
      if (startTimeoutId) clearTimeout(startTimeoutId)
      startTimeoutId = null
    }
    const beginPlaying = () => {
      video.currentTime = 0
      // play() returns a promise that rejects if a pause() interrupts it
      // (e.g. scrolling past quickly) — expected, not an error to surface.
      video.play().catch(() => {})
      startWatchdog()
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          cancelPendingStart()
          startTimeoutId = setTimeout(beginPlaying, startDelayMs)
        } else {
          cancelPendingStart()
          stopWatchdog()
          video.pause()
        }
      },
      { threshold: VISIBILITY_THRESHOLD },
    )

    observer.observe(video)
    return () => {
      observer.disconnect()
      cancelPendingStart()
      stopWatchdog()
    }
  }, [startDelayMs])

  return videoRef
}
