import { motion, useSpring } from 'motion/react'
import type Lenis from 'lenis'
import { useEffect, useState, type ReactNode, type RefObject } from 'react'
import { useLang, type Txt } from '../i18n'
import { useStore, type WishItem } from '../store'
import { IHeart } from './SareeArt'

export const scroller: { lenis: Lenis | null } = { lenis: null }
export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  if (scroller.lenis) scroller.lenis.scrollTo(el, { offset: id === 'top' ? 0 : -20, duration: 1.4 })
  else el.scrollIntoView({ behavior: 'smooth' })
}

export const ease = [0.22, 1, 0.36, 1] as const

export function Reveal({ children, delay = 0, y = 28, className }: { children: ReactNode; delay?: number; y?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.9, ease, delay }}
    >
      {children}
    </motion.div>
  )
}

/** Eyebrow + big headline with a sindoor→gold gradient second half. */
export function SectionHead({ eyebrow, a, b, side, center }: { eyebrow: Txt; a: Txt; b: Txt; side?: Txt; center?: boolean }) {
  const { t } = useLang()
  return (
    <div className={'sec-head' + (center ? ' center' : '')}>
      <div>
        <Reveal>
          <p className="eyebrow">
            <span className="eyebrow-line" />
            {t(eyebrow)}
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="h2">
            {t(a)} <span className="grad">{t(b)}</span>
          </h2>
        </Reveal>
      </div>
      {side && (
        <Reveal delay={0.16} className="sec-side">
          <p>{t(side)}</p>
        </Reveal>
      )}
    </div>
  )
}

export function HeartBtn({ item, className = '' }: { item: WishItem; className?: string }) {
  const { isWished, toggleWish } = useStore()
  const on = isWished(item.id)
  return (
    <motion.button
      whileTap={{ scale: 0.8 }}
      className={'heart ' + (on ? 'on ' : '') + className}
      aria-label="wishlist"
      aria-pressed={on}
      onClick={(e) => {
        e.stopPropagation()
        toggleWish(item)
      }}
    >
      <motion.span key={String(on)} initial={{ scale: on ? 0.4 : 1 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 14 }}>
        <IHeart size={17} />
      </motion.span>
    </motion.button>
  )
}

/** Tiny decorative divider: a row of alpona dots. */
export function Alpona({ className = '' }: { className?: string }) {
  return (
    <svg className={'alpona ' + className} viewBox="0 0 240 16" aria-hidden>
      <path d="M0 8 H96" stroke="currentColor" strokeWidth=".8" />
      <path d="M144 8 H240" stroke="currentColor" strokeWidth=".8" />
      <path d="M120 1 C124 5 124 11 120 15 C116 11 116 5 120 1Z" fill="currentColor" />
      <circle cx="106" cy="8" r="2" fill="currentColor" />
      <circle cx="134" cy="8" r="2" fill="currentColor" />
      <circle cx="98" cy="8" r="1.1" fill="currentColor" />
      <circle cx="142" cy="8" r="1.1" fill="currentColor" />
    </svg>
  )
}

/** 3D tilt toward the cursor, with a moving light glare. */
export function Tilt({ children, max = 10, className = '', scale = 1.02 }: { children: ReactNode; max?: number; className?: string; scale?: number }) {
  const rx = useSpring(0, { stiffness: 180, damping: 16 })
  const ry = useSpring(0, { stiffness: 180, damping: 16 })
  const s = useSpring(1, { stiffness: 220, damping: 18 })
  return (
    <motion.div
      className={'tilt ' + className}
      style={{ rotateX: rx, rotateY: ry, scale: s, transformPerspective: 900 }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        const px = (e.clientX - r.left) / r.width
        const py = (e.clientY - r.top) / r.height
        ry.set((px - 0.5) * max * 2)
        rx.set((0.5 - py) * max * 2)
        s.set(scale)
        e.currentTarget.style.setProperty('--gx', `${px * 100}%`)
        e.currentTarget.style.setProperty('--gy', `${py * 100}%`)
      }}
      onPointerLeave={() => {
        rx.set(0)
        ry.set(0)
        s.set(1)
      }}
    >
      {children}
      <span className="tilt-glare" />
    </motion.div>
  )
}

/** true while the element is on (or near) the screen; used to pause off-screen work. */
export function useOnScreen(ref: RefObject<Element | null>, margin = '100px') {
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { rootMargin: margin })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, margin])
  return on
}
