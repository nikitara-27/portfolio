import CaseStudyLayout from '../components/CaseStudyLayout'
import { Body, Caption, Figure, ReflectionCard, ReflectionStack, SubHeading, TagRow, Video } from '../components/CaseStudyContent'
import heroImage from '../assets/images/bhacks-mockup-2.jpg'
import moodboardImage from '../assets/images/bhacks-moodboard.jpg'
import colorPaletteImage from '../assets/images/bhacks-color-palette.png'
import lanyardPhoto from '../assets/images/bhacks-lanyard-photo.jpg'
import badgeFront from '../assets/images/bhacks-badge-front.jpg'
import badgeBack from '../assets/images/bhacks-badge-back.jpg'
import ig1 from '../assets/images/bhacks-ig-1.jpeg'
import ig2 from '../assets/images/bhacks-ig-2.jpeg'
import ig3 from '../assets/images/bhacks-ig-3.jpeg'
import ig4 from '../assets/images/bhacks-ig-4.jpeg'
import ig5 from '../assets/images/bhacks-ig-5.jpeg'
import ig6 from '../assets/images/bhacks-ig-6.jpeg'

// Served as-is from /public, same as the Homeward case study's videos and
// the Play section's clip — not imported, so it skips Vite's hashing
// pipeline for a large asset.
const LANDING_DEMO_URL = '/videos/bhacks-landing-demo.mov'
const TRACKS_DEMO_URL = '/videos/bhacks-tracks-demo.mov'

// Matches Figure's own .figureImgShadow value (CaseStudyContent.module.css)
// — used here because these three images are plain <img> tags rather than
// Figure components (see the comment where they're used for why).
const FIGURE_SHADOW = '0 16px 32px rgba(0, 0, 0, 0.18)'

// Newest-first, matching how the real Instagram grid reads.
const INSTAGRAM_POSTS = [
  { src: ig1, alt: 'BostonHacks Instagram post: Results Are Out' },
  { src: ig2, alt: 'BostonHacks Instagram post: Track 1, Upgrade.exe' },
  { src: ig3, alt: 'BostonHacks Instagram post: Track 2, Protecting N00bs' },
  { src: ig4, alt: 'BostonHacks Instagram post: Track 3, Make Fetch Happen' },
  { src: ig5, alt: 'BostonHacks Instagram post: One Week Left to Apply' },
  { src: ig6, alt: 'BostonHacks Instagram post: Applications Are Live' },
]

const META = [
  { label: 'ROLE', value: 'Design Team Member' },
  { label: 'TEAM', value: '6 people' },
  { label: 'CONTEXT', value: 'BostonHacks' },
  { label: 'TIMELINE', value: 'Spring 2025 – Fall 2025' },
]

const LINKS = [
  {
    label: 'LINKS',
    value: 'View BostonHacks.org Live',
    href: 'https://bostonhacks.org',
  },
]

