import { motion, useMotionValue, useSpring } from 'motion/react'
import { useEffect, useState } from 'react'
import { useLang } from '../i18n'

/** Context labels: put data-cursor="drag" (etc.) on any element. */
const LABELS: Record<string, { en: string; bn: string }> = {
  view: { en: 'View', bn: 'দেখুন' },
  drag: { en: 'Pull', bn: 'টানুন' },
  zoom: { en: 'Zoom', bn: 'জুম' },
  add: { en: 'Add', bn: 'ব্যাগে' },
  open: { en: 'Open', bn: 'খুলুন' },
  play: { en: 'Play', bn: 'চালান' },
  swipe: { en: 'Swipe', bn: 'সরান' },
  touch: { en: 'Touch', bn: 'ছুঁয়ে দেখুন' },
}
const MAGNETIC = '.btn, .round, .icon-btn, .pick-add, .heart, .fdot, .sw, .lang, .detail-nav, .ctrl > span:first-child'
const PETAL_COLORS = ['#E8C46A', '#B81D27', '#F2A33A', '#F6E3B0', '#D9547B']

export function Cursor() {
  const { lang } = useLang()
  const [on, setOn] = useState(false)
  const [mode, setMode] = useState<'none' | 'hover' | 'label' | 'text'>('none')
  const [label, setLabel] = useState('')
  const [down, setDown] = useState(false)
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const rx = useSpring(x, { stiffness: 420, damping: 32, mass: 0.6 })
  const ry = useSpring(y, { stiffness: 420, damping: 32, mass: 0.6 })

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine) return
    setOn(true)
    document.documentElement.classList.add('has-cursor')
    let mag: HTMLElement | null = null

    const move = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      const t = e.target as HTMLElement | null
      if (!t || !t.closest) return
      const lab = t.closest<HTMLElement>('[data-cursor]')
      if (t.closest('input, textarea, select')) setMode('text')
      else if (lab) {
        setMode('label')
        setLabel(lab.dataset.cursor || '')
      } else if (t.closest('a, button, label, [role="button"]')) setMode('hover')
      else setMode('none')

      // magnetic pull
      if (reduce) return
      const m = t.closest<HTMLElement>(MAGNETIC)
      if (mag && mag !== m) {
        mag.style.translate = ''
        mag = null
      }
      if (m) {
        const r = m.getBoundingClientRect()
        const dx = e.clientX - (r.left + r.width / 2)
        const dy = e.clientY - (r.top + r.height / 2)
        const k = Math.min(0.35, 18 / Math.max(r.width, 1))
        m.style.translate = `${dx * k}px ${dy * k}px`
        mag = m
      }
    }
    const leave = () => setMode('none')
    const pd = (e: PointerEvent) => {
      setDown(true)
      const t = e.target as HTMLElement
      if (reduce || t.closest('input, textarea, select, canvas')) return
      petals(e.clientX, e.clientY)
    }
    const pu = () => setDown(false)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerdown', pd)
    window.addEventListener('pointerup', pu)
    document.addEventListener('pointerleave', leave)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', pd)
      window.removeEventListener('pointerup', pu)
      document.removeEventListener('pointerleave', leave)
      document.documentElement.classList.remove('has-cursor')
    }
  }, [x, y])

  if (!on) return null
  const txt = LABELS[label]?.[lang] ?? label
  return (
    <>
      <motion.div className={'cur-ring m-' + mode + (down ? ' down' : '')} style={{ x: rx, y: ry }}>
        {mode === 'label' && <span>{txt}</span>}
      </motion.div>
      <motion.div className={'cur-dot m-' + mode} style={{ x, y }} />
    </>
  )
}

/** A small burst of flower petals (pushpo brishti) at the click point. */
function petals(cx: number, cy: number) {
  const n = 9
  for (let i = 0; i < n; i++) {
    const p = document.createElement('i')
    p.className = 'petal'
    p.style.left = cx + 'px'
    p.style.top = cy + 'px'
    p.style.background = PETAL_COLORS[i % PETAL_COLORS.length]
    document.body.appendChild(p)
    const a = (i / n) * Math.PI * 2 + Math.random() * 0.6
    const d = 40 + Math.random() * 50
    const dx = Math.cos(a) * d
    const dy = Math.sin(a) * d - 30
    const rot = (Math.random() - 0.5) * 540
    p.animate(
      [
        { transform: 'translate(-50%,-50%) rotate(0deg) scale(0.4)', opacity: 1 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${rot / 2}deg) scale(1)`, opacity: 1, offset: 0.35 },
        { transform: `translate(calc(-50% + ${dx * 1.3}px), calc(-50% + ${dy + 90}px)) rotate(${rot}deg) scale(0.8)`, opacity: 0 },
      ],
      { duration: 1100 + Math.random() * 400, easing: 'cubic-bezier(.2,.7,.3,1)' },
    ).onfinish = () => p.remove()
  }
}
