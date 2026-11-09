import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { DISTRICTS, SHOP, deliveryFor, img } from '../data'
import { L, useLang } from '../i18n'
import { FLOW, STATUS_NAME, isPhone, priceCart, shopOrderText, useOps, waLink, type Order, type Payment } from '../ops'
import { useStore } from '../store'
import { IArrow, IClose, LogoMark, SareeHanging } from './SareeArt'
import { scroller } from './ui'

const SAVED = 'sb-customer'

export function Checkout() {
  const { t, taka, num, lang } = useLang()
  const { cart, clear } = useStore()
  const ops = useOps()
  const saved = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(SAVED) || 'null')
    } catch {
      return null
    }
  }, [])
  const [name, setName] = useState<string>(saved?.name ?? '')
  const [phone, setPhone] = useState<string>(saved?.phone ?? '')
  const [district, setDistrict] = useState<string>(saved?.district ?? 'Dhaka')
  const [address, setAddress] = useState<string>(saved?.address ?? '')
  const [note, setNote] = useState('')
  const [pay, setPay] = useState<Payment>('cod')
  const [code, setCode] = useState('')
  const [tried, setTried] = useState(false)
  const [done, setDone] = useState<Order | null>(null)

  const open = ops.checkout
  const sub = cart.reduce((s, x) => s + x.price * x.qty, 0)
  const pr = priceCart(sub, district, code || undefined, ops.rules)
  const errs = {
    name: name.trim().length < 2,
    phone: !isPhone(phone),
    address: address.trim().length < 8,
  }
  const ok = !errs.name && !errs.phone && !errs.address && cart.length > 0

  useEffect(() => {
    if (open) scroller.lenis?.stop()
    else scroller.lenis?.start()
  }, [open])

  const close = () => {
    ops.setCheckout(false)
    setTimeout(() => setDone(null), 400)
  }

  const place = () => {
    setTried(true)
    if (!ok) return
    const order = ops.placeOrder({
      items: cart.map(({ key, id, name, price, qty, photo, look }) => ({ key, id, name, price, qty, photo, look })),
      customer: { name: name.trim(), phone: phone.replace(/[\s-]/g, ''), district, address: address.trim(), note: note.trim() || undefined },
      payment: pay,
      subtotal: sub,
      discount: pr.discount,
      coupon: pr.coupon?.code,
      delivery: pr.delivery,
      total: pr.total,
    })
    localStorage.setItem(SAVED, JSON.stringify({ name, phone, district, address }))
    clear()
    setDone(order)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} data-lenis-prevent>
          <div className="scrim" onClick={close} />
          <motion.div className="sheet checkout" initial={{ y: 60, opacity: 0, scale: 0.97 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ type: 'spring', stiffness: 240, damping: 28 }}>
            <button className="icon-btn sheet-close" onClick={close} aria-label="close">
              <IClose />
            </button>
            {done ? (
              <Done order={done} onTrack={() => { close(); setTimeout(() => ops.openTrack(done.id), 450) }} />
            ) : (
              <div className="co-grid">
                <div className="co-form">
                  <p className="mini">{t(L('Checkout', 'চেকআউট'))}</p>
                  <h3 className="sheet-title">{t(L('Where should we send it?', 'শাড়ি কোথায় পাঠাব?'))}</h3>
                  {saved && <p className="co-welcome">✦ {t(L(`Welcome back, ${saved.name.split(' ')[0]}! Your details are filled in.`, `আবার স্বাগতম, ${saved.name.split(' ')[0]}! আপনার তথ্য বসিয়ে দিয়েছি।`))}</p>}
                  <Field label={L('Your name', 'আপনার নাম')} err={tried && errs.name ? L('Please write your name', 'নাম লিখুন') : null}>
                    <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                  </Field>
                  <Field label={L('Mobile number', 'মোবাইল নম্বর')} err={tried && errs.phone ? L('Use a Bangladeshi number, e.g. 01712345678', 'সঠিক নম্বর দিন, যেমন ০১৭১২৩৪৫৬৭৮') : null}>
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="01XXXXXXXXX" />
                  </Field>
                  <Field label={L('District', 'জেলা')}>
                    <select value={district} onChange={(e) => setDistrict(e.target.value)}>
                      {DISTRICTS.map((d) => (
                        <option key={d.en} value={d.en}>
                          {lang === 'bn' ? d.bn : d.en}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label={L('Full address', 'পূর্ণ ঠিকানা')} err={tried && errs.address ? L('A little more detail, please', 'আরেকটু বিস্তারিত লিখুন') : null}>
                    <textarea rows={2} value={address} onChange={(e) => setAddress(e.target.value)} autoComplete="street-address" placeholder={t(L('House, road, area', 'বাড়ি, রোড, এলাকা'))} />
                  </Field>
                  <Field label={L('Note (optional)', 'নোট (ঐচ্ছিক)')}>
                    <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t(L('e.g. please call before delivery', 'যেমন: ডেলিভারির আগে ফোন দেবেন'))} />
                  </Field>
                  <p className="mini" style={{ marginTop: 18 }}>{t(L('Payment', 'পেমেন্ট'))}</p>
                  <div className="pay">
                    {(['cod', 'bkash', 'nagad'] as Payment[]).map((p) => (
                      <button key={p} className={'pay-opt ' + p + (pay === p ? ' on' : '')} onClick={() => setPay(p)}>
                        <b>{p === 'cod' ? t(L('Cash on delivery', 'ক্যাশ অন ডেলিভারি')) : p === 'bkash' ? t(L('bKash', 'বিকাশ')) : t(L('Nagad', 'নগদ'))}</b>
                        <small>{p === 'cod' ? t(L('Pay when it arrives', 'হাতে পেয়ে টাকা দিন')) : t(L('Send money, use order ID as reference', 'সেন্ড মানি, রেফারেন্সে অর্ডার নং'))}</small>
                      </button>
                    ))}
                  </div>
                  {pay !== 'cod' && (
                    <p className="tiny">
                      {t(L(`After placing the order, send ${taka(pr.total)} to ${SHOP.phone} (${pay === 'bkash' ? 'bKash' : 'Nagad'} personal).`, `অর্ডারের পর ${taka(pr.total)} পাঠান ${SHOP.phone} নম্বরে (${pay === 'bkash' ? 'বিকাশ' : 'নগদ'} পার্সোনাল)।`))}
                    </p>
                  )}
                </div>

                <div className="co-sum">
                  <div className="co-items">
                    {cart.map((x) => (
                      <div className="co-item" key={x.key}>
                        {x.photo ? <img src={img(x.photo, 160)} alt="" /> : x.look ? <div className="co-art"><SareeHanging look={x.look} /></div> : <div className="co-art" />}
                        <span>
                          {t(x.name)} <em>× {num(x.qty)}</em>
                        </span>
                        <b>{taka(x.price * x.qty)}</b>
                      </div>
                    ))}
                  </div>
                  <div className="co-code">
                    <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder={t(L('Coupon code', 'কুপন কোড'))} />
                    {code && pr.manualBad && <small className="err">{t(L('Not valid here, so we used the best one for you', 'এখানে চলবে না, সেরা ছাড়টি দেওয়া হলো'))}</small>}
                  </div>
                  <div className="sum"><span>{t(L('Subtotal', 'সাবটোটাল'))}</span><span>{taka(sub)}</span></div>
                  <AnimatePresence>
                    {pr.coupon && (
                      <motion.div className="sum disc" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <span>✦ {pr.coupon.code} <small>{t(L('auto-applied', 'নিজে থেকেই'))}</small></span>
                        <span>−{taka(pr.discount)}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="sum">
                    <span>{t(L('Delivery', 'ডেলিভারি'))} · {t(pr.eta)}</span>
                    <motion.span key={pr.delivery} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>{pr.delivery === 0 ? t(L('Free', 'ফ্রি')) : taka(pr.delivery)}</motion.span>
                  </div>
                  <div className="sum total"><span>{t(L('Total', 'মোট'))}</span><motion.span key={pr.total} initial={{ scale: 1.15 }} animate={{ scale: 1 }}>{taka(pr.total)}</motion.span></div>
                  <button className="btn btn-sindoor btn-block" onClick={place} disabled={cart.length === 0}>
                    {t(L('Place order', 'অর্ডার করুন'))}
                    <span className="btn-ic"><IArrow size={15} /></span>
                  </button>
                  <p className="tiny center">{t(L('Orders under ৳20,000 are confirmed instantly. Bigger orders get a quick confirmation call.', '৳২০,০০০-এর কম অর্ডার সঙ্গে সঙ্গে কনফার্ম। বড় অর্ডারে একটি ফোন কল।'))}</p>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Field({ label, err, children }: { label: { en: string; bn: string }; err?: { en: string; bn: string } | null; children: ReactNode }) {
  const { t } = useLang()
  return (
    <label className={'field' + (err ? ' bad' : '')}>
      <span>{t(label)}</span>
      {children}
      <AnimatePresence>{err && <motion.small initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>{t(err)}</motion.small>}</AnimatePresence>
    </label>
  )
}

function Done({ order, onTrack }: { order: Order; onTrack: () => void }) {
  const { t, taka } = useLang()
  const auto = order.status === 'confirmed'
  const eta = deliveryFor(order.customer.district, order.subtotal).eta
  return (
    <div className="done">
      <div className="petals" aria-hidden>
        {Array.from({ length: 22 }).map((_, k) => (
          <motion.i
            key={k}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
            animate={{ x: Math.cos((k / 22) * Math.PI * 2) * (140 + (k % 3) * 60), y: Math.sin((k / 22) * Math.PI * 2) * (100 + (k % 4) * 40) + 120, opacity: 0, rotate: 360 }}
            transition={{ duration: 1.8, ease: 'easeOut', delay: 0.1 }}
            style={{ background: k % 2 ? 'var(--gold-2)' : 'var(--sindoor)' }}
          />
        ))}
      </div>
      <motion.div initial={{ scale: 0.4, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 12 }} className="done-mark">
        <LogoMark size={74} />
      </motion.div>
      <h3 className="sheet-title">{t(L('Thank you! Your order is in.', 'ধন্যবাদ! আপনার অর্ডার পেয়েছি।'))}</h3>
      <p className="done-id">{order.id}</p>
      <div className="mini-flow">
        {FLOW.map((s, k) => (
          <span key={s} className={order.history.some((h) => h.status === s) ? 'on' : ''}>
            <i>{k + 1}</i>
            {t(STATUS_NAME[s])}
          </span>
        ))}
      </div>
      <p className="muted">
        {auto
          ? t(L(`Confirmed automatically ✓ Expected delivery ${eta.en}.`, `নিজে থেকেই কনফার্ম হয়েছে ✓ ডেলিভারি ${eta.bn}।`))
          : t(L('We will call you shortly to confirm this order.', 'অর্ডারটি কনফার্ম করতে আমরা শীঘ্রই ফোন করব।'))}{' '}
        {t(L('Total', 'মোট'))} <b>{taka(order.total)}</b>
      </p>
      <div className="done-actions">
        <a className="btn btn-sindoor" href={waLink(SHOP.whatsapp, shopOrderText(order))} target="_blank" rel="noreferrer">
          {t(L('Send order on WhatsApp', 'হোয়াটসঅ্যাপে অর্ডার পাঠান'))}
          <span className="btn-ic"><IArrow size={15} /></span>
        </a>
        <button className="btn btn-white" onClick={onTrack}>
          {t(L('Track order', 'অর্ডার ট্র্যাক করুন'))}
          <span className="btn-ic"><IArrow size={15} /></span>
        </button>
        <button className="chip" onClick={() => printInvoice(order)}>🧾 {t(L('Invoice', 'ইনভয়েস'))}</button>
      </div>
    </div>
  )
}

export function printInvoice(o: Order) {
  const w = window.open('', '_blank', 'width=720,height=900')
  if (!w) return
  const rows = o.items.map((x) => `<tr><td>${x.name.en}<br><small>${x.name.bn}</small></td><td>${x.qty}</td><td>৳${x.price.toLocaleString('en-IN')}</td><td>৳${(x.price * x.qty).toLocaleString('en-IN')}</td></tr>`).join('')
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Invoice ${o.id}</title>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@600&family=Hind+Siliguri:wght@400;600&display=swap" rel="stylesheet">
<style>body{font-family:'Hind Siliguri',sans-serif;color:#1b1411;padding:40px;max-width:640px;margin:auto}h1{font-family:Fraunces,serif;color:#5a0f1a;margin:0;letter-spacing:.1em}.g{color:#b0812f}table{width:100%;border-collapse:collapse;margin:24px 0}td,th{padding:10px 6px;border-bottom:1px solid #ece4d6;text-align:left}th{font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#7a6c63}.r{text-align:right}.tot td{font-weight:700;font-size:18px;border:0}.top{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px double #c9a04a;padding-bottom:18px}small{color:#7a6c63}</style></head><body>
<div class="top"><div><h1>SRIMOTI BITAN</h1><div class="g">শ্রীমতী বিতান · Saree House</div><small>${SHOP.address.en}<br>${SHOP.phone}</small></div><div style="text-align:right"><b>INVOICE</b><br>${o.id}<br><small>${new Date(o.at).toLocaleString('en-GB')}</small></div></div>
<p><b>${o.customer.name}</b><br>${o.customer.phone}<br>${o.customer.address}, ${o.customer.district}</p>
<table><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>${rows}
<tr><td colspan="3" class="r">Subtotal</td><td>৳${o.subtotal.toLocaleString('en-IN')}</td></tr>
${o.discount ? `<tr><td colspan="3" class="r">Discount (${o.coupon})</td><td>−৳${o.discount.toLocaleString('en-IN')}</td></tr>` : ''}
<tr><td colspan="3" class="r">Delivery</td><td>৳${o.delivery}</td></tr>
<tr class="tot"><td colspan="3" class="r">Total</td><td>৳${o.total.toLocaleString('en-IN')}</td></tr></table>
<p>Payment: <b>${o.payment === 'cod' ? 'Cash on delivery' : o.payment === 'bkash' ? 'bKash' : 'Nagad'}</b></p>
<p class="g">ধন্যবাদ! Thank you for choosing Srimoti Bitan.</p>
<script>setTimeout(()=>print(),600)</script></body></html>`)
  w.document.close()
}
