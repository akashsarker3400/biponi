import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Lang = 'bn' | 'en'
export type Txt = { en: string; bn: string }
export const L = (en: string, bn: string): Txt => ({ en, bn })

type Ctx = {
  lang: Lang
  setLang: (l: Lang) => void
  t: (x: Txt) => string
  taka: (n: number) => string
  num: (n: number) => string
}

const LangContext = createContext<Ctx | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('sb-lang') : null
    return saved === 'en' ? 'en' : 'bn'
  })

  useEffect(() => {
    localStorage.setItem('sb-lang', lang)
    document.documentElement.lang = lang
    document.documentElement.dataset.lang = lang
  }, [lang])

  const locale = lang === 'bn' ? 'bn-BD' : 'en-IN'
  const value: Ctx = {
    lang,
    setLang,
    t: (x) => x[lang],
    num: (n) => n.toLocaleString(locale),
    taka: (n) => '৳' + n.toLocaleString(locale),
  }
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useLang() {
  const c = useContext(LangContext)
  if (!c) throw new Error('useLang outside provider')
  return c
}
