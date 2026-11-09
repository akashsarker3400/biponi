import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform } from 'motion/react'
import { Fragment, useEffect, useRef, useState } from 'react'
import { HERO_SLIDES, img } from '../data'
import { L, useLang } from '../i18n'
import { IUpRight } from './SareeArt'
import { SilkCanvas } from './SilkCanvas'
import { ease, scrollToId } from './ui'

const DUR = 6500

export function Hero({ ready }: { ready: boolean }) {
  const { t, lang, num } = useLang()
  const [i, setI] = useState(0)
  const [gl, setGl] = useState(false)
  const [fine] = useState(() => window.matchMedia('(pointer: fine)').matches)
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '22%'])
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '40%'])
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  // mouse parallax + spotlight
  const mx = useSpring(useMotionValue(0), { stiffness: 60, damping: 18 })
  const my = useSpring(useMotionValue(0), { stiffness: 60, damping: 18 })
  const imgX = useTransform(mx, (v) => v * -36)
  const imgRY = useTransform(mx, (v) => v * 3)
  const textX = useTransform(mx, (v) => v * 18)
  const chipX = useTransform(mx, (v) => v * 30)
  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width - 0.5)
    my.set((e.clientY - r.top) / r.height - 0.5)
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  useEffect(() => {
    const id = setInterval(() => setI((x) => (x + 1) % HERO_SLIDES.length), DUR)
    return () => clearInterval(id)
  }, [])

  const head = lang === 'bn' ? ['বাংলার', 'তাঁতে,', 'আপনার', 'আঁচলে।'] : ['Draped', 'in', 'the', 'looms', 'of', 'Bengal.']

  return (
    <section className="hero" id="top" ref={ref} onPointerMove={onMove} onPointerLeave={() => { mx.set(0); my.set(0) }}>
      <motion.div className={'hero-media' + (gl ? ' gl' : '')} style={{ y: imgY, x: imgX, rotateY: imgRY }}>
        {fine && <SilkCanvas src={img(HERO_SLIDES[i].photo, 1400)} dur={DUR / 1000} onReady={setGl} />}
        <AnimatePresence initial={false}>
          <motion.img
            key={i}
            src={img(HERO_SLIDES[i].photo, fine ? 2000 : 900)}
            alt=""
            initial={{ opacity: 0, scale: 1.12 }}
            animate={{ opacity: 1, scale: 1.02 }}
            exit={{ opacity: 0 }}
            transition={{ opacity: { duration: 1.4 }, scale: { duration: DUR / 1000 + 1.4, ease: 'linear' } }}
          />
        </AnimatePresence>
        <div className="hero-shade" />
      </motion.div>
      <div className="hero-reveal" aria-hidden />
      <div className="hero-glow" aria-hidden />

      <motion.div className="hero-content wrap" style={{ y: textY, x: textX, opacity: fade }}>
        <motion.p className="hero-chip" style={{ x: chipX }} initial={{ opacity: 0, y: 16 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.2, duration: 0.8, ease }}>
          <span className="dot" />
          {t(L('Jamdani · Tangail Tant · Rajshahi Silk · Katan', 'জামদানি · টাঙ্গাইল তাঁত · রাজশাহী সিল্ক · কাতান'))}
        </motion.p>
        <h1 className="hero-title" key={lang}>
          {head.map((w, k) => (
            <Fragment key={k}>
              <span className="mask">
                <motion.span initial={{ y: '110%' }} animate={ready ? { y: '0%' } : {}} transition={{ delay: 0.35 + k * 0.09, duration: 1, ease }}>
                  {w}
                </motion.span>
              </span>
              {lang === 'bn' && k === 1 && <br />}
            </Fragment>
          ))}
        </h1>
        <motion.p className="hero-sub" initial={{ opacity: 0, y: 16 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.9, duration: 0.8, ease }}>
          {t(
            L(
              'Jamdani from Rupganj, tant from Tangail, silk from Rajshahi. Handpicked from the weavers who make them and brought to your door anywhere in Bangladesh.',
              'রূপগঞ্জের জামদানি, টাঙ্গাইলের তাঁত, রাজশাহীর রেশম। তাঁতিদের হাত থেকে সরাসরি বাছাই করা, পৌঁছে যাবে বাংলাদেশের যেকোনো ঠিকানায়।',
            ),
          )}
        </motion.p>
        <motion.div className="hero-ctas" initial={{ opacity: 0, y: 16 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ delay: 1.05, duration: 0.8, ease }}>
          <button className="btn btn-sindoor btn-lg" onClick={() => scrollToId('studio')}>
            {t(L('Design your saree', 'নিজের শাড়ি সাজান'))}
            <span className="btn-ic"><IUpRight size={16} /></span>
          </button>
          <button className="btn btn-white btn-lg" onClick={() => scrollToId('rail')}>
            {t(L('Browse the rail', 'কালেকশন দেখুন'))}
            <span className="btn-ic"><IUpRight size={16} /></span>
          </button>
        </motion.div>
      </motion.div>

      <div className="hero-count" aria-hidden>
        <AnimatePresence mode="wait">
          <motion.b key={i} initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '-100%' }} transition={{ duration: 0.5, ease }}>
            {num(i + 1).padStart(2, lang === 'bn' ? '০' : '0')}
          </motion.b>
        </AnimatePresence>
        <span>/ {num(HERO_SLIDES.length).padStart(2, lang === 'bn' ? '০' : '0')}</span>
      </div>
      <div className="hero-slides wrap">
        {HERO_SLIDES.map((s, k) => (
          <button key={k} className={'hs' + (k === i ? ' on' : '')} onClick={() => setI(k)}>
            <span className="hs-bar">{k === i && <motion.span key={i} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: DUR / 1000, ease: 'linear' }} />}</span>
            <span className="hs-cap">{t(s.cap)}</span>
          </button>
        ))}
      </div>

      <div className="scroll-cue" aria-hidden>
        <span />
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
