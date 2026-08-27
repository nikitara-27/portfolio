import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Nav from './components/Nav'
import ScrollToTop from './components/ScrollToTop'
import SmoothScroll from './components/SmoothScroll'
import CursorEffects from './components/CursorEffects'
import Landing from './sections/Landing'
import About from './sections/About'
import Play from './sections/Play'
import Resume from './sections/Resume'
import HomewardCaseStudy from './pages/HomewardCaseStudy'
import BostonHacksCaseStudy from './pages/BostonHacksCaseStudy'
import ImmigrationEnforcementReporterCaseStudy from './pages/ImmigrationEnforcementReporterCaseStudy'

function App() {
  const [homeKey, setHomeKey] = useState(0)

  return (
    <>
      <SmoothScroll />
      <CursorEffects />
      <ScrollToTop />
      <Nav onHomeClick={() => setHomeKey((key) => key + 1)} />
      <Routes>
        <Route path="/" element={<Landing key={homeKey} />} />
        <Route path="/about" element={<About />} />
        <Route path="/play" element={<Play />} />
        <Route path="/resume" element={<Resume />} />
        <Route path="/work/homeward" element={<HomewardCaseStudy />} />
        <Route path="/work/bostonhacks" element={<BostonHacksCaseStudy />} />
        <Route path="/work/immigrationenforcementreporter" element={<ImmigrationEnforcementReporterCaseStudy />} />
      </Routes>
    </>
  )
}

export default App
