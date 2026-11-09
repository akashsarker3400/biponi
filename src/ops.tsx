/**
 * Srimoti Bitan "ops" engine: orders, stock, coupons and automation rules.
 *
 * Everything persists to localStorage so the demo works with no server.
 * To go live, swap `persist`/`load` for calls to a real backend (Supabase,
 * Firebase, your own API); the rest of the app only talks to `useOps()`.
 */
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { CATALOG, COUPONS, INITIAL_STOCK, SHOP, activeCampaign, deliveryFor, type Look } from './data'
import { L, type Txt } from './i18n'

export type Status = 'new' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled'
export const FLOW: Status[] = ['new', 'confirmed', 'packed', 'shipped', 'delivered']
export const STATUS_NAME: Record<Status, Txt> = {
  new: L('Received', 'অর্ডার পেয়েছি'),
  confirmed: L('Confirmed', 'কনফার্ম'),
  packed: L('Packed', 'প্যাক করা হয়েছে'),
  shipped: L('On the way', 'পথে আছে'),
  delivered: L('Delivered', 'পৌঁছে গেছে'),
  cancelled: L('Cancelled', 'বাতিল'),
}

export type OrderItem = { key: string; id: string; name: Txt; price: number; qty: number; photo?: string; look?: Look }
export type Customer = { name: string; phone: string; district: string; address: string; note?: string }
export type Payment = 'cod' | 'bkash' | 'nagad'
export type Order = {
  id: string
  at: string
  items: OrderItem[]
  customer: Customer
  payment: Payment
  subtotal: number
  discount: number
  coupon?: string
  delivery: number
  total: number
  status: Status
  history: { status: Status; at: string; auto?: boolean }[]
}
export type Rules = {
  autoConfirm: boolean
  autoConfirmLimit: number
  autoCoupon: boolean
  campaign: boolean
  cartNudge: boolean
  chatGreet: boolean
  lowStockAt: number
  restoreOnCancel: boolean
  pin: string
}
export type LogEntry = { at: string; text: Txt; kind: 'order' | 'stock' | 'coupon' | 'nudge' | 'restock' | 'status' }
export type RestockReq = { id: string; phone: string; at: string; done?: boolean }

const DEFAULT_RULES: Rules = {
  autoConfirm: true,
  autoConfirmLimit: 20000,
  autoCoupon: true,
  campaign: true,
  cartNudge: true,
  chatGreet: true,
  lowStockAt: 2,
  restoreOnCancel: true,
  pin: '1234',
}

function load<T>(k: string, fallback: T): T {
  try {
    const v = localStorage.getItem(k)
    return v ? { ...(fallback as object), ...JSON.parse(v) } : fallback
  } catch {
    return fallback
  }
}
function loadArr<T>(k: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(k) || '[]') as T[]
  } catch {
    return []
  }
}
const persist = (k: string, v: unknown) => localStorage.setItem(k, JSON.stringify(v))

export const isPhone = (p: string) => /^(?:\+?88)?01[3-9]\d{8}$/.test(p.replace(/[\s-]/g, ''))
export const normPhone = (p: string) => '880' + p.replace(/\D/g, '').replace(/^(?:88)?0?/, '')

/* ---------- pricing ---------- */
export function priceCart(subtotal: number, district: string, manual: string | undefined, rules: Rules) {
  const camp = rules.campaign ? activeCampaign() : null
  const pool = [
    ...COUPONS.filter((c) => c.auto && rules.autoCoupon),
    ...(camp ? [{ code: camp.code, pct: camp.pct, min: camp.min, label: camp.line, auto: true }] : []),
    ...COUPONS.filter((c) => !c.auto && manual && c.code === manual.trim().toUpperCase()),
  ].filter((c) => subtotal >= c.min)
  const best = pool.sort((a, b) => b.pct - a.pct)[0]
  const discount = best ? Math.round((subtotal * best.pct) / 100) : 0
  const d = deliveryFor(district || 'Dhaka', subtotal - discount)
  const manualBad = !!manual && !pool.some((c) => c.code === manual.trim().toUpperCase())
  return { coupon: best, discount, delivery: d.fee, eta: d.eta, total: subtotal - discount + d.fee, manualBad }
}

