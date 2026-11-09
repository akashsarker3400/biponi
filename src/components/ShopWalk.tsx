/**
 * "Walk into the shop": a scroll-driven CSS-3D walk through Srimoti Bitan.
 * Only transforms and opacity animate, so it stays smooth on phones.
 *
 * World units are px. The camera looks down -Z; scrolling pushes the
 * world toward you (translateZ), the mouse turns your head (rotateX/Y).
 */
import { motion, useMotionValue, useScroll, useSpring, useTransform, type MotionValue } from 'motion/react'
import { useMemo, useRef } from 'react'
import { BRIDAL_ALL, SAREES, byId, type Saree } from '../catalog'
import { img } from '../data'
import { L, useLang, type Txt } from '../i18n'
import { useStore } from '../store'
import { LogoMark, SareeFlat, SareeHanging } from './SareeArt'

const W = 1000 // corridor width
const H = 620 // wall height
const D = 3000 // depth of the shop
const TOP = -330
const FLOOR = 290
const MIDY = (TOP + FLOOR) / 2

const CHAPTERS: { from: number; to: number; n: string; t: Txt; s: Txt }[] = [
  { from: 0, to: 0.16, n: '০১', t: L('The shutter rises', 'ঝাঁপ উঠছে'), s: L('Scroll to open Srimoti Bitan', 'স্ক্রল করুন, দোকান খুলছে') },
  { from: 0.18, to: 0.46, n: '০২', t: L('Shelves full of sarees', 'তাক ভরা শাড়ি'), s: L('Hover a stack to pull it out, tap to open it', 'ভাঁজে মাউস রাখুন, চাপ দিলে খুলবে') },
  { from: 0.48, to: 0.68, n: '০৩', t: L('Unfolded at the counter', 'কাউন্টারে শাড়ি খোলা'), s: L('“Look at this one, pure jamdani.”', '“এটা দেখুন আপা, খাঁটি জামদানি।”') },
  { from: 0.7, to: 0.82, n: '০৪', t: L('The mirror corner', 'আয়নার কোণ'), s: L('See how it falls when it is worn', 'পরলে কেমন মানায়, দেখে নিন') },
  { from: 0.84, to: 1.01, n: '০৫', t: L('The bridal room', 'বিয়ের ঘর'), s: L('Benarasi and katan for every vow', 'প্রতিটি শুভক্ষণের বেনারসি ও কাতান') },
]

const u = (v: unknown, unit: string) => (typeof v === 'number' ? `${v}${unit}` : String(v ?? `0${unit}`))
const t3 = (x: number, y: number, z: number, extra = '') => `translate3d(${x}px, ${y}px, ${z}px) ${extra}`

/** One folded saree in a stack, drawn with stripes: paar, zari, jomin. */
function Fold({ s, w = 64 }: { s: Saree; w?: number }) {
  const { body, border, zari } = s.look
  return <i className="fold" style={{ width: w, background: `linear-gradient(180deg, ${border} 0 16%, ${zari} 16% 23%, ${body} 23% 77%, ${zari} 77% 84%, ${border} 84%)` }} />
}

function Stack({ items, onOpen }: { items: Saree[]; onOpen: (s: Saree) => void }) {
  const { t, taka } = useLang()
  const top = items[items.length - 1]
  return (
    <button className="stack" onClick={() => onOpen(top)} data-cursor="open" aria-label={top.name.en}>
      {items.map((s, k) => (
        <Fold key={k} s={s} w={58 + ((k * 7) % 10)} />
      ))}
      <span className="stack-tip">
        <b>{t(top.name)}</b>
        {taka(top.price)}
      </span>
    </button>
  )
}

