import CaseStudyLayout from '../components/CaseStudyLayout'
import {
  Body,
  Caption,
  Eyebrow,
  Figure,
  ProcessSteps,
  PullQuote,
  ReflectionCard,
  ReflectionStack,
  SideBySide,
  SubHeading,
  TagRow,
  Video,
} from '../components/CaseStudyContent'
import heroImage from '../assets/images/homeward-mockup-2.jpg'
import spreadsheetImage from '../assets/images/homeward-spreadsheet.jpg'
import howToPlayImage from '../assets/images/homeward-how-to-play.png'
import summaryPageImage from '../assets/images/homeward-summary-page.png'
import housingImage from '../assets/images/homeward-housing.png'
import unitsMatrixImage from '../assets/images/homeward-units-matrix.png'
import typographyImage from '../assets/images/homeward-typography.png'
import colorPaletteImage from '../assets/images/homeward-color-palette.png'
import surveyIcon from '../assets/images/homeward-process-survey-icon.png'
import surveyBg from '../assets/images/homeward-process-survey-bg.png'
import interviewIcon from '../assets/images/homeward-process-interview-icon.png'
import interviewBg from '../assets/images/homeward-process-interview-bg.png'
import personaIcon from '../assets/images/homeward-process-persona-icon.png'
import personaBg from '../assets/images/homeward-process-persona-bg.png'

// Served as-is from /public (not imported from src/assets) — large video
// files don't benefit from going through Vite's asset-hashing pipeline the
// way images do, and this keeps them out of the JS bundle graph entirely.
const introVideoUrl = '/videos/homeward-intro-animation.mov'
const goalSetVideoUrl = '/videos/homeward-goal-set.mp4'
const popUpVideoUrl = '/videos/homeward-pop-up.mov'
const disruptorVideoUrl = '/videos/homeward-disruptor-cards.mp4'

const PROCESS_STEPS = [
  {
    icon: surveyIcon,
    background: surveyBg,
    heading: 'Survey Analysis',
    body: 'Before conducting new research, we reviewed feedback forms from previous Homeward players to identify patterns.',
  },
  {
    icon: interviewIcon,
    background: interviewBg,
    heading: 'User Interviews',
    body: 'To dig deeper into the Excel pain points, we interviewed 2 urban development professionals who represent the type of people Homeward is designed for.',
  },
  {
    icon: personaIcon,
    background: personaBg,
    heading: 'User Personas',
    body: 'From our feedback analysis and interviews, we developed two user personas representing our primary audiences.',
  },
]

const META = [
  { label: 'ROLE', value: 'UX Researcher, UX Designer' },
  { label: 'TEAM', value: '4 people' },
  { label: 'CONTEXT', value: 'Spark! UX Design X-Lab Practicum' },
  { label: 'TIMELINE', value: 'Spring 2026' },
]

const LINKS = [
  {
    label: 'LINKS',
    value: 'Figma Prototype',
    href: 'https://www.figma.com/proto/o7FnSPA2ei6u475b1pb194/ULI--Homeward-Wireframes?node-id=2383-1793&p=f&viewport=199%2C138%2C0.07&t=Xe2Z10Ep16Q5XvWU-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=2383%3A1771&page-id=2383%3A543',
  },
]

