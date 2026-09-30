import bendiLogo from '../assets/logos/bendiwellness.png'
import sparkLogo from '../assets/logos/spark.png'
import figmaLogo from '../assets/logos/figma.png'
import bostonHacksLogo from '../assets/logos/bostonhacks.png'
import styles from './Experience.module.css'

// Logos live in src/assets/logos/ — square PNGs trimmed to the circle's own
// edge, so each one fills the round frame the same way. Set `logo: null`
// to fall back to a plain placeholder circle.
const EXPERIENCE = [
  { company: 'Bendi Wellness', role: 'Product Design Intern', logo: bendiLogo },
  { company: 'BU Spark!', role: 'UX Design Intern', logo: sparkLogo },
  { company: 'Figma', role: 'Campus Leader', logo: figmaLogo },
  { company: 'BostonHacks', role: 'Co-Head of Design', logo: bostonHacksLogo },
]

function Experience() {
  return (
    <section className={styles.section} aria-labelledby="experience-heading">
      <h2 id="experience-heading" className={styles.label}>
        My experience
      </h2>

      <ul className={styles.list}>
        {EXPERIENCE.map(({ company, role, logo }) => (
          <li key={company} className={styles.item}>
            {logo ? (
              <img src={logo} alt="" className={styles.logo} loading="lazy" decoding="async" />
            ) : (
              <span className={styles.logo} aria-hidden="true" />
            )}
            <span className={styles.company}>{company}</span>
            <span className={styles.role}>{role}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Experience