function Wall({ side, onOpen }: { side: 'l' | 'r'; onOpen: (s: Saree) => void }) {
  const { t } = useLang()
  // 4 shelves × 13 stacks, each stack 4 different sarees
  const shelves = useMemo(
    () =>
      Array.from({ length: 4 }, (_, r) =>
        Array.from({ length: 13 }, (_, c) => Array.from({ length: 4 }, (_, k) => SAREES[(r * 13 + c * 4 + k + (side === 'r' ? 7 : 0)) % SAREES.length])),
      ),
    [side],
  )
  const mirror = byId('n7')!
  const poster = BRIDAL_ALL[0]
  return (
    <div
      className={'w-wall ' + side}
      style={{ width: D, height: H, marginLeft: -D / 2, marginTop: -H / 2, transform: t3(side === 'l' ? -W / 2 : W / 2, MIDY, -D / 2, `rotateY(${side === 'l' ? 90 : -90}deg)`) }}
    >
      <div className="w-shelves">
        {shelves.map((row, r) => (
          <div className="w-shelf" key={r}>
            {row.map((st, c) => (
              <Stack key={c} items={st} onOpen={onOpen} />
            ))}
          </div>
        ))}
      </div>
      {side === 'r' ? (
        <button className="w-mirror" onClick={() => onOpen(mirror)} data-cursor="view">
          <span className="w-mirror-glass">
            <img src={img(mirror.photo, 700)} alt="" loading="lazy" />
            <i className="w-mirror-shine" />
          </span>
          <b>{t(L('Try it in the mirror', 'আয়নায় মিলিয়ে দেখুন'))}</b>
        </button>
      ) : (
        <button className="w-poster" onClick={() => onOpen(byId(poster.id)!)} data-cursor="view">
          <img src={img(poster.photo, 700)} alt="" loading="lazy" />
          <b>{t(L('Bridal week · ask inside', 'বিয়ের সপ্তাহ · ভেতরে জিজ্ঞেস করুন'))}</b>
        </button>
      )}
    </div>
  )
}

