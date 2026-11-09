import { useEffect, useState } from 'react'

/** Diagnostic overlay: open the site with ?fps to see frame rate per section. */
export function Fps() {
  const [on] = useState(() => new URLSearchParams(location.search).has('fps'))
  const [st, setSt] = useState({ fps: 0, low: 0, sec: '' })
  useEffect(() => {
    if (!on) return
    let raf = 0
    let last = performance.now()
    let frames = 0
    let acc = 0
    let worst = 0
    let t0 = last
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      const d = now - last
      last = now
      frames++
      acc += d
      worst = Math.max(worst, d)
      if (now - t0 > 500) {
        const el = document.elementFromPoint(innerWidth / 2, innerHeight / 2)?.closest('section, footer') as HTMLElement | null
        setSt({ fps: Math.round((frames * 1000) / acc), low: Math.round(1000 / worst), sec: el?.id || el?.className.split(' ').pop() || '' })
        frames = 0
        acc = 0
        worst = 0
        t0 = now
      }
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [on])
  if (!on) return null
  const col = st.fps >= 55 ? '#3ad07a' : st.fps >= 40 ? '#f2c94c' : '#ff5a5a'
  return (
    <div style={{ position: 'fixed', zIndex: 200, left: 8, top: 44, padding: '6px 10px', borderRadius: 10, background: 'rgba(0,0,0,.78)', color: '#fff', font: '700 12px/1.4 ui-monospace, monospace', pointerEvents: 'none' }}>
      <div style={{ color: col }}>
        {st.fps} fps · low {st.low}
      </div>
      <div style={{ opacity: 0.8 }}>{st.sec}</div>
    </div>
  )
}