/* ---------- message templates (sent through WhatsApp) ---------- */
export function statusMessage(o: Order, s: Status = o.status) {
  const link = `${location.origin}${location.pathname}#/track/${o.id}`
  const first = o.customer.name.split(' ')[0]
  const total = '৳' + o.total.toLocaleString('en-IN')
  const m: Record<Status, string> = {
    new: `প্রিয় ${first}, শ্রীমতী বিতানে অর্ডার করার জন্য ধন্যবাদ! অর্ডার নং ${o.id}, মোট ${total}। আমরা শীঘ্রই কনফার্ম করছি।\nট্র্যাক করুন: ${link}`,
    confirmed: `প্রিয় ${first}, আপনার অর্ডার ${o.id} কনফার্ম হয়েছে ✅ মোট ${total}। শাড়ি এখন ফলস-পিকো ও প্যাকিংয়ে যাচ্ছে।\nট্র্যাক: ${link}`,
    packed: `প্রিয় ${first}, আপনার শাড়ি যত্ন করে প্যাক করা হয়েছে 🎁 অর্ডার ${o.id} আজই কুরিয়ারে যাবে।\nট্র্যাক: ${link}`,
    shipped: `প্রিয় ${first}, আপনার অর্ডার ${o.id} পথে আছে 🚚 ${o.payment === 'cod' ? `ডেলিভারির সময় ${total} পরিশোধ করবেন।` : ''}\nট্র্যাক: ${link}`,
    delivered: `প্রিয় ${first}, আশা করি শাড়িটি আপনার পছন্দ হয়েছে 🌸 একটি ছবি পাঠালে খুব খুশি হব! পরের অর্ডারে FIRAI5 কোডে ৫% ছাড়।`,
    cancelled: `প্রিয় ${first}, আপনার অর্ডার ${o.id} বাতিল করা হয়েছে। কোনো প্রশ্ন থাকলে এই নম্বরে জানাবেন।`,
  }
  return m[s]
}
export const waLink = (phone: string, text: string) => `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
export const shopOrderText = (o: Order) =>
  [
    `🛍️ New order ${o.id}`,
    ...o.items.map((x) => `• ${x.name.en} × ${x.qty} = ৳${(x.price * x.qty).toLocaleString('en-IN')}`),
    `Subtotal ৳${o.subtotal.toLocaleString('en-IN')}${o.discount ? ` · Discount −৳${o.discount.toLocaleString('en-IN')} (${o.coupon})` : ''} · Delivery ৳${o.delivery}`,
    `TOTAL ৳${o.total.toLocaleString('en-IN')} · ${o.payment.toUpperCase()}`,
    `${o.customer.name} · ${o.customer.phone}`,
    `${o.customer.address}, ${o.customer.district}`,
    o.customer.note ? `Note: ${o.customer.note}` : '',
  ]
    .filter(Boolean)
    .join('\n')

/* ---------- context ---------- */
type Ctx = {
  orders: Order[]
  stock: Record<string, number>
  rules: Rules
  log: LogEntry[]
  restock: RestockReq[]
  stockOf: (id: string) => number | undefined
  sold: (id: string) => number
  placeOrder: (o: Omit<Order, 'id' | 'at' | 'status' | 'history'>) => Order
  setStatus: (id: string, s: Status) => void
  setStock: (id: string, n: number) => void
  setRules: (p: Partial<Rules>) => void
  requestRestock: (id: string, phone: string) => void
  closeRestock: (i: number) => void
  addLog: (text: Txt, kind: LogEntry['kind']) => void
  seedDemo: () => void
  resetAll: () => void
  track: string | null
  openTrack: (id: string | null) => void
  checkout: boolean
  setCheckout: (b: boolean) => void
}
const OpsContext = createContext<Ctx | null>(null)

export function OpsProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(() => loadArr('sb-orders'))
  const [stock, setStockMap] = useState<Record<string, number>>(() => load('sb-stock', INITIAL_STOCK))
  const [rules, setRulesState] = useState<Rules>(() => load('sb-rules', DEFAULT_RULES))
  const [log, setLog] = useState<LogEntry[]>(() => loadArr('sb-log'))
  const [restock, setRestock] = useState<RestockReq[]>(() => loadArr('sb-restock'))
  const [track, setTrack] = useState<string | null>(null)
  const [checkout, setCheckout] = useState(false)

  useEffect(() => persist('sb-orders', orders), [orders])
  useEffect(() => persist('sb-stock', stock), [stock])
  useEffect(() => persist('sb-rules', rules), [rules])
  useEffect(() => persist('sb-log', log.slice(0, 200)), [log])
  useEffect(() => persist('sb-restock', restock), [restock])

  // keep several tabs (shop + admin) in sync
  useEffect(() => {
    const on = (e: StorageEvent) => {
      if (e.key === 'sb-orders') setOrders(loadArr('sb-orders'))
      if (e.key === 'sb-stock') setStockMap(load('sb-stock', INITIAL_STOCK))
      if (e.key === 'sb-log') setLog(loadArr('sb-log'))
      if (e.key === 'sb-restock') setRestock(loadArr('sb-restock'))
      if (e.key === 'sb-rules') setRulesState(load('sb-rules', DEFAULT_RULES))
    }
    window.addEventListener('storage', on)
    return () => window.removeEventListener('storage', on)
  }, [])

  // open the tracker from a shared link: #/track/SB-...
  useEffect(() => {
    const m = location.hash.match(/^#\/track\/?(.*)$/)
    if (m) setTrack(decodeURIComponent(m[1] || ''))
  }, [])

  const addLog = useCallback((text: Txt, kind: LogEntry['kind']) => {
    setLog((l) => [{ at: new Date().toISOString(), text, kind }, ...l].slice(0, 200))
  }, [])

  const stockOf = (id: string) => (id in stock ? stock[id] : undefined)
  const sold = (id: string) =>
    orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.items.filter((x) => x.id === id).reduce((a, x) => a + x.qty, 0), 0)

  const adjust = (items: OrderItem[], sign: 1 | -1) => {
    const lows: string[] = []
    setStockMap((s) => {
      const n = { ...s }
      items.forEach((x) => {
        if (x.id in n) {
          n[x.id] = Math.max(0, n[x.id] + sign * x.qty)
          if (sign < 0 && n[x.id] <= rules.lowStockAt) lows.push(`${x.name.en}|${x.name.bn}|${n[x.id]}`)
        }
      })
      return n
    })
    return lows
  }

  const placeOrder: Ctx['placeOrder'] = (o) => {
    const now = new Date()
    const id = `SB-${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`
    const auto = rules.autoConfirm && o.total <= rules.autoConfirmLimit
    const order: Order = {
      ...o,
      id,
      at: now.toISOString(),
      status: auto ? 'confirmed' : 'new',
      history: auto ? [{ status: 'new', at: now.toISOString() }, { status: 'confirmed', at: now.toISOString(), auto: true }] : [{ status: 'new', at: now.toISOString() }],
    }
    setOrders((x) => [order, ...x])
    addLog(L(`New order ${id} · ৳${o.total.toLocaleString('en-IN')} from ${o.customer.district}`, `নতুন অর্ডার ${id} · ৳${o.total.toLocaleString('en-IN')} · ${o.customer.district}`), 'order')
    if (auto) addLog(L(`${id} auto-confirmed (under ৳${rules.autoConfirmLimit.toLocaleString('en-IN')})`, `${id} নিজে থেকেই কনফার্ম হয়েছে`), 'status')
    else addLog(L(`${id} held for a confirmation call (high value)`, `${id} বড় অর্ডার, ফোনে কনফার্মের অপেক্ষায়`), 'status')
    if (o.coupon) addLog(L(`Coupon ${o.coupon} applied automatically (−৳${o.discount.toLocaleString('en-IN')})`, `কুপন ${o.coupon} প্রয়োগ হয়েছে`), 'coupon')
    // stock + low-stock alerts
    const lows: string[] = []
    const n = { ...stock }
    o.items.forEach((x) => {
      if (x.id in n) {
        n[x.id] = Math.max(0, n[x.id] - x.qty)
        if (n[x.id] <= rules.lowStockAt) lows.push(`${x.name.en}|${x.name.bn}|${n[x.id]}`)
      }
    })
    setStockMap(n)
    lows.forEach((s) => {
      const [en, bn, left] = s.split('|')
      addLog(left === '0' ? L(`${en} is now SOLD OUT. Shown as "Notify me" on the site`, `${bn} স্টক শেষ। সাইটে "জানাবেন" দেখাচ্ছে`) : L(`Low stock: ${en} has only ${left} left`, `স্টক কম: ${bn} আর মাত্র ${left}টি`), 'stock')
    })
    return order
  }

  const setStatus = (id: string, s: Status) => {
    const o = orders.find((x) => x.id === id)
    if (!o || o.status === s) return
    setOrders((x) => x.map((y) => (y.id === id ? { ...y, status: s, history: [...y.history, { status: s, at: new Date().toISOString() }] } : y)))
    addLog(L(`${id} → ${STATUS_NAME[s].en}`, `${id} → ${STATUS_NAME[s].bn}`), 'status')
    if (s === 'cancelled' && rules.restoreOnCancel) {
      adjust(o.items, 1)
      addLog(L(`Stock returned for cancelled order ${id}`, `বাতিল অর্ডার ${id}-এর স্টক ফেরত গেছে`), 'stock')
    }
  }

  const setStock = (id: string, v: number) => {
    const was = stock[id] ?? 0
    setStockMap((s) => ({ ...s, [id]: Math.max(0, v) }))
    if (was === 0 && v > 0) {
      const waiting = restock.filter((r) => r.id === id && !r.done).length
      if (waiting) addLog(L(`Back in stock: ${waiting} customer(s) waiting. Send them a message from Requests`, `আবার স্টকে: ${waiting} জন অপেক্ষায়`), 'restock')
    }
  }

  const value: Ctx = {
    orders,
    stock,
    rules,
    log,
    restock,
    stockOf,
    sold,
    placeOrder,
    setStatus,
    setStock,
    setRules: (p) => setRulesState((r) => ({ ...r, ...p })),
    requestRestock: (id, phone) => {
      setRestock((r) => [{ id, phone, at: new Date().toISOString() }, ...r])
      const item = CATALOG.find((c) => c.id === id)
      addLog(L(`Restock request for ${item?.name.en ?? id}`, `${item?.name.bn ?? id} আবার আনার অনুরোধ`), 'restock')
    },
    closeRestock: (i) => setRestock((r) => r.map((x, k) => (k === i ? { ...x, done: true } : x))),
    addLog,
    seedDemo: () => {
      const names = ['Nusrat Jahan', 'Tahmina Akter', 'Rupa Chowdhury', 'Farzana Islam', 'Mitu Das', 'Sharmin Sultana', 'Ayesha Siddika', 'Priya Saha', 'Lamia Rahman', 'Shathi Biswas']
      const dists = ['Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Dhaka', 'Khulna', 'Gazipur', 'Dhaka', 'Cumilla', 'Narayanganj']
      const statuses: Status[] = ['delivered', 'delivered', 'shipped', 'delivered', 'packed', 'confirmed', 'new', 'delivered', 'shipped', 'cancelled']
      const demo: Order[] = names.map((n, i) => {
        const items = [CATALOG[(i * 7) % CATALOG.length], ...(i % 3 === 0 ? [CATALOG[(i * 5 + 3) % CATALOG.length]] : [])].map((c) => ({ key: c.id, id: c.id, name: c.name, price: c.price, qty: 1, photo: c.photo, look: c.look }))
        const sub = items.reduce((s, x) => s + x.price, 0)
        const at = new Date(Date.now() - (i * 1.3 + 0.2) * 864e5).toISOString()
        const st = statuses[i]
        const path = st === 'cancelled' ? (['new', 'cancelled'] as Status[]) : FLOW.slice(0, FLOW.indexOf(st) + 1)
        const del = deliveryFor(dists[i], sub).fee
        return {
          id: `SB-DEMO-${100 + i}`,
          at,
          items,
          customer: { name: n, phone: `017000000${String(10 + i)}`, district: dists[i], address: 'Demo address' },
          payment: (['cod', 'bkash', 'nagad'] as Payment[])[i % 3],
          subtotal: sub,
          discount: 0,
          delivery: del,
          total: sub + del,
          status: st,
          history: path.map((s, k) => ({ status: s, at: new Date(Date.parse(at) + k * 5 * 36e5).toISOString(), auto: s === 'confirmed' && sub < 20000 })),
        }
      })
      setOrders((x) => [...x.filter((o) => !o.id.startsWith('SB-DEMO')), ...demo])
      addLog(L('Loaded 10 demo orders', '১০টি ডেমো অর্ডার যোগ হয়েছে'), 'order')
    },
    resetAll: () => {
      setOrders([])
      setStockMap(INITIAL_STOCK)
      setLog([])
      setRestock([])
      setRulesState(DEFAULT_RULES)
    },
    track,
    openTrack: setTrack,
    checkout,
    setCheckout,
  }
  return <OpsContext.Provider value={value}>{children}</OpsContext.Provider>
}

export function useOps() {
  const c = useContext(OpsContext)
  if (!c) throw new Error('useOps outside provider')
  return c
}

export const SHOP_WA = SHOP.whatsapp
