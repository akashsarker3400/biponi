/**
 * "Walk into the shop": a scroll-driven CSS-3D walk through Srimoti Bitan.
 * Only transforms and opacity animate, so it stays smooth on phones.
 *
 * World units are px. The camera looks down -Z; scrolling pushes the
 * world toward you (translateZ), the mouse turns your head (rotateX/Y).
 */
import { motion, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform, type MotionValue } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { BRIDAL_ALL, byId, type Saree } from '../catalog'
import { img } from '../data'
import { L, useLang, type Txt } from '../i18n'
import { useStore } from '../store'
import { LogoMark, SareeFlat } from './SareeArt'
import { useOnScreen } from './ui'

const W = 1000 // corridor width
const H = 620 // wall height
const D = 3000 // depth of the shop
const Q = 4 // downscale factor for plain surfaces
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

/** Living models on display stands: short silent loops (public/videos). */
const STANDS: { v: string; id: string; label: Txt }[] = [
  { v: 'bride', id: 'b1', label: L('Bridal Benarasi', 'বিয়ের বেনারসি') },
  { v: 'pink', id: 'n7', label: L('Festive silk', 'উৎসবের সিল্ক') },
  { v: 'drape', id: 'n4', label: L('How it is draped', 'যেভাবে পরানো হয়') },
  { v: 'red', id: 'p6', label: L('Red with mehndi', 'মেহেদি রাঙা লাল') },
  { v: 'kuchi', id: 'n11', label: L('The perfect kuchi', 'নিখুঁত কুচি') },
  { v: 'sisters', id: 'n12', label: L('With the sisters', 'সখীদের সাথে') },
]
const standZ = (k: number) => -720 - Math.floor(k / 2) * 420

/** A looping clip that only downloads/decodes while `active` (near the camera). */
function LoopVideo({ name, active }: { name: string; active: boolean }) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const v = ref.current
    if (!v) return
    if (active) {
      v.preload = 'auto'
      v.play().catch(() => {})
    } else v.pause()
  }, [active])
  return <video ref={ref} src={`/videos/${name}.mp4`} poster={`/videos/${name}.jpg`} muted loop playsInline preload="none" aria-hidden />
}

/** Real photos of stacked sarees, framed as glass-front wooden cabinets. */
const CABINETS: Record<'l' | 'r', { photo: string; label: Txt; id: string; flip?: boolean }[]> = {
  l: [
    { photo: '1722635941018-a9e7de0a5b1b', label: L('Jamdani', 'জামদানি'), id: 'n5' },
    { photo: '1771074153197-89af3a969042', label: L('Rajshahi Silk', 'রাজশাহী সিল্ক'), id: 'n6' },
    { photo: '1632046876672-de5e7ee4ac61', label: L('Tangail Tant', 'টাঙ্গাইল তাঁত'), id: 'n3' },
    { photo: '1773291934435-adb824c7f040', label: L('Katan', 'কাতান'), id: 'n11' },
  ],
  r: [
    { photo: '1775662039200-8e9e4a635367', label: L('Cotton & Tant', 'সুতি ও তাঁত'), id: 'n10' },
    { photo: '1771074152971-7dba5f49bf93', label: L('Monipuri', 'মণিপুরী'), id: 'n8' },
    { photo: '1773218373348-34db6bb11662', label: L('Handwoven', 'হাতে বোনা'), id: 'n2' },
    { photo: '1722635941018-a9e7de0a5b1b', label: L('New arrivals', 'নতুন এসেছে'), id: 'n1', flip: true },
  ],
}

function Wall({ side, onOpen }: { side: 'l' | 'r'; onOpen: (s: Saree) => void }) {
  const { t } = useLang()
  const mirror = byId('n7')!
  const poster = BRIDAL_ALL[0]
  const x = side === 'l' ? -W / 2 + 2 : W / 2 - 2
  const rot = `rotateY(${side === 'l' ? 90 : -90}deg)`
  const at = (depth: number, y: number) => t3(x, y, -depth, rot)
  return (
    <>
      {/* wallpaper + wainscot: plain surface, painted small and stretched */}
      <div
        className={'w-wall ' + side}
        style={{ width: D / Q, height: H / Q, marginLeft: -D / Q / 2, marginTop: -H / Q / 2, transform: t3(side === 'l' ? -W / 2 : W / 2, MIDY, -D / 2, `${rot} scale(${Q})`) }}
      />
      {/* each cabinet is its own small layer (sharp photos, little memory) */}
      {CABINETS[side].map((c, k) => (
        <button key={k} className="cab" onClick={() => onOpen(byId(c.id)!)} data-cursor="open" style={{ marginLeft: -235, marginTop: -232, transform: at(330 + k * 530, FLOOR - 296) }}>
          <span className="cab-crown" />
          <span className="cab-glass">
            <img src={img(c.photo, 760)} alt="" loading="lazy" style={c.flip ? { transform: 'scaleX(-1)' } : undefined} />
            <i className="cab-shine" />
          </span>
          <span className="cab-plate">{t(c.label)}</span>
        </button>
      ))}
      {side === 'r' ? (
        <button className="w-mirror" onClick={() => onOpen(mirror)} data-cursor="view" style={{ marginLeft: -162, marginTop: -260, transform: at(2560, MIDY + 10) }}>
          <span className="w-mirror-glass">
            <img src={img(mirror.photo, 700)} alt="" loading="lazy" />
            <i className="w-mirror-shine" />
          </span>
          <b>{t(L('Try it in the mirror', 'আয়নায় মিলিয়ে দেখুন'))}</b>
        </button>
      ) : (
        <button className="w-poster" onClick={() => onOpen(byId(poster.id)!)} data-cursor="view" style={{ marginLeft: -150, marginTop: -240, transform: at(2560, MIDY + 10) }}>
          <img src={img(poster.photo, 700)} alt="" loading="lazy" />
          <b>{t(L('Bridal week · ask inside', 'বিয়ের সপ্তাহ · ভেতরে জিজ্ঞেস করুন'))}</b>
        </button>
      )}
    </>
  )
}

