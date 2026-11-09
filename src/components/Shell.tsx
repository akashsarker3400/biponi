import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from 'motion/react'
import { useEffect, useState } from 'react'
import { FREE_DELIVERY, SHOP, img } from '../data'
import { priceCart, useOps } from '../ops'
import { L, useLang } from '../i18n'
import { useStore, type CartItem } from '../store'
import { LINKS } from './Nav'
import { IUp, IArrow, IBag, IChat, IClock, IClose, IHeart, IMinus, IPhone, IPin, IPlus, IShield, ITruck, LogoMark, SareeHanging } from './SareeArt'
import { Alpona, Reveal, SectionHead, scrollToId, scroller } from './ui'

export function Visit() {
  const { t } = useLang()
  const [sent, setSent] = useState(false)
  const perks = [
    { ic: <ITruck />, a: L('Delivery to all 64 districts', '৬৪ জেলায় হোম ডেলিভারি'), b: L('Dhaka in 24 hours, the rest of the country in 2–4 days', 'ঢাকায় ২৪ ঘণ্টা, সারা দেশে ২–৪ দিন') },
    { ic: <IShield />, a: L('Cash on delivery', 'ক্যাশ অন ডেলিভারি'), b: L('Or pay with bKash, Nagad, or card', 'অথবা বিকাশ, নগদ, কার্ডে পেমেন্ট') },
    { ic: <IChat />, a: L('Video-call shopping', 'ভিডিও কলে কেনাকাটা'), b: L('See the saree live on WhatsApp before you buy', 'কেনার আগে হোয়াটসঅ্যাপে লাইভ দেখে নিন') },
  ]
  return (
    <section className="section visit" id="visit">
      <div className="wrap">
        <SectionHead eyebrow={L('Come say hello', 'চলে আসুন একদিন')} a={L('Visit', 'আসুন')} b={L('Srimoti Bitan.', 'শ্রীমতী বিতানে।')} side={L('Sit down, have a cup of tea, and let us unfold a few sarees for you.', 'বসুন, এক কাপ চা খান। আমরা আপনার সামনে শাড়ি মেলে ধরি।')} />
        <div className="visit-grid">
          <Reveal className="visit-card dark">
            <div className="visit-photo">
              <img src={img('1773218373348-34db6bb11662', 1200)} alt="" loading="lazy" />
            </div>
            <div className="visit-rows">
              <p><IPin /> <span>{t(SHOP.address)}</span></p>
              <p><IClock /> <span>{t(SHOP.hours)}</span></p>
              <p><IPhone /> <span>{SHOP.phone}</span></p>
            </div>
            <div className="visit-btns">
              <a className="btn btn-gold" href={`https://wa.me/${SHOP.whatsapp}`} target="_blank" rel="noreferrer">
                {t(L('Message on WhatsApp', 'হোয়াটসঅ্যাপে মেসেজ'))}
                <span className="btn-ic"><IArrow size={15} /></span>
              </a>
              <a className="btn btn-ghost-light" href={`tel:${SHOP.phone.replace(/[^+\d]/g, '')}`}>
                {t(L('Call us', 'কল করুন'))}
              </a>
            </div>
          </Reveal>
          <div className="visit-side">
            {perks.map((p, k) => (
              <Reveal key={k} delay={k * 0.08} className="perk">
                <span className="perk-ic">{p.ic}</span>
                <div>
                  <b>{t(p.a)}</b>
                  <p>{t(p.b)}</p>
                </div>
              </Reveal>
            ))}
            <Reveal delay={0.3} className="news">
              <b>{t(L('First look at new weaves', 'নতুন শাড়ির খবর সবার আগে'))}</b>
              <p>{t(L('One letter a month, when the new sarees come in from the looms.', 'মাসে একটি চিঠি, তাঁত থেকে নতুন শাড়ি এলে।'))}</p>
              <AnimatePresence mode="wait">
                {sent ? (
                  <motion.p key="ok" className="news-ok" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    ✦ {t(L('Thank you! You are on the list.', 'ধন্যবাদ! আপনি তালিকায় যুক্ত হয়েছেন।'))}
                  </motion.p>
                ) : (
                  <motion.form key="f" exit={{ opacity: 0 }} onSubmit={(e) => { e.preventDefault(); setSent(true) }}>
                    <input type="email" required placeholder={t(L('Your email', 'আপনার ইমেইল'))} />
                    <button className="btn btn-sindoor" type="submit">{t(L('Join', 'যুক্ত হোন'))}</button>
                  </motion.form>
                )}
              </AnimatePresence>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  const { t, lang } = useLang()
  const ops = useOps()
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="foot-top">
          <div className="foot-brand">
            <LogoMark size={54} />
            <p>{t(L('A saree house for the Bengali woman: handwoven, honestly priced, and made with love on the looms of Bangladesh.', 'বাঙালি নারীর শাড়ির ঘর: হাতে বোনা, ন্যায্য দামে, বাংলাদেশের তাঁতে ভালোবাসায় তৈরি।'))}</p>
          </div>
          <div className="foot-cols">
            <div>
              <h4>{t(L('Explore', 'ঘুরে দেখুন'))}</h4>
              {LINKS.map((l) => (
                <button key={l.id} onClick={() => scrollToId(l.id)}>{t(l.name)}</button>
              ))}
            </div>
            <div>
              <h4>{t(L('Help', 'সহায়তা'))}</h4>
              <button onClick={() => ops.openTrack('')}>{t(L('Track your order', 'অর্ডার ট্র্যাক করুন'))}</button>
              <button onClick={() => scrollToId('visit')}>{t(L('Delivery & returns', 'ডেলিভারি ও রিটার্ন'))}</button>
              <button onClick={() => scrollToId('drape')}>{t(L('Touch a saree in 3D', 'থ্রিডিতে শাড়ি ছুঁয়ে দেখুন'))}</button>
              <button onClick={() => scrollToId('studio')}>{t(L('Made-to-order sarees', 'অর্ডারে বোনা শাড়ি'))}</button>
              <button onClick={() => scrollToId('bridal')}>{t(L('Bridal appointments', 'বিয়ের শাড়ির অ্যাপয়েন্টমেন্ট'))}</button>
            </div>
            <div>
              <h4>{t(L('Follow', 'ফলো করুন'))}</h4>
              <a href={SHOP.facebook}>Facebook</a>
              <a href={SHOP.instagram}>Instagram</a>
              <a href={`https://wa.me/${SHOP.whatsapp}`}>WhatsApp</a>
              <a href={`mailto:${SHOP.email}`}>{SHOP.email}</a>
            </div>
          </div>
        </div>
        <Alpona className="gold foot-alpona" />
        <div className="foot-word" aria-hidden>
          {lang === 'bn' ? 'শ্রীমতী বিতান' : 'Srimoti Bitan'}
        </div>
        <div className="foot-bottom">
          <span>© {new Date().getFullYear()} {t(L('Srimoti Bitan. All rights reserved.', 'শ্রীমতী বিতান। সর্বস্বত্ব সংরক্ষিত।'))}</span>
          <span>{t(L('Photography: Unsplash contributors', 'ছবি: আনস্প্ল্যাশ ফটোগ্রাফারগণ'))}</span>
        </div>
      </div>
    </footer>
  )
}

