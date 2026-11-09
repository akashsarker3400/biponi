import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { useEffect, useState } from 'react'
import { L, useLang } from '../i18n'
import { useStore } from '../store'
import { IArrow, IBag, IClose, IHeart, IMenu, ISearch, LogoMark } from './SareeArt'
import { CATS, activeCampaign, img } from '../data'
import { NEW_ARRIVALS } from '../catalog'
import { scrollToId } from './ui'

export const LINKS = [
  { id: 'seasons', name: L('Seasons', 'ঋতু') },
  { id: 'drape', name: L('Touch it · 3D', 'ছুঁয়ে দেখুন') },
  { id: 'studio', name: L('Weave Studio', 'তাঁত স্টুডিও') },
  { id: 'arrivals', name: L('New', 'নতুন') },
  { id: 'rail', name: L('Collection', 'কালেকশন') },
  { id: 'looms', name: L('The Looms', 'তাঁতঘর') },
  { id: 'bridal', name: L('Bridal', 'বিয়ের শাড়ি') },
  { id: 'visit', name: L('Visit', 'ঠিকানা') },
]

export function Logo({ light }: { light?: boolean }) {
  const { lang } = useLang()
  return (
    <button className={'logo' + (light ? ' light' : '')} onClick={() => scrollToId('top')} aria-label="Srimoti Bitan home">
      <LogoMark size={36} />
      <span className="logo-text">
        <b>{lang === 'bn' ? 'শ্রীমতী বিতান' : 'SRIMOTI BITAN'}</b>
        <small>{lang === 'bn' ? 'SRIMOTI BITAN · শাড়ির ঘর' : 'শ্রীমতী বিতান · saree house'}</small>
      </span>
    </button>
  )
}

