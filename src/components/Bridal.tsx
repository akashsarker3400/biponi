import { AnimatePresence, motion, useSpring } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { LOOKBOOK_A, LOOKBOOK_B, LOOKBOOK_FILM, img } from '../data'
import { BRIDAL_ALL as BRIDAL, LOOKBOOK_MORE, SAREES } from '../catalog'
import { L, useLang } from '../i18n'
import { useStore } from '../store'
import { IArrow, IArrowL, IBag, IPause, IPlay } from './SareeArt'
import { HeartBtn, SectionHead, ease, scrollToId, useOnScreen } from './ui'

export function Bridal() {
  const { t, taka, num } = useLang()
  const { add, openQuick } = useStore()
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const [w, setW] = useState(1200)
  const btn = useRef<HTMLButtonElement>(null)
  const lean = useSpring(0, { stiffness: 60, damping: 14 })
  const secRef = useRef<HTMLElement>(null)
  const seen = useOnScreen(secRef)
  const n = BRIDAL.length
  const go = (d: number) => setI((x) => (x + d + n) % n)

  useEffect(() => {
    const m = () => setW(window.innerWidth)
    m()
    window.addEventListener('resize', m)
    return () => window.removeEventListener('resize', m)
  }, [])
  useEffect(() => {
    if (paused || !seen) return
    const id = setInterval(() => setI((x) => (x + 1) % n), 4800)
    return () => clearInterval(id)
  }, [paused, i, n, seen])

  const gap = w < 700 ? 150 : w < 1100 ? 190 : 235
  const b = BRIDAL[i]
  const sale = b.off ? Math.round((b.price * (100 - b.off)) / 100 / 100) * 100 : b.price

  return (
    <section className="section bridal" id="bridal" ref={secRef}>
      <div className="wrap">
        <SectionHead center eyebrow={L('For the gaye holud, the biye, and every vow after', 'গায়ে হলুদ, বিয়ে আর তার পরের প্রতিটি দিনের জন্য')} a={L('The Bridal', 'বিয়ের')} b={L('Collection', 'কালেকশন')} />
      </div>
      <motion.div className="arc" data-cursor="swipe" style={{ rotateY: lean, transformPerspective: 1600 }} onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); lean.set(((e.clientX - r.left) / r.width - 0.5) * 10) }} onPointerLeave={() => lean.set(0)} onHoverStart={() => setPaused(true)} onHoverEnd={() => setPaused(false)} onPanEnd={(_, info) => (info.offset.x < -40 ? go(1) : info.offset.x > 40 ? go(-1) : null)}>
        {BRIDAL.map((c, k) => {
          let off = k - i
          if (off > n / 2) off -= n
          if (off < -n / 2) off += n
          const a = Math.abs(off)
          return (
            <motion.button
              key={c.id}
              className={'arc-card' + (off === 0 ? ' center' : '')}
              animate={{ x: off * gap, y: a * a * 16 + (off === 0 ? -10 : 0), rotate: off * 7, scale: 1 - a * 0.08, opacity: a > 3 ? 0 : 1 - a * 0.16, zIndex: 10 - a }}
              transition={{ type: 'spring', stiffness: 90, damping: 18 }}
              onClick={() => (off === 0 ? openQuick(c.id) : go(off))}
              data-cursor={off === 0 ? 'view' : 'swipe'}
              aria-label={t(c.name)}
            >
              <img src={img(c.photo, 700)} alt="" draggable={false} loading="lazy" />
              {c.off > 0 && <span className="off">−{num(c.off)}%</span>}
              {off !== 0 && <span className="arc-veil" style={{ opacity: Math.min(0.5, a * 0.16) }} />}
            </motion.button>
          )
        })}
      </motion.div>

      <div className="bridal-info">
        <AnimatePresence mode="wait">
          <motion.div key={b.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4, ease }}>
            <h3>{t(b.name)}</h3>
            <p className="muted">{t(b.fabric)}</p>
            <p className="gold-price">
              {b.off > 0 && <s>{taka(b.price)}</s>} {taka(sale)}
            </p>
          </motion.div>
        </AnimatePresence>
        <div className="bridal-ctrl">
          <button className="round" onClick={() => go(-1)} aria-label="previous">
            <IArrowL />
          </button>
          <button ref={btn} className="btn btn-sindoor" onClick={() => add({ id: b.id, name: b.name, price: sale, photo: b.photo, meta: b.fabric }, btn.current, '#9E1620')}>
            {t(L('Add to bag', 'ব্যাগে নিন'))}
            <span className="btn-ic"><IBag size={15} /></span>
          </button>
          <HeartBtn item={{ id: b.id, name: b.name, price: sale, photo: b.photo }} />
          <button className="btn btn-white" onClick={() => openQuick(b.id)}>
            {t(L('View all angles', 'সব দিক থেকে দেখুন'))}
            <span className="btn-ic"><IArrow size={15} /></span>
          </button>
          <button className="round" onClick={() => go(1)} aria-label="next">
            <IArrow />
          </button>
        </div>
        <p className="tiny">{t(L('Book a private bridal viewing at the showroom, with tea and no hurry.', 'শোরুমে আলাদা করে বিয়ের শাড়ি দেখার সময় বুক করুন। চা থাকবে, তাড়া থাকবে না।'))}</p>
      </div>
    </section>
  )
}

