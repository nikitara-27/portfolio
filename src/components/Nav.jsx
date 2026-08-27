import { useEffect, useRef, useState } from 'react'
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
  const isLanding = pathname === '/'
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

  const navClassName = [styles.nav, !isLanding && styles.opaque, menuVisuallyOpen && styles.navMenuOpen]
    .filter(Boolean)
    .join(' ')

  return (
    <nav className={navClassName}>
      <div className={styles.left}>
        <Link to="/" className={styles.homeButton} aria-label="Back to home" onClick={handleHomeClick}>
          <h4 className={styles.wordmark}>Niki Taradash</h4>
        </Link>
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
      </div>
    </nav>
  )
}

export default Nav
