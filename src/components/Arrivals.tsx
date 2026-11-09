import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { SAREES, type Saree } from '../catalog'
import { img } from '../data'
import { L, useLang } from '../i18n'
import { useOps } from '../ops'
import { useStore } from '../store'
import { IPlus } from './SareeArt'
import { HeartBtn, SectionHead } from './ui'

const TABS = [
  { key: 'new', name: L('New arrivals', 'নতুন এসেছে') },
  { key: 'bridal', name: L('Bridal', 'বিয়ের') },
  { key: 'pick', name: L('Studio picks', 'স্টুডিও বাছাই') },
] as const

export function SareeCard({ s, k = 0 }: { s: Saree; k?: number }) {
  const { t, taka, num } = useLang()
  const { add, openQuick } = useStore()
  const ops = useOps()
  const left = ops.stockOf(s.id)
  return (
    <motion.article
      layout
      className="sc"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.6, delay: k * 0.05, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => openQuick(s.id)}
      data-cursor="view"
    >
      <div className="sc-img">
        <img className="a" src={img(s.photo, 640)} alt={t(s.name)} loading="lazy" />
        <img className="b" src={img(s.more?.[0] ?? s.photo, 900)} alt="" loading="lazy" aria-hidden />
        {s.badge && <span className="sc-badge">{t(s.badge)}</span>}
        {left === 0 && <span className="sc-sold">{t(L('Sold out', 'স্টক শেষ'))}</span>}
        {left !== undefined && left > 0 && left <= ops.rules.lowStockAt && <span className="sc-low">{t(L(`Only ${left} left`, `মাত্র ${num(left)}টি`))}</span>}
        <HeartBtn item={{ id: s.id, name: s.name, price: s.price, photo: s.photo }} className="sc-heart" />
        <div className="sc-quick">
          <span>{t(L('View saree', 'শাড়িটি দেখুন'))}</span>
          <button
            className="sc-add"
            onClick={(e) => {
              e.stopPropagation()
              add({ id: s.id, name: s.name, price: s.price, photo: s.photo, meta: s.kind }, e.currentTarget, s.look.body)
            }}
            aria-label="add to bag"
          >
            <IPlus size={16} />
          </button>
        </div>
      </div>
      <div className="sc-info">
        <small>{t(s.kind)}</small>
        <b>{t(s.name)}</b>
        <div className="sc-row">
          <span className="sc-price">
            {taka(s.price)} {s.was && <s>{taka(s.was)}</s>}
          </span>
          <span className="sc-dots">
            {[s.look.body, s.look.border, s.look.zari].map((c, i) => (
              <i key={i} style={{ background: c }} />
            ))}
          </span>
        </div>
      </div>
    </motion.article>
  )
}

export function Arrivals() {
  const { t, num } = useLang()
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('new')
  const list = SAREES.filter((s) => s.group === tab)
  return (
    <section className="section arrivals" id="arrivals">
      <div className="wrap">
        <SectionHead
          eyebrow={L('Fresh from the looms', 'তাঁত থেকে সদ্য এসেছে')}
          a={L('The new', 'নতুন')}
          b={L('arrivals.', 'সংগ্রহ।')}
          side={L('Tap any saree to see it head to toe, up close, and in 3D.', 'যেকোনো শাড়িতে চাপুন: মাথা থেকে পা, কাছ থেকে, আর থ্রিডিতে দেখুন।')}
        />
        <div className="ar-tabs">
          {TABS.map((x) => (
            <button key={x.key} className={'fchip' + (tab === x.key ? ' on' : '')} onClick={() => setTab(x.key)}>
              {tab === x.key && <motion.span layoutId="ar-tab" className="fchip-bg" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
              <span>{t(x.name)}</span>
              <i>{num(SAREES.filter((s) => s.group === x.key).length)}</i>
            </button>
          ))}
        </div>
        <motion.div layout className="sc-grid">
          <AnimatePresence mode="popLayout">
            {list.map((s, k) => (
              <SareeCard key={s.id} s={s} k={k} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}
