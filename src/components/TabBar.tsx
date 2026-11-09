import { motion, useMotionValueEvent, useScroll } from 'motion/react'
import { useEffect, useState, type ReactNode } from 'react'
import { L, useLang, type Txt } from '../i18n'
import { useStore } from '../store'
import { IBag, IHeart, ISearch, LogoMark } from './SareeArt'
import { scrollToId } from './ui'

const buzz = () => {
  if ('vibrate' in navigator) navigator.vibrate(8)
}

/** Phone-only bottom bar, like a shopping app. */
export function TabBar() {
  const { t, num } = useLang()
  const { cart, wish, setDrawer, drawer, bump } = useStore()
  const { scrollY } = useScroll()
  const [active, setActive] = useState('home')
  const [hide, setHide] = useState(false)
  const count = cart.reduce((s, x) => s + x.qty, 0)

  // tuck away while scrolling down fast, come back on the way up
  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0
    if (y > prev + 12 && y > 400) setHide(true)
    else if (y < prev - 6) setHide(false)
  })

  useEffect(() => {
    if (drawer) setActive(drawer === 'bag' ? 'bag' : 'wish')
  }, [drawer])

  const tabs: { id: string; label: Txt; icon: ReactNode; badge?: number; go: () => void }[] = [
    { id: 'home', label: L('Home', 'হোম'), icon: <LogoMark size={20} />, go: () => scrollToId('top') },
    { id: 'search', label: L('Search', 'খুঁজুন'), icon: <ISearch size={20} />, go: () => window.dispatchEvent(new Event('sb:search')) },
    { id: 'new', label: L('New', 'নতুন'), icon: <span className="tb-new">✦</span>, go: () => scrollToId('arrivals') },
    { id: 'wish', label: L('Saved', 'পছন্দ'), icon: <IHeart size={20} />, badge: wish.length, go: () => setDrawer('wish') },
    { id: 'bag', label: L('Bag', 'ব্যাগ'), icon: <IBag size={20} />, badge: count, go: () => setDrawer('bag') },
  ]

  return (
    <motion.nav className="tabbar" animate={{ y: hide ? 110 : 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
      {tabs.map((x) => (
        <motion.button
          key={x.id}
          id={x.id === 'bag' ? 'tab-bag' : undefined}
          className={'tb' + (active === x.id ? ' on' : '')}
          whileTap={{ scale: 0.86 }}
          onClick={() => {
            buzz()
            setActive(x.id)
            x.go()
          }}
        >
          {active === x.id && <motion.span layoutId="tb-pill" className="tb-pill" transition={{ type: 'spring', stiffness: 420, damping: 32 }} />}
          <motion.span className="tb-ic" key={x.id === 'bag' ? bump : 0} animate={x.id === 'bag' && bump ? { scale: [1, 1.35, 0.9, 1] } : undefined}>
            {x.icon}
            {!!x.badge && <i className="tb-badge">{num(x.badge)}</i>}
          </motion.span>
          <span className="tb-label">{t(x.label)}</span>
        </motion.button>
      ))}
    </motion.nav>
  )
}