const SECTIONS = [
  {
    id: 'context',
    label: 'Context',
    content: (
      <>
        <Body>
          Homeward is a physical board game created by ULI to help visualize the concepts of urban planning. It&rsquo;s
          used across a wide range of settings — from professional urban planning conferences to open town meetings
          with volunteers who may be unfamiliar with either urban planning or technology. The previous Excel-based
          scoring tool didn&rsquo;t account for that range, which made it hard to use for less tech-savvy participants.
        </Body>
        <Body>
          I <strong>conducted user interviews, designed the visual style guide,</strong> and{' '}
          <strong>built the high-fidelity prototype</strong>. Working alongside three teammates who created user
          personas and journey maps, we transformed the Excel-based scoring system into an intuitive digital
          platform.
        </Body>

        <SubHeading>The problem</SubHeading>
        <SideBySide
          left={
            <Body>
              The existing scoring system relied on a clunky Excel spreadsheet that slowed gameplay and frustrated
              users. Players struggled to navigate complex formulas and track progress efficiently.
            </Body>
          }
          right={
            <Figure
              src={spreadsheetImage}
              alt="Excel spreadsheet used to score the original Homeward board game"
              aspectRatio="1309 / 1909"
            />
          }
        />
        <PullQuote>“How can we create an intuitive experience for users of all ages and backgrounds?”</PullQuote>
      </>
    ),
  },
  {
    id: 'my-role',
    label: 'My Role',
    content: (
      <>
        <TagRow tags={['UX/UI Design', 'Brand Identity', 'Design System', 'Figma Prototyping']} />
        <Body>
          I was the only team member with a design background, working alongside computer science and data science
          students. My focus was the <strong>design system, visual style guide, and hi-fi wireframes</strong> — I
          also conducted a <strong>user interview</strong> and helped <strong>map the user flow</strong>. Being the
          sole designer meant <strong>advocating for decisions</strong> the rest of the team didn&rsquo;t always have
          context on; I <strong>pushed for a more intentional use of color</strong> in the final prototype, since it
          plays a <strong>direct role in usability and visual hierarchy</strong>.
        </Body>

        <SubHeading>Visual Style Guide</SubHeading>
        <div style={{ display: 'flex', gap: '2.5rem' }}>
          <div style={{ flex: 1 }}>
            <Figure
              src={typographyImage}
              alt="Typography style guide card showing Roboto SemiBold, Roboto Bold, Nunito Medium, and Nunito Bold type samples"
              aspectRatio="515 / 296"
              shadow
              style={{ marginTop: 0 }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <Figure
              src={colorPaletteImage}
              alt="Color palette card showing five brand color swatches: #00480E, #6CA301, #00948E, #8CAECC, and #555758"
              aspectRatio="515 / 296"
              shadow
              style={{ marginTop: 0 }}
            />
          </div>
        </div>
        <div style={{ marginTop: '2.5rem' }}>
          <Body>
            We received ULI&rsquo;s brand kit, but Homeward itself had no established brand identity — so my team
            trusted me to build one. I pulled Roboto from ULI&rsquo;s kit for headers and paired it with Nunito for a
            rounder, friendlier body text. I also condensed the provided color palette down to five colors, anchoring
            it around ULI&rsquo;s signature key lime green alongside a forest green, two shades of blue, and a solid
            grey.
          </Body>
        </div>
      </>
    ),
  },
  {
    id: 'process',
    label: 'Process',
    content: (
      <>
        <ProcessSteps
          intro="We used a three-phase research strategy to understand the current experience and identify opportunities for improvement."
          steps={PROCESS_STEPS}
        />
        <div style={{ marginTop: '2rem' }}>
          <SideBySide
            left={
              <>
                <Eyebrow>Phase 1. Survey Analysis</Eyebrow>
                <SubHeading>Guided Starting Point</SubHeading>
                <Body>
                  Through research, we learned that users without prior experience found the Excel scoring sheet to
                  be confusing and hard to navigate.
                </Body>
                <Body>
                  To fix this gap, we designed a &ldquo;How to Play&rdquo; screen at the beginning to walk new users
                  through the scoring system before they start playing.
                </Body>
              </>
            }
            right={
              <Figure
                src={howToPlayImage}
                alt="How to Play screen mockup, showing three numbered steps and a Get Started button"
                aspectRatio="1194 / 834"
                shadow
                // Nudges the image down so its top edge lines up with the
                // ascender line (cap-height) of "Guided Starting Point"
                // rather than the top of the SideBySide row it's aligned
                // to by default — measured directly (DOM baseline marker +
                // canvas cap-height), not estimated from font metrics.
                style={{ marginTop: '43px' }}
              />
            }
          />
        </div>

        <div style={{ marginTop: '4rem' }}>
          <SideBySide
            left={
              <Figure
                src={summaryPageImage}
                alt="Result Summary screen mockup, showing a bar chart comparing Units, Tax Revenue, and ROC % against a 100% threshold"
                aspectRatio="1194 / 834"
                shadow
                style={{ marginTop: '43px' }}
              />
            }
            right={
              <>
                <Eyebrow>Phase 2. User Interviews</Eyebrow>
                <SubHeading>Visualizing Progress</SubHeading>
                <Body>
                  When we found out that users were having trouble visualizing their goal progress and tradeoffs, we
                  explored ways to show progress more clearly.
                </Body>
                <Body>
                  Speaking with the 2 urban development professionals led us to the insight that bar graphs are the
                  most intuitive way to show goals achieved and progress. Based on this, we built a results summary
                  that appears after every round, showing users whether they&rsquo;ve hit their goal or how close
                  they are.
                </Body>
              </>
            }
          />
        </div>

        <div style={{ marginTop: '4rem' }}>
          <div style={{ display: 'flex', gap: '2.5rem' }}>
            <div style={{ flex: 1 }}>
              <Figure
                src={housingImage}
                alt="Select your housing screen mockup, showing housing type circles with plus/minus selectors and a Continue button"
                aspectRatio="1194 / 834"
                shadow
                style={{ marginTop: 0 }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <Figure
                src={unitsMatrixImage}
                alt="Units Matrix screen mockup, showing a data table of total beds, total units, and percent of unit mix, plus an area coverage breakdown"
                aspectRatio="1194 / 834"
                shadow
                style={{ marginTop: 0 }}
              />
            </div>
          </div>
          <div style={{ marginTop: '2.5rem' }}>
            <Eyebrow>Phase 3. User Personas</Eyebrow>
            <SubHeading>Simplifying the Input Process</SubHeading>
            <Body>
              As we dove into creating User Personas, we discovered that our users want clear and simple explanations
              of housing impacts, along with an easy way to input and test decisions.
            </Body>
            <Body>
              To satisfy these needs, we made housing selection easy with simple plus/minus controls to adjust each
              housing type. Additionally, the summary page then breaks the score down further, so users know what
              areas they need to improve to reach their goals.
            </Body>
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
          Our scope was limited to redesigning the digital scoring tool — not the board game itself. Our client was
          clear that the tool should support the physical game, not replace it: she didn&rsquo;t want users getting
          too locked into the screen, disconnected from their teammates or the board in front of them.
        </Body>

        <div style={{ marginTop: '2.5rem' }}>
          <Video src={introVideoUrl} aspectRatio="2118 / 1524" />
          <Caption>Animated introduction that welcomes players into the game.</Caption>
        </div>

        <div style={{ marginTop: '2.5rem' }}>
          <Video src={goalSetVideoUrl} aspectRatio="2128 / 1524" />
          <Caption>
            Every card and label in the tool mirrors the language of the board game itself, so the two always feel
            like one connected experience.
          </Caption>
        </div>

        <div style={{ marginTop: '2.5rem' }}>
          <Video src={popUpVideoUrl} aspectRatio="2128 / 1524" />
          <Caption>
            At her request, we added pop-ups that guide users back to the physical game at key moments.
          </Caption>
        </div>

        <div style={{ marginTop: '2.5rem' }}>
          <Video src={disruptorVideoUrl} aspectRatio="2128 / 1524" />
          <Caption>The teal gradient header signals disruption before the player even reads the card.</Caption>
        </div>
      </>
    ),
  },
  {
    id: 'reflection',
    label: 'Reflection',
    content: (
      <ReflectionStack>
        <ReflectionCard
          title="Client Alignment"
          paragraphs={[
            'Communication was a key part of this project, as our team wanted to make sure we were executing our client’s vision.',
            'A memorable moment was when our client wanted a feature that kept users engaged with the physical board game. Listening to the client shifted our design, as we added pop-ups that redirected users away from the screen.',
          ]}
        />
        <ReflectionCard
          title="Design Leadership"
          paragraphs={[
            'As the only team member with a design background, I led the visual execution and consistency. That ownership pushed me to gain confidence in my design decisions, backed by a team that trusted my input.',
            'One decision I advocated for: I intentionally changed the header from a deep green to a teal blue on the Disrupter Cards section, to signal their role in the game. When my professor flagged it as an inconsistency, I explained the reasoning — the cards disrupt the player, and the header needed to reflect that.',
          ]}
        />
      </ReflectionStack>
    ),
  },
]

function HomewardCaseStudy() {
  return (
    <CaseStudyLayout
      eyebrow="CASE STUDY • HOMEWARD"
      title={
        <>
          Redesigned a scoring
          <br />
          platform from Excel to a
          <br />
          streamlined digital experience
        </>
      }
      meta={META}
      links={LINKS}
      sections={SECTIONS}
      heroImage={heroImage}
      heroAlt="Homeward's redesigned housing selection screen shown on a tablet resting on a wooden table"
    />
  )
}

export default HomewardCaseStudy
