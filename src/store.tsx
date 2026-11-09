import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { Txt } from './i18n'
import type { Look } from './data'
import { useOps } from './ops'

export type CartItem = {
  key: string
  id: string
  name: Txt
  meta?: Txt
  price: number
  qty: number
  look?: Look
  photo?: string
}
export type WishItem = Omit<CartItem, 'qty' | 'key'>

type Fly = { id: number; x: number; y: number; color: string }
type Toast = { id: number; text: Txt }

type Ctx = {
  cart: CartItem[]
  wish: WishItem[]
  add: (item: Omit<CartItem, 'qty' | 'key'> & { key?: string }, from?: HTMLElement | null, color?: string) => void
  setQty: (key: string, qty: number) => void
  remove: (key: string) => void
  clear: () => void
  toggleWish: (item: WishItem) => void
  isWished: (id: string) => boolean
  drawer: null | 'bag' | 'wish'
  setDrawer: (d: null | 'bag' | 'wish') => void
  flies: Fly[]
  toasts: Toast[]
  bump: number
  toast: (t: Txt) => void
  quick: string | null
  openQuick: (id: string | null) => void
  added: (CartItem & { n: number }) | null
  clearAdded: () => void
}

const StoreContext = createContext<Ctx | null>(null)

function load<T>(k: string, fallback: T): T {
  try {
    const v = localStorage.getItem(k)
    return v ? (JSON.parse(v) as T) : fallback
  } catch {
    return fallback
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => load('sb-cart', []))
  const [wish, setWish] = useState<WishItem[]>(() => load('sb-wish', []))
  const [drawer, setDrawer] = useState<null | 'bag' | 'wish'>(null)
  const [flies, setFlies] = useState<Fly[]>([])
  const [toasts, setToasts] = useState<Toast[]>([])
  const [bump, setBump] = useState(0)
  const [added, setAdded] = useState<(CartItem & { n: number }) | null>(null)
  const addedTimer = useRef(0)
  const [quick, setQuick] = useState<string | null>(() => {
    const m = location.hash.match(/^#\/saree\/(.+)$/)
    return m ? decodeURIComponent(m[1]) : null
  })
  const openQuick = (id: string | null) => {
    setQuick(id)
    const base = location.pathname + location.search
    history.replaceState(null, '', id ? `${base}#/saree/${id}` : base)
  }
  const seq = useRef(0)

  useEffect(() => localStorage.setItem('sb-cart', JSON.stringify(cart)), [cart])
  // shared links like #/saree/n7 open the product view
  useEffect(() => {
    const on = () => {
      const m = location.hash.match(/^#\/saree\/(.+)$/)
      setQuick(m ? decodeURIComponent(m[1]) : null)
    }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  useEffect(() => localStorage.setItem('sb-wish', JSON.stringify(wish)), [wish])

  const toast = useCallback((text: Txt) => {
    const id = ++seq.current
    setToasts((t) => [...t, { id, text }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600)
  }, [])

  const ops = useOps()
  const inBag = (id: string) => cart.filter((x) => x.id === id).reduce((a, x) => a + x.qty, 0)
  /** Stock guard: refuses (with a message) when the shelf would run out. */
  const canTake = (id: string, name: Txt, extra = 1) => {
    const left = ops.stockOf(id)
    if (left === undefined) return true
    if (left === 0) {
      toast({ en: `Sorry, ${name.en} is sold out`, bn: `দুঃখিত, ${name.bn} স্টকে নেই` })
      return false
    }
    if (inBag(id) + extra > left) {
      toast({ en: `Only ${left} left of ${name.en}`, bn: `${name.bn} আর মাত্র ${left.toLocaleString('bn-BD')}টি আছে` })
      return false
    }
    return true
  }

  const add: Ctx['add'] = (item, from, color = '#C9A04A') => {
    const key = item.key ?? item.id
    if (!canTake(item.id, item.name)) return
    setCart((c) => {
      const ex = c.find((x) => x.key === key)
      if (ex) return c.map((x) => (x.key === key ? { ...x, qty: x.qty + 1 } : x))
      return [...c, { ...item, key, qty: 1 }]
    })
    if (from) {
      const r = from.getBoundingClientRect()
      const id = ++seq.current
      setFlies((f) => [...f, { id, x: r.left + r.width / 2, y: r.top + r.height / 2, color }])
      setTimeout(() => {
        setFlies((f) => f.filter((x) => x.id !== id))
        setBump((b) => b + 1)
      }, 750)
    } else setBump((b) => b + 1)
    const n = ++seq.current
    setAdded({ ...item, key, qty: 1, n })
    clearTimeout(addedTimer.current)
    addedTimer.current = window.setTimeout(() => setAdded(null), 4200)
  }

  const value: Ctx = {
    cart,
    wish,
    add,
    setQty: (key, qty) => {
      const it = cart.find((x) => x.key === key)
      if (it && qty > it.qty && !canTake(it.id, it.name, qty - it.qty)) return
      setCart((c) => (qty <= 0 ? c.filter((x) => x.key !== key) : c.map((x) => (x.key === key ? { ...x, qty } : x))))
    },
    remove: (key) => setCart((c) => c.filter((x) => x.key !== key)),
    clear: () => setCart([]),
    toggleWish: (item) => {
      if (wish.some((x) => x.id === item.id)) {
        setWish((w) => w.filter((x) => x.id !== item.id))
      } else {
        setWish((w) => [...w, item])
        toast({ en: `Saved to wishlist · ${item.name.en}`, bn: `পছন্দের তালিকায় · ${item.name.bn}` })
      }
    },
    isWished: (id) => wish.some((x) => x.id === id),
    drawer,
    setDrawer,
    flies,
    toasts,
    bump,
    toast,
    quick,
    openQuick,
    added,
    clearAdded: () => setAdded(null),
  }
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const c = useContext(StoreContext)
  if (!c) throw new Error('useStore outside provider')
  return c
}