function Thumb({ it }: { it: Pick<CartItem, 'photo' | 'look'> }) {
  if (it.photo) return <img className="thumb" src={img(it.photo, 200)} alt="" />
  if (it.look) return <div className="thumb art"><SareeHanging look={it.look} /></div>
  return <div className="thumb" />
}

export function Drawer() {
  const { t, taka, num } = useLang()
  const { cart, wish, drawer, setDrawer, setQty, remove, toggleWish, add, clear } = useStore()
  const ops = useOps()
  const sub = cart.reduce((s, x) => s + x.price * x.qty, 0)
  const FREE = FREE_DELIVERY
  const pr = priceCart(sub, 'Dhaka', undefined, ops.rules)
  const pct = Math.min(1, sub / FREE)

  useEffect(() => {
    if (drawer) scroller.lenis?.stop()
    else scroller.lenis?.start()
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setDrawer(null)
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [drawer, setDrawer])

  return (
    <AnimatePresence>
      {drawer && (
        <>
          <motion.div className="scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawer(null)} />
          <motion.aside className="drawer" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 260, damping: 32 }} data-lenis-prevent>
            <div className="drawer-head">
              <div className="seg">
                {(['bag', 'wish'] as const).map((d) => (
                  <button key={d} className={drawer === d ? 'on' : ''} onClick={() => setDrawer(d)}>
                    {drawer === d && <motion.span layoutId="drawer-pill" className="seg-pill dark" />}
                    <span>
                      {d === 'bag' ? <IBag size={15} /> : <IHeart size={15} />} {d === 'bag' ? t(L('Bag', 'ব্যাগ')) : t(L('Wishlist', 'পছন্দ'))} ({num(d === 'bag' ? cart.reduce((s, x) => s + x.qty, 0) : wish.length)})
                    </span>
                  </button>
                ))}
              </div>
              <button className="icon-btn" onClick={() => setDrawer(null)} aria-label="close">
                <IClose />
              </button>
            </div>

            {drawer === 'bag' ? (
              cart.length === 0 ? (
                <Empty text={L('Your bag is empty. A saree is waiting for you.', 'আপনার ব্যাগ খালি। একটা শাড়ি আপনার অপেক্ষায়।')} />
              ) : (
                <>
                  <div className="free">
                    <p>{sub >= FREE ? t(L('You get free delivery ✦', 'আপনি ফ্রি ডেলিভারি পাচ্ছেন ✦')) : t(L(`Add ${taka(FREE - sub)} more for free delivery`, `আর ${taka(FREE - sub)} হলেই ফ্রি ডেলিভারি`))}</p>
                    <div className="free-bar"><motion.span animate={{ width: `${pct * 100}%` }} /></div>
                  </div>
                  <div className="lines">
                    <AnimatePresence initial={false}>
                      {cart.map((x) => (
                        <motion.div layout key={x.key} className="line" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 60, height: 0, marginBottom: 0 }}>
                          <Thumb it={x} />
                          <div className="line-info">
                            <b>{t(x.name)}</b>
                            {x.meta && <small>{t(x.meta)}</small>}
                            <div className="qty">
                              <button onClick={() => setQty(x.key, x.qty - 1)} aria-label="less"><IMinus size={14} /></button>
                              <span>{num(x.qty)}</span>
                              <button onClick={() => setQty(x.key, x.qty + 1)} aria-label="more"><IPlus size={14} /></button>
                            </div>
                          </div>
                          <div className="line-end">
                            <b>{taka(x.price * x.qty)}</b>
                            <button onClick={() => remove(x.key)}>{t(L('Remove', 'সরান'))}</button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                  <div className="drawer-foot">
                    <div className="sum"><span>{t(L('Subtotal', 'সাবটোটাল'))}</span><span>{taka(sub)}</span></div>
                    {pr.coupon && (
                      <div className="sum disc">
                        <span>✦ {pr.coupon.code} <small>{t(L('auto-applied', 'নিজে থেকেই'))}</small></span>
                        <span>−{taka(pr.discount)}</span>
                      </div>
                    )}
                    <div className="sum"><span>{t(L('Delivery', 'ডেলিভারি'))}</span><span>{pr.delivery === 0 ? t(L('Free', 'ফ্রি')) : t(L(`from ${taka(80)}`, `${taka(80)} থেকে`))}</span></div>
                    <div className="sum total"><span>{t(L('Estimated total', 'আনুমানিক মোট'))}</span><span>{taka(sub - pr.discount + pr.delivery)}</span></div>
                    <button className="btn btn-sindoor btn-block" onClick={() => { setDrawer(null); setTimeout(() => ops.setCheckout(true), 250) }}>
                      {t(L('Checkout', 'চেকআউট'))}
                      <span className="btn-ic"><IArrow size={15} /></span>
                    </button>
                    <p className="tiny center">
                      {t(L('Cash on delivery · bKash · Nagad · Card', 'ক্যাশ অন ডেলিভারি · বিকাশ · নগদ · কার্ড'))} ·{' '}
                      <button className="link" onClick={clear}>{t(L('Clear bag', 'ব্যাগ খালি করুন'))}</button>
                    </p>
                  </div>
                </>
              )
            ) : wish.length === 0 ? (
              <Empty text={L('No favourites yet. Tap ♡ on any saree to save it.', 'এখনো কিছু পছন্দ করেননি। যেকোনো শাড়িতে ♡ চাপুন।')} />
            ) : (
              <div className="lines">
                <AnimatePresence initial={false}>
                  {wish.map((x) => (
                    <motion.div layout key={x.id} className="line" exit={{ opacity: 0, x: 60 }}>
                      <Thumb it={x} />
                      <div className="line-info">
                        <b>{t(x.name)}</b>
                        <small>{taka(x.price)}</small>
                      </div>
                      <div className="line-end">
                        <button className="btn btn-sindoor btn-sm" onClick={() => { add(x); toggleWish(x) }}>{t(L('Move to bag', 'ব্যাগে নিন'))}</button>
                        <button onClick={() => toggleWish(x)}>{t(L('Remove', 'সরান'))}</button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

function Empty({ text }: { text: { en: string; bn: string } }) {
  const { t } = useLang()
  const { setDrawer } = useStore()
  return (
    <div className="empty">
      <LogoMark size={70} />
      <p>{t(text)}</p>
      <button className="btn btn-sindoor" onClick={() => { setDrawer(null); scrollToId('rail') }}>
        {t(L('Browse sarees', 'শাড়ি দেখুন'))}
        <span className="btn-ic"><IArrow size={15} /></span>
      </button>
    </div>
  )
}

function AddedCard() {
  const { added, clearAdded, setDrawer, cart, drawer, quick } = useStore()
  const ops = useOps()
  const covered = !!drawer || ops.checkout
  const { t, taka, num } = useLang()
  const count = cart.reduce((s, x) => s + x.qty, 0)
  return (
    <AnimatePresence>
      {added && !covered && (
        <motion.div key={added.n} className={'added' + (quick ? ' over-qv' : '')} initial={{ opacity: 0, y: -24, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -16, scale: 0.96 }} transition={{ type: 'spring', stiffness: 320, damping: 26, delay: 0.55 }}>
          <span className="added-arrow" />
          <div className="added-top">
            <b>✓ {t(L('Added to your bag', 'ব্যাগে যোগ হয়েছে'))}</b>
            <button onClick={clearAdded} aria-label="close"><IClose size={14} /></button>
          </div>
          <div className="added-item">
            <Thumb it={added} />
            <div>
              <b>{t(added.name)}</b>
              {added.meta && <small>{t(added.meta)}</small>}
              <em>{taka(added.price)}</em>
            </div>
          </div>
          <div className="added-btns">
            <button className="btn btn-white btn-sm" onClick={() => { clearAdded(); setDrawer('bag') }}>
              {t(L('View bag', 'ব্যাগ দেখুন'))} ({num(count)})
            </button>
            <button className="btn btn-sindoor btn-sm" onClick={() => { clearAdded(); ops.setCheckout(true) }}>
              {t(L('Checkout', 'চেকআউট'))}
            </button>
          </div>
          <motion.span className="added-timer" initial={{ scaleX: 1 }} animate={{ scaleX: 0 }} transition={{ duration: 4.2, ease: 'linear' }} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function Overlays() {
  const { flies, toasts } = useStore()
  const [lite] = useState(() => document.documentElement.classList.contains('lite'))
  const { t } = useLang()
  const { scrollYProgress } = useScroll()
  const sx = useSpring(scrollYProgress, { stiffness: 120, damping: 24 })
  const target = () => {
    const tab = document.getElementById('tab-bag')
    const r = (tab && tab.offsetParent ? tab : document.getElementById('bag-btn'))?.getBoundingClientRect()
    return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : { x: window.innerWidth - 60, y: 40 }
  }
  return (
    <>
      {/* phones: no scroll-progress bar or back-to-top ring (they redraw every frame) */}
      {!lite && <motion.div className="progress" style={{ scaleX: sx }} />}
      <AddedCard />
      {!lite && <BackTop />}
      {flies.map((f) => {
        const to = target()
        return (
          <motion.span
            key={f.id}
            className="fly"
            style={{ background: f.color, left: 0, top: 0 }}
            initial={{ x: f.x - 14, y: f.y - 14, scale: 1, opacity: 1 }}
            animate={{ x: [f.x - 14, (f.x + to.x) / 2 - 14, to.x - 14], y: [f.y - 14, Math.min(f.y, to.y) - 160, to.y - 14], scale: [1, 1.3, 0.35], opacity: [1, 1, 0.6] }}
            transition={{ duration: 0.75, ease: 'easeInOut' }}
          />
        )
      })}
      <div className="toasts">
        <AnimatePresence>
          {toasts.map((x) => (
            <motion.div key={x.id} layout className="toast" initial={{ opacity: 0, y: 30, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}>
              <LogoMark size={18} /> {t(x.text)}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  )
}

function BackTop() {
  const { scrollYProgress, scrollY } = useScroll()
  const [show, setShow] = useState(false)
  useMotionValueEvent(scrollY, 'change', (y) => setShow(y > window.innerHeight * 1.2))
  return (
    <AnimatePresence>
      {show && (
        <motion.button className="backtop" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} onClick={() => scrollToId('top')} aria-label="back to top">
          <svg viewBox="0 0 48 48" aria-hidden>
            <circle cx="24" cy="24" r="21" className="bt-track" />
            <motion.circle cx="24" cy="24" r="21" className="bt-bar" style={{ pathLength: scrollYProgress }} />
          </svg>
          <IUp size={18} />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
