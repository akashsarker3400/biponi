/**
 * Photo catalogue: every saree that is shown on a model.
 * One source for the product view, the new-arrivals grid, the 3D ring,
 * bridal and lookbook. Prices are examples; replace with real ones.
 */
import { BRIDAL, PICKS, type Look, type Motif } from './data'
import { L, type Txt } from './i18n'

export type Shot = { photo: string; pos?: string; zoom?: number; fit?: 'contain'; label?: Txt }
export type Saree = {
  id: string
  name: Txt
  kind: Txt
  price: number
  was?: number
  photo: string
  more?: string[]
  look: Look
  story: Txt
  badge?: Txt
  group: 'new' | 'pick' | 'bridal'
  fabric: Txt
  origin: Txt
}

const lk = (body: string, border: string, zari = '#E2BE62', motif: Motif = 'jamdani'): Look => ({ body, border, zari, motif })

/** The product view builds a gallery from one honest photo: the full look plus close crops of the same picture. */
export function shots(s: Saree): Shot[] {
  const extra = (s.more ?? []).map((photo) => ({ photo, fit: 'contain' as const, label: L('Another angle', 'অন্য দিক থেকে') }))
  return [
    { photo: s.photo, fit: 'contain', label: L('Long view · full drape', 'পুরো সাজ · মাথা থেকে পা') },
    ...extra,
    { photo: s.photo, pos: '50% 28%', zoom: 1.35, label: L('Short view · waist up', 'কাছ থেকে · কোমর পর্যন্ত') },
    { photo: s.photo, pos: '50% 22%', zoom: 1.9, label: L('Anchol & blouse', 'আঁচল ও ব্লাউজ') },
    { photo: s.photo, pos: '50% 80%', zoom: 2.1, label: L('Kuchi & paar', 'কুচি ও পাড়') },
    { photo: s.photo, pos: '38% 55%', zoom: 2.8, label: L('Weave close-up', 'বুনন কাছ থেকে') },
  ]
}

