import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { isPhone, useOps } from '../ops'
import { CATS, RACK, type Cat, type Product } from '../data'
import { L, useLang } from '../i18n'
import { useStore } from '../store'
import { IArrow, IArrowL, IBag, IClose, SareeHanging } from './SareeArt'
import { Lens } from './Lens'
import { HeartBtn, SectionHead, scroller } from './ui'

export function Rack() {
  const { t, taka, num } = useLang()
  const [cat, setCat] = useState<Cat | 'all'>('all')
  const [hover, setHover] = useState<Product | null>(null)
  const [open, setOpen] = useState<number | null>(null)
  const list = cat === 'all' ? RACK : RACK.filter((p) => p.cat === cat)
  const count = (k: Cat | 'all') => (k === 'all' ? RACK.length : RACK.filter((p) => p.cat === k).length)
  const ops = useOps()
  useEffect(() => {
    const on = (e: Event) => setCat((e as CustomEvent).detail as Cat)
    window.addEventListener('sb:rack', on)
    return () => window.removeEventListener('sb:rack', on)
  }, [])

  // --- hangers swing when the cursor brushes past them (damped spring per hanger) ---
  const swings = useRef(new Map<string, HTMLDivElement>())
  const phys = useRef(new Map<string, { a: number; v: number }>())
  const last = useRef({ x: 0, t: 0 })
  const brush = (e: React.PointerEvent) => {
    const now = performance.now()
    const dt = Math.max(8, now - last.current.t)
    const vx = (e.clientX - last.current.x) / dt
    last.current = { x: e.clientX, t: now }
    if (Math.abs(vx) > 6) return
    swings.current.forEach((el, id) => {
      const r = el.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const d = Math.abs(e.clientX - cx)
      if (d < r.width * 0.6 && e.clientY > r.top + r.height * 0.15 && e.clientY < r.bottom) {
        const st = phys.current.get(id) ?? { a: 0, v: 0 }
        st.v += vx * 6 * (1 - d / (r.width * 0.6))
        phys.current.set(id, st)
      }
    })
  }
  useEffect(() => {
    let raf = 0
    let prev = performance.now()
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      const dt = Math.min(0.05, (now - prev) / 1000)
      prev = now
      phys.current.forEach((st, id) => {
        const acc = -38 * st.a - 2.2 * st.v
        st.v += acc * dt
        st.a += st.v * dt
        st.a = Math.max(-28, Math.min(28, st.a))
        const el = swings.current.get(id)
        if (el) el.style.transform = `rotate(${st.a.toFixed(2)}deg)`
        if (Math.abs(st.a) < 0.02 && Math.abs(st.v) < 0.02) {
          phys.current.delete(id)
          if (el) el.style.transform = ''
        }
      })
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    if (open === null) {
      scroller.lenis?.start()
      return
    }
    scroller.lenis?.stop()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
      if (e.key === 'ArrowRight') setOpen((o) => (o === null ? o : (o + 1) % list.length))
      if (e.key === 'ArrowLeft') setOpen((o) => (o === null ? o : (o - 1 + list.length) % list.length))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, list.length])

  return (
    <section className="section rack" id="rail">
      <div className="wrap">
        <SectionHead center eyebrow={L('The collection', 'কালেকশন')} a={L('Every saree,', 'সব শাড়ি,')} b={L('on the rail.', 'এক আলনায়।')} />
        <div className="filters">
          {CATS.map((c) => (
            <button key={c.key} className={'fchip' + (cat === c.key ? ' on' : '')} onClick={() => setCat(c.key)}>
              {cat === c.key && <motion.span layoutId="fchip" className="fchip-bg" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
              <span>{t(c.name)}</span>
              <i>{num(count(c.key))}</i>
            </button>
          ))}
        </div>
      </div>

      <LayoutGroup>
        <div className="rail-wrap">
          <div className="rail-scroll" onPointerMove={brush}>
            <div className="rail">
              <div className="rod">
                <span />
                <span />
              </div>
              <AnimatePresence mode="popLayout">
                {list.map((p, k) => (
                  <motion.button
                    layout
                    key={p.id}
                    className="hanger"
                    data-cursor="open"
                    initial={{ opacity: 0, x: 120, rotate: 8 }}
                    animate={{ opacity: open === k ? 0 : 1, x: 0, rotate: 0 }}
                    exit={{ opacity: 0, x: -120, rotate: -8, transition: { duration: 0.35 } }}
                    transition={{ type: 'spring', stiffness: 120, damping: 18, delay: k * 0.03 }}
                    onHoverStart={() => setHover(p)}
                    onHoverEnd={() => setHover(null)}
                    onFocus={() => setHover(p)}
                    onClick={() => setOpen(k)}
                    aria-label={t(p.name)}
                  >
                    <motion.div layoutId={'h-' + p.id} className="hanger-art" whileHover={{ y: 14, scale: 1.08 }} transition={{ duration: 0.5 }}>
                      <div className="swing" ref={(el) => { if (el) swings.current.set(p.id, el); else swings.current.delete(p.id) }}>
                        <SareeHanging look={p.look} />
                      </div>
                      {(() => {
                        const left = ops.stockOf(p.id)
                        return left === 0 ? <span className="tag sold">{t(L('Sold out', 'স্টক শেষ'))}</span> : left !== undefined && left <= ops.rules.lowStockAt ? <span className="tag low">{t(L(`Only ${left} left`, `মাত্র ${num(left)}টি`))}</span> : null
                      })()}
                    </motion.div>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </div>
          <div className="rail-caption">
            <AnimatePresence mode="wait">
              <motion.p key={hover?.id ?? 'none'} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
                {hover ? (
                  <>
                    {t(hover.name)} <span>·</span> {taka(hover.price)}
                  </>
                ) : (
                  t(L('Tap any hanger to take it off the rail', 'যেকোনো হ্যাঙ্গারে চাপ দিয়ে নামিয়ে দেখুন'))
                )}
              </motion.p>
            </AnimatePresence>
          </div>
          <div className="wrap rail-meta">
            <span>{t(L('Explore the collection', 'কালেকশন ঘুরে দেখুন'))} · {num(list.length)} {t(L('pieces', 'টি শাড়ি'))}</span>
            <span>{t(L('Free fall & pico on every saree', 'প্রতিটি শাড়িতে ফ্রি ফলস ও পিকো'))}</span>
          </div>
        </div>

        <AnimatePresence>
          {open !== null && list[open] && <Detail key="detail" list={list} i={open} setI={setOpen} />}
        </AnimatePresence>
      </LayoutGroup>
    </section>
  )
}

function Detail({ list, i, setI }: { list: Product[]; i: number; setI: (n: number | null) => void }) {
  const { t, taka, num } = useLang()
  const { add } = useStore()
  const [side, setSide] = useState<'front' | 'back'>('front')
  const [blouse, setBlouse] = useState(true)
  const btn = useRef<HTMLButtonElement>(null)
  const ops = useOps()
  const [phone, setPhone] = useState('')
  const [asked, setAsked] = useState(false)
  const p = list[i]
  const left = ops.stockOf(p.id)
  const total = p.price

  return (
    <motion.div className="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setI(null)}>
      <motion.div className="detail-blur" initial={{ backdropFilter: 'blur(0px)' }} animate={{ backdropFilter: 'blur(14px)' }} exit={{ backdropFilter: 'blur(0px)' }} />
      <button className="detail-close" onClick={() => setI(null)}>
        {t(L('Close', 'বন্ধ'))} <IClose size={16} />
      </button>
      <button className="detail-nav l" onClick={(e) => { e.stopPropagation(); setSide('front'); setI((i - 1 + list.length) % list.length) }} aria-label="previous">
        <IArrowL />
      </button>
      <button className="detail-nav r" onClick={(e) => { e.stopPropagation(); setSide('front'); setI((i + 1) % list.length) }} aria-label="next">
        <IArrow />
      </button>

      <div className="detail-body" onClick={(e) => e.stopPropagation()}>
        <motion.div layoutId={'h-' + p.id} className="detail-art" transition={{ type: 'spring', stiffness: 160, damping: 22 }}>
          <AnimatePresence mode="wait">
            <motion.div key={p.id + side} initial={{ rotateY: side === 'back' ? -90 : 90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} exit={{ rotateY: side === 'back' ? 90 : -90, opacity: 0 }} transition={{ duration: 0.35 }}>
              <Lens>
                <SareeHanging look={p.look} side={side} />
              </Lens>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <motion.div className="detail-info" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ delay: 0.15 }}>
          <p className="mini">{t(CATS.find((c) => c.key === p.cat)!.name)}</p>
          <h3>{t(p.name)}</h3>
          <p className="muted">{t(p.note)}</p>
          <b className="gold-price">{taka(total)}</b>
          <div className="seg small">
            {(['front', 'back'] as const).map((s) => (
              <button key={s} className={side === s ? 'on' : ''} onClick={() => setSide(s)}>
                {side === s && <motion.span layoutId="side-pill" className="seg-pill dark" />}
                <span>{s === 'front' ? t(L('Jomin & paar', 'জমিন ও পাড়')) : t(L('Anchol', 'আঁচল'))}</span>
              </button>
            ))}
          </div>
          <label className="check">
            <input type="checkbox" checked={blouse} onChange={(e) => setBlouse(e.target.checked)} />
            <span />
            {t(L('Include matching blouse piece (free)', 'ম্যাচিং ব্লাউজ পিস সহ (ফ্রি)'))}
          </label>
          {left === 0 ? (
            <div className="notify">
              <b>{t(L('Sold out. Want it when it is back?', 'স্টক শেষ। আবার এলে জানাব?'))}</b>
              {asked ? (
                <p className="news-ok">✦ {t(L('Done! We will message you the moment it is back.', 'ঠিক আছে! ফিরে এলেই আপনাকে জানাব।'))}</p>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); if (!isPhone(phone)) return; ops.requestRestock(p.id, phone); setAsked(true) }}>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" inputMode="tel" />
                  <button className="btn btn-sindoor" type="submit">{t(L('Notify me', 'জানাবেন'))}</button>
                </form>
              )}
            </div>
          ) : (
            <div className="detail-actions">
            <button
              ref={btn}
              className="btn btn-sindoor"
              onClick={() =>
                add(
                  { id: p.id, key: p.id + (blouse ? '-bp' : ''), name: p.name, price: total, look: p.look, meta: blouse ? L('With blouse piece', 'ব্লাউজ পিস সহ') : L('Saree only', 'শুধু শাড়ি') },
                  btn.current,
                  p.look.body,
                )
              }
            >
              {t(L('Add to bag', 'ব্যাগে নিন'))}
              <span className="btn-ic"><IBag size={15} /></span>
            </button>
            <HeartBtn item={{ id: p.id, name: p.name, price: p.price, look: p.look }} />
          </div>
          )}
          {left !== undefined && left > 0 && left <= ops.rules.lowStockAt && <p className="hurry">🔥 {t(L(`Only ${left} left in stock`, `স্টকে আর মাত্র ${num(left)}টি`))}</p>}
          <p className="tiny">{t(L('In stock at the Dhanmondi showroom · ships in 24 hours', 'ধানমন্ডি শোরুমে আছে · ২৪ ঘণ্টায় পাঠানো হয়'))}</p>
        </motion.div>
      </div>
    </motion.div>
  )
}
