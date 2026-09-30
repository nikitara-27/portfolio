import homewardMockup from '../assets/images/homeward-mockup.jpg'
import bhacksMockup from '../assets/images/bhacks-mockup.jpg'
import luceMockup from '../assets/images/luce-mockup.jpg'
import { Link } from 'react-router-dom'
import styles from './CaseStudies.module.css'

// Exported so CaseStudyLayout can reuse the same title/blurb/tags/image
// data (and the WorkCard component itself) for a case study page's own
// "Next Up" section, instead of that content being re-typed per page and
// drifting out of sync with these cards.
//
// `thumbnail` is what the landing-page grid shows in each card. Leave it
// null for the gray placeholder, or set it to an image or video:
//   thumbnail: { type: 'image', src: homewardThumb, alt: '...' }
//   thumbnail: { type: 'video', src: '/videos/homeward-intro-animation.mov' }
// (import images from src/assets; reference videos by their /public path).
export const PROJECTS = [
  {
    title: 'Homeward Scoring Platform',
    descriptionLines: ['A digital scoring tool designed to support Homeward’s', 'physical board game.'],
    tags: ['Urban Planning', 'UX Research', 'UX Design Practicum'],
    compactHiddenTags: ['Urban Planning'],
    team: true,
    href: '/work/homeward',
    thumbnail: null,
    image: homewardMockup,
    imageAlt: "Homeward's scoring platform shown on a tablet",
    // Same clips/order as the case study's own Final Product section —
    // played in a loop for the hover preview (see WorkCard's usePreviewVideoSequence).
    previewVideos: [
      '/videos/homeward-intro-animation.mov',
      '/videos/homeward-goal-set.mp4',
      '/videos/homeward-pop-up.mov',
      '/videos/homeward-disruptor-cards.mp4',
    ],
  },
  {
    title: 'Immigration Enforcement Reporter',
    descriptionLines: ['Stepping in as sole designer to research and improve', 'an existing civic mapping tool.'],
    tags: ['In Progress', 'UX Research', 'Competitive Analysis'],
    compactHiddenTags: ['Competitive Analysis'],
    team: true,
    href: '/work/immigrationenforcementreporter',
    thumbnail: null,
    image: luceMockup,
    imageAlt: 'Immigration Enforcement Reporter mapping tool shown on a desktop monitor',
    // Single clip -- the crossfade loop just replays it seamlessly between
    // the two buffered <video> slots (see WorkCard's advance()/preloadNext).
    previewVideos: ['/videos/luce-demo.mp4'],
  },
  {
    title: 'BostonHacks 2025: Brand Direction',
    descriptionLines: ['Visual identity for the largest student-run hackathon on', 'campus, applied across social media, web and event materials'],
    tags: ['Branding', 'UI Design', 'Visual Systems'],
    compactHiddenTags: ['UI Design'],
    team: true,
    href: '/work/bostonhacks',
    thumbnail: null,
    image: bhacksMockup,
    imageAlt: 'BostonHacks 2025 brand direction shown on a laptop',
    // Same two clips (and order) as the case study's own Final Product
    // section — played in a loop for the hover preview.
    previewVideos: ['/videos/bhacks-landing-demo.mov', '/videos/bhacks-tracks-demo.mov'],
  },
]

function CaseStudies() {
  return (
    <section id="case-studies" className={styles.section}>
      <div className={styles.grid}>
        {PROJECTS.map((project) => (
          <Link key={project.href} to={project.href} className={styles.card} aria-label={project.title}>
            <CardThumbnail thumbnail={project.thumbnail} />
          </Link>
        ))}
      </div>
    </section>
  )
}

function CardThumbnail({ thumbnail }) {
  if (thumbnail?.type === 'image') {
    return <img src={thumbnail.src} alt={thumbnail.alt ?? ''} className={styles.media} loading="lazy" decoding="async" />
  }
  if (thumbnail?.type === 'video') {
    return <video src={thumbnail.src} className={styles.media} autoPlay muted loop playsInline aria-hidden="true" />
  }
  return null
}

export default CaseStudies
