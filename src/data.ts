import { L, type Txt } from './i18n'

/* ---------- Brand placeholders: replace with the real shop details ---------- */
export const SHOP = {
  phone: '+880 1700-000000',
  whatsapp: '8801700000000',
  email: 'hello@srimotibitan.com',
  address: L('House 00, Road 00, Dhanmondi, Dhaka', 'বাড়ি ০০, রোড ০০, ধানমন্ডি, ঢাকা'),
  hours: L('Every day · 11am – 9pm (Friday from 3pm)', 'প্রতিদিন · সকাল ১১টা – রাত ৯টা (শুক্রবার বিকেল ৩টা থেকে)'),
  facebook: '#',
  instagram: '#',
}

/* ---------- Photos (Unsplash, free licence) ---------- */
const PHONE = typeof window !== 'undefined' && window.matchMedia('(max-width: 760px)').matches
/** Phones get smaller files: less to download and decode while scrolling. */
export const img = (id: string, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?w=${PHONE ? Math.min(w, 800) : w}&q=${PHONE ? 70 : 75}&auto=format&fit=crop`

/* ---------- Procedural saree look ---------- */
export type Motif = 'jamdani' | 'buti' | 'kolka' | 'check' | 'stripe' | 'plain'
export type Look = { body: string; border: string; zari: string; motif: Motif }

export type Cat = 'jamdani' | 'tant' | 'silk' | 'katan' | 'monipuri' | 'cotton'
export const CATS: { key: Cat | 'all'; name: Txt }[] = [
  { key: 'all', name: L('All sarees', 'সব শাড়ি') },
  { key: 'jamdani', name: L('Jamdani', 'জামদানি') },
  { key: 'tant', name: L('Tangail Tant', 'টাঙ্গাইল তাঁত') },
  { key: 'silk', name: L('Rajshahi Silk', 'রাজশাহী সিল্ক') },
  { key: 'katan', name: L('Katan & Benarasi', 'কাতান ও বেনারসি') },
  { key: 'monipuri', name: L('Monipuri', 'মণিপুরী') },
  { key: 'cotton', name: L('Everyday Cotton', 'সুতি') },
]

export type Product = {
  id: string
  name: Txt
  cat: Cat
  price: number
  look: Look
  note: Txt
}

export const RACK: Product[] = [
  { id: 'r1', cat: 'jamdani', price: 14500, name: L('Shada Jamdani, Gold Butidar', 'সাদা জামদানি, সোনালি বুটিদার'), look: { body: '#F4EEDF', border: '#B8892E', zari: '#D9B45A', motif: 'jamdani' }, note: L('Rupganj · 84 count · 3 months on the loom', 'রূপগঞ্জ · ৮৪ কাউন্ট · তাঁতে তিন মাস') },
  { id: 'r2', cat: 'jamdani', price: 18900, name: L('Kalo Jamdani, Silver Phool', 'কালো জামদানি, রুপালি ফুল'), look: { body: '#1C1A1B', border: '#8C8C94', zari: '#D6D6DC', motif: 'jamdani' }, note: L('Half-silk · silver thread · evening weight', 'হাফ সিল্ক · রুপালি সুতা · সন্ধ্যার শাড়ি') },
  { id: 'r3', cat: 'tant', price: 3400, name: L('Lal Paar Shada Tant', 'লাল পাড় সাদা তাঁত'), look: { body: '#F7F2E6', border: '#B3191F', zari: '#C99A3B', motif: 'plain' }, note: L('The Pujo classic · Pathrail, Tangail', 'পূজার চিরচেনা · পাথরাইল, টাঙ্গাইল') },
  { id: 'r4', cat: 'tant', price: 2900, name: L('Kochupata Check Tant', 'কচুপাতা চেক তাঁত'), look: { body: '#2F6B3E', border: '#E2B83C', zari: '#F1D27A', motif: 'check' }, note: L('Soft cotton · everyday drape', 'নরম সুতি · প্রতিদিনের শাড়ি') },
  { id: 'r5', cat: 'silk', price: 12800, name: L('Holud Rajshahi Silk', 'হলুদ রাজশাহী সিল্ক'), look: { body: '#E3A92B', border: '#7A1E1E', zari: '#F5D889', motif: 'buti' }, note: L('Pure mulberry silk · Sopura, Rajshahi', 'খাঁটি মালবেরি সিল্ক · সপুরা, রাজশাহী') },
  { id: 'r6', cat: 'silk', price: 15600, name: L('Begun Rajshahi Silk', 'বেগুনি রাজশাহী সিল্ক'), look: { body: '#5B2A6E', border: '#C9A04A', zari: '#EED48C', motif: 'kolka' }, note: L('Kolka motif · gold zari paar', 'কলকা মোটিফ · সোনালি জরি পাড়') },
  { id: 'r7', cat: 'katan', price: 24500, name: L('Lal Katan Benarasi', 'লাল কাতান বেনারসি'), look: { body: '#9E1620', border: '#D4A63F', zari: '#F0CF77', motif: 'jamdani' }, note: L('Mirpur Benarasi Palli · bridal weight', 'মিরপুর বেনারসি পল্লী · বিয়ের শাড়ি') },
  { id: 'r8', cat: 'katan', price: 21900, name: L('Neel Katan, Zari Kolka', 'নীল কাতান, জরি কলকা'), look: { body: '#1E3A7B', border: '#C9A04A', zari: '#EBCB7A', motif: 'kolka' }, note: L('Royal blue · heavy zari pallu', 'রাজকীয় নীল · ভারী জরির আঁচল') },
  { id: 'r9', cat: 'monipuri', price: 4800, name: L('Golapi Monipuri', 'গোলাপি মণিপুরী'), look: { body: '#D9547B', border: '#2B2B5E', zari: '#F2C4D2', motif: 'stripe' }, note: L('Sylhet handloom · temple-stripe border', 'সিলেটের তাঁত · মন্দির-রেখা পাড়') },
  { id: 'r10', cat: 'monipuri', price: 5200, name: L('Akashi Monipuri', 'আকাশি মণিপুরী'), look: { body: '#7FB3D5', border: '#1F3B5C', zari: '#E8F1F7', motif: 'stripe' }, note: L('Light, breezy · summer favourite', 'হালকা, আরামদায়ক · গ্রীষ্মের প্রিয়') },
  { id: 'r11', cat: 'cotton', price: 1850, name: L('Pudina Sutir Shari', 'পুদিনা সুতির শাড়ি'), look: { body: '#9CCDB5', border: '#1E4D3B', zari: '#EAF4EE', motif: 'buti' }, note: L('Office-ready · machine washable', 'অফিসের জন্য · ধোয়া সহজ') },
  { id: 'r12', cat: 'cotton', price: 1650, name: L('Komola Block Print', 'কমলা ব্লক প্রিন্ট'), look: { body: '#E07A2F', border: '#3A1A0E', zari: '#F7D2A8', motif: 'kolka' }, note: L('Hand block-printed · Kushtia', 'হাতে ব্লক প্রিন্ট · কুষ্টিয়া') },
  { id: 'r13', cat: 'jamdani', price: 32000, name: L('Muslin Jamdani, Ivory Zari', 'মসলিন জামদানি, আইভরি জরি'), look: { body: '#EFE3C8', border: '#A9822F', zari: '#E2C47A', motif: 'jamdani' }, note: L('Revived Dhakai muslin · heirloom piece', 'পুনর্জাগরিত ঢাকাই মসলিন · উত্তরাধিকারের শাড়ি') },
  { id: 'r14', cat: 'tant', price: 3800, name: L('Neel-Shada Tangail', 'নীল-সাদা টাঙ্গাইল'), look: { body: '#25488A', border: '#F4EEDF', zari: '#F4EEDF', motif: 'stripe' }, note: L('Indigo stripes · Baje Sildhuli', 'নীল ডোরা · বাজে সিলধুলি') },
]

/* ---------- Six seasons (ষড়ঋতু) ---------- */
export const SEASONS = [
  { name: L('Grishmo', 'গ্রীষ্ম'), en: 'Summer', line: L('Breathable cotton, sun-washed whites', 'হালকা সুতি, রোদ-ধোয়া সাদা'), photo: '1752468178780-2368233d691c', tone: '#E6B44C' },
  { name: L('Borsha', 'বর্ষা'), en: 'Monsoon', line: L('Rain greens in soft half-silk', 'নরম হাফ সিল্কে বর্ষার সবুজ'), photo: '1679006831648-7c9ea12e5807', tone: '#4E8C78' },
  { name: L('Shorot', 'শরৎ'), en: 'Autumn', line: L('Lal-paar shada for Pujo mornings', 'পূজার সকালে লাল পাড় সাদা'), photo: '1729101143891-a8fed18023f2', tone: '#B3191F' },
  { name: L('Hemonto', 'হেমন্ত'), en: 'Harvest', line: L('Golden Rajshahi silk, nobanno glow', 'নবান্নের আলোয় সোনালি রাজশাহী সিল্ক'), photo: '1727430228383-aa1fb59db8bf', tone: '#C98A2B' },
  { name: L('Sheet', 'শীত'), en: 'Winter', line: L('Rich katan for wedding season', 'বিয়ের মৌসুমে ভারী কাতান'), photo: '1641699862936-be9f49b1c38d', tone: '#5B2A6E' },
  { name: L('Boshonto', 'বসন্ত'), en: 'Spring', line: L('Holud-basanti for Pohela Falgun', 'পহেলা ফাল্গুনে হলুদ-বাসন্তী'), photo: '1769275061202-cf3ef67d7279', tone: '#E0A21B' },
]

/* ---------- Pick a saree (studio cards) ---------- */
export const PICKS = [
  { id: 'p1', title: L('Begun Rani', 'বেগুনি রানী'), kind: L('Rajshahi Silk', 'রাজশাহী সিল্ক'), price: 16200, bg: '#5C2470', ink: '#F6E3FF', photo: '1610030469983-98e550d6193c' },
  { id: 'p2', title: L('Kalo Meghe', 'কালো মেঘে'), kind: L('Jamdani', 'জামদানি'), price: 19800, bg: '#1B1717', ink: '#E9D9B4', photo: '1610030469668-8e9f641aaf27' },
  { id: 'p3', title: L('Pudina Katan', 'পুদিনা কাতান'), kind: L('Katan', 'কাতান'), price: 22400, bg: '#2F7A64', ink: '#E5FFF4', photo: '1609748340041-f5d61e061ebc' },
  { id: 'p4', title: L('Holud Benarasi', 'হলুদ বেনারসি'), kind: L('Benarasi', 'বেনারসি'), price: 27500, bg: '#E2A419', ink: '#3A1A05', photo: '1610189337543-1c5d8e64f574' },
  { id: 'p5', title: L('Neel Akash', 'নীল আকাশ'), kind: L('Tangail Silk', 'টাঙ্গাইল সিল্ক'), price: 9800, bg: '#1F3F8F', ink: '#FFE9A8', photo: '1610189012906-4c0aa9b9781e' },
  { id: 'p6', title: L('Raj Darbar', 'রাজ দরবার'), kind: L('Katan Benarasi', 'কাতান বেনারসি'), price: 31800, bg: '#9E1620', ink: '#FFE4B0', photo: '1609748513078-9ff6232781c5' },
  { id: 'p7', title: L('Golapi Bagan', 'গোলাপি বাগান'), kind: L('Half Silk', 'হাফ সিল্ক'), price: 8600, bg: '#D2457A', ink: '#FFF0F5', photo: '1617627143750-d86bc21e42bb' },
]

/* ---------- Bridal ---------- */
export const BRIDAL = [
  { id: 'b1', name: L('Phulsojja Benarasi', 'ফুলশয্যা বেনারসি'), fabric: L('Benarasi · rose-gold pallu', 'বেনারসি · গোলাপি-সোনালি আঁচল'), price: 38500, off: 0, photo: '1610047614301-13c63f00c032' },
  { id: 'b2', name: L('Shubho Drishti Katan', 'শুভদৃষ্টি কাতান'), fabric: L('Katan · blue zari border', 'কাতান · নীল জরি পাড়'), price: 42000, off: 10, photo: '1662561283890-b00a2d5b4bfc' },
  { id: 'b3', name: L('Rajkonna Benarasi', 'রাজকন্যা বেনারসি'), fabric: L('Benarasi · royal blue & gold', 'বেনারসি · রাজকীয় নীল ও সোনালি'), price: 54000, off: 0, photo: '1600685890506-593fdf55949b' },
  { id: 'b4', name: L('Lal Shalu Benarasi', 'লাল শালু বেনারসি'), fabric: L('Benarasi · classic red bridal', 'বেনারসি · চিরায়ত লাল'), price: 46500, off: 8, photo: '1727934404073-797950f15a76' },
  { id: 'b5', name: L('Bou Bhat Silk', 'বৌভাত সিল্ক'), fabric: L('Rajshahi silk · gold temple border', 'রাজশাহী সিল্ক · সোনালি মন্দির পাড়'), price: 28900, off: 0, photo: '1633109957352-4e50520439d6' },
  { id: 'b6', name: L('Mondir Lal Katan', 'মন্দির লাল কাতান'), fabric: L('Katan · terracotta-red', 'কাতান · পোড়ামাটি লাল'), price: 36200, off: 12, photo: '1618901185975-d59f7091bcfe' },
  { id: 'b7', name: L('Tin Shokhi Edit', 'তিন সখী এডিট'), fabric: L('Bridesmaid set · 3 sarees', 'বরের-কনের সখীদের সেট · ৩টি শাড়ি'), price: 39900, off: 15, photo: '1610189026205-27510cfc52f8' },
  { id: 'b8', name: L('Gaye Holud Jamdani', 'গায়ে হলুদ জামদানি'), fabric: L('Jamdani · holud & sindoor', 'জামদানি · হলুদ ও সিঁদুর'), price: 24800, off: 0, photo: '1570212773364-e30cd076539e' },
]

/* ---------- Lookbook columns ---------- */
export const LOOKBOOK_A = ['1752469126143-9de2078e5281', '1726076584498-2064363f8b5a', '1769275061721-bb6439d24ebc', '1752469145295-3146b95cb544']
export const LOOKBOOK_B = ['1752469113412-cb988552e387', '1787220272461-2c53528c9349', '1781194519715-a1d72e169b35', '1787554497632-1727c23e58cb']
export const LOOKBOOK_FILM = ['1729101143891-a8fed18023f2', '1752469113412-cb988552e387', '1617627143750-d86bc21e42bb', '1679006831648-7c9ea12e5807']

export const HERO_SLIDES = [
  { photo: '1729101143891-a8fed18023f2', cap: L('Shorot · Lal-paar shada', 'শরৎ · লাল পাড় সাদা') },
  { photo: '1618901185975-d59f7091bcfe', cap: L('Terracotta red katan', 'পোড়ামাটি লাল কাতান') },
  { photo: '1727430228383-aa1fb59db8bf', cap: L('Hemonto · Rajshahi silk', 'হেমন্ত · রাজশাহী সিল্ক') },
  { photo: '1619516388835-2b60acc4049e', cap: L('Golap Bagan silk', 'গোলাপ বাগান সিল্ক') },
  { photo: '1787295779612-b3182bea0a81', cap: L('Sonali paar shada', 'সোনালি পাড় সাদা') },
]

/* ---------- Weave studio options ---------- */
export const WEAVES = [
  { key: 'jamdani', name: L('Jamdani', 'জামদানি'), base: 8500, days: 45, motif: 'jamdani' as Motif },
  { key: 'tant', name: L('Tangail Tant', 'টাঙ্গাইল তাঁত'), base: 2800, days: 7, motif: 'plain' as Motif },
  { key: 'silk', name: L('Rajshahi Silk', 'রাজশাহী সিল্ক'), base: 11500, days: 14, motif: 'buti' as Motif },
  { key: 'katan', name: L('Katan Benarasi', 'কাতান বেনারসি'), base: 18000, days: 30, motif: 'kolka' as Motif },
  { key: 'muslin', name: L('Dhakai Muslin', 'ঢাকাই মসলিন'), base: 42000, days: 120, motif: 'jamdani' as Motif },
]
export const BODY_COLORS = [
  { c: '#9E1620', n: L('Sindoor', 'সিঁদুর') },
  { c: '#F4EEDF', n: L('Ivory', 'আইভরি') },
  { c: '#E3A92B', n: L('Holud', 'হলুদ') },
  { c: '#2F6B3E', n: L('Kochupata', 'কচুপাতা') },
  { c: '#1E3A7B', n: L('Neel', 'নীল') },
  { c: '#1C1A1B', n: L('Kalo', 'কালো') },
  { c: '#D9547B', n: L('Golapi', 'গোলাপি') },
  { c: '#5B2A6E', n: L('Begun', 'বেগুনি') },
]
export const BORDER_COLORS = [
  { c: '#B3191F', n: L('Lal', 'লাল') },
  { c: '#C9A04A', n: L('Sonali', 'সোনালি') },
  { c: '#1E4D3B', n: L('Shobuj', 'সবুজ') },
  { c: '#141414', n: L('Kalo', 'কালো') },
  { c: '#5A0F1A', n: L('Khoyeri', 'খয়েরি') },
  { c: '#25488A', n: L('Neel', 'নীল') },
]
export const MOTIFS: { key: Motif; name: Txt }[] = [
  { key: 'jamdani', name: L('Jamdani phool', 'জামদানি ফুল') },
  { key: 'buti', name: L('Buti', 'বুটি') },
  { key: 'kolka', name: L('Kolka', 'কলকা') },
  { key: 'check', name: L('Check', 'চেক') },
  { key: 'stripe', name: L('Dora', 'ডোরা') },
  { key: 'plain', name: L('Plain', 'প্লেইন') },
]
export const ZARIS = [
  { key: 'gold', c: '#E2BE62', name: L('Gold zari', 'সোনালি জরি'), add: 2500 },
  { key: 'silver', c: '#D8D9DF', name: L('Silver zari', 'রুপালি জরি'), add: 1800 },
  { key: 'thread', c: '', name: L('Cotton thread', 'সুতার কাজ'), add: 0 },
]

/* =========================================================
   Automation data
   ========================================================= */

/** One catalogue for stock, orders, finder and admin. */
export type CatalogItem = {
  id: string
  name: Txt
  price: number
  group: 'rack' | 'pick' | 'bridal'
  photo?: string
  look?: Look
  added: string // ISO date, drives "New arrivals"
  occasion: ('wedding' | 'festival' | 'daily' | 'party' | 'gift')[]
  feel: 'light' | 'silk' | 'zari'
  color: 'red' | 'light' | 'bright' | 'dark' | 'green'
}

/** Colour family from a hex colour, so new products tag themselves. */
export function colorFamily(hex: string): CatalogItem['color'] {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  const mx = Math.max(r, g, b)
  const mn = Math.min(r, g, b)
  const l = (mx + mn) / 2
  if (l > 0.8) return 'light'
  if (l < 0.22) return 'dark'
  let h = 0
  if (mx !== mn) {
    const d = mx - mn
    h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4
    h *= 60
    if (h < 0) h += 360
  }
  if (h < 18 || h > 330) return 'red'
  if (h < 70) return 'bright'
  if (h < 170) return 'green'
  if (h < 300) return 'dark'
  return 'bright'
}

const RACK_TAGS: Record<Cat, Pick<CatalogItem, 'occasion' | 'feel'>> = {
  jamdani: { occasion: ['festival', 'party', 'gift'], feel: 'zari' },
  tant: { occasion: ['daily', 'festival'], feel: 'light' },
  silk: { occasion: ['festival', 'party', 'gift'], feel: 'silk' },
  katan: { occasion: ['wedding', 'party'], feel: 'zari' },
  monipuri: { occasion: ['daily', 'gift'], feel: 'light' },
  cotton: { occasion: ['daily'], feel: 'light' },
}
const PICK_TAGS: Record<string, Pick<CatalogItem, 'occasion' | 'feel' | 'color'>> = {
  p1: { occasion: ['party', 'festival'], feel: 'silk', color: 'dark' },
  p2: { occasion: ['party', 'gift'], feel: 'zari', color: 'dark' },
  p3: { occasion: ['wedding', 'party'], feel: 'zari', color: 'green' },
  p4: { occasion: ['wedding', 'festival'], feel: 'zari', color: 'bright' },
  p5: { occasion: ['daily', 'festival'], feel: 'silk', color: 'dark' },
  p6: { occasion: ['wedding', 'party'], feel: 'zari', color: 'red' },
  p7: { occasion: ['festival', 'gift', 'daily'], feel: 'silk', color: 'bright' },
}
const daysAgo = (n: number) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10)

export const CATALOG: CatalogItem[] = [
  ...RACK.map((p, i) => ({ id: p.id, name: p.name, price: p.price, group: 'rack' as const, look: p.look, added: daysAgo(4 + i * 5), color: colorFamily(p.look.body), ...RACK_TAGS[p.cat] })),
  ...PICKS.map((p, i) => ({ id: p.id, name: p.title, price: p.price, group: 'pick' as const, photo: p.photo, added: daysAgo(1 + i * 3), ...PICK_TAGS[p.id] })),
  ...BRIDAL.map((b, i) => ({ id: b.id, name: b.name, price: b.off ? Math.round((b.price * (100 - b.off)) / 10000) * 100 : b.price, group: 'bridal' as const, photo: b.photo, added: daysAgo(10 + i * 6), occasion: ['wedding' as const], feel: 'zari' as const, color: 'red' as const })),
]

/** Opening stock. Studio designs are made to order, so they never run out. */
export const INITIAL_STOCK: Record<string, number> = {
  r1: 6, r2: 1, r3: 14, r4: 9, r5: 4, r6: 2, r7: 3, r8: 0, r9: 7, r10: 5, r11: 20, r12: 18, r13: 1, r14: 8,
  p1: 4, p2: 3, p3: 2, p4: 5, p5: 9, p6: 1, p7: 6,
  b1: 2, b2: 3, b3: 1, b4: 2, b5: 4, b6: 0, b7: 2, b8: 3,
}

/* ---------- delivery (auto by district) ---------- */
export const DISTRICTS: { en: string; bn: string; div: string }[] = [
  ['Dhaka', 'ঢাকা'], ['Faridpur', 'ফরিদপুর'], ['Gazipur', 'গাজীপুর'], ['Gopalganj', 'গোপালগঞ্জ'], ['Kishoreganj', 'কিশোরগঞ্জ'], ['Madaripur', 'মাদারীপুর'], ['Manikganj', 'মানিকগঞ্জ'], ['Munshiganj', 'মুন্সীগঞ্জ'], ['Narayanganj', 'নারায়ণগঞ্জ'], ['Narsingdi', 'নরসিংদী'], ['Rajbari', 'রাজবাড়ী'], ['Shariatpur', 'শরীয়তপুর'], ['Tangail', 'টাঙ্গাইল'],
  ['Bandarban', 'বান্দরবান'], ['Brahmanbaria', 'ব্রাহ্মণবাড়িয়া'], ['Chandpur', 'চাঁদপুর'], ['Chattogram', 'চট্টগ্রাম'], ["Cox's Bazar", 'কক্সবাজার'], ['Cumilla', 'কুমিল্লা'], ['Feni', 'ফেনী'], ['Khagrachhari', 'খাগড়াছড়ি'], ['Lakshmipur', 'লক্ষ্মীপুর'], ['Noakhali', 'নোয়াখালী'], ['Rangamati', 'রাঙ্গামাটি'],
  ['Bogura', 'বগুড়া'], ['Chapai Nawabganj', 'চাঁপাইনবাবগঞ্জ'], ['Joypurhat', 'জয়পুরহাট'], ['Naogaon', 'নওগাঁ'], ['Natore', 'নাটোর'], ['Pabna', 'পাবনা'], ['Rajshahi', 'রাজশাহী'], ['Sirajganj', 'সিরাজগঞ্জ'],
  ['Bagerhat', 'বাগেরহাট'], ['Chuadanga', 'চুয়াডাঙ্গা'], ['Jashore', 'যশোর'], ['Jhenaidah', 'ঝিনাইদহ'], ['Khulna', 'খুলনা'], ['Kushtia', 'কুষ্টিয়া'], ['Magura', 'মাগুরা'], ['Meherpur', 'মেহেরপুর'], ['Narail', 'নড়াইল'], ['Satkhira', 'সাতক্ষীরা'],
  ['Barguna', 'বরগুনা'], ['Barishal', 'বরিশাল'], ['Bhola', 'ভোলা'], ['Jhalokati', 'ঝালকাঠি'], ['Patuakhali', 'পটুয়াখালী'], ['Pirojpur', 'পিরোজপুর'],
  ['Habiganj', 'হবিগঞ্জ'], ['Moulvibazar', 'মৌলভীবাজার'], ['Sunamganj', 'সুনামগঞ্জ'], ['Sylhet', 'সিলেট'],
  ['Dinajpur', 'দিনাজপুর'], ['Gaibandha', 'গাইবান্ধা'], ['Kurigram', 'কুড়িগ্রাম'], ['Lalmonirhat', 'লালমনিরহাট'], ['Nilphamari', 'নীলফামারী'], ['Panchagarh', 'পঞ্চগড়'], ['Rangpur', 'রংপুর'], ['Thakurgaon', 'ঠাকুরগাঁও'],
  ['Jamalpur', 'জামালপুর'], ['Mymensingh', 'ময়মনসিংহ'], ['Netrokona', 'নেত্রকোণা'], ['Sherpur', 'শেরপুর'],
].map(([en, bn], i) => ({ en, bn, div: i < 13 ? 'dhaka' : 'other' }))

export const FREE_DELIVERY = 5000
const NEAR_DHAKA = ['Gazipur', 'Narayanganj', 'Munshiganj', 'Manikganj', 'Narsingdi']
export function deliveryFor(district: string, subtotal: number) {
  const fee = district === 'Dhaka' ? 80 : NEAR_DHAKA.includes(district) ? 110 : 150
  const eta = district === 'Dhaka' ? L('within 24 hours', '২৪ ঘণ্টার মধ্যে') : NEAR_DHAKA.includes(district) ? L('in 1–2 days', '১–২ দিনে') : L('in 2–4 days', '২–৪ দিনে')
  return { fee: subtotal >= FREE_DELIVERY || subtotal === 0 ? 0 : fee, base: fee, eta }
}

/* ---------- coupons & campaigns (auto by date) ---------- */
export type Coupon = { code: string; pct: number; min: number; label: Txt; auto?: boolean }
export const COUPONS: Coupon[] = [
  { code: 'BIG5', pct: 5, min: 15000, auto: true, label: L('5% off orders over ৳15,000 (applied automatically)', '৳১৫,০০০-এর বেশি অর্ডারে ৫% ছাড় (নিজে থেকেই)') },
  { code: 'FIRAI5', pct: 5, min: 0, label: L('Welcome-back 5% off', 'ফিরে আসার জন্য ৫% ছাড়') },
  { code: 'SRIMOTI10', pct: 10, min: 8000, label: L('10% off orders over ৳8,000', '৳৮,০০০-এর বেশি অর্ডারে ১০% ছাড়') },
]

/** Seasonal campaigns. Dates are MM-DD; Eid dates shift every year, so update them. */
export const CAMPAIGNS = [
  { id: 'biye', from: '11-01', to: '01-31', code: 'BIYE8', pct: 8, min: 0, title: L('Wedding season is here', 'বিয়ের মৌসুম শুরু'), line: L('8% off every saree with code BIYE8, applied at checkout', 'সব শাড়িতে ৮% ছাড় · কোড BIYE8 · চেকআউটে নিজে থেকেই') },
  { id: 'falgun', from: '02-01', to: '02-14', code: 'FALGUN10', pct: 10, min: 0, title: L('Pohela Falgun edit', 'পহেলা ফাল্গুন এডিট'), line: L('10% off holud-basanti sarees', 'হলুদ-বাসন্তী শাড়িতে ১০% ছাড়') },
  { id: 'eid', from: '02-25', to: '03-12', code: 'EID10', pct: 10, min: 0, title: L('Eid collection', 'ঈদ কালেকশন'), line: L('10% off for Eid (update these dates each year)', 'ঈদে ১০% ছাড়') },
  { id: 'boishakh', from: '04-01', to: '04-14', code: 'BOISHAKH10', pct: 10, min: 0, title: L('Shubho Noboborsho', 'শুভ নববর্ষ'), line: L('Lal-paar sada at 10% off for Pohela Boishakh', 'পহেলা বৈশাখে লাল পাড় সাদায় ১০% ছাড়') },
  { id: 'pujo', from: '10-01', to: '10-25', code: 'PUJO10', pct: 10, min: 0, title: L('Pujo is coming', 'পূজা আসছে'), line: L('10% off tant and katan for Pujo', 'পূজায় তাঁত ও কাতানে ১০% ছাড়') },
]
export function activeCampaign(d = new Date()) {
  const md = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return CAMPAIGNS.find((c) => (c.from <= c.to ? md >= c.from && md <= c.to : md >= c.from || md <= c.to)) ?? null
}

export const POLICY = {
  exchange: L('Exchange within 3 days of delivery if the saree is unused and the tag is on.', 'ডেলিভারির ৩ দিনের মধ্যে, অব্যবহৃত ও ট্যাগসহ শাড়ি বদলানো যাবে।'),
  services: L('Free fall & pico on every saree. Blouse stitching from ৳650, ready in 3 days.', 'প্রতিটি শাড়িতে ফ্রি ফলস ও পিকো। ব্লাউজ সেলাই ৳৬৫০ থেকে, ৩ দিনে প্রস্তুত।'),
}