export function Nav() {
  const { t, lang, setLang, num } = useLang()
  const { cart, wish, setDrawer, bump, openQuick } = useStore()
  const [mega, setMega] = useState(false)
  const [bar, setBar] = useState(() => sessionStorage.getItem('sb-bar') !== 'off')
  const camp = activeCampaign()
  const feat = NEW_ARRIVALS[new Date().getDate() % NEW_ARRIVALS.length]
  const { scrollY } = useScroll()
  const [solid, setSolid] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [active, setActive] = useState('')
  const [menu, setMenu] = useState(false)
  const count = cart.reduce((s, x) => s + x.qty, 0)

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0
    setSolid(y > window.innerHeight * 0.75)
    setHidden(y > 300 && y > prev + 4 && !menu)
    if (y < prev - 4) setHidden(false)
  })

  useEffect(() => {
    const obs = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    LINKS.forEach((l) => {
      const el = document.getElementById(l.id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [])

  const go = (id: string) => {
    setMenu(false)
    scrollToId(id)
  }

  return (
    <>
      <motion.div className="topwrap" animate={{ y: hidden ? -150 : 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} onPointerLeave={() => setMega(false)}>
      <AnimatePresence>
        {bar && (
          <motion.div className="announce" initial={{ height: 0 }} animate={{ height: 34 }} exit={{ height: 0 }}>
            <div className="announce-track">
              {[0, 1].map((r) => (
                <div className="announce-row" key={r}>
                  {camp && (
                    <span>
                      <b>✦ {t(camp.title)}</b> {t(camp.line)}
                    </span>
                  )}
                  <span>{t(L('Free delivery on orders over ৳5,000', '৳৫,০০০-এর বেশি অর্ডারে ফ্রি ডেলিভারি'))}</span>
                  <span>{t(L('Cash on delivery to all 64 districts', '৬৪ জেলায় ক্যাশ অন ডেলিভারি'))}</span>
                  <span>{t(L('Free fall & pico on every saree', 'প্রতিটি শাড়িতে ফ্রি ফলস ও পিকো'))}</span>
                  <span>{t(L('Easy exchange within 3 days', '৩ দিনের মধ্যে সহজ বদল'))}</span>
                </div>
              ))}
            </div>
            <button className="announce-x" onClick={() => { setBar(false); sessionStorage.setItem('sb-bar', 'off') }} aria-label="close">
              <IClose size={13} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <header className={'nav' + (solid ? ' solid' : '')}>
        <Logo light={!solid} />
        <nav className="nav-links">
          {LINKS.map((l) => (
            <button key={l.id} onClick={() => go(l.id)} className={active === l.id ? 'active' : ''} onPointerEnter={() => setMega(l.id === 'rail' || l.id === 'arrivals')}>
              {active === l.id && <motion.span layoutId="nav-pill" className="nav-pill" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
              <span>{t(l.name)}</span>
            </button>
          ))}
        </nav>
        <div className="nav-actions">
          <button className="icon-btn" onClick={() => window.dispatchEvent(new Event('sb:search'))} aria-label="search">
            <ISearch />
          </button>
          <button className="lang" onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')} aria-label="language">
            <span className={lang === 'bn' ? 'on' : ''}>বাং</span>
            <span className={lang === 'en' ? 'on' : ''}>EN</span>
          </button>
          <button className="icon-btn" onClick={() => setDrawer('wish')} aria-label="wishlist">
            <IHeart />
            {wish.length > 0 && <span className="badge">{num(wish.length)}</span>}
          </button>
          <motion.button
            id="bag-btn"
            key={bump}
            className="icon-btn"
            onClick={() => setDrawer('bag')}
            aria-label="bag"
            animate={bump ? { scale: [1, 1.28, 0.92, 1] } : undefined}
            transition={{ duration: 0.5 }}
          >
            <IBag />
            {count > 0 && <span className="badge">{num(count)}</span>}
          </motion.button>
          <button className="btn btn-sindoor nav-cta" onClick={() => go('visit')}>
            {t(L('Visit the Store', 'দোকানে আসুন'))}
            <span className="btn-ic"><IArrow size={15} /></span>
          </button>
          <button className="icon-btn burger" onClick={() => setMenu(true)} aria-label="menu">
            <IMenu />
          </button>
        </div>
        <AnimatePresence>
          {mega && (
            <motion.div className="mega" initial={{ opacity: 0, y: -10, clipPath: 'inset(0 0 100% 0 round 26px)' }} animate={{ opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0 round 26px)' }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
              <div className="mega-col">
                <p className="mini">{t(L('By weave', 'বুনন অনুযায়ী'))}</p>
                {CATS.filter((c) => c.key !== 'all').map((c, k) => (
                  <motion.button key={c.key} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 + k * 0.03 }} onClick={() => { setMega(false); window.dispatchEvent(new CustomEvent('sb:rack', { detail: c.key })); scrollToId('rail') }}>
                    {t(c.name)}
                  </motion.button>
                ))}
              </div>
              <div className="mega-col">
                <p className="mini">{t(L('By occasion', 'উপলক্ষ অনুযায়ী'))}</p>
                {[
                  { n: L('Wedding & bou-bhat', 'বিয়ে ও বৌভাত'), id: 'bridal' },
                  { n: L('Gaye holud', 'গায়ে হলুদ'), id: 'arrivals' },
                  { n: L('Pujo & Eid', 'পূজা ও ঈদ'), id: 'seasons' },
                  { n: L('Design your own', 'নিজে নকশা করুন'), id: 'studio' },
                  { n: L('Touch it in 3D', 'থ্রিডিতে ছুঁয়ে দেখুন'), id: 'drape' },
                ].map((o, k) => (
                  <motion.button key={o.id + k} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 + k * 0.03 }} onClick={() => go(o.id)}>
                    {t(o.n)}
                  </motion.button>
                ))}
              </div>
              <button className="mega-feat" onClick={() => { setMega(false); openQuick(feat.id) }}>
                <img src={img(feat.photo, 500)} alt="" />
                <span>
                  <small>{t(L('Saree of the day', 'আজকের শাড়ি'))}</small>
                  <b>{t(feat.name)}</b>
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      </motion.div>

      <AnimatePresence>
        {menu && (
          <motion.div className="mobile-menu" initial={{ clipPath: 'circle(0% at 92% 4%)' }} animate={{ clipPath: 'circle(150% at 92% 4%)' }} exit={{ clipPath: 'circle(0% at 92% 4%)' }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
            <button className="icon-btn mm-close" onClick={() => setMenu(false)} aria-label="close">
              <IClose />
            </button>
            <LogoMark size={64} />
            <button className="mm-search" onClick={() => { setMenu(false); window.dispatchEvent(new Event('sb:search')) }}>
              <ISearch size={20} /> {t(L('Search sarees', 'শাড়ি খুঁজুন'))}
            </button>
            {LINKS.map((l, i) => (
              <motion.button key={l.id} onClick={() => go(l.id)} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05 }}>
                {t(l.name)}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export function Preloader({ onOpen, onEnd }: { onOpen: () => void; onEnd: () => void }) {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const a = setTimeout(() => {
      setOpen(true)
      onOpen()
    }, 1900)
    const b = setTimeout(onEnd, 3300)
    return () => {
      clearTimeout(a)
      clearTimeout(b)
    }
  }, [onOpen, onEnd])
  const curtain = (side: 'l' | 'r') => (
    <motion.div
      className={'curtain ' + side}
      initial={false}
      animate={open ? { scaleX: 0.08, x: side === 'l' ? '-6%' : '6%' } : { scaleX: 1, x: '0%' }}
      transition={{ duration: 1.3, ease: [0.7, 0, 0.2, 1] }}
    >
      <svg className="curtain-silk" aria-hidden>
        <rect width="100%" height="100%" fill="url(#paisley)" />
      </svg>
      <span className="curtain-folds" />
      <span className="curtain-sheen" />
      <span className="curtain-paar" />
    </motion.div>
  )
  return (
    <div className="preloader">
      {curtain('l')}
      {curtain('r')}
      <motion.div className="pre-inner" animate={open ? { opacity: 0, scale: 1.15, filter: 'blur(8px)' } : { opacity: 1 }} transition={{ duration: 0.6 }}>
        <LogoMark size={96} draw />
        <motion.h1 initial={{ opacity: 0, letterSpacing: '0.6em' }} animate={{ opacity: 1, letterSpacing: '0.04em' }} transition={{ delay: 0.4, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}>
          শ্রীমতী বিতান
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
          SRIMOTI BITAN · SAREE HOUSE
        </motion.p>
      </motion.div>
    </div>
  )
}
