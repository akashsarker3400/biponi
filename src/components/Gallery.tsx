import { animate, motion, useMotionValue, useMotionValueEvent, useSpring, useTransform } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { img } from '../data'
import { SAREES, byId } from '../catalog'
import { L, useLang } from '../i18n'
import { useStore } from '../store'
import { IPlus } from './SareeArt'
import { SectionHead } from './ui'

/* ------------------------------------------------------------------ */
/* Concave 3D ring: you stand inside it. Drag, scroll or move the mouse */
/* ------------------------------------------------------------------ */
const CARDS = SAREES
const COUNT = 20
const STEP = 360 / COUNT

export function Ring() {
  const { t, taka } = useLang()
  const { add, openQuick } = useStore()
  const moved = useRef(0)
  const [R, setR] = useState(860)
  useEffect(() => {
    const m = () => setR(window.innerWidth < 760 ? 700 : 860)
    m()
    window.addEventListener('resize', m)
    return () => window.removeEventListener('resize', m)
  }, [])
  const rot = useMotionValue(0)
  const lean = useSpring(0, { stiffness: 50, damping: 16 })
  const total = useTransform(() => rot.get() + lean.get())
  const [front, setFront] = useState(0)
  const drag = useRef<{ x: number; r: number; v: number; t: number } | null>(null)
  const stage = useRef<HTMLDivElement>(null)
  const auto = useRef(true)

  useMotionValueEvent(total, 'change', (v) => {
    const idx = (((Math.round(-v / STEP) % COUNT) + COUNT) % COUNT) % COUNT
    setFront(idx)
  })

  // slow idle drift, only while the ring is on screen
  useEffect(() => {
    let raf = 0
    let prev = performance.now()
    let seen = false
    const fine = window.matchMedia('(pointer: fine)').matches
    const io = new IntersectionObserver(([en]) => (seen = en.isIntersecting))
    if (stage.current) io.observe(stage.current)
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(0.05, (now - prev) / 1000)
      prev = now
      if (fine && seen && auto.current && !drag.current) rot.set(rot.get() - dt * 4)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
    }
  }, [rot])

  // wheel / trackpad sideways turns the ring
  useEffect(() => {
    const el = stage.current!
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault()
        rot.set(rot.get() - e.deltaX * 0.08)
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [rot])

  const snap = (v: number) => {
    const target = Math.round(v / STEP) * STEP
    animate(rot, target, { type: 'spring', stiffness: 80, damping: 18 })
  }

  return (
    <section className="section ringsec" id="remember">
      <div className="wrap">
        <SectionHead
          eyebrow={L('Drag to turn · you are standing inside', 'টেনে ঘোরান · আপনি আছেন মাঝখানে')}
          a={L('Woven to be', 'মনে রাখার মতো')}
          b={L('remembered.', 'বুনন।')}
          side={L('Stand in the middle of our showroom. Drag, swipe or move your mouse and the sarees turn around you.', 'শোরুমের ঠিক মাঝখানে দাঁড়িয়ে আছেন। টানুন, সোয়াইপ করুন বা মাউস নাড়ুন, শাড়িগুলো আপনার চারপাশে ঘুরবে।')}
        />
      </div>
      <div
        className="ring-stage"
        ref={stage}
        data-cursor="drag"
        onPointerEnter={() => (auto.current = false)}
        onPointerLeave={() => {
          auto.current = true
          lean.set(0)
        }}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect()
          if (drag.current) {
            const now = performance.now()
            const dx = e.clientX - drag.current.x
            moved.current = Math.max(moved.current, Math.abs(dx))
            const nr = drag.current.r + dx * 0.12
            drag.current.v = (nr - rot.get()) / Math.max(8, now - drag.current.t)
            drag.current.t = now
            rot.set(nr)
          } else lean.set(((e.clientX - r.left) / r.width - 0.5) * -14)
        }}
        onPointerDown={(e) => {
          drag.current = { x: e.clientX, r: rot.get(), v: 0, t: performance.now() }
          moved.current = 0
          e.currentTarget.setPointerCapture(e.pointerId)
        }}
        onPointerUp={() => {
          if (!drag.current) return
          const fling = rot.get() + drag.current.v * 260
          drag.current = null
          snap(fling)
        }}
      >
        <motion.div className="ring" style={{ rotateY: total, z: R < 800 ? 430 : 0 }}>
          {Array.from({ length: COUNT }).map((_, k) => {
            const c = CARDS[k % CARDS.length]
            return (
              <div key={k} className={'ring-card' + (k === front ? ' front' : '')} style={{ transform: `rotateY(${k * STEP}deg) translateZ(${-R}px)` }} onClick={() => moved.current < 6 && openQuick(c.id)}>
                <img src={img(c.photo, 520)} alt="" draggable={false} loading="lazy" />
                <div className="ring-cap">
                  <small>{t(c.kind)}</small>
                  <b>{t(c.name)}</b>
                  <span>{taka(c.price)}</span>
                </div>
                <button
                  className="ring-add"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => { e.stopPropagation(); add({ id: c.id, name: c.name, price: c.price, photo: c.photo, meta: c.kind }, e.currentTarget, c.look.body) }}
                  aria-label="add"
                >
                  <IPlus size={16} />
                </button>
              </div>
            )
          })}
        </motion.div>
        <div className="ring-floor" />
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Hover accordion: black & white until your mouse brings it to life   */
/* ------------------------------------------------------------------ */
const PANELS = [
  { id: 'n10', t: L('Pujo mornings', 'পূজার সকাল'), d: L('Lal-paar shada, conch bangles, dhak in the distance.', 'লাল পাড় সাদা, শাঁখা-পলা, দূরে ঢাকের শব্দ।') },
  { id: 'b1', t: L('The wedding', 'বিয়ের দিন'), d: L('Benarasi heavy with zari, made for a lifetime.', 'জরি-ভারী বেনারসি, সারা জীবনের জন্য।') },
  { id: 'n11', t: L('Gaye holud', 'গায়ে হলুদ'), d: L('Turmeric yellow, sindoor red and marigolds.', 'হলুদ, সিঁদুর লাল আর গাঁদা ফুল।') },
  { id: 'p2', t: L('An evening out', 'সন্ধ্যার দাওয়াত'), d: L('Black jamdani with a silver glint.', 'রুপালি ঝিলিকে কালো জামদানি।') },
  { id: 'n7', t: L('Garden afternoons', 'বাগানের বিকেল'), d: L('Rose silk for family dawats.', 'পারিবারিক দাওয়াতে গোলাপি রেশম।') },
  { id: 'n12', t: L('With the sisters', 'সখীদের সাথে'), d: L('Matching sarees that belong together.', 'একসাথে মানায় এমন শাড়ি।') },
].map((p) => ({ ...p, photo: byId(p.id)!.photo }))

