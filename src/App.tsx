import { useCallback, useEffect, useMemo, useState } from 'react'
import { SiteContext } from './site'
import { DICTS, SEO, SITE_URL, parseLang } from './i18n'
import type { Lang } from './i18n'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { About } from './components/About'
import { Why } from './components/Why'
import { Delivery } from './components/Delivery'
import { Catalog } from './components/Catalog'
import { Faq } from './components/Faq'
import { Contacts } from './components/Contacts'
import { Footer } from './components/Footer'
import { AgeGate } from './components/AgeGate'
import { ComingSoon } from './components/ComingSoon'

const AGE_KEY = 'cc_age_v1'
const ALL_LANGS: Lang[] = ['cs', 'en', 'ru']

type AgeState = 'gate' | 'ok' | 'denied'

function readAge(): AgeState {
  try {
    const value = localStorage.getItem(AGE_KEY)
    if (value === 'ok') return 'ok'
    if (value === 'denied') return 'denied'
  } catch {
    /* storage unavailable */
  }
  return 'gate'
}

function setMeta(name: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setMetaProperty(property: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('property', property)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setLink(rel: string, href: string, attr?: { name: string; value: string }) {
  const selector = attr ? `link[rel="${rel}"][${attr.name}="${attr.value}"]` : `link[rel="${rel}"]`
  let el = document.head.querySelector<HTMLLinkElement>(selector)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    if (attr) el.setAttribute(attr.name, attr.value)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

export default function App({ initialLang }: { initialLang: Lang }) {
  const [lang, setLang] = useState<Lang>(initialLang)
  const [age, setAge] = useState<AgeState>(readAge)
  const [catalogOpen, setCatalogOpen] = useState(false)

  const t = DICTS[lang]

  useEffect(() => {
    const seo = SEO[lang]
    document.title = seo.title
    document.documentElement.lang = lang

    setMeta('description', seo.description)
    setMetaProperty('og:title', seo.title)
    setMetaProperty('og:description', seo.description)
    setMetaProperty('og:url', `${SITE_URL}/${lang}/`)
    setMetaProperty('og:locale', seo.locale)
    setMetaProperty('og:image', `${SITE_URL}/og.jpg`)
    setMeta('twitter:image', `${SITE_URL}/og.jpg`)

    setLink('canonical', `${SITE_URL}/${lang}/`)
    ALL_LANGS.forEach((code) => setLink('alternate', `${SITE_URL}/${code}/`, { name: 'hreflang', value: code }))

    try {
      localStorage.setItem('cc_lang', lang)
    } catch {
      /* storage unavailable */
    }
  }, [lang])

  useEffect(() => {
    const onPopState = () => setLang(parseLang(window.location.pathname))
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const switchLang = useCallback(
    (next: Lang) => {
      if (next === lang) return
      const hash = window.location.hash
      window.history.pushState(null, '', `/${next}/${hash}`)
      setLang(next)
    },
    [lang],
  )

  const acceptAge = useCallback(() => {
    try {
      localStorage.setItem(AGE_KEY, 'ok')
    } catch {
      /* storage unavailable */
    }
    setAge('ok')
  }, [])

  const denyAge = useCallback(() => {
    try {
      localStorage.setItem(AGE_KEY, 'denied')
    } catch {
      /* storage unavailable */
    }
    setAge('denied')
  }, [])

  const openCatalog = useCallback(() => setCatalogOpen(true), [])
  const closeCatalog = useCallback(() => setCatalogOpen(false), [])

  const value = useMemo(
    () => ({ lang, t, switchLang, openCatalog }),
    [lang, t, switchLang, openCatalog],
  )

  return (
    <SiteContext.Provider value={value}>
      {age === 'ok' ? (
        <>
          <Header />
          <main>
            <Hero />
            <About />
            <Why />
            <Delivery />
            <Catalog />
            <Faq />
            <Contacts />
          </main>
          <Footer />
        </>
      ) : (
        <AgeGate mode={age === 'denied' ? 'denied' : 'gate'} onAccept={acceptAge} onDeny={age === 'gate' ? denyAge : undefined} />
      )}
      <ComingSoon open={catalogOpen} onClose={closeCatalog} />
    </SiteContext.Provider>
  )
}
