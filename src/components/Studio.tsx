import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useRef, useState, type ReactNode } from 'react'
import { BODY_COLORS, BORDER_COLORS, MOTIFS, WEAVES, ZARIS, type Look, type Motif } from '../data'
import { L, useLang } from '../i18n'
import { useStore } from '../store'
import { Cloth3D } from './LazyCloth'
import { IBag, IDice, SareeFlat, SareeHanging } from './SareeArt'
import { SectionHead } from './ui'

const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)]

export function Studio() {
  const { t, taka, num } = useLang()
  const { add } = useStore()
  const [weave, setWeave] = useState(0)
  const [body, setBody] = useState(1)
  const [border, setBorder] = useState(0)
  const [motif, setMotif] = useState<Motif>('jamdani')
  const [zari, setZari] = useState(0)
  const [view, setView] = useState<'flat' | 'hang' | '3d'>(() => (window.matchMedia('(pointer: coarse)').matches ? 'flat' : '3d'))
  const addRef = useRef<HTMLButtonElement>(null)

  const w = WEAVES[weave]
  const z = ZARIS[zari]
  const look: Look = {
    body: BODY_COLORS[body].c,
    border: BORDER_COLORS[border].c,
    zari: z.c || shade(BORDER_COLORS[border].c, BODY_COLORS[body].c),
    motif,
  }
  const motifAdd = motif === 'plain' ? 0 : motif === 'jamdani' ? 1800 : 900
  const price = w.base + z.add + motifAdd
  const name = useMemo(
    () => ({
      en: `${BODY_COLORS[body].n.en} ${w.name.en}, ${BORDER_COLORS[border].n.en} paar`,
      bn: `${BODY_COLORS[body].n.bn} ${w.name.bn}, ${BORDER_COLORS[border].n.bn} পাড়`,
    }),
    [body, border, w],
  )

  const surprise = () => {
    setWeave(Math.floor(Math.random() * WEAVES.length))
    setBody(Math.floor(Math.random() * BODY_COLORS.length))
    let b = Math.floor(Math.random() * BORDER_COLORS.length)
    if (BORDER_COLORS[b].c === BODY_COLORS[body].c) b = (b + 1) % BORDER_COLORS.length
    setBorder(b)
    setMotif(pick(MOTIFS).key)
    setZari(Math.floor(Math.random() * ZARIS.length))
  }

  return (
    <section className="section studio" id="studio">
      <div className="wrap">
        <SectionHead
          eyebrow={L('Made to order on our looms', 'আমাদের তাঁতে অর্ডারে বোনা')}
          a={L('The Weave', 'তাঁত')}
          b={L('Studio.', 'স্টুডিও।')}
          side={L('Choose the weave, the body colour, the paar and the motif. We send your design to the weaver, and your saree is made for you alone.', 'বুনন, জমিনের রং, পাড় আর নকশা বেছে নিন। আপনার নকশা চলে যাবে তাঁতির কাছে, বোনা হবে শুধু আপনার জন্য।')}
        />

        <div className="studio-grid">
          <div className="studio-stage">
            <div className="stage-top">
              <div className="seg">
                {(['3d', 'flat', 'hang'] as const).map((v) => (
                  <button key={v} className={view === v ? 'on' : ''} onClick={() => setView(v)}>
                    {view === v && <motion.span layoutId="seg-pill" className="seg-pill" />}
                    <span>{v === '3d' ? t(L('3D · touch it', 'থ্রিডি · ছুঁয়ে দেখুন')) : v === 'flat' ? t(L('Unfolded', 'খোলা ৬ গজ')) : t(L('Hanger', 'হ্যাঙ্গারে'))}</span>
                  </button>
                ))}
              </div>
              <button className="chip ghost" onClick={surprise}>
                <IDice size={16} /> {t(L('Surprise me', 'চমকে দিন'))}
              </button>
            </div>

            <div className="stage-canvas">
              <AnimatePresence mode="wait">
                {view === '3d' ? (
                  <motion.div key="3d" data-cursor="drag" className="stage-3d" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.5 }}>
                    <Cloth3D look={look} />
                  </motion.div>
                ) : view === 'flat' ? (
                  <motion.div key="flat" className="stage-flat" initial={{ opacity: 0, rotateX: 30, y: 30 }} animate={{ opacity: 1, rotateX: 12, y: 0 }} exit={{ opacity: 0, rotateX: 30, y: -20 }} transition={{ duration: 0.6 }}>
                    <SareeFlat look={look} />
                  </motion.div>
                ) : (
                  <motion.div key="hang" className="stage-hang" initial={{ opacity: 0, y: -60, rotate: -6 }} animate={{ opacity: 1, y: 0, rotate: [-6, 3, -1.5, 0] }} exit={{ opacity: 0, y: -40 }} transition={{ duration: 1 }}>
                    <SareeHanging look={look} />
                    <SareeHanging look={look} side="back" />
                  </motion.div>
                )}
              </AnimatePresence>
              {view !== '3d' && <div className="stage-labels">
                <span>{t(L('Body · jomin', 'জমিন'))}</span>
                <span>{t(L('Paar · border', 'পাড়'))}</span>
                <span>{t(L('Anchol · pallu', 'আঁচল'))}</span>
              </div>}
            </div>

            <div className="stage-foot">
              <div>
                <p className="mini">{t(L('Your design', 'আপনার নকশা'))}</p>
                <AnimatePresence mode="wait">
                  <motion.h3 key={name.en + motif} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                    {t(name)}
                  </motion.h3>
                </AnimatePresence>
                <p className="muted">
                  {t(MOTIFS.find((m) => m.key === motif)!.name)} · {t(z.name)} · {t(L(`Woven in about ${w.days} days`, `প্রায় ${num(w.days)} দিনে বোনা`))}
                </p>
              </div>
              <div className="stage-price">
                <motion.b key={price} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                  {taka(price)}
                </motion.b>
                <button
                  ref={addRef}
                  className="btn btn-sindoor"
                  onClick={() =>
                    add(
                      { id: 'custom', key: `custom-${weave}-${body}-${border}-${motif}-${zari}`, name, price, look, meta: L('Made to order · Weave Studio', 'অর্ডারে বোনা · তাঁত স্টুডিও') },
                      addRef.current,
                      look.body,
                    )
                  }
                >
                  {t(L('Order this weave', 'এই শাড়ি অর্ডার করুন'))}
                  <span className="btn-ic"><IBag size={15} /></span>
                </button>
              </div>
            </div>
          </div>

          <div className="studio-controls">
            <Group n="01" title={L('Weave', 'বুনন')}>
              <div className="weave-list">
                {WEAVES.map((x, k) => (
                  <button
                    key={x.key}
                    className={'weave' + (k === weave ? ' on' : '')}
                    onClick={() => {
                      setWeave(k)
                      setMotif(x.motif)
                    }}
                  >
                    <span>{t(x.name)}</span>
                    <small>{t(L('from', 'শুরু'))} {taka(x.base)}</small>
                  </button>
                ))}
              </div>
            </Group>
            <Group n="02" title={L('Jomin · body colour', 'জমিনের রং')} value={t(BODY_COLORS[body].n)}>
              <div className="swatches">
                {BODY_COLORS.map((x, k) => (
                  <button key={k} className={'sw' + (k === body ? ' on' : '')} style={{ background: x.c }} onClick={() => setBody(k)} aria-label={x.n.en} title={t(x.n)} />
                ))}
              </div>
            </Group>
            <Group n="03" title={L('Paar · border colour', 'পাড়ের রং')} value={t(BORDER_COLORS[border].n)}>
              <div className="swatches">
                {BORDER_COLORS.map((x, k) => (
                  <button key={k} className={'sw sw-border' + (k === border ? ' on' : '')} style={{ background: `linear-gradient(${x.c} 0 30%, ${BODY_COLORS[body].c} 30% 70%, ${x.c} 70%)` }} onClick={() => setBorder(k)} aria-label={x.n.en} title={t(x.n)} />
                ))}
              </div>
            </Group>
            <Group n="04" title={L('Nokshi · motif', 'নকশা')}>
              <div className="chips">
                {MOTIFS.map((m) => (
                  <button key={m.key} className={'chip' + (m.key === motif ? ' on' : '')} onClick={() => setMotif(m.key)}>
                    {t(m.name)}
                  </button>
                ))}
              </div>
            </Group>
            <Group n="05" title={L('Zari · thread', 'জরি')}>
              <div className="chips">
                {ZARIS.map((x, k) => (
                  <button key={x.key} className={'chip' + (k === zari ? ' on' : '')} onClick={() => setZari(k)}>
                    {x.c && <span className="zdot" style={{ background: x.c }} />}
                    {t(x.name)} {x.add > 0 && <em>+{taka(x.add)}</em>}
                  </button>
                ))}
              </div>
            </Group>
          </div>
        </div>
      </div>
    </section>
  )
}

function Group({ n, title, value, children }: { n: string; title: { en: string; bn: string }; value?: string; children: ReactNode }) {
  const { t } = useLang()
  return (
    <div className="group">
      <div className="group-h">
        <span className="gn">{n}</span>
        <span>{t(title)}</span>
        {value && <em>{value}</em>}
      </div>
      {children}
    </div>
  )
}

/** Thread-work colour when there is no zari: a lighter mix of border/body. */
function shade(a: string, b: string) {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
  const [x, y] = [p(a), p(b)]
  const lum = (c: number[]) => 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2]
  const base = lum(y) > 150 ? x : [255, 255, 255]
  return '#' + base.map((v, i) => Math.round(v * 0.7 + y[i] * 0.3).toString(16).padStart(2, '0')).join('')
}
