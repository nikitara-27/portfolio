import { useLocation, useNavigate } from 'react-router-dom'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getLenis } from '../lib/lenis'

function scrollToCaseStudies() {
  const el = document.getElementById('case-studies')
  if (!el) return
  // Forces every ScrollTrigger instance to recompute against the
  // freshly-mounted Landing page, otherwise stale cached positions from
  // whatever page was showing before can make the scroll undershoot.
  ScrollTrigger.refresh()
  const lenis = getLenis()
  if (lenis) {
    // Lenis caches its own scroll limit separately from the DOM/ScrollTrigger
    // and doesn't know the page just grew taller, so it clamps scrollTo to
    // its stale (too-short) limit unless told to recompute first.
    lenis.resize()
    // No `immediate` flag — clicking "Work" while already on Home should
    // visibly smooth-scroll down, matching the case-study page's in-page
    // nav (unlike the cross-page landing case in ScrollToTop, which jumps
    // immediately since the page is still mounting at that point).
    lenis.scrollTo(el)
  } else {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

// A plain `to="/#case-studies"` Link only re-scrolls when the hash string
// itself changes, so clicking "Work" a second time (hash already set from
// the first click) would silently do nothing. This scrolls explicitly on
// every click regardless of prior navigation state.
export function useWorkLinkHandler() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const isLanding = pathname === '/'

  return (e) => {
    // Let modified/non-primary clicks (open in new tab, etc.) behave like a
    // normal link instead of being hijacked.
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()

    if (isLanding) {
      scrollToCaseStudies()
    } else {
      // Route state (rather than a hash) tells ScrollToTop where to land
      // once Landing has mounted, and doesn't leave a stale "#case-studies"
      // in the URL if the user later navigates elsewhere from here.
      navigate('/', { state: { scrollTargetId: 'case-studies' } })
    }
  }
}
