import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { byId } from '../catalog'
import { img } from '../data'
import { L, useLang } from '../i18n'
import { useStore } from '../store'
import { IUpRight, LogoMark } from './SareeArt'
import { ease, scrollToId, useOnScreen } from './ui'

const DUR = 6000
/** Full-length photos only: they fit the tall arch without cropping faces. */
const SLIDES = ['n7', 'n10', 'b1', 'n3', 'n11'].map((id) => byId(id)!)

export function Hero({ ready }: { ready: boolean }) {
  const { t, lang, taka, num } = useLang()
  const { openQuick } = useStore()
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const ref = useRef<HTMLElement>(null)
  const visible = useOnScreen(ref)
  const s = SLIDES[i]
  const lite = typeof window !== 'undefined' && document.documentElement.classList.contains('lite')

  // gentle scroll + mouse depth (desktop only)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const stageY = useTransform(scrollYProgress, [0, 1], [0, lite ? 0 : 120])
  const textY = useTransform(scrollYProgress, [0, 1], [0, lite ? 0 : -60])
  const mx = useSpring(useMotionValue(0), { stiffness: 60, damping: 16 })
  const my = useSpring(useMotionValue(0), { stiffness: 60, damping: 16 })
  const archRY = useTransform(mx, (v) => v * 10)
  const archRX = useTransform(my, (v) => v * -8)
  const cardX = useTransform(mx, (v) => v * -26)
  const sealX = useTransform(mx, (v) => v * 30)
  const orbX = useTransform(mx, (v) => `${50 + v * 40}%`)
  const orbY = useTransform(my, (v) => `${45 + v * 40}%`)

  useEffect(() => {
    if (paused || !visible) return
    const id = setInterval(() => setI((x) => (x + 1) % SLIDES.length), DUR)
    return () => clearInterval(id)
  }, [paused, i, visible])

  const lines = lang === 'bn' ? [['বাংলার', 'তাঁতে,'], ['আপনার', 'আঁচলে।']] : [['Draped', 'in'], ['Bengal’s', 'looms.']]

  return (
    <section
      className={'hx' + (visible ? '' : ' is-off')}
      id="top"
      ref={ref}
      onPointerMove={(e) => {
        if (e.pointerType !== 'mouse') return
        mx.set(e.clientX / window.innerWidth - 0.5)
        my.set(e.clientY / window.innerHeight - 0.5)
      }}
      onPointerLeave={() => {
        mx.set(0)
        my.set(0)
      }}
    >
      <div className="hx-bg" aria-hidden>
        <motion.span className="hx-orb" style={{ left: orbX, top: orbY }} />
        <span className="hx-pattern" />
        <span className="hx-watermark">{lang === 'bn' ? 'শ্রীমতী' : 'Srimoti'}</span>
      </div>

      <div className="hx-grid wrap">
        <motion.div className="hx-text" style={{ y: textY }}>
          <motion.p className="hx-chip" initial={{ opacity: 0, y: 14 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.15, duration: 0.8, ease }}>
            <span className="dot" />
            {t(L('Handwoven sarees of Bengal · since 1433', 'বাংলার হাতে বোনা শাড়ি · ১৪৩৩ থেকে'))}
          </motion.p>
          <h1 className="hx-title" key={lang}>
            {lines.map((ln, r) => (
              <span className="hx-line" key={r}>
                {ln.map((w, k) => (
                  <span className="mask" key={k}>
                    <motion.span className={r === 1 && k === 1 ? 'hx-gold' : ''} initial={{ y: '115%' }} animate={ready ? { y: '0%' } : {}} transition={{ delay: 0.3 + (r * 2 + k) * 0.1, duration: 1.05, ease }}>
                      {w}
                    </motion.span>
                  </span>
                ))}
              </span>
            ))}
          </h1>
          <motion.p className="hx-sub" initial={{ opacity: 0, y: 14 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.8, duration: 0.8, ease }}>
            {t(
              L(
                'Jamdani from Rupganj, tant from Tangail, silk from Rajshahi: chosen by hand from the weavers and brought to your door.',
                'রূপগঞ্জের জামদানি, টাঙ্গাইলের তাঁত, রাজশাহীর রেশম। তাঁতিদের কাছ থেকে হাতে বেছে, পৌঁছে দিই আপনার দরজায়।',
              ),
            )}
          </motion.p>
          <motion.div className="hx-ctas" initial={{ opacity: 0, y: 14 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.95, duration: 0.8, ease }}>
            <button className="btn btn-gold btn-lg" onClick={() => scrollToId('arrivals')}>
              {t(L('Shop new arrivals', 'নতুন শাড়ি দেখুন'))}
              <span className="btn-ic"><IUpRight size={16} /></span>
            </button>
            <button className="btn btn-ghost-light btn-lg" onClick={() => scrollToId('walk')}>
              {t(L('Walk into the shop', 'দোকানে ঢুকুন'))} →
            </button>
          </motion.div>
          <motion.div className="hx-thumbs" initial={{ opacity: 0 }} animate={ready ? { opacity: 1 } : {}} transition={{ delay: 1.15 }}>
            {SLIDES.map((x, k) => (
              <button key={x.id} className={'hx-th' + (k === i ? ' on' : '')} onClick={() => setI(k)} aria-label={x.name.en}>
                <img src={img(x.photo, 160)} alt="" />
                {k === i && !paused && visible && (
                  <svg viewBox="0 0 44 44" aria-hidden>
                    <motion.circle cx="22" cy="22" r="20" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: DUR / 1000, ease: 'linear' }} key={i} />
                  </svg>
                )}
              </button>
            ))}
            <span className="hx-count">
              {num(i + 1)} / {num(SLIDES.length)}
            </span>
          </motion.div>
        </motion.div>

        <motion.div className="hx-stage" style={{ y: stageY }} onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}>
          <div className="hx-mandala" aria-hidden>
            <LogoMark size={520} />
          </div>
          <motion.div className="hx-arch-back" initial={{ opacity: 0, scale: 0.9 }} animate={ready ? { opacity: 1, scale: 1 } : {}} transition={{ delay: 0.4, duration: 1.2, ease }} />
          <motion.div
            className="hx-arch"
            style={{ rotateY: archRY, rotateX: archRX }}
            initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
            animate={ready ? { clipPath: 'inset(0% 0% 0% 0%)' } : {}}
            transition={{ delay: 0.25, duration: 1.3, ease: [0.76, 0, 0.24, 1] }}
            onClick={() => openQuick(s.id)}
            data-cursor="view"
          >
            <AnimatePresence initial={false}>
              <motion.img
                key={s.id}
                src={img(s.photo, 1100)}
                alt={t(s.name)}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ opacity: { duration: 1.1 }, scale: { duration: DUR / 1000 + 1, ease: 'linear' } }}
              />
            </AnimatePresence>
            <span className="hx-arch-shine" />
          </motion.div>

          <motion.div className="hx-seal" style={{ x: sealX }} initial={{ opacity: 0, scale: 0.6 }} animate={ready ? { opacity: 1, scale: 1 } : {}} transition={{ delay: 1, type: 'spring', stiffness: 160, damping: 14 }}>
            <svg viewBox="0 0 120 120" className="hx-seal-ring" aria-hidden>
              <defs>
                <path id="hxc" d="M60 60 m-46 0 a46 46 0 1 1 92 0 a46 46 0 1 1 -92 0" />
              </defs>
              <text>
                <textPath href="#hxc">{lang === 'bn' ? 'হাতে বোনা · খাঁটি তাঁত · শ্রীমতী বিতান · ' : 'HANDWOVEN · PURE LOOM · SRIMOTI BITAN · '}</textPath>
              </text>
            </svg>
            <LogoMark size={34} />
          </motion.div>

          <motion.button className="hx-card" style={{ x: cardX }} initial={{ opacity: 0, y: 30 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ delay: 1.1, duration: 0.8, ease }} onClick={() => openQuick(s.id)}>
            <AnimatePresence mode="wait">
              <motion.span key={s.id} className="hx-card-in" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35 }}>
                <img src={img(s.photo, 160)} alt="" />
                <span>
                  <small>{t(s.kind)}</small>
                  <b>{t(s.name)}</b>
                  <em>
                    {taka(s.price)} · {t(L('View', 'দেখুন'))} →
                  </em>
                </span>
              </motion.span>
            </AnimatePresence>
          </motion.button>

          <div className="hx-swatches" aria-hidden>
            {[s.look.body, s.look.border, s.look.zari].map((c, k) => (
              <motion.i key={s.id + k} style={{ background: c }} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 + k * 0.08, type: 'spring', stiffness: 300, damping: 15 }} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export function Ticker() {
  const { t } = useLang()
  const items = [
    [L('Weave Studio', 'তাঁত স্টুডিও'), L('Design your own saree, thread by thread', 'সুতো ধরে ধরে নিজের শাড়ি সাজান')],
    [L('Pure Jamdani', 'খাঁটি জামদানি'), L('UNESCO-listed weaving from Rupganj', 'ইউনেস্কো স্বীকৃত রূপগঞ্জের বুনন')],
    [L('Bridal', 'বিয়ের শাড়ি'), L('Benarasi & katan for every vow', 'প্রতিটি শুভক্ষণের বেনারসি ও কাতান')],
    [L('Fall & Pico', 'ফলস ও পিকো'), L('Ready to wear, done in-house', 'পরার জন্য প্রস্তুত, দোকানেই করা')],
    [L('64 Districts', '৬৪ জেলা'), L('Home delivery · cash on delivery', 'হোম ডেলিভারি · ক্যাশ অন ডেলিভারি')],
  ]
  const row = (
    <div className="ticker-row">
      {items.map(([a, b], k) => (
        <span key={k} className="tk">
          <b>{t(a)}</b> {t(b)} <i>◆</i>
        </span>
      ))}
    </div>
  )
  return (
    <div className="ticker" aria-hidden>
      <div className="ticker-track">
        {row}
        {row}
      </div>
    </div>
  )
}

export function Trust() {
  const { t } = useLang()
  const items = [
    { ic: '🧵', a: L('Straight from the weavers', 'তাঁতিদের কাছ থেকে সরাসরি'), b: L('Rupganj · Tangail · Rajshahi · Sylhet', 'রূপগঞ্জ · টাঙ্গাইল · রাজশাহী · সিলেট') },
    { ic: '🚚', a: L('All 64 districts', '৬৪ জেলায় ডেলিভারি'), b: L('Dhaka within 24 hours', 'ঢাকায় ২৪ ঘণ্টায়') },
    { ic: '💵', a: L('Cash on delivery', 'ক্যাশ অন ডেলিভারি'), b: L('or bKash · Nagad', 'অথবা বিকাশ · নগদ') },
    { ic: '✂️', a: L('Free fall & pico', 'ফ্রি ফলস ও পিকো'), b: L('Ready to wear on arrival', 'হাতে পেয়েই পরতে পারবেন') },
    { ic: '🔁', a: L('Easy exchange', 'সহজ বদল'), b: L('Within 3 days of delivery', 'ডেলিভারির ৩ দিনের মধ্যে') },
  ]
  return (
    <div className="trust wrap">
      {items.map((x, k) => (
        <motion.div key={k} className="trust-i" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: k * 0.08, duration: 0.7, ease }} whileHover={{ y: -4 }}>
          <span className="trust-ic">{x.ic}</span>
          <div>
            <b>{t(x.a)}</b>
            <small>{t(x.b)}</small>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
