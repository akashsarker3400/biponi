import Lenis from 'lenis'
import { MotionConfig } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'
import { Bridal, Lookbook } from './components/Bridal'
import { Drape } from './components/Drape'
import { ShopWalk } from './components/ShopWalk'
import { ZariCursor } from './components/ZariCursor'
import { Cursor } from './components/Cursor'
import { Checkout } from './components/Checkout'
import { QuickView } from './components/QuickView'
import { Arrivals } from './components/Arrivals'
import { Accordion, Ring } from './components/Gallery'
import { Track } from './components/Track'
import { Unfold } from './components/Unfold'
import { Hero, Ticker, Trust } from './components/Hero'
import { Search } from './components/Search'
import { TabBar } from './components/TabBar'
import { Looms } from './components/Looms'
import { Nav, Preloader } from './components/Nav'
import { Picks } from './components/Picks'
import { Rack } from './components/Rack'
import { ChalaDefs, Seasons } from './components/Seasons'
import { Drawer, Footer, Overlays, Visit } from './components/Shell'
import { Studio } from './components/Studio'
import { scroller } from './components/ui'
import { LangProvider } from './i18n'
import { StoreProvider } from './store'
import { OpsProvider } from './ops'

export default function App() {
  const [loading, setLoading] = useState(() => !sessionStorage.getItem('sb-seen'))
  const [curtain, setCurtain] = useState(loading)
  const done = useCallback(() => {
    sessionStorage.setItem('sb-seen', '1')
    setLoading(false)
  }, [])
  const end = useCallback(() => setCurtain(false), [])

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true })
    scroller.lenis = lenis
    let raf = 0
    const loop = (time: number) => {
      lenis.raf(time)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
      scroller.lenis = null
    }
  }, [])

  useEffect(() => {
    if (loading) scroller.lenis?.stop()
    else scroller.lenis?.start()
  }, [loading])

  return (
    <MotionConfig reducedMotion="user">
      <LangProvider>
        <OpsProvider>
        <StoreProvider>
          <ChalaDefs />
          {curtain && <Preloader onOpen={done} onEnd={end} />}
          <ZariCursor />
          <Cursor />
          <Nav />
          <main>
            <Hero ready={!loading} />
            <Ticker />
            <Trust />
            <ShopWalk />
            <Seasons />
            <Arrivals />
            <Drape />
            <Unfold />
            <Studio />
            <Picks />
            <Ring />
            <Rack />
            <Looms />
            <Bridal />
            <Accordion />
            <Lookbook />
            <Visit />
          </main>
          <Footer />
          <Drawer />
          <Checkout />
          <QuickView />
          <Search />
          <TabBar />
          <Track />
          <Overlays />
        </StoreProvider>
        </OpsProvider>
      </LangProvider>
    </MotionConfig>
  )
}
