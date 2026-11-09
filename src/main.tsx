import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import App from './App.tsx'

// Phones/tablets get a lighter version of the effects (see html.lite in styles.css)
if (window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 760) document.documentElement.classList.add('lite')

// Decode every image off the main thread so scrolling never waits on it
new MutationObserver((list) => {
  for (const m of list)
    m.addedNodes.forEach((n) => {
      if (n instanceof HTMLImageElement) n.decoding = 'async'
      else if (n instanceof HTMLElement) n.querySelectorAll('img').forEach((i) => (i.decoding = 'async'))
    })
}).observe(document.documentElement, { childList: true, subtree: true })

// Premium image reveal: every photo fades in from a soft blur once it has loaded.
document.addEventListener(
  'load',
  (e) => {
    const el = e.target as HTMLElement
    if (el.tagName === 'IMG') el.classList.add('is-in')
  },
  true,
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
