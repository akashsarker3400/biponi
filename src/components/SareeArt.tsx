import { useId, type ReactNode } from 'react'
import type { Look, Motif } from '../data'

const sid = (s: string) => s.replace(/[^a-zA-Z0-9]/g, '')
const T = { transition: 'fill .6s ease, stroke .6s ease' }

/** A repeating woven motif, drawn in zari over the body colour. */
export function MotifPattern({ id, motif, color, size = 26, opacity = 0.9 }: { id: string; motif: Motif; color: string; size?: number; opacity?: number }) {
  const s = size
  const h = s / 2
  const flower = (x: number, y: number, k = 1) => (
    <g transform={`translate(${x} ${y}) scale(${(s / 26) * k})`} key={`${x}-${y}`}>
      <path d="M0 -7 L2.4 0 L0 7 L-2.4 0 Z" style={{ fill: color, ...T }} />
      <path d="M-7 0 L0 -2.4 L7 0 L0 2.4 Z" style={{ fill: color, ...T }} opacity={0.75} />
      <circle r={1.3} fill="rgba(0,0,0,.25)" />
    </g>
  )
  let body = null
  switch (motif) {
    case 'jamdani':
      body = (
        <>
          {flower(h, h)}
          {[0, s].flatMap((x) => [0, s].map((y) => flower(x, y, 0.6)))}
        </>
      )
      break
    case 'buti':
      body = (
        <>
          <circle cx={h} cy={h} r={s * 0.07} style={{ fill: color, ...T }} />
          {[0, s].flatMap((x) => [0, s].map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r={s * 0.045} style={{ fill: color, ...T }} />))}
        </>
      )
      break
    case 'kolka':
      body = (
        <>
          <path
            transform={`translate(${h - 7} ${h - 9}) scale(${s / 30})`}
            d="M8 20 C2 18 2 9 8 7 C13 5 15 1 13 0 C20 3 21 15 13 20 C11 21 9.5 21 8 20 Z"
            style={{ fill: color, ...T }}
          />
          {[0, s].flatMap((x) => [0, s].map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r={s * 0.04} style={{ fill: color, ...T }} />))}
        </>
      )
      break
    case 'check':
      body = (
        <>
          <rect x={0} y={s * 0.42} width={s} height={s * 0.16} style={{ fill: color, ...T }} opacity={0.55} />
          <rect y={0} x={s * 0.42} height={s} width={s * 0.16} style={{ fill: color, ...T }} opacity={0.55} />
          <rect x={0} y={s * 0.49} width={s} height={s * 0.02} fill="rgba(255,255,255,.5)" />
        </>
      )
      break
    case 'stripe':
      body = (
        <>
          <rect x={s * 0.1} y={0} width={s * 0.08} height={s} style={{ fill: color, ...T }} />
          <rect x={s * 0.55} y={0} width={s * 0.03} height={s} style={{ fill: color, ...T }} opacity={0.7} />
        </>
      )
      break
    default:
      body = null
  }
  return (
    <pattern id={id} width={s} height={s} patternUnits="userSpaceOnUse">
      <g opacity={opacity}>{body}</g>
    </pattern>
  )
}