export function Accordion() {
  const { t } = useLang()
  const { openQuick } = useStore()
  const [on, setOn] = useState(1)
  return (
    <section className="acc-sec">
      <svg className="wave top" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden>
        <path d="M0 60 V30 Q90 0 180 30 T360 30 T540 30 T720 30 T900 30 T1080 30 T1260 30 T1440 30 T1620 30 T1800 30 V60 Z" />
      </svg>
      <div className="wrap">
        <SectionHead eyebrow={L('Moments worth the saree', 'যে মুহূর্তগুলোর জন্য শাড়ি')} a={L('Worth your', 'নজর')} b={L('attention.', 'কাড়া।')} />
        <div className="acc">
          {PANELS.map((p, k) => (
            <motion.div key={k} className={'acc-p' + (on === k ? ' on' : '')} layout onPointerEnter={() => setOn(k)} onClick={() => (on === k ? openQuick(p.id) : setOn(k))} data-cursor="view" transition={{ type: 'spring', stiffness: 180, damping: 26 }}>
              <img src={img(p.photo, 900)} alt="" loading="lazy" />
              <span className="acc-no">0{k + 1}</span>
              <div className="acc-cap">
                <b>{t(p.t)}</b>
                <motion.p initial={false} animate={{ opacity: on === k ? 1 : 0, y: on === k ? 0 : 12 }}>
                  {t(p.d)}
                </motion.p>
                <motion.span className="acc-cta" initial={false} animate={{ opacity: on === k ? 1 : 0 }}>
                  {t(L('See this saree →', 'শাড়িটি দেখুন →'))}
                </motion.span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <svg className="wave bottom" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden>
        <path d="M0 0 V30 Q90 60 180 30 T360 30 T540 30 T720 30 T900 30 T1080 30 T1260 30 T1440 30 T1620 30 T1800 30 V0 Z" />
      </svg>
    </section>
  )
}
