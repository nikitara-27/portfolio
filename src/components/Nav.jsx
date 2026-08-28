import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FiMail } from 'react-icons/fi'
import { FaLinkedin } from 'react-icons/fa'
import { getLenis } from '../lib/lenis'
import { useWorkLinkHandler } from '../hooks/useWorkLinkHandler'
import styles from './Nav.module.css'

const EMAIL = 'nikitaradash@gmail.com'
const LINKEDIN_URL = 'https://www.linkedin.com/in/nikitaradash/'

function Nav({ onHomeClick }) {
  const { pathname } = useLocation()
  const handleWorkClick = useWorkLinkHandler()
  const [menuOpen, setMenuOpen] = useState(false)
  // Stays true slightly past menuOpen going false, while the panel's own
  // 250ms fade-out is still running — .navMenuOpen is what hides the header
  // and drops .nav's backdrop-filter (see the CSS comment on it), and both
  // need to stay suppressed for the panel's whole close transition, not
  // just the instant the click fires. Letting them snap back immediately
  // restores .nav's backdrop-filter mid-fade, which changes .mobileMenu's
  // position: fixed containing block (backdrop-filter on an ancestor does
  // that) and visibly collapses the panel down to the header's own tiny
  // box before it finishes fading — the "leftover frame" flash.
  const [menuVisuallyOpen, setMenuVisuallyOpen] = useState(false)
  const mobileMenuRef = useRef(null)

  // Desktop/tablet only (see .capsule's display: none below 720px) — the
  // pill starts collapsed and, once expanded by any trigger, never
  // collapses back. Nav itself is rendered once outside <Routes> (see
  // App.jsx), so it never unmounts on route changes — this state living
  // here rather than in a page component is what makes "stays expanded for
  // the rest of the session" the default behavior with no extra plumbing:
  // a route change simply doesn't touch it.
  const [expanded, setExpanded] = useState(false)
  const expandNav = () => setExpanded(true)

  // Expanded width is measured, not a fixed/percentage value — the pill
  // should end up exactly as wide as "Niki Taradash · Work Play About ·
  // the two icons" actually needs, condensed and centered, rather than
  // stretching to fill the viewport. capsuleContentRef's own natural width
  // (it's never itself given an explicit width, so it's always sized to
  // its content) plus the capsule's own horizontal padding is that target.
  // Read via ResizeObserver rather than measured once, so a breakpoint's
  // font-size change (see variables.css's tablet/mobile type scale) or any
  // other reflow keeps this in sync.
  const capsuleRef = useRef(null)
  const capsuleContentRef = useRef(null)
  const [expandedWidth, setExpandedWidth] = useState(null)

  useLayoutEffect(() => {
    const capsule = capsuleRef.current
    const content = capsuleContentRef.current
    if (!capsule || !content) return undefined

    const measure = () => {
      const paddingX = parseFloat(getComputedStyle(capsule).paddingLeft) + parseFloat(getComputedStyle(capsule).paddingRight)
      setExpandedWidth(content.scrollWidth + paddingX)
    }
    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(content)
    return () => observer.disconnect()
  }, [])

  // Auto-expand on the user's first scroll anywhere on the page. `{ once:
  // true }` is the whole guarantee here — the listener detaches itself
  // after the very first scroll event, so a smooth-scrolled gesture that
  // fires many native scroll events in a row (Lenis eases toward the
  // target over ~1.4s, each animation frame is its own event) still only
  // ever triggers this once. Skipped once already expanded (by hover/click
  // instead) so there's nothing left to listen for.
  useEffect(() => {
    if (expanded) return undefined
    window.addEventListener('scroll', expandNav, { once: true, passive: true })
    return () => window.removeEventListener('scroll', expandNav)
  }, [expanded])

  const openMenu = () => {
    setMenuOpen(true)
    setMenuVisuallyOpen(true)
  }

  const closeMenu = () => setMenuOpen(false)

  useEffect(() => {
    const el = mobileMenuRef.current
    if (menuOpen || !el) return undefined
    const handleTransitionEnd = (e) => {
      if (e.target === el && e.propertyName === 'opacity') setMenuVisuallyOpen(false)
    }
    el.addEventListener('transitionend', handleTransitionEnd)
    return () => el.removeEventListener('transitionend', handleTransitionEnd)
  }, [menuOpen])

  const handleHomeClick = () => {
    const lenis = getLenis()
    if (lenis) {
      lenis.scrollTo(0, { immediate: true })
    } else {
      window.scrollTo(0, 0)
    }
    onHomeClick?.()
    closeMenu()
  }

  const handleMobileWorkClick = (e) => {
    handleWorkClick(e)
    closeMenu()
  }

  const navClassName = [styles.nav, menuVisuallyOpen && styles.navMenuOpen].filter(Boolean).join(' ')
  const capsuleClassName = [styles.capsule, expanded && styles.capsuleExpanded].filter(Boolean).join(' ')

  return (
    <nav className={navClassName}>
      {/* Desktop/tablet pill — collapsed to a small dot by default (see
          .capsule), expanded by hovering/clicking it or by the user's first
          scroll (above). Hidden entirely on mobile; see .mobileWordmark/
          .hamburger/.mobileMenu below for that breakpoint's own bar. */}
      <div
        className={capsuleClassName}
        ref={capsuleRef}
        style={expanded && expandedWidth ? { width: `${expandedWidth}px` } : undefined}
        onMouseEnter={expandNav}
        onClick={expandNav}
      >
        <div className={styles.capsuleContent} ref={capsuleContentRef}>
          <div className={styles.left}>
            <Link to="/" className={styles.homeButton} aria-label="Back to home" onClick={handleHomeClick}>
              <h4 className={styles.wordmark}>Niki Taradash</h4>
            </Link>
          </div>

          <div className={styles.links}>
            <Link to="/" className={styles.link} onClick={handleWorkClick}>
              Work
            </Link>
            <Link to="/play" className={pathname === '/play' ? `${styles.link} ${styles.active}` : styles.link}>
              Play
            </Link>
            <Link to="/about" className={pathname === '/about' ? `${styles.link} ${styles.active}` : styles.link}>
              About
            </Link>
          </div>

          <div className={styles.iconGroup}>
            <a href={`mailto:${EMAIL}`} className={styles.iconButton} aria-label="Email Niki">
              <FiMail />
            </a>
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noreferrer"
              className={styles.iconButton}
              aria-label="Niki's LinkedIn profile"
            >
              <FaLinkedin />
            </a>
          </div>
        </div>
      </div>

      {/* Mobile-only wordmark, centered in the bar independent of the
          hamburger's own flex slot — see .mobileWordmark. */}
      <Link to="/" className={styles.mobileWordmark} aria-label="Back to home" onClick={handleHomeClick}>
        <h4 className={styles.wordmark}>Niki Taradash</h4>
      </Link>

      {/* Mobile-only hamburger toggle — hidden entirely above the mobile
          breakpoint via CSS, alongside .links flipping the other way. */}
      <button
        type="button"
        className={`${styles.hamburger} ${menuOpen ? styles.hamburgerOpen : ''}`}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
        onClick={() => (menuOpen ? closeMenu() : openMenu())}
      >
        <span className={styles.hamburgerLine} />
        <span className={styles.hamburgerLine} />
        <span className={styles.hamburgerLine} />
      </button>

      {/* Full-screen now, so clicking its own background (not a link) is
          "outside" in the same sense the old separate backdrop caught —
          no separate element needed for that anymore. */}
      <div
        ref={mobileMenuRef}
        className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`}
        onClick={closeMenu}
      >
        <Link to="/" className={styles.mobileLink} onClick={handleMobileWorkClick}>
          Work
        </Link>
        <Link
          to="/play"
          className={pathname === '/play' ? `${styles.mobileLink} ${styles.mobileLinkActive}` : styles.mobileLink}
          onClick={closeMenu}
        >
          Play
        </Link>
        <Link
          to="/about"
          className={pathname === '/about' ? `${styles.mobileLink} ${styles.mobileLinkActive}` : styles.mobileLink}
          onClick={closeMenu}
        >
          About
        </Link>

        {/* Email/LinkedIn moved here from the header bar itself (see
            .capsule's .iconGroup, desktop-only) — mobile keeps only the
            wordmark and hamburger in the bar proper. */}
        <div className={styles.mobileIconRow}>
          <a href={`mailto:${EMAIL}`} className={styles.iconButton} aria-label="Email Niki" onClick={closeMenu}>
            <FiMail />
          </a>
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noreferrer"
            className={styles.iconButton}
            aria-label="Niki's LinkedIn profile"
            onClick={closeMenu}
          >
            <FaLinkedin />
          </a>
        </div>
      </div>
    </nav>
  )
}

export default Nav
