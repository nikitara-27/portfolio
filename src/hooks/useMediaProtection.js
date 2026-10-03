import { useEffect } from 'react'

const MEDIA = 'img, video'

// Casual-copy deterrents for every image and video on the site, set up once
// in App (the matching CSS lives in global.css). Covers elements rendered
// later too, via a MutationObserver, so components don't need to opt in.
// Right-click is only blocked on media that isn't inside a link, so links
// keep their normal menu (open in new tab, copy link) and text is untouched.
function protect(el) {
  el.setAttribute('draggable', 'false')
  if (el.tagName === 'VIDEO') {
    el.setAttribute('controlsList', 'nodownload noplaybackrate')
    el.setAttribute('disablePictureInPicture', '')
    el.disablePictureInPicture = true
  }
}

function protectTree(node) {
  if (node.nodeType !== Node.ELEMENT_NODE) return
  if (node.matches(MEDIA)) protect(node)
  node.querySelectorAll(MEDIA).forEach(protect)
}

export function useMediaProtection() {
  useEffect(() => {
    protectTree(document.body)
    const observer = new MutationObserver((records) => {
      for (const record of records) record.addedNodes.forEach(protectTree)
    })
    observer.observe(document.body, { childList: true, subtree: true })

    const onContextMenu = (e) => {
      const media = e.target.closest?.(MEDIA)
      if (media && !media.closest('a')) e.preventDefault()
    }
    const onDragStart = (e) => {
      if (e.target.closest?.(MEDIA)) e.preventDefault()
    }
    document.addEventListener('contextmenu', onContextMenu)
    document.addEventListener('dragstart', onDragStart)

    return () => {
      observer.disconnect()
      document.removeEventListener('contextmenu', onContextMenu)
      document.removeEventListener('dragstart', onDragStart)
    }
  }, [])
}
