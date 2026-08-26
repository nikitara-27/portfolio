import { FiArrowUpRight } from 'react-icons/fi'
import photo from '../assets/images/niki-taradash1.jpg'
import catIcon from '../assets/icons/cat-sit.svg'
import matchaIcon from '../assets/icons/matcha-latte.svg'
import cableCarIcon from '../assets/icons/cable-car.png'
import buLogo from '../assets/logos/bu.png'
import uliLogo from '../assets/logos/uli.jpeg'
import bostonhacksLogo from '../assets/logos/bostonhacks.jpeg'
import bujsaLogo from '../assets/logos/bujsa.jpeg'
import bendiWellnessLogo from '../assets/logos/bendi-wellness.jpeg'
import googleLogo from '../assets/logos/google.webp'
import DraggableSticker from '../components/DraggableSticker'
import Footer from './Footer'
import styles from './About.module.css'

// Served as-is from /public (not imported from src/assets) so it keeps a
// stable, unhashed URL to link to directly rather than going through
// Vite's asset pipeline.
const RESUME_PDF_URL = '/niki-taradash-resume.pdf'

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

const EXPERIENCE = [
  { logo: bendiWellnessLogo, role: 'Product Design Intern @ Bendi Wellness', dates: 'September 2026 – Present' },
  { logo: buLogo, role: 'UX Design Intern @ BU Law', dates: 'April 2026 – Present' },
  {
    logo: uliLogo,
    role: 'Student UX Designer @ ULI: Homeward | BU Spark! UX Design Practicum',
    dates: 'February 2026 – May 2026',
  },
  { logo: bostonhacksLogo, role: 'Co-Head of Design @ BostonHacks', dates: 'February 2026 – Present' },
  { logo: bujsaLogo, role: 'VP of Marketing @ Japanese Student Association', dates: 'September 2025 – April 2026' },
]

const CERTIFICATES = [
  { logo: googleLogo, role: 'Foundations of User Experience (UX) Design', dates: 'June 2026' },
  { logo: googleLogo, role: 'Start the UX Design Process: Empathize, Define, and Ideate', dates: 'July 2026' },
  { logo: googleLogo, role: 'Build Wireframes and Low-Fidelity Prototypes', dates: 'July 2026' },
]

const EDUCATION = [
  { logo: buLogo, role: 'B.F.A. Graphic Design, Boston University', dates: 'September 2023 – May 2027' },
  { logo: buLogo, role: 'B.S. Advertising, Boston University', dates: 'September 2023 – May 2027' },
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

function EntrySection({ title, entries, actions }) {
  return (
    <div className={styles.entrySection}>
      <div className={styles.entrySectionHeader}>
        <h2 className={styles.entrySectionTitle}>{title}</h2>
        {actions}
      </div>
      <div className={styles.entryList}>
        {entries.map((entry) => (
          <div className={styles.entry} key={entry.role}>
            <img src={entry.logo} alt="" aria-hidden="true" className={styles.entryLogo} loading="lazy" decoding="async" />
            <div className={styles.entryText}>
              <h3 className={styles.entryRole}>{entry.role}</h3>
              <p className={styles.entryDate}>{entry.dates}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function About() {
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

          <EntrySection
            title="Experience"
            entries={EXPERIENCE}
            actions={<ResumeButton className={styles.resumeButtonInline} />}
          />
          <EntrySection title="Education" entries={EDUCATION} />
          <EntrySection title="Certificates" entries={CERTIFICATES} />

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
