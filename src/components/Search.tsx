import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { SAREES } from '../catalog'
import { CATS, colorFamily, img } from '../data'
import { L, useLang } from '../i18n'
import { useStore } from '../store'
import { IArrow, IClose, ISearch } from './SareeArt'
import { scrollToId, scroller } from './ui'

const BN_DIGITS = '০১২৩৪৫৬৭৮৯'
const toLatin = (s: string) => s.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)))

/** Colour words people actually type, in both languages. */
const COLOR_WORDS: Record<string, string[]> = {
  red: ['red', 'lal', 'লাল', 'sindoor', 'সিঁদুর'],
  light: ['white', 'shada', 'সাদা', 'ivory', 'cream', 'ghiye', 'ঘিয়ে'],
  bright: ['yellow', 'holud', 'হলুদ', 'pink', 'golapi', 'গোলাপি', 'orange', 'komola', 'কমলা'],
  dark: ['black', 'kalo', 'কালো', 'blue', 'neel', 'নীল', 'purple', 'begun', 'বেগুনি'],
  green: ['green', 'shobuj', 'সবুজ', 'mint', 'pudina', 'পুদিনা'],
}
const SUGGEST = [L('Bridal', 'বিয়ে'), L('Jamdani', 'জামদানি'), L('Red', 'লাল'), L('Silk', 'সিল্ক'), L('Under 10000', '১০০০০-এর নিচে'), L('Tant', 'তাঁত')]

export function Search() {
  const { t, taka } = useLang()
  const { openQuick } = useStore()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const show = () => setOpen(true)
    const key = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if ((e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') || (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('sb:search', show)
    window.addEventListener('keydown', key)
    return () => {
      window.removeEventListener('sb:search', show)
      window.removeEventListener('keydown', key)
    }
  }, [])

  useEffect(() => {
    if (open) {
      scroller.lenis?.stop()
      setTimeout(() => input.current?.focus(), 80)
    } else scroller.lenis?.start()
  }, [open])

  const results = useMemo(() => {
    const raw = toLatin(q.trim().toLowerCase())
    if (!raw) return []
    const budget = Number((raw.match(/\d{3,}/) || [])[0])
    const words = raw.replace(/\d+/g, ' ').replace(/(under|er nich[e]?|-এর নিচে|নিচে|এর)/g, ' ').split(/\s+/).filter((w) => w.length > 1)
    return SAREES.map((s) => {
      const hay = [s.name.en, s.name.bn, s.kind.en, s.kind.bn, s.fabric.en, s.fabric.bn, s.origin.en, s.origin.bn, s.group === 'bridal' ? 'bridal wedding biye বিয়ে' : '', s.badge?.en ?? '', s.badge?.bn ?? ''].join(' ').toLowerCase()
      let score = 0
      for (const w of words) {
        if (hay.includes(w)) score += 3
        for (const [fam, list] of Object.entries(COLOR_WORDS)) if (list.includes(w) && s.look && colorFamily(s.look.body) === fam) score += 2
      }
      if (budget && s.price <= budget) score += words.length ? 1 : 3
      if (budget && s.price > budget) score = 0
      return { s, score }
    })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((x) => x.s)
  }, [q])

  const weaves = CATS.filter((c) => c.key !== 'all' && q && (c.name.en.toLowerCase().includes(q.toLowerCase()) || c.name.bn.includes(q)))

  const pick = (id: string) => {
    setOpen(false)
    setTimeout(() => openQuick(id), 250)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} data-lenis-prevent onClick={() => setOpen(false)}>
          <motion.div className="search-box" initial={{ y: -30, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: -20, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 28 }} onClick={(e) => e.stopPropagation()}>
            <div className="search-in">
              <ISearch size={22} />
              <input
                ref={input}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value)
                  setSel(0)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') setSel((x) => Math.min(results.length - 1, x + 1))
                  if (e.key === 'ArrowUp') setSel((x) => Math.max(0, x - 1))
                  if (e.key === 'Enter' && results[sel]) pick(results[sel].id)
                }}
                placeholder={t(L('Search sarees: “red jamdani”, “bridal”, “under 10000”…', 'শাড়ি খুঁজুন: “লাল জামদানি”, “বিয়ে”, “১০০০০-এর নিচে”…'))}
              />
              <button className="icon-btn" onClick={() => setOpen(false)} aria-label="close">
                <IClose />
              </button>
            </div>

            {!q && (
              <div className="search-sug">
                <p className="mini">{t(L('Popular searches', 'জনপ্রিয় খোঁজ'))}</p>
                <div className="chips">
                  {SUGGEST.map((x) => (
                    <button key={x.en} className="chip" onClick={() => setQ(t(x))}>
                      {t(x)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {weaves.length > 0 && (
              <div className="search-weaves">
                {weaves.map((c) => (
                  <button key={c.key} className="chip" onClick={() => { setOpen(false); window.dispatchEvent(new CustomEvent('sb:rack', { detail: c.key })); scrollToId('rail') }}>
                    {t(L('See all', 'সব দেখুন'))} {t(c.name)} <IArrow size={14} />
                  </button>
                ))}
              </div>
            )}

            <div className="search-res">
              <AnimatePresence initial={false}>
                {results.map((s, k) => (
                  <motion.button
                    layout
                    key={s.id}
                    className={'sr' + (k === sel ? ' on' : '')}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: k * 0.03 }}
                    onPointerEnter={() => setSel(k)}
                    onClick={() => pick(s.id)}
                  >
                    <img src={img(s.photo, 160)} alt="" />
                    <span>
                      <b>{t(s.name)}</b>
                      <small>{t(s.kind)} · {t(s.origin)}</small>
                    </span>
                    <em>{taka(s.price)}</em>
                  </motion.button>
                ))}
              </AnimatePresence>
              {q && results.length === 0 && weaves.length === 0 && <p className="muted">{t(L('Nothing yet. Try a colour, a weave, or a budget.', 'কিছু পাওয়া যায়নি। একটি রং, বুনন বা বাজেট লিখে দেখুন।'))}</p>}
            </div>
            <p className="tiny search-tip">{t(L('Tip: press / anywhere to search · ↑ ↓ to move · Enter to open', 'টিপ: যেকোনো জায়গায় / চাপুন · ↑ ↓ সরান · Enter খুলুন'))}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