/** A saree draped over a wooden hanger. `side='back'` shows the pallu. */
export function SareeHanging({ look, side = 'front', className }: { look: Look; side?: 'front' | 'back'; className?: string }) {
  const u = sid(useId())
  const fabric =
    'M36 62 L164 62 L171 268 Q160 282 149 270 Q137 285 124 272 Q111 287 98 273 Q85 287 72 272 Q60 285 49 270 Q38 281 28 268 Z'
  const back = 'M44 62 L156 62 L164 256 Q140 266 100 262 Q62 266 36 256 Z'
  const pallu = side === 'back'
  return (
    <svg viewBox="0 0 200 300" className={className} aria-hidden>
      <defs>
        <MotifPattern id={`m${u}`} motif={look.motif} color={look.zari} size={pallu ? 18 : 24} />
        <MotifPattern id={`b${u}`} motif="jamdani" color={look.zari} size={12} />
        <linearGradient id={`f${u}`} x1="0" x2="1" y1="0" y2="0">
          {Array.from({ length: 9 }).map((_, i) => (
            <stop key={i} offset={`${(i / 8) * 100}%`} stopColor={i % 2 ? '#000' : '#fff'} stopOpacity={i % 2 ? 0.2 : 0.1} />
          ))}
        </linearGradient>
        <linearGradient id={`t${u}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity=".35" />
          <stop offset=".12" stopColor="#000" stopOpacity="0" />
          <stop offset=".85" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".18" />
        </linearGradient>
        <linearGradient id={`w${u}`} x1="0" x2="1">
          <stop offset="0" stopColor="#8A5530" />
          <stop offset=".5" stopColor="#B9824F" />
          <stop offset="1" stopColor="#7A4726" />
        </linearGradient>
        <clipPath id={`c${u}`}>
          <path d={fabric} />
        </clipPath>
      </defs>

      {/* back layer for depth */}
      <path d={back} style={{ fill: look.body, ...T }} />
      <path d={back} fill="rgba(0,0,0,.35)" />

      {/* hook + hanger */}
      <path d="M100 40 L100 22 C100 10 114 9 114 19" fill="none" stroke="#9EA3AA" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M24 64 L100 38 L176 64" fill="none" stroke={`url(#w${u})`} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />

      {/* front fabric */}
      <g clipPath={`url(#c${u})`}>
        <path d={fabric} style={{ fill: look.body, ...T }} />
        <rect x="0" y="0" width="200" height="300" fill={`url(#m${u})`} />
        {pallu ? (
          <g>
            {[96, 150, 204].map((y) => (
              <g key={y}>
                <rect x="0" y={y} width="200" height="16" style={{ fill: look.border, ...T }} />
                <rect x="0" y={y + 3} width="200" height="2" style={{ fill: look.zari, ...T }} />
                <rect x="0" y={y + 11} width="200" height="2" style={{ fill: look.zari, ...T }} />
              </g>
            ))}
          </g>
        ) : (
          <g>
            <rect x="0" y="236" width="200" height="64" style={{ fill: look.border, ...T }} />
            <rect x="0" y="244" width="200" height="12" fill={`url(#b${u})`} />
            <rect x="0" y="239" width="200" height="2" style={{ fill: look.zari, ...T }} />
            <rect x="0" y="259" width="200" height="2" style={{ fill: look.zari, ...T }} />
            {/* side border */}
            <rect x="158" y="62" width="14" height="240" style={{ fill: look.border, ...T }} />
            <rect x="161" y="62" width="2" height="240" style={{ fill: look.zari, ...T }} />
          </g>
        )}
        <rect x="0" y="0" width="200" height="300" fill={`url(#f${u})`} />
        <rect x="0" y="0" width="200" height="300" fill={`url(#t${u})`} />
      </g>
      {/* fold over the bar */}
      <path d="M34 60 Q100 52 166 60 L166 70 Q100 62 34 70 Z" style={{ fill: look.body, ...T }} />
      <path d="M34 60 Q100 52 166 60 L166 70 Q100 62 34 70 Z" fill="rgba(255,255,255,.18)" />
    </svg>
  )
}

/** A saree laid fully open: body, top/bottom paar, pallu, tassels. */
export function SareeFlat({ look, className }: { look: Look; className?: string }) {
  const u = sid(useId())
  const W = 640
  const pX = 450
  return (
    <svg viewBox={`0 0 ${W} 260`} className={className} aria-hidden>
      <defs>
        <MotifPattern id={`m${u}`} motif={look.motif} color={look.zari} size={26} />
        <MotifPattern id={`d${u}`} motif={look.motif === 'plain' ? 'buti' : look.motif} color={look.zari} size={16} />
        <MotifPattern id={`b${u}`} motif="jamdani" color={look.zari} size={13} />
        <linearGradient id={`s${u}`} x1="0" x2="1" y1="0" y2="0.2">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".45" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".28" />
          <stop offset=".55" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
          <animate attributeName="x1" values="-1;1" dur="5s" repeatCount="indefinite" />
          <animate attributeName="x2" values="0;2" dur="5s" repeatCount="indefinite" />
        </linearGradient>
        <linearGradient id={`v${u}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity=".18" />
          <stop offset=".2" stopColor="#000" stopOpacity="0" />
          <stop offset=".8" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".22" />
        </linearGradient>
        <clipPath id={`c${u}`}>
          <path d={`M8 34 Q160 26 320 34 T${W - 22} 32 L${W - 22} 226 Q480 234 320 226 T8 228 Z`} />
        </clipPath>
      </defs>
      <ellipse cx={W / 2} cy={242} rx={W / 2 - 20} ry={10} fill="rgba(60,20,10,.12)" />
      <g clipPath={`url(#c${u})`}>
        <rect width={W} height={260} style={{ fill: look.body, ...T }} />
        <rect width={pX} height={260} fill={`url(#m${u})`} />
        {/* paar top / bottom */}
        {[26, 194].map((y) => (
          <g key={y}>
            <rect x="0" y={y} width={W} height={40} style={{ fill: look.border, ...T }} />
            <rect x="0" y={y + 14} width={W} height={13} fill={`url(#b${u})`} />
            <rect x="0" y={y + (y < 100 ? 37 : 1)} width={W} height="2.4" style={{ fill: look.zari, ...T }} />
            <rect x="0" y={y + (y < 100 ? 8 : 30)} width={W} height="1.4" style={{ fill: look.zari, ...T }} />
          </g>
        ))}
        {/* pallu */}
        <rect x={pX} y="0" width={W - pX} height="260" fill={`url(#d${u})`} />
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <rect x={pX + i * 46} y="0" width={18} height="260" style={{ fill: look.border, ...T }} />
            <rect x={pX + i * 46 + 4} y="0" width={2} height="260" style={{ fill: look.zari, ...T }} />
            <rect x={pX + i * 46 + 12} y="0" width={2} height="260" style={{ fill: look.zari, ...T }} />
          </g>
        ))}
        <rect width={W} height={260} fill={`url(#v${u})`} />
        <rect width={W} height={260} fill={`url(#s${u})`} />
      </g>
      {/* tassels */}
      {Array.from({ length: 30 }).map((_, i) => (
        <line key={i} x1={W - 22} x2={W - 8 + (i % 3)} y1={40 + i * 6.3} y2={42 + i * 6.3} style={{ stroke: i % 4 === 0 ? look.zari : look.border, ...T }} strokeWidth="1.6" strokeLinecap="round" />
      ))}
    </svg>
  )
}

/** Alpona-inspired mark: eight petals around a bindu. */
export function LogoMark({ size = 38, draw = false, color = 'currentColor' }: { size?: number; draw?: boolean; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={draw ? 'logo-draw' : undefined} aria-hidden>
      <circle cx="32" cy="32" r="29" fill="none" stroke={color} strokeWidth="1.4" pathLength={1} />
      <circle cx="32" cy="32" r="25.5" fill="none" stroke={color} strokeWidth=".6" strokeDasharray=".02 .02" pathLength={1} />
      {Array.from({ length: 8 }).map((_, i) => (
        <path
          key={i}
          transform={`rotate(${i * 45} 32 32)`}
          d="M32 9 C37.5 15 37.5 22 32 27.5 C26.5 22 26.5 15 32 9 Z"
          fill="none"
          stroke={color}
          strokeWidth="1.3"
          pathLength={1}
        />
      ))}
      {Array.from({ length: 8 }).map((_, i) => (
        <circle key={i} cx={32 + 20 * Math.cos(((i * 45 + 22.5) * Math.PI) / 180)} cy={32 + 20 * Math.sin(((i * 45 + 22.5) * Math.PI) / 180)} r="1.3" fill={color} />
      ))}
      <circle cx="32" cy="32" r="3.2" fill={color} />
    </svg>
  )
}

/* ---------- tiny icon set ---------- */
type IP = { size?: number }
const ic = (d: ReactNode) =>
  function Icon({ size = 18 }: IP) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {d}
      </svg>
    )
  }
