import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { SHOP, img } from '../data'
import { L, useLang } from '../i18n'
import { FLOW, STATUS_NAME, useOps, waLink, type Order } from '../ops'
import { IClose, SareeHanging } from './SareeArt'
import { scroller } from './ui'

export function Track() {
  const { t } = useLang()
  const ops = useOps()
  const open = ops.track !== null
  const [q, setQ] = useState('')

  useEffect(() => {
    if (open) {
      setQ(ops.track || '')
      scroller.lenis?.stop()
    } else scroller.lenis?.start()
  }, [open, ops.track])

  const close = () => {
    ops.openTrack(null)
    if (location.hash.startsWith('#/track')) history.replaceState(null, '', location.pathname + location.search)
  }

  const key = q.trim().toUpperCase().replace(/\s/g, '')
  const digits = key.replace(/\D/g, '')
  const found: Order[] =
    key.length < 4 ? [] : ops.orders.filter((o) => o.id.toUpperCase() === key || (digits.length >= 10 && o.customer.phone.replace(/\D/g, '').endsWith(digits.slice(-10))))

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} data-lenis-prevent>
          <div className="scrim" onClick={close} />
          <motion.div className="sheet track" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ type: 'spring', stiffness: 240, damping: 28 }}>
            <button className="icon-btn sheet-close" onClick={close} aria-label="close">
              <IClose />
            </button>
            <p className="mini">{t(L('Order tracking', 'অর্ডার ট্র্যাকিং'))}</p>
            <h3 className="sheet-title">{t(L('Where is my saree?', 'আমার শাড়ি কোথায়?'))}</h3>
            <input className="track-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t(L('Order number (SB-…) or mobile number', 'অর্ডার নং (SB-…) অথবা মোবাইল নম্বর'))} autoFocus />
            {key.length >= 4 && found.length === 0 && <p className="muted">{t(L('No order found yet. Check the number, or message us on WhatsApp.', 'কোনো অর্ডার পাওয়া যায়নি। নম্বরটি দেখে নিন বা হোয়াটসঅ্যাপে জানান।'))}</p>}
            <div className="track-list">
              {found.map((o) => (
                <OrderTimeline key={o.id} o={o} />
              ))}
            </div>
            <p className="tiny">
              {t(L('Questions?', 'কোনো প্রশ্ন?'))}{' '}
              <a className="link" href={waLink(SHOP.whatsapp, `Hello! I have a question about my order ${found[0]?.id ?? ''}`)} target="_blank" rel="noreferrer">
                {t(L('Ask us on WhatsApp', 'হোয়াটসঅ্যাপে জিজ্ঞেস করুন'))}
              </a>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function OrderTimeline({ o }: { o: Order }) {
  const { t, taka, lang } = useLang()
  const cancelled = o.status === 'cancelled'
  const idx = FLOW.indexOf(o.status)
  const when = (s: string) => {
    const h = o.history.find((x) => x.status === s)
    return h ? { at: new Date(h.at).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-GB', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }), auto: h.auto } : null
  }
  return (
    <div className="tl-card">
      <div className="tl-head">
        <b>{o.id}</b>
        <span className={'status-pill s-' + o.status}>{t(STATUS_NAME[o.status])}</span>
      </div>
      <div className="tl-items">
        {o.items.map((x) => (
          <span key={x.key}>
            {x.photo ? <img src={img(x.photo, 120)} alt="" /> : x.look ? <i className="tl-art"><SareeHanging look={x.look} /></i> : null}
            {t(x.name)} × {x.qty}
          </span>
        ))}
      </div>
      {cancelled ? (
        <p className="muted">{t(L('This order was cancelled.', 'এই অর্ডারটি বাতিল হয়েছে।'))}</p>
      ) : (
        <ol className="tl">
          {FLOW.map((s, k) => {
            const w = when(s)
            const state = k < idx ? 'done' : k === idx ? 'now' : 'next'
            return (
              <motion.li key={s} className={state} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: k * 0.08 }}>
                <span className="tl-dot">{state === 'done' ? '✓' : k + 1}</span>
                <div>
                  <b>{t(STATUS_NAME[s])}</b>
                  {w && (
                    <small>
                      {w.at} {w.auto && <em>· {t(L('automatic', 'স্বয়ংক্রিয়'))}</em>}
                    </small>
                  )}
                </div>
                {k < FLOW.length - 1 && <span className="tl-line"><motion.span initial={{ scaleY: 0 }} animate={{ scaleY: k < idx ? 1 : 0 }} transition={{ delay: 0.3 + k * 0.15, duration: 0.5 }} /></span>}
              </motion.li>
            )
          })}
        </ol>
      )}
      <div className="tl-foot">
        <span>{o.customer.district}</span>
        <b>{taka(o.total)}</b>
      </div>
    </div>
  )
}
