import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { RACK } from '../data'
import { L, useLang } from '../i18n'
import { useStore } from '../store'
import type { LightMood } from './Cloth3D'
import { Cloth3D } from './LazyCloth'
import { IBag } from './SareeArt'
import { HeartBtn, SectionHead } from './ui'

const MOODS: { key: LightMood; name: { en: string; bn: string }; ic: string }[] = [
  { key: 'day', name: L('Daylight', 'দিনের আলো'), ic: '☀' },
  { key: 'lamp', name: L('Lamplight', 'প্রদীপের আলো'), ic: '🪔' },
  { key: 'pandal', name: L('Pujo pandal', 'পূজা মণ্ডপ'), ic: '✦' },
]

export function Drape() {
  const { t, taka } = useLang()
  const { add } = useStore()
  const [i, setI] = useState(0)
  const [mood, setMood] = useState<LightMood>('day')
  const [wind, setWind] = useState(true)
  const [gust, setGust] = useState(0)
  const [touched, setTouched] = useState(false)
  const [mic, setMic] = useState<'off' | 'on' | 'denied'>('off')
  const [level, setLevel] = useState(0)
  const btn = useRef<HTMLButtonElement>(null)
  const stopMic = useRef<() => void>(() => {})
  const p = RACK[i]

  useEffect(() => () => stopMic.current(), [])

  const toggleMic = async () => {
    if (mic === 'on') {
      stopMic.current()
      setMic('off')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const ctx = new AudioContext()
      const an = ctx.createAnalyser()
      an.fftSize = 512
      ctx.createMediaStreamSource(stream).connect(an)
      const buf = new Uint8Array(an.fftSize)
      let raf = 0
      let lastGust = 0
      const tick = () => {
        an.getByteTimeDomainData(buf)
        let s = 0
        for (const v of buf) s += ((v - 128) / 128) ** 2
        const rms = Math.sqrt(s / buf.length)
        setLevel(Math.min(1, rms * 6))
        const now = performance.now()
        if (rms > 0.09 && now - lastGust > 350) {
          lastGust = now
          setGust((g) => g + 1)
          setTouched(true)
        }
        raf = requestAnimationFrame(tick)
      }
      tick()
      stopMic.current = () => {
        cancelAnimationFrame(raf)
        stream.getTracks().forEach((tr) => tr.stop())
        ctx.close()
        setLevel(0)
      }
      setMic('on')
    } catch {
      setMic('denied')
    }
  }

  return (
    <section className={'section drape mood-' + mood} id="drape">
      <div className="drape-bokeh" aria-hidden>
        {Array.from({ length: 14 }).map((_, k) => (
          <span key={k} style={{ left: `${(k * 37) % 100}%`, top: `${(k * 53) % 100}%`, animationDelay: `${k * 0.7}s`, width: 30 + (k % 4) * 22, height: 30 + (k % 4) * 22 }} />
        ))}
      </div>
      <div className="wrap">
        <SectionHead
          eyebrow={L('Live 3D · real cloth physics', 'লাইভ থ্রিডি · আসল কাপড়ের মতো')}
          a={L('Touch the', 'শাড়িটা')}
          b={L('saree.', 'ছুঁয়ে দেখুন।')}
          side={L('Grab the fabric and pull it. Turn on the fan, change the light, or blow into your mic and watch the anchol fly.', 'কাপড় ধরে টানুন, ফ্যান চালান, আলো বদলান। মাইকে ফুঁ দিলে আঁচল উড়বে।')}
        />
        <div className="drape-grid">
          <div className="drape-stage" data-cursor="drag">
            <Cloth3D look={p.look} mood={mood} wind={wind} gust={gust} onGrab={() => setTouched(true)} />
            <AnimatePresence>
              {!touched && (
                <motion.div className="drag-hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                  <motion.span className="hand" animate={{ x: [0, 46, 46, 0], y: [0, 18, 18, 0], scale: [1, 0.9, 0.9, 1] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}>
                    ☝
                  </motion.span>
                  <p>{t(L('Drag the fabric', 'কাপড় টেনে দেখুন'))}</p>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="stage-shadow" />
            <div className="mood-bar">
              {MOODS.map((m) => (
                <button key={m.key} className={mood === m.key ? 'on' : ''} onClick={() => setMood(m.key)}>
                  {mood === m.key && <motion.span layoutId="mood-pill" className="mood-pill" />}
                  <span>
                    {m.ic} {t(m.name)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="drape-panel">
            <p className="mini">{t(L('Choose a saree', 'শাড়ি বাছুন'))}</p>
            <div className="fabric-dots">
              {RACK.map((r, k) => (
                <motion.button
                  key={r.id}
                  className={'fdot' + (k === i ? ' on' : '')}
                  style={{ background: `linear-gradient(135deg, ${r.look.body} 0 62%, ${r.look.border} 62% 82%, ${r.look.zari} 82%)` }}
                  onClick={() => setI(k)}
                  whileHover={{ scale: 1.15, rotate: -8 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={r.name.en}
                  title={t(r.name)}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={p.id} className="drape-info" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35 }}>
                <h3>{t(p.name)}</h3>
                <p className="muted">{t(p.note)}</p>
                <b className="gold-price">{taka(p.price)}</b>
              </motion.div>
            </AnimatePresence>

            <div className="drape-ctrls">
              <button className={'ctrl' + (wind ? ' on' : '')} onClick={() => setWind((w) => !w)}>
                <span className={'fan' + (wind ? ' spin' : '')}>✢</span>
                {wind ? t(L('Fan on', 'ফ্যান চলছে')) : t(L('Fan off', 'ফ্যান বন্ধ'))}
              </button>
              <button className="ctrl" onClick={() => { setGust((g) => g + 1); setTouched(true) }}>
                <span>〰</span>
                {t(L('Blow a breeze', 'হাওয়া দিন'))}
              </button>
              <button className={'ctrl' + (mic === 'on' ? ' on' : '')} onClick={toggleMic}>
                <span className="mic-meter" style={{ ['--lv' as string]: level }}>🎤</span>
                {mic === 'on' ? t(L('Now blow into the mic!', 'এবার মাইকে ফুঁ দিন!')) : mic === 'denied' ? t(L('Mic blocked', 'মাইক বন্ধ')) : t(L('Blow with your mic', 'মাইকে ফুঁ দিন'))}
              </button>
            </div>

            <div className="drape-actions">
              <button ref={btn} className="btn btn-sindoor" onClick={() => add({ id: p.id, name: p.name, price: p.price, look: p.look, meta: p.note }, btn.current, p.look.body)}>
                {t(L('Add to bag', 'ব্যাগে নিন'))}
                <span className="btn-ic"><IBag size={15} /></span>
              </button>
              <HeartBtn item={{ id: p.id, name: p.name, price: p.price, look: p.look }} />
            </div>
            <p className="tiny">{t(L('Silk sheen and metallic zari are rendered live. Real fabric may vary slightly in colour.', 'রেশমের আভা আর জরির ঝলক লাইভ তৈরি হচ্ছে। আসল কাপড়ের রং সামান্য ভিন্ন হতে পারে।'))}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
