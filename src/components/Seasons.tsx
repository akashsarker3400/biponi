import { motion } from 'motion/react'
import { SEASONS, img } from '../data'
import { L, useLang } from '../i18n'
import { SEASON_SAREE } from '../catalog'
import { useStore } from '../store'
import { SectionHead, Tilt, ease } from './ui'

/** Do-chala roof silhouette, the curved roofline of Bengal's terracotta temples. */
const CHALA = 'M0,0.27 C0.12,0.17 0.27,0.05 0.5,0.035 C0.73,0.05 0.88,0.17 1,0.27 L0.93,0.255 L0.93,1 L0.07,1 L0.07,0.255 Z'

export function ChalaDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
      <defs>
        <clipPath id="chala" clipPathUnits="objectBoundingBox">
          <path d={CHALA} />
        </clipPath>
        <pattern id="paisley" width="140" height="150" patternUnits="userSpaceOnUse">
          <g fill="#E8C46A">
            <path transform="translate(40 30) scale(2.6)" d="M8 20 C2 18 2 9 8 7 C13 5 15 1 13 0 C20 3 21 15 13 20 C11 21 9.5 21 8 20 Z" />
            <path transform="translate(110 105) scale(-1.6 1.6)" d="M8 20 C2 18 2 9 8 7 C13 5 15 1 13 0 C20 3 21 15 13 20 C11 21 9.5 21 8 20 Z" />
            <circle cx="104" cy="30" r="5" />
            <circle cx="30" cy="118" r="4" />
            {[0, 60, 120, 180, 240, 300].map((a) => (
              <ellipse key={a} cx="104" cy="30" rx="3" ry="9" transform={`rotate(${a} 104 30) translate(0 -11)`} />
            ))}
          </g>
          <g fill="#7A0E14">
            <circle cx="61" cy="70" r="5" />
          </g>
        </pattern>
        <filter id="silk" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.006 0.018" numOctaves="2" seed="4">
            <animate attributeName="baseFrequency" dur="7s" values="0.006 0.018;0.009 0.026;0.006 0.018" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" scale="16" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <clipPath id="arch" clipPathUnits="objectBoundingBox">
          <path d="M0,0.5 C0,0.22 0.22,0 0.5,0 C0.78,0 1,0.22 1,0.5 L1,1 L0,1 Z" />
        </clipPath>
      </defs>
    </svg>
  )
}

export function Seasons() {
  const { t } = useLang()
  const { openQuick } = useStore()
  return (
    <section className="section seasons" id="seasons">
      <div className="wrap">
        <SectionHead
          eyebrow={L('The Srimoti almanac', 'শ্রীমতীর পঞ্জিকা')}
          a={L('Six seasons.', 'ছয় ঋতু,')}
          b={L('Six drapes.', 'ছয় শাড়ি।')}
          side={L('Bengal dresses for six seasons, not four. Here is a saree for each one, from the heat of Boishakh to the yellow of Falgun.', 'বাংলার ঋতু চারটি নয়, ছয়টি। বৈশাখের রোদ থেকে ফাল্গুনের হলুদ, প্রতিটি ঋতুর জন্য আলাদা শাড়ি।')}
        />
        <div className="season-row">
          {SEASONS.map((s, k) => (
            <motion.article
              key={k}
              className="season"
              onClick={() => openQuick(SEASON_SAREE[k])}
              style={{ ['--tone' as string]: s.tone }}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1, ease, delay: k * 0.08 }}
            >
              <Tilt max={12}>
              <div className="season-frame" data-cursor="view">
                <svg className="kalash" viewBox="0 0 20 28" aria-hidden>
                  <path d="M10 0 L10 6" stroke="currentColor" strokeWidth="1.4" />
                  <circle cx="10" cy="8" r="2.4" fill="currentColor" />
                  <path d="M4 18 C4 12 16 12 16 18 C16 22 4 22 4 18Z" fill="currentColor" />
                  <path d="M6 22 H14 L13 27 H7Z" fill="currentColor" />
                </svg>
                <div className="season-img">
                  <img src={img(s.photo, 700)} alt={t(s.line)} loading="lazy" />
                  <div className="season-glow" />
                  <p className="season-line">{t(s.line)}</p>
                </div>
                <svg className="season-outline" viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden>
                  <path d={CHALA} vectorEffect="non-scaling-stroke" />
                </svg>
              </div>
              </Tilt>
              <h3>{t(s.name)}</h3>
              <p className="season-en">{s.en}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
