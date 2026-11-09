/**
 * "Walk into the shop": a photographic, scroll-driven walk through the store.
 * Each next room appears through an arch-shaped doorway that grows as you
 * scroll, while the current room drifts toward you. Transforms + opacity only,
 * so it stays smooth on phones.
 *
 * Shop photos are stock images (Unsplash). Replace them with photos of the
 * real Srimoti Bitan showroom for the most authentic result.
 */
import { motion, useMotionValue, useScroll, useSpring, useTransform, type MotionValue } from 'motion/react'
import { useRef } from 'react'
import { byId } from '../catalog'
import { img } from '../data'
import { L, useLang, type Txt } from '../i18n'
import { useStore } from '../store'
import { LogoMark } from './SareeArt'

type Spot = { x: number; y: number; id: string }
type Scene = { photo: string; pos?: string; n: string; t: Txt; s: Txt; spots?: Spot[]; cta?: boolean }

const SCENES: Scene[] = [
  { photo: '1785860089217-5c7f62013cb9', n: '০১', t: L('Welcome to Srimoti Bitan', 'শ্রীমতী বিতানে স্বাগতম'), s: L('Scroll and the shutter rises', 'স্ক্রল করুন, ঝাঁপ উঠছে') },
  { photo: '1775662039200-8e9e4a635367', n: '০২', t: L('Step inside', 'ভেতরে আসুন'), s: L('Shelves stacked to the ceiling, tea on the way', 'ছাদ পর্যন্ত সাজানো তাক, চা আসছে') },
  { photo: '1722635941018-a9e7de0a5b1b', n: '০৩', t: L('Shelves full of sarees', 'তাক ভরা শাড়ি'), s: L('Tap a gold dot to pull one out', 'সোনালি বিন্দুতে চাপ দিন, শাড়ি নামিয়ে দেখাই'), spots: [{ x: 26, y: 38, id: 'n3' }, { x: 58, y: 56, id: 'n6' }, { x: 78, y: 30, id: 'n1' }] },
  { photo: '1773291934435-adb824c7f040', n: '০৪', t: L('Feel the weave', 'হাত দিয়ে ছুঁয়ে দেখুন'), s: L('Folded six yards, waiting to be opened', 'ভাঁজ করা ছয় গজ, খোলার অপেক্ষায়'), spots: [{ x: 40, y: 50, id: 'n4' }, { x: 70, y: 36, id: 'n11' }] },
  { photo: '1773218373348-34db6bb11662', n: '০৫', t: L('The hanging rail', 'ঝোলানো আলনা'), s: L('Pick by colour, border and pallu', 'রং, পাড় আর আঁচল দেখে বেছে নিন'), spots: [{ x: 30, y: 45, id: 'n8' }, { x: 64, y: 55, id: 'n2' }] },
  { photo: '1619516388835-2b60acc4049e', pos: '50% 22%', n: '০৬', t: L('See it on you', 'পরলে কেমন মানায়'), s: L('Every saree, shown worn, head to toe', 'প্রতিটি শাড়ি পরা অবস্থায়, মাথা থেকে পা'), spots: [{ x: 50, y: 62, id: 'n7' }] },
  { photo: '1610047614301-13c63f00c032', pos: '50% 22%', n: '০৭', t: L('The bridal room', 'বিয়ের ঘর'), s: L('Benarasi and katan for every vow', 'প্রতিটি শুভক্ষণের বেনারসি ও কাতান'), spots: [{ x: 50, y: 58, id: 'b1' }], cta: true },
]

const N = SCENES.length
const START = 0.1 // shutter phase
const STEP = (1 - START - 0.04) / (N - 1)
const win = (k: number) => [START + (k - 1) * STEP, START + (k - 1) * STEP + STEP * 0.8] as const