export function ShopWalk() {
  const { t, lang } = useLang()
  const { openQuick } = useStore()
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.5 })

  // camera
  const camZ = useTransform(p, [0, 0.14, 0.9, 1], [-420, -120, 2650, 2700])
  const look = useTransform(p, [0, 0.22, 0.34, 0.46, 0.6, 0.74, 0.86, 1], [0, -24, 22, -4, 0, 30, 0, 0])
  const pitch = useTransform(p, [0.5, 0.6, 0.68, 0.74], [0, 16, 16, 0])
  const mx = useSpring(useMotionValue(0), { stiffness: 50, damping: 16 })
  const my = useSpring(useMotionValue(0), { stiffness: 50, damping: 16 })
  const rotY = useTransform(() => look.get() + mx.get() * 14)
  const rotX = useTransform(() => pitch.get() + my.get() * -7)
  // shop front
  const shutter = useTransform(p, [0.02, 0.13], ['0%', '-102%'])
  const frontOp = useTransform(p, [0.15, 0.21], [1, 0])
  const frontPE = useTransform(p, (v) => (v > 0.18 ? 'none' : 'auto'))
  const glowOp = useTransform(p, [0.04, 0.14], [0, 1])
  // counter saree
  const unroll = useTransform(p, [0.54, 0.67], [100, 0])
  const clip = useTransform(unroll, (v) => `inset(0 ${v}% 0 0)`)
  const rollX = useTransform(unroll, (v) => `${100 - v}%`)
  const bar = useTransform(p, [0, 1], ['0%', '100%'])

  const open = (s: Saree) => openQuick(s.id)
  const hanging = useMemo(() => SAREES.filter((s) => s.group === 'new').slice(0, 6), [])
  const bridal = BRIDAL_ALL.slice(0, 3)
  const counterSaree = byId('n2')!

  return (
    <section className="walk" id="walk" ref={ref}>
      <div
        className="walk-view"
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
        <div className="walk-scale">
          <motion.div className="walk-world" style={{ z: camZ, rotateX: rotX, rotateY: rotY }} transformTemplate={(v) => `rotateX(${u(v.rotateX, 'deg')}) rotateY(${u(v.rotateY, 'deg')}) translateZ(${u(v.z, 'px')})`}>
            {/* floor & ceiling */}
            <div className="w-floor" style={{ width: W, height: D, marginLeft: -W / 2, marginTop: -D / 2, transform: t3(0, FLOOR, -D / 2, 'rotateX(90deg)') }} />
            <div className="w-ceil" style={{ width: W, height: D, marginLeft: -W / 2, marginTop: -D / 2, transform: t3(0, TOP, -D / 2, 'rotateX(-90deg)') }} />

            <Wall side="l" onOpen={open} />
            <Wall side="r" onOpen={open} />

            {/* pendant lamps */}
            {[-350, -950, -1550, -2150, -2700].map((z) => (
              <div key={z} className="w-lamp" style={{ transform: t3(0, TOP + 70, z) }}>
                <i />
              </div>
            ))}

            {/* sarees hanging from a ceiling rail */}
            {hanging.map((s, k) => {
              const left = k % 2 === 0
              const z = -650 - Math.floor(k / 2) * 330
              return (
                <button key={s.id} className="w-hang" onClick={() => open(s)} data-cursor="open" style={{ transform: t3(left ? -300 : 300, TOP + 30, z, `rotateY(${left ? 58 : -58}deg)`) }} aria-label={s.name.en}>
                  <SareeHanging look={s.look} />
                </button>
              )
            })}

            {/* counter with a saree being unrolled */}
            <div className="w-counter" style={{ transform: t3(0, 190, -1950) }}>
              <div className="w-counter-front">
                <LogoMark size={30} />
                <span>{lang === 'bn' ? 'শ্রীমতী বিতান' : 'SRIMOTI BITAN'}</span>
              </div>
              <div className="w-counter-top">
                <motion.div className="w-unroll" style={{ clipPath: clip }}>
                  <SareeFlat look={counterSaree.look} />
                </motion.div>
                <motion.i className="w-roll" style={{ left: rollX, background: `linear-gradient(90deg, rgba(0,0,0,.4), rgba(255,255,255,.3) 40%, rgba(0,0,0,.45)), ${counterSaree.look.body}` }} />
              </div>
              <button className="w-counter-cta" onClick={() => open(counterSaree)}>
                {t(counterSaree.name)} →
              </button>
            </div>

            {/* back wall: the bridal room */}
            <div className="w-back" style={{ width: W, height: H, marginLeft: -W / 2, marginTop: -H / 2, transform: t3(0, MIDY, -D) }}>
              <p className="w-back-title">{t(L('The bridal room', 'বিয়ের ঘর'))}</p>
              <div className="w-arches">
                {bridal.map((b) => (
                  <button key={b.id} className="w-arch" onClick={() => openQuick(b.id)} data-cursor="view">
                    <img src={img(b.photo, 600)} alt="" loading="lazy" />
                    <span>{t(b.name)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* shop front at the entrance */}
            <motion.div className="w-front" style={{ width: W, height: H, marginLeft: -W / 2, marginTop: -H / 2, transform: t3(0, MIDY, 0), opacity: frontOp, pointerEvents: frontPE }}>
              <div className="w-sign">
                <LogoMark size={44} />
                <b>{lang === 'bn' ? 'শ্রীমতী বিতান' : 'Srimoti Bitan'}</b>
                <small>{lang === 'bn' ? 'হাতে বোনা শাড়ির ঘর · স্থাপিত ১৪৩৩' : 'Handwoven saree house · Est. 1433'}</small>
              </div>
              <div className="w-toran" aria-hidden>
                {Array.from({ length: 26 }).map((_, k) => (
                  <i key={k} style={{ animationDelay: `${(k % 6) * 0.2}s` }} />
                ))}
              </div>
              <div className="w-facade">
                <div className="w-window">
                  <img src={img('1610030469983-98e550d6193c', 500)} alt="" />
                </div>
                <div className="w-door">
                  <motion.div className="w-door-glow" style={{ opacity: glowOp }} />
                  <motion.div className="w-shutter" style={{ y: shutter }}>
                    <span>{t(L('Scroll to open', 'স্ক্রল করে খুলুন'))} ↓</span>
                  </motion.div>
                </div>
                <div className="w-window">
                  <img src={img('1609748340041-f5d61e061ebc', 500)} alt="" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        <div className="walk-vignette" />
        {CHAPTERS.map((c) => (
          <Caption key={c.n} p={p} c={c} />
        ))}
        <div className="walk-progress">
          <motion.span style={{ height: bar }} />
        </div>
      </div>
    </section>
  )
}

function Caption({ p, c }: { p: MotionValue<number>; c: (typeof CHAPTERS)[number] }) {
  const { t } = useLang()
  const o = useTransform(p, [c.from, c.from + 0.03, c.to - 0.03, c.to], [0, 1, 1, 0])
  const y = useTransform(p, [c.from, c.from + 0.03, c.to - 0.03, c.to], [24, 0, 0, -24])
  return (
    <motion.div className="walk-cap" style={{ opacity: o, y }}>
      <span className="walk-n">{c.n}</span>
      <b>{t(c.t)}</b>
      <small>{t(c.s)}</small>
    </motion.div>
  )
}