const NEW: Saree[] = [
  { id: 'n1', group: 'new', photo: '1610189013429-a703f4b245cf', price: 13900, badge: L('New', 'নতুন'), name: L('Neel Rajshahi Katan', 'নীল রাজশাহী কাতান'), kind: L('Rajshahi Silk', 'রাজশাহী সিল্ক'), fabric: L('Pure silk, katan weave', 'খাঁটি রেশম, কাতান বুনন'), origin: L('Sopura, Rajshahi', 'সপুরা, রাজশাহী'), look: lk('#1E3A7B', '#B3191F', '#E2BE62', 'buti'), story: L('Deep indigo silk with a sindoor-red border. It looks royal in lamplight and soft by day.', 'গাঢ় নীল রেশমে সিঁদুর-লাল পাড়। প্রদীপের আলোয় রাজকীয়, দিনের আলোয় কোমল।') },
  { id: 'n2', group: 'new', photo: '1610030469839-f909584b43f1', price: 17500, badge: L('Handwoven', 'হাতে বোনা'), name: L('Kalo-Golapi Jamdani', 'কালো-গোলাপি জামদানি'), kind: L('Jamdani', 'জামদানি'), fabric: L('Half-silk jamdani, 80 count', 'হাফ সিল্ক জামদানি, ৮০ কাউন্ট'), origin: L('Rupganj, Narayanganj', 'রূপগঞ্জ, নারায়ণগঞ্জ'), look: lk('#1C1A1B', '#D9547B', '#E9C46A'), story: L('Night-black jamdani with a rose-pink anchol. Every motif is lifted by hand on the loom.', 'রাতের মতো কালো জামদানিতে গোলাপি আঁচল। প্রতিটি নকশা তাঁতে হাতে তোলা।') },
  { id: 'n3', group: 'new', photo: '1609748341932-f0206c09412b', price: 4200, name: L('Kancha Holud Tant', 'কাঁচা হলুদ তাঁত'), kind: L('Tangail Tant', 'টাঙ্গাইল তাঁত'), fabric: L('Fine cotton tant', 'মিহি সুতি তাঁত'), origin: L('Pathrail, Tangail', 'পাথরাইল, টাঙ্গাইল'), look: lk('#EFE3B0', '#5C8A3A', '#E2BE62', 'stripe'), story: L('Fresh as turmeric on a spring morning. Light, breathable and easy to drape.', 'বসন্তের সকালের কাঁচা হলুদের মতো। হালকা, আরামদায়ক, পরতে সহজ।') },
  { id: 'n4', group: 'new', photo: '1646979200020-941e1deb2670', price: 9600, was: 11200, badge: L('−15%', '−১৫%'), name: L('Lal Muslin', 'লাল মসলিন'), kind: L('Half-silk Muslin', 'হাফ সিল্ক মসলিন'), fabric: L('Soft muslin blend', 'নরম মসলিন মিশ্রণ'), origin: L('Dhaka', 'ঢাকা'), look: lk('#B3191F', '#E3A92B', '#F0CF77', 'buti'), story: L('A pure red that moves like water. For the evening you want to remember.', 'জলের মতো বয়ে চলা খাঁটি লাল। যে সন্ধ্যা মনে রাখতে চান, তার জন্য।') },
  { id: 'n5', group: 'new', photo: '1609748340878-c690e3e4706b', price: 15800, badge: L('New', 'নতুন'), name: L('Ghiye Jamdani', 'ঘিয়ে জামদানি'), kind: L('Jamdani', 'জামদানি'), fabric: L('Cotton jamdani, 84 count', 'সুতি জামদানি, ৮৪ কাউন্ট'), origin: L('Rupganj, Narayanganj', 'রূপগঞ্জ, নারায়ণগঞ্জ'), look: lk('#F2E6CF', '#C9A04A'), story: L('Ghee-white with blush flowers, so light you forget you are wearing six yards.', 'ঘিয়ে রঙে হালকা গোলাপি ফুল। এত হালকা যে ছয় গজ পরে আছেন ভুলে যাবেন।') },
  { id: 'n6', group: 'new', photo: '1610189025857-f42fe6e8dd91', price: 14400, name: L('Begun Buti Silk', 'বেগুনি বুটি সিল্ক'), kind: L('Rajshahi Silk', 'রাজশাহী সিল্ক'), fabric: L('Mulberry silk with buti', 'বুটিদার মালবেরি সিল্ক'), origin: L('Rajshahi', 'রাজশাহী'), look: lk('#4B2A7B', '#C9A04A', '#EED48C', 'buti'), story: L('Aubergine silk scattered with small white buti, like stars on a winter night.', 'বেগুনি রেশমে ছোট সাদা বুটি, শীতের রাতের তারার মতো।') },
  { id: 'n7', group: 'new', photo: '1619516388835-2b60acc4049e', price: 11200, name: L('Golap Bagan Silk', 'গোলাপ বাগান সিল্ক'), kind: L('Soft Silk', 'সফট সিল্ক'), fabric: L('Soft silk, zari border', 'সফট সিল্ক, জরি পাড়'), origin: L('Rajshahi', 'রাজশাহী'), look: lk('#E86A7B', '#B3191F', '#F0CF77', 'kolka'), story: L('Rose and red for garden afternoons and family dawats.', 'বাগানের বিকেল আর পারিবারিক দাওয়াতের জন্য গোলাপি-লাল।') },
  { id: 'n8', group: 'new', photo: '1692992193981-d3d92fabd9cb', price: 6800, badge: L('Handwoven', 'হাতে বোনা'), name: L('Rongdhonu Monipuri', 'রংধনু মণিপুরী'), kind: L('Monipuri', 'মণিপুরী'), fabric: L('Handloom cotton', 'হাতে বোনা সুতি'), origin: L('Sylhet', 'সিলেট'), look: lk('#2B6CB0', '#E3A92B', '#F2C94C', 'stripe'), story: L('Every colour of the rainbow, woven in a Monipuri home in Sylhet.', 'সিলেটের মণিপুরী ঘরে বোনা রংধনুর সব রং।') },
  { id: 'n9', group: 'new', photo: '1615555896813-401d84a0d737', price: 21500, badge: L('Limited', 'সীমিত'), name: L('Rupali Tissue', 'রুপালি টিস্যু'), kind: L('Tissue Silk', 'টিস্যু সিল্ক'), fabric: L('Tissue silk, silver zari', 'টিস্যু সিল্ক, রুপালি জরি'), origin: L('Mirpur, Dhaka', 'মিরপুর, ঢাকা'), look: lk('#E8E6E0', '#9EA0AA', '#D8D9DF', 'jamdani'), story: L('Moonlight in silk. A silver tissue for receptions and bou-bhat.', 'রেশমে জ্যোৎস্না। রিসেপশন আর বৌভাতের রুপালি টিস্যু।') },
  { id: 'n10', group: 'new', photo: '1787295779612-b3182bea0a81', more: ['1787295779676-181b3d5b55dd'], price: 7900, name: L('Sonali Paar Shada', 'সোনালি পাড় সাদা'), kind: L('Cotton Tissue', 'সুতি টিস্যু'), fabric: L('Cotton with gold tissue border', 'সোনালি টিস্যু পাড়ের সুতি'), origin: L('Tangail', 'টাঙ্গাইল'), look: lk('#F4EEDF', '#C9A04A', '#E2BE62', 'plain'), story: L('Pure white with a wide gold border, for pujo mornings and quiet celebrations.', 'চওড়া সোনালি পাড়ে ধবধবে সাদা। পূজার সকাল আর ছোট উৎসবের জন্য।') },
  { id: 'n11', group: 'new', photo: '1680711552692-76a8bd810398', price: 12600, badge: L('New', 'নতুন'), name: L('Gaye Holud Katan', 'গায়ে হলুদ কাতান'), kind: L('Katan', 'কাতান'), fabric: L('Katan silk', 'কাতান সিল্ক'), origin: L('Mirpur, Dhaka', 'মিরপুর, ঢাকা'), look: lk('#E3A92B', '#B3191F', '#F5D889', 'kolka'), story: L('Turmeric yellow and sindoor red, the colours of the gaye holud.', 'হলুদ আর সিঁদুর লাল, গায়ে হলুদের রং।') },
  { id: 'n12', group: 'new', photo: '1758797315311-07c928608c04', price: 24900, was: 27600, badge: L('Set of 3', '৩টির সেট'), name: L('Pahar-Sondhya Edit', 'পাহাড়-সন্ধ্যা এডিট'), kind: L('Sisters set', 'সখীদের সেট'), fabric: L('Three soft silks', 'তিনটি সফট সিল্ক'), origin: L('Rajshahi', 'রাজশাহী'), look: lk('#7A1E2A', '#C9A04A', '#EED48C', 'buti'), story: L('Three sarees that belong together, for sisters and best friends.', 'একসাথে মানায় এমন তিনটি শাড়ি, বোন আর প্রিয় বান্ধবীদের জন্য।') },
]