export const IHeart = ic(<path d="M12 20s-7-4.4-9.2-8.6C1.2 8.2 3 4.8 6.4 4.5 8.6 4.3 10.3 5.6 12 7.6c1.7-2 3.4-3.3 5.6-3.1 3.4.3 5.2 3.7 3.6 6.9C19 15.6 12 20 12 20z" />)
export const IBag = ic(<><path d="M5 8h14l-1.2 12.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></>)
export const IArrow = ic(<><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>)
export const IArrowL = ic(<><path d="M19 12H5" /><path d="m11 6-6 6 6 6" /></>)
export const IUpRight = ic(<><path d="M7 17 17 7" /><path d="M8 7h9v9" /></>)
export const IPlus = ic(<><path d="M12 5v14" /><path d="M5 12h14" /></>)
export const IMinus = ic(<path d="M5 12h14" />)
export const IClose = ic(<><path d="M6 6l12 12" /><path d="M18 6 6 18" /></>)
export const IMenu = ic(<><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h10" /></>)
export const IDice = ic(<><rect x="4" y="4" width="16" height="16" rx="3" /><circle cx="9" cy="9" r=".9" fill="currentColor" /><circle cx="15" cy="15" r=".9" fill="currentColor" /><circle cx="15" cy="9" r=".9" fill="currentColor" /><circle cx="9" cy="15" r=".9" fill="currentColor" /></>)
export const IPin = ic(<><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></>)
export const IClock = ic(<><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>)
export const IPhone = ic(<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z" />)
export const ITruck = ic(<><path d="M3 6h11v10H3z" /><path d="M14 10h4l3 3v3h-7" /><circle cx="7" cy="18" r="1.8" /><circle cx="17" cy="18" r="1.8" /></>)
export const IShield = ic(<><path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z" /><path d="m9 12 2 2 4-4" /></>)
export const IPlay = ic(<path d="M8 5v14l11-7z" fill="currentColor" />)
export const IPause = ic(<><path d="M9 5v14" /><path d="M15 5v14" /></>)
export const IChat = ic(<path d="M4 19.5 5.3 15A8 8 0 1 1 9 18.7z" />)
export const ISearch = ic(<><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></>)
export const IUp = ic(<><path d="M12 19V5" /><path d="m6 11 6-6 6 6" /></>)
