import { motion, useMotionValueEvent, useScroll, useSpring, useTransform, type MotionValue } from 'motion/react'
import { useRef, useState } from 'react'
import { RACK } from '../data'
import { L, useLang, type Txt } from '../i18n'
import { SareeFlat } from './SareeArt'

const PARTS: { at: number; x: number; top?: boolean; name: Txt; text: Txt }[] = [
  { at: 0.12, x: 7, name: L('Kuchi', 'কুচি'), text: L('These first yards become the pleats at the waist', 'প্রথম অংশটুকু কোমরে কুচি হয়ে যায়') },
  { at: 0.32, x: 32, top: true, name: L('Jomin', 'জমিন'), text: L('The body of the saree, woven with the motif', 'শাড়ির মূল অংশ, যেখানে নকশা বোনা') },
  { at: 0.5, x: 52, name: L('Paar', 'পাড়'), text: L('The border runs along both edges for all six yards', 'দুই ধারে পুরো ছয় গজ জুড়ে পাড়') },
  { at: 0.72, x: 80, top: true, name: L('Anchol', 'আঁচল'), text: L('The pallu: the richest weaving, worn over the shoulder', 'আঁচল: সবচেয়ে জমকালো বুনন, কাঁধে ঝোলে') },
  { at: 0.88, x: 97, name: L('Jhalor', 'ঝালর'), text: L('Hand-knotted tassels finish the end', 'হাতে গিঁট দেওয়া ঝালর') },
]

function Label({ p, part }: { p: MotionValue<number>; part: (typeof PARTS)[number] }) {
  const { t } = useLang()
  const o = useTransform(p, [part.at - 0.05, part.at], [0, 1])
  const y = useTransform(p, [part.at - 0.05, part.at], [part.top ? -16 : 16, 0])
  return (
    <motion.div className={'uf-label' + (part.top ? ' top' : '')} style={{ left: `${part.x}%`, opacity: o, y }}>
      <span className="uf-pin" />
      <b>{t(part.name)}</b>
      <small>{t(part.text)}</small>
    </motion.div>
  )
}

const LOOKS = [RACK[6], RACK[0], RACK[5], RACK[3]]

export function Unfold() {
  const { t, num } = useLang()
  const ref = useRef<HTMLElement>(null)
  const [li, setLi] = useState(0)
  const ydRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const p = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 })
  const reveal = useTransform(p, [0.04, 0.92], [0, 100])
  const clip = useTransform(reveal, (v) => `inset(-40px ${100 - v}% -40px 0)`)
  const rollLeft = useTransform(reveal, (v) => `${v}%`)
  const rollScale = useTransform(reveal, [0, 100], [1, 0.35])
  const tilt = useTransform(p, [0, 0.5, 1], [28, 14, 8])
  const lift = useTransform(p, [0.92, 1], [0, -12])
  useMotionValueEvent(reveal, 'change', (v) => {
    if (ydRef.current) ydRef.current.textContent = num(Math.round((v / 100) * 60) / 10)
  })
  const look = LOOKS[li].look

  return (
    <section className="unfold" ref={ref} id="unfold">
      <div className="uf-sticky">
        <div className="wrap uf-head">
          <p className="eyebrow">
            <span className="eyebrow-line" />
            {t(L('Scroll to unroll', 'স্ক্রল করে খুলুন'))}
          </p>
          <h2 className="h2">
            {t(L('Six yards,', 'ছয় গজের'))} <span className="grad">{t(L('one story.', 'একটি গল্প।'))}</span>
          </h2>
          <div className="uf-looks">
            {LOOKS.map((r, k) => (
              <button key={r.id} className={'fdot' + (k === li ? ' on' : '')} style={{ background: `linear-gradient(135deg, ${r.look.body} 0 62%, ${r.look.border} 62% 82%, ${r.look.zari} 82%)` }} onClick={() => setLi(k)} aria-label={r.name.en} title={t(r.name)} />
            ))}
          </div>
        </div>

        <div className="uf-stage">
          <motion.div className="uf-table" style={{ rotateX: tilt, y: lift }}>
            <motion.div className="uf-cloth" style={{ clipPath: clip }}>
              <SareeFlat look={look} />
            </motion.div>
            <motion.div
              className="uf-roll"
              style={{
                left: rollLeft,
                scale: rollScale,
                background: `linear-gradient(90deg, rgba(0,0,0,.45), rgba(255,255,255,.28) 38%, rgba(0,0,0,.05) 55%, rgba(0,0,0,.5)), linear-gradient(180deg, ${look.border} 0 13%, ${look.zari} 13% 15%, ${look.body} 15% 85%, ${look.zari} 85% 87%, ${look.border} 87%)`,
              }}
            />
            {PARTS.map((part) => (
              <Label key={part.name.en} p={p} part={part} />
            ))}
          </motion.div>
          <div className="uf-ruler">
            <motion.span className="uf-ruler-fill" style={{ width: rollLeft }} />
            {Array.from({ length: 7 }).map((_, k) => (
              <i key={k} style={{ left: `${(k / 6) * 100}%` }}>
                {num(k)}
              </i>
            ))}
          </div>
          <p className="uf-count">
            <b ref={ydRef}>{num(0)}</b> {t(L('of 6 yards', '/ ৬ গজ'))}
          </p>
        </div>
      </div>
    </section>
  )
}
