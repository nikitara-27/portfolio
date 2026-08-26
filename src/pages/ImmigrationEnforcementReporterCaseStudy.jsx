import CaseStudyLayout from '../components/CaseStudyLayout'
import { Body, Caption, Figure, PullQuote, SideBySide, SubHeading, TagRow } from '../components/CaseStudyContent'
import heroImage from '../assets/images/luce-mockup.jpg'
import auditSnippetImage from '../assets/images/luce-audit-snippet.png'
import aboutBeforeImage from '../assets/images/luce-about-before.png'
import aboutAfterImage from '../assets/images/luce-about-after.png'

const META = [
  { label: 'ROLE', value: 'UX Designer' },
  { label: 'TEAM', value: '8 people' },
  { label: 'CONTEXT', value: 'Boston University Law and LUCE' },
  { label: 'TIMELINE', value: 'In progress' },
]

const LINKS = [
  {
    label: 'LINKS',
    value: 'Live Beta Site',
    href: 'https://icewatchma.org',
  },
]

const SECTIONS = [
  {
    id: 'context',
    label: 'Context',
    content: (
      <>
        <Body>
          The Immigration Enforcement Reporter is an educational and archival resource built in partnership with
          the Boston University of Law Immigrants’ Rights and Human Trafficking Clinic and LUCE to document
          verified ICE activity over time. The purpose is to improve transparency around ICE enforcement activity
          in Massachusetts.
        </Body>
        <Body>
          I’ve <strong>analyzed user feedback,</strong> <strong>conducted a competitor audit,</strong> and{' '}
          <strong>clarified the About section.</strong> As the sole designer on the project, I stepped in after
          the previous designer’s departure, using research to prioritize where the product needed the most
          clarity.
        </Body>

        <SubHeading>The problem</SubHeading>
        <Body>
          After receiving user feedback on the beta site, we realized there was a gap between our tool’s purpose
          and our users’ expectations. The interactive map was built as an educational tool that archives data
          and shows ICE activity in Massachusetts over time, but users expected real-time updates, a platform
          showing active ICE involvement as it happened.
        </Body>
        <PullQuote>
          “How can we clarify the tool’s purpose to close the gap between what it offers and what users expect?”
        </PullQuote>
      </>
    ),
  },
  {
    id: 'my-role',
    label: 'My Role',
    content: (
      <>
        <TagRow tags={['UX Research', 'UX Design', 'Competitive Analysis', 'Figma']} />
        <Body>
          As the sole designer, I stepped into this project after the site’s core design had already been
          established. My role is to carry that design work forward, using ongoing user feedback to guide future
          design decisions, and refining the experience as new needs emerge.
        </Body>
        <Body>
          Since design isn’t the rest of the team’s focus, they often come to me for visual direction, from small
          styling questions to bigger decisions about how the site should look and feel.
        </Body>
      </>
    ),
  },
  {
    id: 'process',
    label: 'Process',
    content: (
      <>
        <Body>
          First, to understand the problem, I analyzed 22 survey responses to user feedback on our live beta
          site. Alongside this, I conducted a competitor audit of similar civic mapping and reporting tools,
          looking at how other platforms communicated their data’s purpose and scope to users.
        </Body>

        <Figure
          src={auditSnippetImage}
          alt="Competitor audit table comparing the Immigration Enforcement Reporter to similar civic mapping and reporting tools"
          aspectRatio="1774 / 448"
          style={{ border: '1px solid var(--color-divider)' }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', margin: '3rem 0' }}>
          <span
            style={{
              fontFamily: 'var(--font-family)',
              fontWeight: 'var(--font-weight-semibold)',
              fontSize: 'var(--font-size-h1)',
              color: 'var(--color-accent-green)',
              flexShrink: 0,
            }}
          >
            45%
          </span>
          <p style={{ margin: 0 }}>
            of respondents expected the Immigration Enforcement Reporter to function as a live, real-time
            resource for impacted communities.
          </p>
        </div>

        <Body>
          Paired with the competitor audit, it became clear our data was framed as archival and educational, but
          nothing on the site told users that outright, leaving room for assumptions with real stakes.
        </Body>
        <Body>
          To address this, I redesigned the site’s About section, rewriting the copy and restructuring the
          layout to state plainly, right away, what the data is and isn’t. Instead of leaving users to infer the
          tool’s purpose from the map itself, the About section now does that work directly.
        </Body>
      </>
    ),
  },
  {
    id: 'current-progress',
    label: 'Current Progress',
    content: (
      <>
        <Body>
          I rewrote the copy to state the tool’s purpose and target audience, and restructured the layout so
          that the explanation is clear, rather than something users had to dig for.
        </Body>

        <div style={{ marginTop: '2rem' }}>
          <SideBySide
            left={
              <>
                <Figure src={aboutBeforeImage} alt="The About page before the redesign" aspectRatio="3024 / 1964" shadow />
                <Caption>Before</Caption>
              </>
            }
            right={
              <>
                <Figure src={aboutAfterImage} alt="The About page after the redesign" aspectRatio="3024 / 6152" shadow />
                <Caption>After</Caption>
              </>
            }
          />
        </div>
      </>
    ),
  },
  {
    id: 'next-steps',
    label: 'Next Steps',
    content: (
      <div style={{ background: '#f5f1ea', borderRadius: '24px', padding: '2rem' }}>
        <p style={{ margin: 0, color: '#252422' }}>
          With the About section addressing the trust and clarity gap, my next focus is bringing LUCE’s brand
          identity into the rest of the site. This aligns the visual language with the organization behind the
          tool.
        </p>
      </div>
    ),
  },
]

function ImmigrationEnforcementReporterCaseStudy() {
  return (
    <CaseStudyLayout
      eyebrow="CASE STUDY • IMMIGRATION ENFORCEMENT REPORTER"
      title={
        <>
          Auditing and clarifying trust
          <br />
          in existing civic mapping tool
        </>
      }
      meta={META}
      links={LINKS}
      sections={SECTIONS}
      heroImage={heroImage}
      heroAlt="Immigration Enforcement Reporter mapping tool shown on a desktop monitor"
    />
  )
}

export default ImmigrationEnforcementReporterCaseStudy