const PICK_LOOKS: Record<string, Look> = {
  p1: lk('#5C2470', '#C9A04A', '#EED48C', 'kolka'),
  p2: lk('#1B1717', '#8C8C94', '#D6D6DC'),
  p3: lk('#7FC4AE', '#C9A04A', '#EED48C', 'buti'),
  p4: lk('#E2A419', '#B3191F', '#F5D889', 'kolka'),
  p5: lk('#1F3F8F', '#E2A419', '#F5D889', 'buti'),
  p6: lk('#1E3A7B', '#B3191F', '#E2BE62'),
  p7: lk('#D2457A', '#E3A92B', '#F5D889', 'buti'),
}
const PICKS_S: Saree[] = PICKS.map((p) => ({
  id: p.id,
  group: 'pick',
  photo: p.photo,
  price: p.price,
  name: p.title,
  kind: p.kind,
  fabric: p.kind,
  origin: L('Bangladesh', 'বাংলাদেশ'),
  look: PICK_LOOKS[p.id],
  story: L('One of this week’s picks, chosen by hand at the showroom.', 'এই সপ্তাহের বাছাই, শোরুমে হাতে বেছে নেওয়া।'),
}))

const BRIDAL_EXTRA = [
  { id: 'b9', photo: '1610173827043-9db50e0d8ef9', price: 52000, off: 0, name: L('Shubho Biye Benarasi', 'শুভ বিয়ে বেনারসি'), fabric: L('Benarasi · heavy gold zari', 'বেনারসি · ভারী সোনালি জরি') },
  { id: 'b10', photo: '1684868268327-7e5590bcfbd6', price: 44800, off: 10, name: L('Sindoor Rani Katan', 'সিঁদুর রানী কাতান'), fabric: L('Katan · red & gold', 'কাতান · লাল ও সোনালি') },
  { id: 'b11', photo: '1610276347459-825713e28145', price: 39500, off: 8, name: L('Alta Lal Silk', 'আলতা লাল সিল্ক'), fabric: L('Silk · temple border', 'সিল্ক · মন্দির পাড়') },
]
export const BRIDAL_ALL = [...BRIDAL, ...BRIDAL_EXTRA]

const BRIDAL_S: Saree[] = BRIDAL_ALL.map((b) => {
  const sale = b.off ? Math.round((b.price * (100 - b.off)) / 10000) * 100 : b.price
  return {
    id: b.id,
    group: 'bridal',
    photo: b.photo,
    price: sale,
    was: b.off ? b.price : undefined,
    badge: b.off ? L(`−${b.off}%`, `−${b.off.toLocaleString('bn-BD')}%`) : L('Bridal', 'বিয়ের'),
    name: b.name,
    kind: L('Bridal', 'বিয়ের শাড়ি'),
    fabric: b.fabric,
    origin: L('Mirpur Benarasi Palli, Dhaka', 'মিরপুর বেনারসি পল্লী, ঢাকা'),
    look: lk('#9E1620', '#D4A63F', '#F0CF77', 'jamdani'),
    story: L('Woven for the day you will tell your grandchildren about. Book a private viewing at the showroom.', 'যে দিনের গল্প নাতি-নাতনিদের বলবেন, সেই দিনের জন্য বোনা। শোরুমে আলাদা করে দেখার সময় বুক করুন।'),
  }
})

export const SAREES: Saree[] = [...NEW, ...PICKS_S, ...BRIDAL_S]
export const byId = (id: string) => SAREES.find((s) => s.id === id)
export const NEW_ARRIVALS = NEW

/** Season arches open a matching saree. */
export const SEASON_SAREE = ['n10', 'p3', 'n10', 'n11', 'n6', 'n3']

export const LOOKBOOK_MORE = ['1787295779676-181b3d5b55dd', '1772887438776-28a6f8b2e29d', '1758797315311-07c928608c04', '1619516388835-2b60acc4049e', '1692992193981-d3d92fabd9cb', '1610047614301-13c63f00c032']
