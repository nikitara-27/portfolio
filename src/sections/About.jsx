import photo from '../assets/images/niki-taradash1.jpg'
import catIcon from '../assets/icons/cat-sit.svg'
import matchaIcon from '../assets/icons/matcha-latte.svg'
import cableCarIcon from '../assets/icons/cable-car.png'
import DraggableSticker from '../components/DraggableSticker'
import Footer from './Footer'
import styles from './About.module.css'

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
