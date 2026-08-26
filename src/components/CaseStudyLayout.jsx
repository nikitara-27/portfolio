import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { FiArrowUpRight } from 'react-icons/fi'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getLenis } from '../lib/lenis'
import Footer from '../sections/Footer'
import styles from './CaseStudyLayout.module.css'

// Smooth-scrolls to a section within the page (Lenis when it's mounted,
// native scrollIntoView as a fallback), offsetting for the fixed site nav.
function scrollToSection(id) {
  const el = document.getElementById(id)
  if (!el) return
  const lenis = getLenis()
  if (lenis) {
    // The hero image (a large asset) can still be loading — and growing the
    // page taller — when a nav link is clicked; Lenis caches its own scroll
    // limit separately from the DOM and doesn't know that's happened unless
    // told to recompute first, otherwise it can undershoot the target.
    lenis.resize()
    lenis.scrollTo(el, { offset: -100 })
  } else {
    el.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }
}

// Shared shell for a case-study page: eyebrow/title/meta header, a floating
// "Contents" side nav plus an in-flow section nav row (both jump-linked to
// the same sections), the hero image, then the section bodies themselves.
// Content is passed in per-project (see pages/HomewardCaseStudy.jsx) so the
// same layout/typography/dividers can be reused for future case studies.
function CaseStudyLayout({ eyebrow, title, meta, links, sections, heroImage, heroAlt }) {
  // Measured off a hidden clone (below), never the visible title — the
  // visible title lives inside the very column this width gets applied to,
  // so observing it directly would feed its own resize back into itself
  // (each measurement nudging the column narrower, wrapping the title's
  // longest line further, shrinking the next measurement, and so on).
  const measureRef = useRef(null)
  // The whole content column is pinned to the title's own (shrink-wrapped)
  // rendered width, so everything below it — meta, dividers, the section
  // nav, the hero image, and every section's own text/images — shares one
  // consistent right edge with the end of the title's longest line, instead
  // of each stretching independently to the column's max-width.
  const [contentWidth, setContentWidth] = useState(null)
  const [activeId, setActiveId] = useState(sections[0]?.id ?? null)
  const containerRef = useRef(null)
  const sectionsRef = useRef(null)
  // While a nav click's scroll animation is in flight, geometry-based
  // detection (below) is suppressed in favor of the clicked id directly —
  // see the comment where it's read for why.
  const suppressGeometryUntilRef = useRef(0)

  useLayoutEffect(() => {
    const measureEl = measureRef.current
    if (!measureEl) return undefined
    let cancelled = false

    const measure = () => setContentWidth(measureEl.getBoundingClientRect().width)
    measure()

    // Re-measures on viewport resize and on web-font swap (both change the
    // title's rendered width without an explicit resize event of our own).
    const resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(measureEl)

    // The very first `measure()` above can land before the real webfont
    // (loaded with font-display: swap, see index.html) has swapped in,
    // sizing .container off the fallback font's metrics for however long
    // that takes — same-session/cached loads won't show it, but a cold
    // cache can. ResizeObserver normally catches the swap's reflow too,
    // but that's incidental to it firing on *a* size change, not a
    // guaranteed signal tied to fonts specifically — this makes the
    // correction explicit and deterministic instead of relying on that.
    document.fonts?.ready?.then(() => {
      if (!cancelled) measure()
    })

    return () => {
      cancelled = true
      resizeObserver.disconnect()
    }
  }, [])

  useEffect(() => {
    // Resizing .container to contentWidth can reflow text below it (a
    // narrower column wraps onto more lines), changing the page's total
    // height after the footer's own scroll-triggered dome animation (see
    // Footer.jsx) already cached its start/end scroll positions against
    // the old, shorter page. Without this, that animation's cached end can
    // fall short of the page's real bottom, so it never finishes
    // flattening no matter how far the user scrolls.
    ScrollTrigger.refresh()
  }, [contentWidth])

  useLayoutEffect(() => {
    const root = sectionsRef.current
    if (!root) return undefined

    const ctx = gsap.context(() => {
      // Headers, paragraphs, and the pull quote (also a <p>, see
      // CaseStudyContent.jsx) — not images, so Figure's <img> is untouched.
      const targets = gsap.utils.toArray('h2, h3, p', root)
      if (targets.length === 0) return

      gsap.set(targets, { opacity: 0 })

      // batch (rather than one ScrollTrigger per element) groups elements
      // that enter the viewport together into a single stagger, and
      // once: true fires each element's reveal exactly once — scrolling
      // back up past it afterward neither re-triggers nor fades it out.
      ScrollTrigger.batch(targets, {
        start: 'top 90%',
        once: true,
        onEnter: (batch) => gsap.to(batch, { opacity: 1, duration: 0.5, ease: 'power1.out', stagger: 0.08 }),
      })
    }, root)

    // Images anywhere above or within these sections — the large hero
    // image especially — can still be loading when the batch above reads
    // each element's position, and grow the page taller once they finish,
    // leaving those cached trigger positions stale (an element can end up
    // needing a much bigger scroll to reach it than what was cached,
    // stranding it at opacity: 0 indefinitely). Refreshing as each image
    // actually finishes loading keeps the triggers matched to reality.
    const images = Array.from(containerRef.current?.querySelectorAll('img') ?? [])
    const pending = images.filter((img) => !img.complete)
    const handleImageLoad = () => ScrollTrigger.refresh()
    pending.forEach((img) => img.addEventListener('load', handleImageLoad))

    return () => {
      pending.forEach((img) => img.removeEventListener('load', handleImageLoad))
      ctx.revert()
    }
  }, [sections])

  useEffect(() => {
    const sectionEls = sections.map((section) => document.getElementById(section.id)).filter(Boolean)
    if (sectionEls.length === 0) return undefined

    const lastId = sections[sections.length - 1].id

    // A single authoritative resolver, called from both triggers below
    // (rather than two independent handlers each calling setActiveId on
    // their own) — the IntersectionObserver and a plain scroll listener
    // fire asynchronously and in no guaranteed order relative to each
    // other for the same scroll change, so if each carried its own
    // separate "what's active" logic, whichever happened to fire last
    // would silently win and could undo the other's more-correct answer.
    // Recomputing from live geometry here (not the observer's own entries
    // argument, since we need the identical decision either way it's
    // triggered) keeps that decision consistent regardless of source.
    const resolveActive = () => {
      if (Date.now() < suppressGeometryUntilRef.current) return

      // The page can be scrolled all the way to its actual bottom without
      // the last section's top ever reaching the band below — there's
      // simply no scroll room left past it for that to happen. Left to
      // the band logic alone, the previous section (still genuinely the
      // only one overlapping the band) would stay "active" forever once
      // you reach the end of the page. Bottom-of-page unambiguously means
      // the last section.
      const doc = document.documentElement
      if (window.scrollY + window.innerHeight >= doc.scrollHeight - 2) {
        setActiveId(lastId)
        return
      }

      // Otherwise: whichever section overlaps a thin band just below the
      // fixed site nav is "current" — a section becomes active as soon as
      // it reaches that band, and stays active until the next section
      // reaches it, matching how the same offset is used for the
      // click-to-scroll target above.
      const bandTop = 100
      const bandBottom = window.innerHeight * 0.3
      const withinBand = sectionEls.filter((el) => {
        const rect = el.getBoundingClientRect()
        return rect.top < bandBottom && rect.bottom > bandTop
      })
      if (withinBand.length === 0) return
      // When two sections both overlap the band (the moment one scrolls
      // out as the next scrolls in), the later one — whose top is
      // closest to the band — is the one that just became current.
      const current = withinBand.reduce((a, b) => (a.getBoundingClientRect().top >= b.getBoundingClientRect().top ? a : b))
      setActiveId(current.id)
    }

    const observer = new IntersectionObserver(resolveActive, { rootMargin: '-100px 0px -70% 0px', threshold: 0 })
    sectionEls.forEach((el) => observer.observe(el))
    window.addEventListener('scroll', resolveActive, { passive: true })
    resolveActive()

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', resolveActive)
    }
  }, [sections])

  const handleNavClick = (id) => (e) => {
    e.preventDefault()
    // Trust the click's own intent immediately rather than waiting to
    // re-derive it from where the scroll ends up — geometry alone can be
    // ambiguous (e.g. a short trailing section can leave two different
    // sections' click targets landing at the exact same scroll-clamped
    // position, which isn't distinguishable after the fact). Suppress the
    // geometry-based observer/scroll-listener above for roughly the
    // scroll's own duration so it doesn't immediately override this once
    // the animation's intersection/scroll events start firing, then let
    // it resume for organic scrolling once the scroll settles.
    setActiveId(id)
    suppressGeometryUntilRef.current = Date.now() + 1500
    scrollToSection(id)
  }

  return (
    <>
      <div className={styles.page}>
        {/* Invisible, unsized-by-us twin of the title, used only to measure
            its natural width (see the comment on measureRef above). */}
        <div className={styles.measureContainer} aria-hidden="true">
          <h1 className={styles.title} ref={measureRef}>
            {title}
          </h1>
        </div>

        <aside className={styles.sideNav} aria-label="Contents">
          <p className={styles.sideNavLabel}>Contents</p>
          <ul className={styles.sideNavList}>
            {sections.map((section) => {
              const isActive = section.id === activeId
              return (
                <li key={section.id} className={isActive ? `${styles.sideNavItem} ${styles.sideNavItemActive}` : styles.sideNavItem}>
                  <a
                    href={`#${section.id}`}
                    className={isActive ? `${styles.sideNavLink} ${styles.sideNavLinkActive}` : styles.sideNavLink}
                    aria-current={isActive ? 'true' : undefined}
                    onClick={handleNavClick(section.id)}
                  >
                    {section.label}
                  </a>
                </li>
              )
            })}
          </ul>
        </aside>

        <div
          className={styles.container}
          style={contentWidth ? { width: `${contentWidth}px` } : undefined}
          ref={containerRef}
        >
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1 className={styles.title}>{title}</h1>

          <hr className={styles.divider} />

          <div className={styles.metaGrid}>
            {meta.map((item) => (
              <div key={item.label} className={styles.metaItem}>
                <p className={styles.metaLabel}>{item.label}</p>
                <p className={styles.metaValue}>{item.value}</p>
              </div>
            ))}
          </div>

          {links?.length > 0 && (
            <div className={styles.linksBlock}>
              {links.map((item) => (
                <div key={item.label} className={styles.metaItem}>
                  <p className={styles.metaLabel}>{item.label}</p>
                  <a href={item.href} target="_blank" rel="noreferrer" className={styles.metaLink}>
                    {item.value}
                    <FiArrowUpRight className={styles.metaLinkArrow} />
                  </a>
                </div>
              ))}
            </div>
          )}

          <hr className={styles.divider} />

          <nav className={styles.sectionNav} aria-label="Section links">
            {sections.map((section) => (
              <a key={section.id} href={`#${section.id}`} className={styles.sectionNavLink} onClick={handleNavClick(section.id)}>
                {section.label}
              </a>
            ))}
          </nav>

          <img
            className={styles.hero}
            src={heroImage}
            alt={heroAlt}
            // The single largest, most prominent image on the page — always
            // fetch it immediately and ahead of anything else competing for
            // bandwidth, rather than treating it like the rest of the page's
            // (lazy) images.
            loading="eager"
            fetchPriority="high"
            decoding="async"
            width="900"
            height="600"
          />

          <div ref={sectionsRef}>
            {sections.map((section) => (
              <section key={section.id} id={section.id} className={styles.section}>
                <h2 className={styles.sectionHeading}>{section.label}</h2>
                {section.content}
              </section>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}

export default CaseStudyLayout
