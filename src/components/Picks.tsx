import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { useRef } from 'react'
import { PICKS, img } from '../data'
import { L, useLang } from '../i18n'
import { useStore } from '../store'
import { IPlus } from './SareeArt'
import { HeartBtn, SectionHead, ease } from './ui'

type P = (typeof PICKS)[number]

function Card({ p, i, n }: { p: P; i: number; n: number }) {
  const { t, taka } = useLang()
  const { add, openQuick } = useStore()
  const btn = useRef<HTMLButtonElement>(null)
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const rx = useSpring(useTransform(my, [0, 1], [10, -10]), { stiffness: 200, damping: 18 })
  const ry = useSpring(useTransform(mx, [0, 1], [-12, 12]), { stiffness: 200, damping: 18 })
  const gx = useTransform(mx, (v) => `${v * 100}%`)
  const gy = useTransform(my, (v) => `${v * 100}%`)
  const off = i - (n - 1) / 2

  return (
    <motion.div
      className="pick-slot"
      style={{ ['--off' as string]: off, ['--aoff' as string]: Math.abs(off) }}
      initial={{ opacity: 0, y: 120, rotate: 0 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 1.1, ease, delay: 0.06 * Math.abs(off) }}
    >
      <motion.article
        className="pick"
        data-cursor="view"
        style={{ background: p.bg, color: p.ink, rotateX: rx, rotateY: ry, ['--gx' as string]: gx, ['--gy' as string]: gy }}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect()
          mx.set((e.clientX - r.left) / r.width)
          my.set((e.clientY - r.top) / r.height)
        }}
        onPointerLeave={() => {
          mx.set(0.5)
          my.set(0.5)
        }}
        onClick={() => openQuick(p.id)}
        whileHover={{ y: -18, zIndex: 20 }}
        whileTap={{ scale: 0.96 }}
      >
        <div className="pick-dash" />
        <p className="pick-kind">{t(p.kind)}</p>
        <h3 className="pick-title">{t(p.title)}</h3>
        <div className="pick-photo">
          <img src={img(p.photo, 600)} alt={t(p.title)} loading="lazy" />
        </div>
        <div className="pick-glare" />
        <HeartBtn item={{ id: p.id, name: p.title, price: p.price, photo: p.photo }} className="pick-heart" />
        <b className="pick-price">{taka(p.price)}</b>
        <motion.button
          ref={btn}
          className="pick-add"
          whileTap={{ scale: 0.8, rotate: 90 }}
          onClick={(e) => {
            e.stopPropagation()
            add({ id: p.id, name: p.title, price: p.price, photo: p.photo, meta: p.kind }, btn.current, p.bg)
          }}
          aria-label="add to bag"
        >
          <IPlus size={20} />
        </motion.button>
      </motion.article>
    </motion.div>
  )
}

export function Picks() {
  return (
    <section className="section picks" id="picks">
      <div className="wrap">
        <SectionHead
          eyebrow={L("This week's picks", 'এই সপ্তাহের বাছাই')}
          a={L('Pick a', 'পছন্দের')}
          b={L('saree.', 'শাড়ি।')}
          side={L('Tilt a card, press it, and tap + to drop the saree into your bag.', 'কার্ড একটু হেলিয়ে দেখুন, চাপ দিন, তারপর + চাপলেই শাড়ি ব্যাগে।')}
        />
      </div>
      <div
        className="pick-fan"
        onPointerMove={(e) => {
          e.currentTarget.querySelectorAll<HTMLElement>('.pick-slot').forEach((el) => {
            const r = el.getBoundingClientRect()
            const d = Math.abs(e.clientX - (r.left + r.width / 2)) / r.width
            el.style.setProperty('--lift', String(Math.max(0, 1 - d * 0.9)))
          })
          const r = e.currentTarget.getBoundingClientRect()
          e.currentTarget.style.setProperty('--lean', String(((e.clientX - r.left) / r.width - 0.5) * 2))
        }}
        onPointerLeave={(e) => {
          e.currentTarget.style.setProperty('--lean', '0')
          e.currentTarget.querySelectorAll<HTMLElement>('.pick-slot').forEach((el) => el.style.setProperty('--lift', '0'))
        }}
      >
        {PICKS.map((p, i) => (
          <Card key={p.id} p={p} i={i} n={PICKS.length} />
        ))}
      </div>
    </section>
  )
}