export function ShopWalk() {
  const { t, lang, taka } = useLang()
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
  const frontVis = useTransform(p, (v) => (v > 0.22 ? 'hidden' : 'visible'))
  const glowOp = useTransform(p, [0.04, 0.14], [0, 1])
  // counter saree
  const unroll = useTransform(p, [0.54, 0.67], [100, 0])
  const clip = useTransform(unroll, (v) => `inset(0 ${v}% 0 0)`)
  const rollX = useTransform(unroll, (v) => `${100 - v}%`)
  const barS = useTransform(p, [0, 1], [0, 1])

  const open = (s: Saree) => openQuick(s.id)
  // play only the clips close to the camera (fewer decoders = smoother phones)
  const [near, setNear] = useState<string>('front')
  useMotionValueEvent(camZ, 'change', (c) => {
    const max = window.innerWidth < 760 ? 2 : 4
    const list = STANDS.map((st, k) => ({ v: st.v, d: standZ(k) + c }))
      .filter((x) => x.d > -1500 && x.d < 650)
      .sort((a, b) => b.d - a.d)
      .slice(0, max)
      .map((x) => x.v)
    if (c < 250) list.push('front')
    const key = list.join(',')
    setNear((prev) => (prev === key ? prev : key))
  })
  const visible = useOnScreen(ref, '0px')
  const on = (v: string) => visible && near.split(',').includes(v)
  const bridal = BRIDAL_ALL.slice(0, 3)
  const counterSaree = byId('n2')!

  return (
    <section className={'walk' + (visible ? '' : ' is-off')} id="walk" ref={ref}>
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
            {/* gradient-only surfaces are painted at 1/4 size and stretched by the GPU (16x less memory) */}
            <div className="w-floor" style={{ width: W / Q, height: D / Q, marginLeft: -W / Q / 2, marginTop: -D / Q / 2, transform: t3(0, FLOOR, -D / 2, `rotateX(90deg) scale(${Q})`) }} />
            <div className="w-ceil" style={{ width: W / Q, height: D / Q, marginLeft: -W / Q / 2, marginTop: -D / Q / 2, transform: t3(0, TOP, -D / 2, `rotateX(-90deg) scale(${Q})`) }} />

            <Wall side="l" onOpen={open} />
            <Wall side="r" onOpen={open} />

            {/* pendant lamps */}
            {[-350, -950, -1550, -2150, -2700].map((z) => (
              <div key={z} className="w-lamp" style={{ transform: t3(0, TOP + 70, z) }}>
                <i />
              </div>
            ))}

            {/* model display stands along the aisle, like showroom mannequins */}
            {STANDS.map((st, k) => {
              const it = byId(st.id)!
              const left = k % 2 === 0
              return (
                <button key={st.v} className="w-stand" onClick={() => open(it)} data-cursor="view" style={{ transform: t3(left ? -330 : 330, FLOOR - 250, standZ(k), `rotateY(${left ? 34 : -34}deg)`) }} aria-label={st.label.en}>
                  <span className="stand-frame">
                    <LoopVideo name={st.v} active={on(st.v)} />
                  </span>
                  <span className="stand-tag">
                    <b>{t(st.label)}</b>
                    {t(it.name)} · {taka(it.price)}
                  </span>
                  <span className="stand-base" />
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
                <motion.div className="w-roll-track" style={{ x: rollX }}>
                  <i className="w-roll" style={{ background: `linear-gradient(90deg, rgba(0,0,0,.4), rgba(255,255,255,.3) 40%, rgba(0,0,0,.45)), ${counterSaree.look.body}` }} />
                </motion.div>
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
            <motion.div className="w-front" style={{ width: W, height: H, marginLeft: -W / 2, marginTop: -H / 2, transform: t3(0, MIDY, 0), opacity: frontOp, pointerEvents: frontPE, visibility: frontVis }}>
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
                  <LoopVideo name="shop1" active={on('front')} />
                </div>
                <div className="w-door">
                  <motion.div className="w-door-glow" style={{ opacity: glowOp }} />
                  <motion.div className="w-shutter" style={{ y: shutter }}>
                    <span>{t(L('Scroll to open', 'স্ক্রল করে খুলুন'))} ↓</span>
                  </motion.div>
                </div>
                <div className="w-window">
                  <LoopVideo name="shop2" active={on('front')} />
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
          <motion.span style={{ scaleY: barS }} />
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
