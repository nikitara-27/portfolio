import { useEffect, useState } from 'react'
import { FiArrowUpRight } from 'react-icons/fi'
import photo from '../assets/images/niki-taradash1.jpg'
import catIcon from '../assets/icons/cat-sit.svg'
import matchaIcon from '../assets/icons/matcha-latte.svg'
import cableCarIcon from '../assets/icons/cable-car.png'
import DraggableSticker from '../components/DraggableSticker'
import Footer from './Footer'
import styles from './About.module.css'

// Served as-is from /public (not imported from src/assets) so it keeps a
// stable, unhashed URL to link to directly rather than going through
// Vite's asset pipeline.
const RESUME_PDF_URL = '/niki-taradash-resume.pdf'

// Shows the stickers' hover-lift "you can drag this" hint on a visitor's
// first visit only, then never again — persisted (not sessionStorage) since
// the point is a one-time introduction, not a once-per-session reminder.
const STICKER_HINT_SEEN_KEY = 'stickerHintSeen'

const BODY_PARAGRAPHS = [
  'I am a senior graphic design and advertising dual-degree student at Boston University.',
  'Looking back on my childhood, I’d spend a month in Japan every summer attending the local elementary and middle school. Not only did that experience provide the ground work to my identity, but also an understanding of the simplicity and intentionality of Japanese design.',
  'As a product designer, I bring that practice into my work. When designing for users and thinking through their needs for functionality and usability, there is no room for clutter. Looking ahead, I want every product I build to feel like it was made with the same care.',
]

const FACTS = [
  { icon: catIcon, alt: 'My cat, Gwen, sitting', rotation: -7, bubbleText: 'i love cats' },
  { icon: matchaIcon, alt: 'A matcha latte', rotation: 4, bubbleText: 'matcha lattes fuel me' },
  {
    icon: cableCarIcon,
    alt: 'A San Francisco cable car',
    rotation: -3,
    bubbleText: 'Bay Area native',
    // cable-car.png has a lot of transparent padding above the artwork
    // itself (~29% of its 1800px canvas — the car sits low in its die-cut
    // canvas), so the default bubble gap reads as floating far away — pull
    // it in to compensate. Measured directly (canvas alpha scan), not
    // eyeballed: at the icon's rendered 180px size that's ~52px of empty
    // space, so this is set to land the bubble ~20px above the actual
    // artwork rather than the image box's own (mostly-empty) top edge.
    bubbleGap: -32,
  },
]

// company/role are kept as separate fields (rather than one preformatted
// string) so the "Company — Role" em-dash join (see ExperienceEntry below)
// lives in one place rather than being baked into six strings.
const EXPERIENCE = [
  { company: 'Figma', role: 'Campus Leader', dates: '2026 – present' },
  { company: 'Bendi Wellness', role: 'Product Design Intern', dates: '2026 – present' },
  { company: 'BU Law', role: 'UX Design Intern', dates: '2026 – present' },
  { company: 'BostonHacks', role: 'Co-Head of Design', dates: '2026 – present' },
  { company: 'ULI: Homeward', role: 'Student UX Designer | BU Spark! UX Design Practicum', dates: '2026' },
  { company: 'Japanese Student Association', role: 'VP of Marketing', dates: '2025 – 2026' },
]

function ResumeButton({ className }) {
  return (
    <a
      href={RESUME_PDF_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`${styles.resumeButton} ${className} body-m`}
    >
      Download Resume (PDF)
      <FiArrowUpRight className={styles.resumeButtonArrow} />
    </a>
  )
}

// Experience's own entry format — bold "Company — Role" line, muted date
// line below, no logo.
function ExperienceEntry({ company, role, dates }) {
  return (
    <div className={styles.experienceEntry}>
      <h3 className={styles.experienceTitle}>
        {company} — {role}
      </h3>
      <p className={styles.experienceDate}>{dates}</p>
    </div>
  )
}

function About() {
  // Lazy initializer runs synchronously during render — before any of the
  // three sticker instances' own effects fire — so all three read the same
  // pre-this-page-view value instead of racing to flip it themselves and
  // disagreeing about whether this is "the" first visit.
  const [showDragHint] = useState(() => {
    try {
      return localStorage.getItem(STICKER_HINT_SEEN_KEY) == null
    } catch {
      // Storage blocked (private mode, disabled) — just skip the hint
      // rather than risk it reappearing every visit.
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STICKER_HINT_SEEN_KEY, '1')
    } catch {
      // Nothing to do if storage isn't writable — worst case the hint
      // shows again next visit.
    }
  }, [])

  return (
    <>
      <section className={styles.about}>
        <div className={styles.inner}>
          <h1 className={styles.title}>About Me</h1>

          <div className={styles.intro}>
            <div className={styles.photoFrame}>
              <img
                src={photo}
                className={styles.photo}
                alt="Niki Taradash"
                loading="eager"
                fetchPriority="high"
                decoding="async"
                width="280"
                height="380"
              />
            </div>
            <div className={styles.introText}>
              <h3 className={styles.greeting}>Hi! My name is Niki.</h3>
              {BODY_PARAGRAPHS.map((paragraph) => (
                <p key={paragraph} className={styles.body}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Mobile-only: closes out the About Me blurb, right where the
              button reads as a call-to-action for it — the same button
              also renders (desktop/tablet only) inline next to "Experience"
              below, toggled via CSS rather than duplicated logic. */}
          <ResumeButton className={styles.resumeButtonStandalone} />

          <div className={styles.entrySection}>
            <div className={styles.entrySectionHeader}>
              <h2 className={styles.entrySectionTitle}>Experience</h2>
              <ResumeButton className={styles.resumeButtonInline} />
            </div>
            <div className={styles.experienceList}>
              {EXPERIENCE.map((entry) => (
                <ExperienceEntry key={`${entry.company}-${entry.role}`} {...entry} />
              ))}
            </div>
          </div>

          <h2 className={styles.factsTitle}>A few things that define me beyond design</h2>

          <div className={styles.facts}>
            {FACTS.map((fact) => (
              <DraggableSticker
                key={fact.alt}
                src={fact.icon}
                alt={fact.alt}
                rotation={fact.rotation}
                bubbleText={fact.bubbleText}
                bubbleGap={fact.bubbleGap}
                className={styles.factIcon}
                showDragHint={showDragHint}
              />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}

export default About
