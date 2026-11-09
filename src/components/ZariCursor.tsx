import { useEffect, useRef, useState } from 'react'

/** A golden zari thread that trails the cursor (desktop only). */
export function ZariCursor() {
  const ref = useRef<HTMLCanvasElement>(null)
  const [on] = useState(() => window.matchMedia('(pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    if (!on) return
    if (!window.matchMedia('(pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const c = ref.current!
    const x = c.getContext('2d')!
    const N = 26
    const pts = Array.from({ length: N }, () => ({ x: -100, y: -100 }))
    const m = { x: -100, y: -100 }
    let raf = 0
    let idle = 0
    const size = () => {
      const d = Math.min(2, devicePixelRatio)
      c.width = innerWidth * d
      c.height = innerHeight * d
      x.setTransform(d, 0, 0, d, 0, 0)
    }
    size()
    const mv = (e: PointerEvent) => {
      m.x = e.clientX
      m.y = e.clientY
      idle = 0
    }
    const loop = () => {
      raf = requestAnimationFrame(loop)
      idle++
      pts[0].x += (m.x - pts[0].x) * 0.55
      pts[0].y += (m.y - pts[0].y) * 0.55
      for (let i = 1; i < N; i++) {
        pts[i].x += (pts[i - 1].x - pts[i].x) * 0.42
        pts[i].y += (pts[i - 1].y - pts[i].y) * 0.42 + 0.35 // a little gravity: it hangs like thread
      }
      x.clearRect(0, 0, innerWidth, innerHeight)
      if (idle > 90) return
      const g = x.createLinearGradient(pts[0].x, pts[0].y, pts[N - 1].x, pts[N - 1].y)
      g.addColorStop(0, 'rgba(240,207,119,0.95)')
      g.addColorStop(0.5, 'rgba(201,160,74,0.7)')
      g.addColorStop(1, 'rgba(201,160,74,0)')
      x.strokeStyle = g
      x.lineCap = 'round'
      x.lineWidth = 1.6
      x.beginPath()
      x.moveTo(pts[0].x, pts[0].y)
      for (let i = 1; i < N - 1; i++) {
        const mx = (pts[i].x + pts[i + 1].x) / 2
        const my = (pts[i].y + pts[i + 1].y) / 2
        x.quadraticCurveTo(pts[i].x, pts[i].y, mx, my)
      }
      x.stroke()
      x.fillStyle = '#F0CF77'
      x.beginPath()
      x.arc(pts[0].x, pts[0].y, 2.4, 0, Math.PI * 2)
      x.fill()
    }
    loop()
    addEventListener('pointermove', mv)
    addEventListener('resize', size)
    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('pointermove', mv)
      removeEventListener('resize', size)
    }
  }, [on])
  return on ? <canvas ref={ref} className="zari-cursor" aria-hidden /> : null
}
