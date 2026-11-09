import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { SAREES, byId, shots, type Saree } from '../catalog'
import { DISTRICTS, POLICY, deliveryFor, img } from '../data'
import { L, useLang, type Txt } from '../i18n'
import { isPhone, useOps } from '../ops'
import { useStore } from '../store'
import { Cloth3D } from './LazyCloth'
import { IArrow, IArrowL, IBag, IClose, IMinus, IPlus } from './SareeArt'
import { HeartBtn, scroller } from './ui'

const SIZES = [32, 34, 36, 38, 40, 42, 44]

export function QuickView() {
  const { quick, openQuick } = useStore()
  const s = quick ? byId(quick) : undefined
  useEffect(() => {
    if (s) scroller.lenis?.stop()
    else scroller.lenis?.start()
  }, [s])
  return <AnimatePresence>{s && <View key="qv" s={s} close={() => openQuick(null)} go={openQuick} />}</AnimatePresence>
}

function View({ s, close, go }: { s: Saree; close: () => void; go: (id: string) => void }) {
  const { t, taka, num } = useLang()
  const { add } = useStore()
  const ops = useOps()
  const [shot, setShot] = useState(0)
  const [mode, setMode] = useState<'photo' | '3d'>('photo')
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null)
  const [blouse, setBlouse] = useState<'unstitched' | 'stitched'>('unstitched')
  const [size, setSize] = useState<number | null>(null)
  const [qty, setQty] = useState(1)
  const [open, setOpen] = useState<number>(0)
  const [phone, setPhone] = useState('')
  const [asked, setAsked] = useState(false)
  const btn = useRef<HTMLButtonElement>(null)
  const body = useRef<HTMLDivElement>(null)
  const gal = shots(s)
  const left = ops.stockOf(s.id)
  const sold = left === 0
  const extra = blouse === 'stitched' ? 650 : 0
  const saved = (() => {
    try {
      return JSON.parse(localStorage.getItem('sb-customer') || 'null')
    } catch {
      return null
    }
  })()
  const district = saved?.district ?? 'Dhaka'
  const eta = deliveryFor(district, s.price).eta
  const dName = DISTRICTS.find((d) => d.en === district) ?? { en: district, bn: district }
  const similar = SAREES.filter((x) => x.id !== s.id && x.group === s.group).slice(0, 8)

  // reset when switching saree
  useEffect(() => {
    setShot(0)
    setMode('photo')
    setQty(1)
    setSize(null)
    setAsked(false)
    body.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [s.id])

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') setShot((x) => (x + 1) % gal.length)
      if (e.key === 'ArrowLeft') setShot((x) => (x - 1 + gal.length) % gal.length)
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [close, gal.length])

  const addToBag = (then?: () => void) => {
    if (blouse === 'stitched' && !size) {
      setOpen(1)
      return
    }
    for (let i = 0; i < qty; i++)
      add(
        {
          id: s.id,
          key: `${s.id}-${blouse}-${size ?? ''}`,
          name: s.name,
          price: s.price + extra,
          photo: s.photo,
          meta: blouse === 'stitched' ? L(`Stitched blouse · size ${size}`, `সেলাই করা ব্লাউজ · সাইজ ${size}`) : L('Unstitched blouse piece', 'আনস্টিচড ব্লাউজ পিস'),
        },
        i === 0 ? btn.current : null,
        s.look.body,
      )
    then?.()
  }

  const g = gal[shot]
  const details: { h: Txt; b: Txt }[] = [
    { h: L('Fabric & weave', 'কাপড় ও বুনন'), b: L(`${s.fabric.en}. Woven in ${s.origin.en}.`, `${s.fabric.bn}। বোনা হয়েছে ${s.origin.bn}।`) },
    { h: L('Size & blouse', 'মাপ ও ব্লাউজ'), b: L('Saree 5.5 m + 0.8 m blouse piece. Choose stitched and we tailor it to your size in 3 days.', 'শাড়ি ৫.৫ মিটার + ০.৮ মিটার ব্লাউজ পিস। সেলাই করা বাছলে ৩ দিনে আপনার মাপে বানিয়ে দেব।') },
    { h: L('Care', 'যত্ন'), b: L('Dry clean the first time. Store folded in muslin, away from sunlight. Refold along new lines every few months.', 'প্রথমবার ড্রাই ক্লিন করুন। মসলিনে ভাঁজ করে রোদ থেকে দূরে রাখুন। কয়েক মাস পরপর ভাঁজ বদলে দিন।') },
    { h: L('Delivery & exchange', 'ডেলিভারি ও বদল'), b: L(`${POLICY.exchange.en} ${POLICY.services.en}`, `${POLICY.exchange.bn} ${POLICY.services.bn}`) },
  ]

  return (
    <motion.div className="qv" initial={{ clipPath: 'inset(100% 0 0 0)' }} animate={{ clipPath: 'inset(0% 0 0 0)' }} exit={{ clipPath: 'inset(0 0 100% 0)' }} transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }} data-lenis-prevent>
      <div className="qv-top">
        <span className="mini">
          {t(s.kind)} · {t(s.origin)}
        </span>
        <button className="qv-close" onClick={close}>
          {t(L('Close', 'বন্ধ'))} <IClose size={16} />
        </button>
      </div>
      <div className="qv-body" ref={body}>
        <div className="qv-grid">
          <div className="qv-media">
            <div className="qv-thumbs">
              {gal.map((x, k) => (
                <button key={k} className={'qv-th' + (k === shot && mode === 'photo' ? ' on' : '')} onClick={() => { setShot(k); setMode('photo') }} aria-label={x.label?.en}>
                  <img src={img(x.photo, 240)} alt="" style={{ objectFit: x.fit ?? 'cover', objectPosition: x.pos ?? '50% 30%', transform: `scale(${x.zoom ?? 1})`, transformOrigin: x.pos ?? '50% 50%' }} />
                  <em>{k === 0 ? t(L('Long', 'লম্বা')) : x.fit ? t(L('Angle', 'দিক')) : t(L('Close', 'কাছে'))}</em>
                </button>
              ))}
              <button className={'qv-th th3d' + (mode === '3d' ? ' on' : '')} onClick={() => setMode('3d')}>
                <span>3D</span>
              </button>
            </div>

            <motion.div
              className="qv-main"
              data-cursor={mode === 'photo' ? 'zoom' : 'drag'}
              onPanEnd={(_, info) => {
                if (mode !== 'photo' || Math.abs(info.offset.x) < 50) return
                setShot((x) => (x + (info.offset.x < 0 ? 1 : -1) + gal.length) % gal.length)
              }}
              onPointerMove={(e) => {
                if (mode !== 'photo' || e.pointerType !== 'mouse') return
                const r = e.currentTarget.getBoundingClientRect()
                setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 })
              }}
              onPointerLeave={() => setZoom(null)}
            >
              <AnimatePresence mode="wait">
                {mode === 'photo' ? (
                  <motion.div key={s.id + shot} className="qv-img" initial={{ opacity: 0, scale: 1.06, filter: 'blur(8px)' }} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.5 }}>
                    {g.fit === 'contain' && <img className="qv-blur" src={img(g.photo, 300)} alt="" aria-hidden />}
                    <img
                      className={g.fit === 'contain' ? 'contain' : ''}
                      src={img(g.photo, 1400)}
                      alt={t(s.name)}
                      style={{
                        objectPosition: g.fit === 'contain' ? '50% 50%' : g.pos ?? '50% 30%',
                        transformOrigin: zoom ? `${zoom.x}% ${zoom.y}%` : g.pos ?? '50% 50%',
                        transform: `scale(${(g.zoom ?? 1) * (zoom ? (g.fit === 'contain' ? 2.4 : 2) : 1)})`,
                      }}
                    />
                  </motion.div>
                ) : (
                  <motion.div key="3d" className="qv-3d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Cloth3D look={s.look} mood="day" />
                    <p className="qv-3d-note">{t(L('3D weave illustration in this saree’s colours · drag to feel it', 'এই শাড়ির রঙে থ্রিডি বুনন · টেনে দেখুন'))}</p>
                  </motion.div>
                )}
              </AnimatePresence>
              {mode === 'photo' && (
                <>
                  <span className="qv-shot-label">{t(g.label!)}</span>
                  <button className="qv-nav l" onClick={() => setShot((x) => (x - 1 + gal.length) % gal.length)} aria-label="previous">
                    <IArrowL />
                  </button>
                  <button className="qv-nav r" onClick={() => setShot((x) => (x + 1) % gal.length)} aria-label="next">
                    <IArrow />
                  </button>
                  <div className="qv-dots">
                    {gal.map((_, k) => (
                      <i key={k} className={k === shot ? 'on' : ''} />
                    ))}
                  </div>
                </>
              )}
              {s.badge && <span className="qv-badge">{t(s.badge)}</span>}
            </motion.div>
          </div>

          <motion.div className="qv-info" key={s.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
            <h2 className="qv-title">{t(s.name)}</h2>
            <div className="qv-price">
              <b>{taka(s.price + extra)}</b>
              {s.was && <s>{taka(s.was + extra)}</s>}
              {s.was && <em>{t(L(`You save ${taka(s.was - s.price)}`, `${taka(s.was - s.price)} সাশ্রয়`))}</em>}
            </div>
            <p className="qv-story">{t(s.story)}</p>

            <div className="qv-colors">
              <span className="mini">{t(L('Colours in this saree', 'এই শাড়ির রং'))}</span>
              <div>
                {[s.look.body, s.look.border, s.look.zari].map((c, k) => (
                  <i key={k} style={{ background: c }} title={c} />
                ))}
              </div>
            </div>

            <div className="qv-opt">
              <span className="mini">{t(L('Blouse', 'ব্লাউজ'))}</span>
              <div className="seg">
                {(['unstitched', 'stitched'] as const).map((b) => (
                  <button key={b} className={blouse === b ? 'on' : ''} onClick={() => setBlouse(b)}>
                    {blouse === b && <motion.span layoutId="qv-blouse" className="seg-pill dark" />}
                    <span>{b === 'unstitched' ? t(L('Unstitched piece', 'আনস্টিচড পিস')) : t(L(`Stitched +${taka(650)}`, `সেলাই করা +${taka(650)}`))}</span>
                  </button>
                ))}
              </div>
              <AnimatePresence>
                {blouse === 'stitched' && (
                  <motion.div className="qv-sizes" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                    {SIZES.map((z) => (
                      <button key={z} className={'qv-size' + (size === z ? ' on' : '')} onClick={() => setSize(z)}>
                        {num(z)}
                      </button>
                    ))}
                    {!size && <small>{t(L('Choose your bust size', 'বুকের মাপ বাছুন'))}</small>}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <p className="qv-perk">✓ {t(L('Fall & pico done free, ready to wear', 'ফ্রি ফলস ও পিকো, পরার জন্য প্রস্তুত'))}</p>

            {sold ? (
              <div className="notify">
                <b>{t(L('Sold out. Want it when it is back?', 'স্টক শেষ। আবার এলে জানাব?'))}</b>
                {asked ? (
                  <p className="news-ok">✦ {t(L('Done! We will message you the moment it is back.', 'ঠিক আছে! ফিরে এলেই আপনাকে জানাব।'))}</p>
                ) : (
                  <form onSubmit={(e) => { e.preventDefault(); if (!isPhone(phone)) return; ops.requestRestock(s.id, phone); setAsked(true) }}>
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" inputMode="tel" />
                    <button className="btn btn-sindoor" type="submit">{t(L('Notify me', 'জানাবেন'))}</button>
                  </form>
                )}
              </div>
            ) : (
              <>
                <div className="qv-buy">
                  <div className="qty big">
                    <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="less"><IMinus size={14} /></button>
                    <span>{num(qty)}</span>
                    <button onClick={() => setQty((q) => Math.min(left ?? 9, q + 1))} aria-label="more"><IPlus size={14} /></button>
                  </div>
                  <button ref={btn} className="btn btn-sindoor qv-add" onClick={() => addToBag()}>
                    {t(L('Add to bag', 'ব্যাগে নিন'))}
                    <span className="btn-ic"><IBag size={15} /></span>
                  </button>
                  <HeartBtn item={{ id: s.id, name: s.name, price: s.price, photo: s.photo }} />
                </div>
                <button className="btn btn-gold btn-block qv-now" onClick={() => addToBag(() => { close(); setTimeout(() => ops.setCheckout(true), 650) })}>
                  {t(L('Buy now', 'এখনই কিনুন'))}
                  <span className="btn-ic"><IArrow size={15} /></span>
                </button>
                {left !== undefined && left <= ops.rules.lowStockAt && <p className="hurry">🔥 {t(L(`Only ${left} left in stock`, `স্টকে আর মাত্র ${num(left)}টি`))}</p>}
              </>
            )}
            <p className="qv-eta">🚚 {t(L(`Delivery to ${dName.en} ${eta.en} · cash on delivery`, `${dName.bn}-এ ডেলিভারি ${eta.bn} · ক্যাশ অন ডেলিভারি`))}</p>

            <div className="qv-acc">
              {details.map((d, k) => (
                <div key={k} className={'qa' + (open === k ? ' on' : '')}>
                  <button onClick={() => setOpen(open === k ? -1 : k)}>
                    {t(d.h)}
                    <span>{open === k ? '−' : '+'}</span>
                  </button>
                  <AnimatePresence initial={false}>
                    {open === k && (
                      <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                        {t(d.b)}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="qv-more">
          <h3>{t(L('You may also love', 'আপনার পছন্দ হতে পারে'))}</h3>
          <div className="qv-row">
            {similar.map((x, k) => (
              <motion.button key={x.id} className="qv-card" onClick={() => go(x.id)} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + k * 0.05 }} whileHover={{ y: -8 }} data-cursor="view">
                <span className="qv-card-img">
                  <img src={img(x.photo, 420)} alt="" loading="lazy" />
                </span>
                <b>{t(x.name)}</b>
                <small>{taka(x.price)}</small>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