const SECTIONS = [
  {
    id: 'context',
    label: 'Context',
    content: (
      <>
        <Body>
          BostonHacks is an on-campus organization that leads Boston University&rsquo;s largest annual, student-run
          hackathon each fall.
        </Body>
        <Body>
          I <strong>pitched a Frutiger Aero-inspired aesthetic,</strong> characterized by glassy textures, sunny
          landscapes, and nostalgic Y2K culture, which was{' '}
          <strong>selected to guide the event&rsquo;s brand direction.</strong>
        </Body>
      </>
    ),
  },
  {
    id: 'my-role',
    label: 'My Role',
    content: (
      <>
        <TagRow tags={['Graphic Designer', 'Brand Identity', 'Design System', 'Figma Prototyping']} />
        <Body>
          Every year, the design team is responsible for imagining the theme for the hackathon. For the 2025
          hackathon, my proposed theme, mood board, and color palette was selected as the brand identity.
        </Body>
        <Body>
          As a team, <strong>we designed the landing page,</strong> the first touch point as applicants apply to the
          hackathon. Additionally, <strong>I designed social media posts, Instagram stories, and a marketing
          package.</strong>
        </Body>

        <div style={{ marginTop: '2.5rem' }}>
          <SubHeading>Visual Style Guide</SubHeading>
          <div style={{ display: 'flex', gap: '2.5rem' }}>
            <div style={{ flex: 1 }}>
              <Figure
                src={moodboardImage}
                alt="BostonHacks 2025 moodboard reference"
                aspectRatio="2880 / 2048"
                shadow
                style={{ marginTop: 0 }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <Figure
                src={colorPaletteImage}
                alt="BostonHacks 2025 color palette swatches"
                aspectRatio="2880 / 2048"
                shadow
                style={{ marginTop: 0 }}
              />
            </div>
          </div>
        </div>
      </>
    ),
  },
  {
    id: 'final-product',
    label: 'Final Product',
    content: (
      <>
        <Body>
          Our team worked cross functionally with the marketing and tech team to make sure the Frutiger Aero theme
          was consistently applied across all touch points of the hackathon.
        </Body>

        <div style={{ marginTop: '2rem' }}>
          {/* Plain <img> tags (not the Figure component) directly as the
              grid/flex items themselves — Figure's own style prop only
              reaches the <img> it renders, not the wrapper div around it,
              so that wrapper never actually picked up a stretched height
              and the images sized off their own content instead. Direct
              img children avoid that indirection.

              aspectRatio lives on this outer plain block wrapper, not the
              grid itself — a grid's own row auto-sizing (driven by its
              tallest child's natural content) overrides aspect-ratio set
              directly on a display:grid element. Giving this box a definite
              height first, then having the grid fill 100% of it, makes the
              row height derived purely from the left column's share of the
              width at 4:3, regardless of either side's native image
              proportions. */}
          <div style={{ aspectRatio: '12 / 7' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '3.5fr 1fr',
                gap: '1.5rem',
                height: '100%',
                alignItems: 'stretch',
              }}
            >
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <img
                  src={lanyardPhoto}
                  alt="Attendee wearing a BostonHacks lanyard badge, cropped tightly to the badge and lanyard"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', boxShadow: FIGURE_SHADOW }}
                />
                {/* Glassmorphism label -- top-left corner sits on the
                    hoodie's shoulder, clear of the badge/lanyard cord, and
                    dark enough for a light frosted pill to read clearly
                    against. backdropFilter blurs the photo behind it rather
                    than a flat fill, so the image's own color still tints
                    the pill. */}
                <span
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    left: '1rem',
                    padding: '0.4rem 0.9rem',
                    borderRadius: '999px',
                    background: 'rgba(255, 255, 255, 0.18)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.35)',
                    color: '#ffffff',
                    fontFamily: 'var(--font-family-body)',
                    fontWeight: 'var(--font-weight-semibold)',
                    fontSize: 'var(--font-size-body-m)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  AI content representation
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%', minHeight: 0 }}>
                <img
                  src={badgeFront}
                  alt="BostonHacks lanyard badge design preview"
                  style={{
                    flex: 1,
                    minHeight: 0,
                    width: '100%',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    boxShadow: FIGURE_SHADOW,
                  }}
                />
                <img
                  src={badgeBack}
                  alt="Blank BostonHacks lanyard badge template with Name, School, and Role fields"
                  style={{
                    flex: 1,
                    minHeight: 0,
                    width: '100%',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    boxShadow: FIGURE_SHADOW,
                  }}
                />
              </div>
            </div>
          </div>
          <Caption>Each attendee receives a lanyard.</Caption>
        </div>

        <div style={{ marginTop: '2.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* aspectRatio was a guess before the source recordings' actual
                letterboxing was measured; crop values below are derived
                directly from each clip's pixel geometry (full frame
                3164x2062, symmetric 111px side bars, asymmetric 76px top /
                ~144-146px bottom bars) — see Video's `crop` prop. */}
            <Video
              src={LANDING_DEMO_URL}
              crop={{ contentAspectRatio: '2942 / 1842', scale: 107.546, left: 3.773, top: 4.126 }}
              shadow
            />
            <Video
              src={TRACKS_DEMO_URL}
              crop={{ contentAspectRatio: '2942 / 1840', scale: 107.546, left: 3.773, top: 4.130 }}
              shadow
            />
          </div>
          <Caption>
            Our landing webpage, where interested students can learn more about the hackathon, what the tracks are,
            who our sponsors are, and how to apply.
          </Caption>
        </div>

        <div style={{ marginTop: '2.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            {INSTAGRAM_POSTS.map((post) => (
              <Figure key={post.src} src={post.src} alt={post.alt} aspectRatio="1206 / 1810" shadow style={{ marginTop: 0 }} />
            ))}
          </div>
          <Caption>A glimpse into our Instagram posts.</Caption>
        </div>
      </>
    ),
  },
  {
    id: 'process',
    label: 'Process',
    content: (
      <>
        <Body>
          During an organization-wide meeting, we landed on the theme Y2K for our 2025 hackathon. From there, each
          member of the design team created a mood board and color palette to be presented in front of the whole
          organization.
        </Body>
        <Body>
          When creating my mood board, I was inspired by Frutiger Aero, and incorporated the blue sky and rolling
          hills desktop image, lots of blue, the windows logo, and underwater imagery. I then picked out repeating
          colors to create my color palette. In the end, the mood board and color palette I created was chosen as
          the visual direction for our hackathon.
        </Body>
        <Body>
          Next, we created graphic assets and choose the typography that would be used throughout the year for the
          marketing and design materials. We then individually created a draft of the landing web-page wireframe
          and the design team voted on the best one. In pairs, we then refined the chosen wireframe, by envisioning
          interactive features and adding design choices from our own that didn&rsquo;t make the cut, and voted
          again to land on the final version together.
        </Body>
        <Body>
          When it came to designing social media graphics, sponsorship material, and merchandise, because the
          graphic assets and typography was established, we were able to all design separately and take ownership
          of individual assignments but stay cohesive and on theme.
        </Body>
      </>
    ),
  },
  {
    id: 'reflection',
    label: 'Reflection',
    content: (
      <ReflectionStack>
        <ReflectionCard
          title="Design System"
          background="#1E65FA"
          textColor="#ffffff"
          paragraphs={[
            'Having an established design system is important when it comes to designing with a team. Because our team laid out our design assets and agreed on specific typography, we were able to work seamlessly as a team and effectively create cohesive designs across all channels.',
            'Comparing this to other design teams that I’ve worked on that weren’t as organized, the difference was clear. Without a shared system in place, teams tend to spend more time going back and forth on small decisions or reconciling mismatched work. Having that foundation set from the start meant we could focus on the actual design work instead of re-litigating the basics every time.',
          ]}
        />
        <ReflectionCard
          title="Appreciation for Design"
          background="#D25D13"
          textColor="#ffffff"
          paragraphs={[
            'During the 24 hour hackathon, attendees kept coming up to me and other organizers to compliment the theme for the hackathon. It was really memorable to have my team’s work recognized and appreciated by the hackers themselves.',
            'It reinforced the importance of organization and execution in design. A great idea can go completely unnoticed if it isn’t carried through well.',
          ]}
        />
      </ReflectionStack>
    ),
  },
]

function BostonHacksCaseStudy() {
  return (
    <CaseStudyLayout
      eyebrow="BostonHacks 2025: Brand Direction"
      title={
        <>
          Art directed the visual identity
          <br />
          for BostonHacks 2025—applied
          <br />
          across social media, web,
          <br />
          and event materials
        </>
      }
      meta={META}
      links={LINKS}
      sections={SECTIONS}
      heroImage={heroImage}
      heroAlt="BostonHacks 2025 brand direction shown on a laptop screen"
    />
  )
}

export default BostonHacksCaseStudy