export function ShopWalk() {
  const { lang } = useLang()
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 })
  const mx = useSpring(useMotionValue(0), { stiffness: 50, damping: 15 })
  const my = useSpring(useMotionValue(0), { stiffness: 50, damping: 15 })
  const shutter = useTransform(p, [0.01, START * 0.9], ['0%', '-104%'])
  const signY = useTransform(p, [0, START], [0, -40])
  const signOp = useTransform(p, [START * 0.6, START + STEP * 0.4], [1, 0])
  const bar = useTransform(p, [0, 1], [0, 1])

  return (
    <section className="walk2" id="walk" ref={ref} style={{ height: `${N * 100 + 60}vh` }}>
      <div
        className="walk2-view"
        onPointerMove={(e) => {
          if (e.pointerType !== 'mouse') return
          mx.set(e.clientX / window.innerWidth - 0.5)
          my.set(e.clientY / window.innerHeight - 0.5)
        }}
        onPointerLeave={() => {
          mx.set(0)
          my.set(0)
        }}
      >
        {SCENES.map((s, k) => (
          <Room key={k} k={k} s={s} p={p} mx={mx} my={my} />
        ))}

        {/* shop front: sign + marigold toran + shutter over the first room */}
        <motion.div className="walk2-sign" style={{ y: signY, opacity: signOp }}>
          <LogoMark size={40} />
          <span>
            <b>{lang === 'bn' ? 'শ্রীমতী বিতান' : 'Srimoti Bitan'}</b>
            <small>{lang === 'bn' ? 'হাতে বোনা শাড়ির ঘর' : 'Handwoven saree house'}</small>
          </span>
        </motion.div>
        <motion.div className="walk2-toran" style={{ opacity: signOp }} aria-hidden>
          {Array.from({ length: 30 }).map((_, i) => (
            <i key={i} style={{ animationDelay: `${(i % 6) * 0.2}s` }} />
          ))}
        </motion.div>
        <motion.div className="walk2-shutter" style={{ y: shutter }}>
          <span>{lang === 'bn' ? 'স্ক্রল করে দোকান খুলুন ↓' : 'Scroll to open the shop ↓'}</span>
        </motion.div>

        <div className="walk2-vignette" />
        {SCENES.map((s, k) => (
          <Caption key={k} k={k} s={s} p={p} />
        ))}
        <div className="walk2-progress">
          <motion.span style={{ scaleY: bar }} />
        </div>
      </div>
    </section>
  )
}

function Room({ k, s, p, mx, my }: { k: number; s: Scene; p: MotionValue<number>; mx: MotionValue<number>; my: MotionValue<number> }) {
  const { openQuick } = useStore()
  const { t } = useLang()
  const [a, b] = k === 0 ? [0, 0.0001] : win(k)
  const next = k < N - 1 ? win(k + 1) : ([2, 2.0001] as const)
  // doorway grows from a small arch to beyond the screen
  const door = useTransform(p, [a, b], [0.16, 3.2])
  const ring = useTransform(p, [a, a + (b - a) * 0.15, b - (b - a) * 0.3, b], [0, 1, 1, 0])
  // the photo stays screen-sized inside the growing doorway, then drifts closer while the next door opens
  const zoom = useTransform(p, [a, b, next[0], next[1]], [k === 0 ? 1 : 1.35, 1, 1, 1.22])
  const inner = useTransform(() => zoom.get() / (k === 0 ? 1 : door.get()))
  const shiftX = useTransform(mx, (v) => `${v * -2.5}%`)
  const shiftY = useTransform(my, (v) => `${v * -2}%`)
  const vis = useTransform(p, (v) => (v >= a - 0.02 && v <= next[1] + 0.02 ? 'visible' : 'hidden'))

  return (
    <motion.div className={'room' + (k === 0 ? ' first' : '')} style={{ visibility: vis, zIndex: k + 1 }}>
      <motion.div className="room-door" style={k === 0 ? undefined : { scale: door }}>
        <motion.div className="room-photo" style={{ scale: inner, x: shiftX, y: shiftY }}>
          <img src={img(s.photo, 1600)} alt="" style={{ objectPosition: s.pos ?? '50% 50%' }} />
          {s.spots?.map((sp, i) => {
            const it = byId(sp.id)
            return (
              <button key={i} className="spot" style={{ left: `${sp.x}%`, top: `${sp.y}%` }} onClick={() => openQuick(sp.id)} data-cursor="open">
                <i />
                {it && (
                  <span className="spot-tip">
                    <b>{t(it.name)}</b>
                    {t(L('Tap to view', 'দেখতে চাপুন'))} →
                  </span>
                )}
              </button>
            )
          })}
        </motion.div>
      </motion.div>
      {k > 0 && <motion.div className="room-ring" style={{ scale: door, opacity: ring }} />}
    </motion.div>
  )
}

function Caption({ k, s, p }: { k: number; s: Scene; p: MotionValue<number> }) {
  const { t } = useLang()
  const from = k === 0 ? 0 : win(k)[1] - 0.02
  const to = k < N - 1 ? win(k + 1)[0] + STEP * 0.35 : 1.01
  const o = useTransform(p, [from, from + 0.02, to - 0.02, to], [0, 1, 1, 0])
  const y = useTransform(p, [from, from + 0.02, to - 0.02, to], [24, 0, 0, -20])
  return (
    <motion.div className="walk2-cap" style={{ opacity: o, y, pointerEvents: s.cta ? 'auto' : 'none' }}>
      <span className="walk-n">{s.n}</span>
      <b>{t(s.t)}</b>
      <small>{t(s.s)}</small>
      {s.cta && (
        <a
          className="btn btn-gold"
          href="#arrivals"
          onClick={(e) => {
            e.preventDefault()
            document.getElementById('arrivals')?.scrollIntoView({ behavior: 'smooth' })
          }}
        >
          {t(L('Start shopping', 'কেনাকাটা শুরু করুন'))} →
        </a>
      )}
    </motion.div>
  )
}
