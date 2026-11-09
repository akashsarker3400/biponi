import { animate, motion, useInView, useMotionValue, useScroll, useTransform } from 'motion/react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { img } from '../data'
import { L, useLang, type Txt } from '../i18n'
import { Alpona } from './ui'

const PANELS: { photo: string; place: Txt; craft: Txt; text: Txt }[] = [
  {
    photo: '1719154717733-d37860cdee24',
    place: L('Rupganj, Narayanganj', 'রূপগঞ্জ, নারায়ণগঞ্জ'),
    craft: L('Jamdani', 'জামদানি'),
    text: L(
      'The motifs are not drawn. They are woven in by hand, one extra weft at a time, from memory. UNESCO listed Jamdani weaving as intangible cultural heritage in 2013.',
      'নকশা কাগজে আঁকা থাকে না। তাঁতি মনে রেখে হাতে একটি একটি সুতো তুলে নকশা বোনেন। ২০১৩ সালে ইউনেস্কো জামদানিকে বিশ্বের অপরিমেয় সাংস্কৃতিক ঐতিহ্যের স্বীকৃতি দেয়।',
    ),
  },
  {
    photo: '1714245145426-c8565109aa34',
    place: L('Pathrail, Tangail', 'পাথরাইল, টাঙ্গাইল'),
    craft: L('Tant', 'তাঁত'),
    text: L('The clack of the shuttle loom sets the rhythm of the village. Fine cotton, a crisp paar, and a drape that softens with every wash.', 'মাকুর খটখট শব্দেই গ্রামের ছন্দ। মিহি সুতি, টানটান পাড়, আর প্রতিবার ধোয়ায় আরও নরম হয়ে ওঠা শাড়ি।'),
  },
  {
    photo: '1640292343595-889db1c8262e',
    place: L('Sopura, Rajshahi', 'সপুরা, রাজশাহী'),
    craft: L('Silk', 'রেশম'),
    text: L('Silk from mulberry-fed cocoons, reeled and woven in Bangladesh’s silk city. Light as air, with a glow that catches every lamp.', 'তুঁত পাতা খাওয়া গুটি থেকে রেশম, রেশম নগরীতেই সুতো কাটা আর বোনা। বাতাসের মতো হালকা, প্রদীপের আলোয় ঝলমলে।'),
  },
  {
    photo: '1739185127141-bb4aa70ad22a',
    place: L('Sylhet', 'সিলেট'),
    craft: L('Monipuri', 'মণিপুরী'),
    text: L('Hand-spun and loin-loom woven by Monipuri families, with the temple-stripe border that gives these sarees their name.', 'মণিপুরী পরিবারের হাতে কাটা সুতো আর কোমর-তাঁতে বোনা, মন্দির-রেখার পাড়েই এই শাড়ির পরিচয়।'),
  },
]

function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const { num } = useLang()
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!inView) return
    const c = animate(0, to, { duration: 2, ease: [0.22, 1, 0.36, 1], onUpdate: (x) => setV(Math.round(x)) })
    return () => c.stop()
  }, [inView, to])
  return (
    <span ref={ref}>
      {num(v)}
      {suffix}
    </span>
  )
}

export function Looms() {
  const { t } = useLang()
  const ref = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const [dist, setDist] = useState(0)
  const [wide, setWide] = useState(true)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const x = useTransform(scrollYProgress, [0, 1], [0, -dist])
  const zero = useMotionValue(0)
  const bar = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  useLayoutEffect(() => {
    const m = () => {
      const w = window.innerWidth > 860
      setWide(w)
      if (track.current) setDist(Math.max(0, track.current.scrollWidth - window.innerWidth))
    }
    m()
    window.addEventListener('resize', m)
    return () => window.removeEventListener('resize', m)
  }, [])

  return (
    <section className="looms" id="looms" ref={ref} style={wide ? { height: `calc(100vh + ${dist}px)` } : undefined}>
      <div
        className="looms-sticky"
        onPointerMove={(e) => {
          e.currentTarget.style.setProperty('--px', String(e.clientX / window.innerWidth - 0.5))
          e.currentTarget.style.setProperty('--py', String(e.clientY / window.innerHeight - 0.5))
        }}
      >
        <motion.div className="looms-track" ref={track} style={{ x: wide ? x : zero }}>
          <div className="loom-intro">
            <p className="eyebrow light">
              <span className="eyebrow-line" />
              {t(L('The looms behind the name', 'নামের পেছনের তাঁতঘর'))}
            </p>
            <h2 className="h2 light">
              {t(L('From the loom', 'তাঁত থেকে'))}
              <br />
              <span className="grad-gold">{t(L('to your anchol.', 'আপনার আঁচলে।'))}</span>
            </h2>
            <p className="loom-lede">
              {t(
                L(
                  'Every Srimoti Bitan saree comes from a weaving family we know by name. We pay the weaver fairly, we pay on time, and we tell you where your saree was born.',
                  'শ্রীমতী বিতানের প্রতিটি শাড়ি আসে এমন তাঁতি পরিবার থেকে, যাদের আমরা নামে চিনি। ন্যায্য দাম, সময়মতো মজুরি, আর আপনার শাড়ির জন্মস্থানের গল্প।',
                ),
              )}
            </p>
            <Alpona className="gold" />
            {wide && <p className="loom-hint">{t(L('Scroll to walk through the villages →', 'স্ক্রল করে গ্রামগুলো ঘুরে দেখুন →'))}</p>}
          </div>

          {PANELS.map((p, k) => (
            <article className={'loom-panel' + (k % 2 ? ' low' : '')} key={k}>
              <div className="loom-img">
                <img src={img(p.photo, 1100)} alt={t(p.craft)} loading="lazy" />
                <span className="loom-no">0{k + 1}</span>
              </div>
              <div className="loom-text">
                <p className="loom-place">{t(p.place)}</p>
                <h3>{t(p.craft)}</h3>
                <p>{t(p.text)}</p>
              </div>
            </article>
          ))}

          <div className="loom-stats">
            <div>
              <b><Counter to={120} suffix="+" /></b>
              <p>{t(L('weaving families', 'তাঁতি পরিবার'))}</p>
            </div>
            <div>
              <b><Counter to={18} /></b>
              <p>{t(L('weaving villages', 'তাঁতগ্রাম'))}</p>
            </div>
            <div>
              <b><Counter to={4800} suffix="+" /></b>
              <p>{t(L('sarees delivered', 'শাড়ি পৌঁছেছে'))}</p>
            </div>
            <div>
              <b><Counter to={64} /></b>
              <p>{t(L('districts we deliver to', 'জেলায় ডেলিভারি'))}</p>
            </div>
          </div>
        </motion.div>
        {wide && (
          <div className="looms-progress">
            <motion.span style={{ width: bar }} />
          </div>
        )}
      </div>
    </section>
  )
}
