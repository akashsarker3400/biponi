import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import App from './App.tsx'

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
