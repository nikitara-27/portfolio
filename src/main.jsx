import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './styles/global.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Matches vite.config.js's base ('/portfolio/') — GitHub Pages serves
        this project site from that subpath, not the domain root. */}
    <BrowserRouter basename="/portfolio">
      <App />
    </BrowserRouter>
  </StrictMode>,
)
