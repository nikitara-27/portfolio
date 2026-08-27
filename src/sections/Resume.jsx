import { FiArrowUpRight } from 'react-icons/fi'
import buLogo from '../assets/logos/bu.png'
import uliLogo from '../assets/logos/uli.jpeg'
import bostonhacksLogo from '../assets/logos/bostonhacks.jpeg'
import bujsaLogo from '../assets/logos/bujsa.jpeg'
import bendiWellnessLogo from '../assets/logos/bendi-wellness.jpeg'
import figmaLogo from '../assets/logos/figma.png'
import googleLogo from '../assets/logos/google.webp'
import Footer from './Footer'
import styles from './Resume.module.css'

// Served as-is from /public (not imported from src/assets) so it keeps a
// stable, unhashed URL to link to directly rather than going through
// Vite's asset pipeline.
const RESUME_PDF_URL = '/niki-taradash-resume.pdf'

const EXPERIENCE = [
  // Unlike the other entries' source logos (which are square/rectangular and
  // need cover's crop-to-fill), figma.png is already a tightly-cropped
  // circular mark — cover would zoom past its own edge trying to fill a
  // square frame with a circle. `logoFit: 'contain'` opts this one entry
  // out of the shared cover behavior (see EntrySection) so it renders at
  // its full, unzoomed proportions instead.
  { logo: figmaLogo, role: 'Campus Leader @ Figma', dates: 'September 2026 – Present', logoFit: 'contain' },
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
            <img
              src={entry.logo}
              alt=""
              aria-hidden="true"
              className={entry.logoFit === 'contain' ? `${styles.entryLogo} ${styles.entryLogoContain}` : styles.entryLogo}
              loading="lazy"
              decoding="async"
            />
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

function Resume() {
  return (
    <>
      <section className={styles.resume}>
        <div className={styles.inner}>
          <h1 className={styles.title}>Resume</h1>

          <EntrySection
            title="Experience"
            entries={EXPERIENCE}
            actions={<ResumeButton className={styles.resumeButtonInline} />}
          />
          <EntrySection title="Education" entries={EDUCATION} />
          <EntrySection title="Certificates" entries={CERTIFICATES} />

          {/* Mobile-only: sits below Certificates instead of inline next to
              "Experience" — the inline version above (rendered as part of
              the Experience header) is hidden on mobile via CSS, and this
              standalone copy is shown only there, toggled the same way the
              old About-page placement was. */}
          <ResumeButton className={styles.resumeButtonStandalone} />
        </div>
      </section>

      <Footer />
    </>
  )
}

export default Resume
