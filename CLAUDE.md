# Project context: Niki Taradash portfolio

Personal portfolio site for Niki Taradash (graphic/UX design student at BU).
- Repo: github.com/nikitara-27/portfolio
- Live: https://nikitaradash.com (custom domain via public/CNAME)

## Working rules
- Never commit, push, or run `npm run deploy` unless explicitly asked.
- `npm run deploy` publishes whatever is in the working tree (any branch,
  including uncommitted changes) to the gh-pages branch, which is the live
  site. Pushing a branch does not change the live site.
- Redesign work lives on the `redesign` branch; `main` still matches the live
  (pre-redesign) site.

## Stack
- React 19 + Vite 8, React Router v7 (plain JS/JSX, no TypeScript)
- GSAP for animation, Lenis for smooth scroll (src/lib/lenis.js)
- CSS Modules per component + global tokens in src/styles/variables.css
- react-icons for icons, oxlint for linting
- Deploy: `npm run deploy` → builds and pushes dist/ to GitHub Pages (gh-pages). Vite base is '/'.

## Commands
- `npm run dev`: local dev server (port 5173, strictPort)
- `npm run build` / `npm run preview`
- `npm run lint`
- `npm run deploy`: publish live

## Structure
- src/App.jsx: routes
  - `/` Landing, `/about` About, `/play` Play
  - `/work/homeward`, `/work/bostonhacks`, `/work/immigrationenforcementreporter`
- src/sections/: Landing, Hero, CaseStudies (grid + PROJECTS data), Experience, About, Play, Footer
- src/pages/: one file per case study (HomewardCaseStudy, BostonHacksCaseStudy, ImmigrationEnforcementReporterCaseStudy)
- src/components/: Nav, WorkCard (hover-preview video), CaseStudyLayout, CaseStudyContent,
  CursorEffects (dot cursor), DraggableSticker, Envelope (About page),
  PlayCornerCat, BackgroundAnimation (currently unused), SmoothScroll, ScrollToTop
- src/config/features.js: on/off switches for hidden features (see below)
- src/lib/sunlit-footer.js: third-party `<sunlit-footer>` web component (WebGL
  dappled-light canvas); left as delivered, so oxlint warns on it
- src/hooks/: usePlayInView, useWorkLinkHandler
- src/utils/: mediaQueries.js (hover-capable query), stars.js
- src/assets/images, src/assets/icons (SVG stickers), src/assets/logos (experience logos,
  square PNGs trimmed to the circle edge)
- public/: videos/ (case study + play clips), niki-taradash-resume.pdf, og-image.png, favicon.png, 404.html

## Design tokens (src/styles/variables.css)
- Colors: bg #F5F1EA, text #000000, accent blue #1975FF (`--color-accent-blue`),
  divider rules #8A8A8A (`--color-rule`), light fill #DED9D1 (`--color-divider`),
  footer ink #1D2951
- Legacy, pre-redesign: `--color-accent-green` (#425C2F) is still used by WorkCard tag
  pills, nav link hover, and the not-yet-redesigned pages
- Fonts: Manrope Medium (500) for headings and body, from Google Fonts; Tchig Mono
  (`tchig-mono`, `--font-family-accent`) as the accent face, from Adobe Fonts kit
  xqk7jjg (use.typekit.net/xqk7jjg.css). Both are linked in index.html.
- Type scale (desktop / mobile ≤720px, px; line-height; letter-spacing), each level
  a `--font-size-*` / `--line-height-*` / `--letter-spacing-*` token:
  - H1 52/38, 1.1, -0.02em · H2 40/32, 1.15, -0.015em · H3 32/26, 1.2, -0.01em
  - H4 24/21, 1.25, -0.005em · H5 20/18, 1.3
  - Body Large 18/17 · Body Medium 16/15 · Body Small 14/13 (all 1.5)
  - Accent 1 (Tchig Mono) 20/16, 1.4 · Accent 2 (Tchig Mono) 14/13, 1.4, 0.02em
  - Utility classes: .body-lg, .body-sm, .accent-1, .accent-2, .body-italic (Body Large italic)
  - No font sizes outside these tokens (the case study title is a clamp() between Body Small and H1)
- Breakpoint: mobile is `max-width: 720px` (the only type-scale breakpoint); some
  layouts also stack at 1024px
- Layout: `--page-gutter` 64px desktop / 20px mobile; frosted glass `--glass-bg`
  (page bg at 50%) + `--glass-blur` (14px)
- Always use tokens rather than hardcoded values.

## Landing page (top to bottom)
1. Nav: fixed, frosted glass (bg color at 50% opacity + 14px blur, with
   -webkit- prefix). "Niki Taradash" left; Work, Play, About, Resume right
   (Resume opens the PDF in a new tab). Mobile: hamburger → full-screen menu
   with the same glass, plus email/LinkedIn icons.
2. Hero: "Niki Taradash" (H1), then two lines in Accent 1:
   "Design student @ Boston University" / "Currently product design intern @ Bendi Wellness"
   Scale-in reveal (Web Animations; constants at the top of Hero.jsx): each line fades in
   from scale 1.18, 1800ms, 250ms stagger. Plays on every full page load, after fonts load
   (1.5s cap); instant on in-site navigation back home, reduced motion, or a hidden tab.
3. Divider rule, then the case study grid: 2 columns desktop / 1 mobile, using the
   original WorkCard (image, hover video, tags, title, description) until the cards
   are redesigned. Card titles are pinned to H5 semibold.
4. Divider rule, then "My experience": label left, 4 circular logos right, each with
   company (bold, Body Small) and role (accent blue): Bendi Wellness (Product Design
   Intern), BU Spark! (UX Design Intern), Figma (Campus Leader), BostonHacks (Co-Head
   of Design). Wraps to 2x2 on mobile; label stacks above at ≤1024px.
5. Footer (all pages)

## Footer (src/sections/Footer.jsx)
- `<sunlit-footer>` with animated dappled light (shadow-color #1975FF, light-color
  #FFFEC2), 300px tall (360px mobile)
- Layout: "Let's Connect" (plain h2, Tchig Mono at the H1 size) at
  lower left with the copyright under it; social links stacked on the right
  (LinkedIn, Email, Instagram, X; external ones open in a new tab); credit line
  "Made with lots of matcha, Figma, and Claude Code" under the links, sharing the
  copyright's baseline
- No "Back to top"; links have no arrow icons

## Cursor (src/components/CursorEffects.jsx)
- Custom 10px dot cursor in accent blue; hidden on touch (`pointer: fine` only).
  No trail or sparkles (removed for good).

## Feature switches (src/config/features.js)
- SHOW_CUSTOM_CURSOR: dot cursor (on)
- SHOW_LANDING_STICKERS: draggable hero stickers (off; positions need re-tuning
  if they come back)

## Case studies (display order)
1. Homeward Scoring Platform
2. Immigration Enforcement Reporter
3. BostonHacks 2025: Brand Direction

## Not yet redesigned
- About, Play, and case study pages pick up the new fonts, colors, and larger
  headings but keep their old layouts
- Note: "luce-*" images and public/videos/luce-demo.mp4 are used by the Immigration
  Enforcement Reporter card and page (no separate Luce page)