const FILM = [...LOOKBOOK_FILM, ...LOOKBOOK_MORE]

export function Lookbook() {
  const { t } = useLang()
  const { openQuick } = useStore()
  const [i, setI] = useState(0)
  const [play, setPlay] = useState(true)
  const lbRef = useRef<HTMLElement>(null)
  const lbSeen = useOnScreen(lbRef)
  useEffect(() => {
    if (!play || !lbSeen) return
    const id = setInterval(() => setI((x) => (x + 1) % FILM.length), 3800)
    return () => clearInterval(id)
  }, [play, lbSeen])

  const col = (list: string[], dir: 'up' | 'down') => (
    <div className={'lb-col ' + dir}>
      <div className="lb-track">
        {[...list, ...list].map((p, k) => {
          const match = SAREES.find((x) => x.photo === p)
          return <img key={k} src={img(p, 500)} alt="" loading="lazy" data-cursor="view" onClick={() => (match ? openQuick(match.id) : scrollToId('arrivals'))} />
        })}
      </div>
    </div>
  )

  return (
    <section className={'section lookbook' + (lbSeen ? '' : ' is-off')} id="lookbook" ref={lbRef}>
      <div className="wrap">
        <SectionHead center eyebrow={L('Lookbook · Boishakh 1433', 'লুকবুক · বৈশাখ ১৪৩৩')} a={L('Feel the', 'আঁচলের')} b={L('drape.', 'ছোঁয়া।')} />
      </div>
      <div className="lb-grid">
        {col([...LOOKBOOK_A, ...LOOKBOOK_MORE.slice(0, 3)], 'up')}
        <div className="lb-center">
          <div className="lb-frame">
            <i className="c tl" />
            <i className="c tr" />
            <i className="c bl" />
            <i className="c br" />
            <div className="lb-film" data-cursor="view" onClick={() => scrollToId('arrivals')}>
              <AnimatePresence initial={false}>
                <motion.img key={i} src={img(FILM[i], 1400)} alt="" initial={{ opacity: 0, scale: 1.15 }} animate={{ opacity: 1, scale: 1.02 }} exit={{ opacity: 0 }} transition={{ opacity: { duration: 1.2 }, scale: { duration: 5, ease: 'linear' } }} />
              </AnimatePresence>
              <button className="lb-play" onClick={(e) => { e.stopPropagation(); setPlay((p) => !p) }}>
                {play ? <IPause size={14} /> : <IPlay size={14} />} {play ? t(L('Playing', 'চলছে')) : t(L('Paused', 'থামানো'))}
              </button>
              <div className="lb-dots">
                {FILM.map((_, k) => (
                  <button key={k} className={k === i ? 'on' : ''} onClick={(e) => { e.stopPropagation(); setI(k) }} aria-label={`slide ${k + 1}`} />
                ))}
              </div>
            </div>
          </div>
          <button className="btn btn-sindoor btn-lg" onClick={() => scrollToId('arrivals')}>
            {t(L('Shop the lookbook', 'লুকবুক থেকে কিনুন'))}
            <span className="btn-ic"><IArrow size={15} /></span>
          </button>
        </div>
        {col([...LOOKBOOK_B, ...LOOKBOOK_MORE.slice(3)], 'down')}
      </div>
    </section>
  )
}
