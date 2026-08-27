import homewardMockup from '../assets/images/homeward-mockup.jpg'
import bhacksMockup from '../assets/images/bhacks-mockup.jpg'
import luceMockup from '../assets/images/luce-mockup.jpg'
import WorkCard from '../components/WorkCard'
import styles from './CaseStudies.module.css'

// Exported so CaseStudyLayout can reuse the same title/blurb/tags/image
// data (and the WorkCard component itself) for a case study page's own
// "Next Up" section, instead of that content being re-typed per page and
// drifting out of sync with these cards.
export const PROJECTS = [
  {
    title: 'Immigration Enforcement Reporter',
    descriptionLines: ['Stepping in as sole designer to research and improve', 'an existing civic mapping tool.'],
    tags: ['In Progress', 'UX Research', 'Competitive Analysis'],
    compactHiddenTags: ['Competitive Analysis'],
    team: true,
    href: '/work/immigrationenforcementreporter',
    image: luceMockup,
    imageAlt: 'Immigration Enforcement Reporter mapping tool shown on a desktop monitor',
    // Single clip -- the crossfade loop just replays it seamlessly between
    // the two buffered <video> slots (see WorkCard's advance()/preloadNext).
    previewVideos: ['/videos/luce-demo.mp4'],
  },
  {
    title: 'Homeward Scoring Platform',
    descriptionLines: ['A digital scoring tool designed to support Homeward’s', 'physical board game.'],
    tags: ['Urban Planning', 'UX Research', 'UX Design Practicum'],
    compactHiddenTags: ['Urban Planning'],
    team: true,
    href: '/work/homeward',
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
    title: 'BostonHacks 2025: Brand Direction',
    descriptionLines: ['Visual identity for the largest student-run hackathon on', 'campus, applied across social media, web and event materials'],
    tags: ['Branding', 'UI Design', 'Visual Systems'],
    compactHiddenTags: ['UI Design'],
    team: true,
    href: '/work/bostonhacks',
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
      <div className={styles.inner}>
        <h1 className={styles.heading}>Case Studies</h1>

        <div className={styles.grid}>
          {PROJECTS.map((project, index) =>
            project ? (
              // LUCE is the first real card and sits in the grid's top
              // row — the only one worth prioritizing over the rest of the page.
              <WorkCard key={project.title} project={project} priority={index === 0} />
            ) : (
              <div key={`placeholder-${index}`} className={styles.placeholder} aria-hidden="true" />
            ),
          )}
        </div>
      </div>
    </section>
  )
}

export default CaseStudies
