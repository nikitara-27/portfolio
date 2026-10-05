import { FiArrowUpRight } from 'react-icons/fi'
import Envelope from '../components/Envelope'
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

function ResumeButton() {
  return (
    <a
      href={RESUME_PDF_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`${styles.resumeButton} body-sm`}
    >
      Download Resume (PDF)
      <FiArrowUpRight className={styles.resumeButtonArrow} />
    </a>
  )
}

function About() {
  return (
    <>
      <section className={styles.about}>
        <h1 className={styles.title}>About me</h1>

        <div className={styles.intro}>
          <div className={styles.envelopeColumn}>
            <Envelope className={styles.envelope} />
          </div>
          <div className={styles.introText}>
            <h2 className={styles.greeting}>Hi! My name is Niki.</h2>
            {BODY_PARAGRAPHS.map((paragraph) => (
              <p key={paragraph} className={styles.body}>
                {paragraph}
              </p>
            ))}
            <ResumeButton />
          </div>
        </div>

        <h2 className={styles.journeyTitle}>My design journey</h2>
      </section>

      <Footer />
    </>
  )
}

export default About
