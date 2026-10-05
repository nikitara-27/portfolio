// Registers the <sunlit-footer> custom element (dappled-sunlight canvas).
import '../lib/sunlit-footer'
import styles from './Footer.module.css'

const EMAIL = 'nikitaradash@gmail.com'
const LINKEDIN_URL = 'https://www.linkedin.com/in/nikitaradash/'
const INSTAGRAM_URL = 'https://www.instagram.com/niikiai/'
const X_URL = 'https://x.com/niikiai'

// `external` links open in a new tab.
const SOCIALS = [
  { label: 'LinkedIn', href: LINKEDIN_URL, external: true },
  { label: 'Email', href: `mailto:${EMAIL}` },
  { label: 'Instagram', href: INSTAGRAM_URL, external: true },
  { label: 'X', href: X_URL, external: true },
]

// "Sunlit" footer. <sunlit-footer> draws its animated light behind the
// content and colors itself from its attributes — shadow-color matches
// --color-footer-bg; see src/lib/sunlit-footer.js for the other tweakable
// attributes (blob-count, drift-speed, grain, pull-strength, ...).
function Footer() {
  return (
    <sunlit-footer class={styles.footer} shadow-color="#1975FF" light-color="#FFFEC2">
      <div className={styles.inner}>
        <h2 className={styles.connect}>Let&rsquo;s Connect</h2>
        <nav className={styles.socials} aria-label="Social links">
          {SOCIALS.map(({ label, href, external }) => (
            <a key={label} href={href} {...(external && { target: '_blank', rel: 'noopener noreferrer' })}>
              {label}
            </a>
          ))}
        </nav>
        <p className={styles.copyright}>&copy; {new Date().getFullYear()} Niki Taradash</p>
        <p className={styles.credit}>Made with lots of matcha, Figma, and Claude Code</p>
      </div>
    </sunlit-footer>
  )
}

export default Footer
