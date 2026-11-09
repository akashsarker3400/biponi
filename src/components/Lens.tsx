import { AnimatePresence, motion } from 'motion/react'
import { useRef, useState, type ReactNode } from 'react'
import { L, useLang } from '../i18n'

/** Magnifying glass: renders `children` a second time, zoomed, inside a loupe. */
export function Lens({ children, zoom = 3.4, size = 170 }: { children: ReactNode; zoom?: number; size?: number }) {
  const { t } = useLang()
  const ref = useRef<HTMLDivElement>(null)
  const [pt, setPt] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const move = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect()
    setPt({ x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height })
  }
  return (
    <div ref={ref} className="lens-wrap" data-cursor="zoom" onPointerMove={move} onPointerDown={move} onPointerLeave={() => setPt(null)}>
      {children}
      <AnimatePresence>
        {pt && (
          <motion.div
            className="lens"
            style={{ width: size, height: size, left: pt.x - size / 2, top: pt.y - size / 2 }}
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.3, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
          >
            <div className="lens-inner" style={{ width: pt.w * zoom, height: pt.h * zoom, left: -(pt.x * zoom - size / 2), top: -(pt.y * zoom - size / 2) }}>
              {children}
            </div>
            <span className="lens-tag">×{zoom} · {t(L('THREAD VIEW', 'সুতোর কাছে'))}</span>
          </motion.div>
        )}
      </AnimatePresence>
      {!pt && <span className="lens-hint">{t(L('🔍 Hover to see the weave up close', '🔍 মাউস রাখুন, বুনন কাছ থেকে দেখুন'))}</span>}
    </div>
  )
}
