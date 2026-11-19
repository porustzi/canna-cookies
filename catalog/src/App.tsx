import { useCallback, useEffect, useState } from 'react'
import { AppCtx, type Ctx } from './context'
import { DICTS } from './i18n'
import { getCatalog } from './api'
import { tgInit, tgUser, type TgUser } from './telegram'
import { detectLang, isAgeOk, passAge, readCart, readZone, saveLang, writeCart, writeZone } from './storage'
import type { CartItem, CatalogData, Lang, Zone } from './types'
import { AgeGate } from './components/AgeGate'
import { DistrictGate } from './components/DistrictGate'
import { Header } from './components/Header'
import { BottomNav } from './components/BottomNav'
import { CatalogView } from './components/CatalogView'
import { ProductSheet } from './components/ProductSheet'
import { CartView } from './components/CartView'
import { CheckoutView } from './components/CheckoutView'
import { ConfirmView } from './components/ConfirmView'
import { FaqView } from './components/FaqView'
import { FeedbackView } from './components/FeedbackView'

const ROUTES = ['cart', 'checkout', 'faq', 'feedback', 'order'] as const

function parseHash(): string {
  const raw = window.location.hash.replace(/^#\/?/, '')
  return (ROUTES as readonly string[]).includes(raw) ? raw : 'catalog'
}

export default function App() {
  const [data, setData] = useState<CatalogData | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)
  const [reload, setReload] = useState(0)
  const [lang, setLangState] = useState<Lang>(detectLang)
  const [ageOk, setAgeOk] = useState(() => isAgeOk())
  const [zone, setZone] = useState<Zone | null>(() => readZone())
  const [zoneGate, setZoneGate] = useState(false)
  const [cart, setCart] = useState<CartItem[]>(() => readCart())
  const [route, setRoute] = useState(parseHash)
  const [productId, setProductId] = useState<string | null>(null)
  const [user] = useState<TgUser | null>(() => tgUser())

  useEffect(() => {
    tgInit()
  }, [])

  useEffect(() => {
    let alive = true
    getCatalog()
      .then((d) => {
        if (alive) setData(d)
      })
      .catch(() => {
        if (alive) setLoadFailed(true)
      })
    return () => {
      alive = false
    }
  }, [reload])

  useEffect(() => {
    const onHash = () => setRoute(parseHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    writeCart(cart)
  }, [cart])

  const t = DICTS[lang]

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    saveLang(next)
  }, [])

  const go = useCallback((next: string) => {
    window.location.hash = next === 'catalog' ? '#/' : `#/${next}`
    setRoute(next)
    window.scrollTo({ top: 0 })
  }, [])

  const saveZone = useCallback((next: Zone) => {
    writeZone(next)
    setZone(next)
    setZoneGate(false)
  }, [])

  const addToCart = useCallback((id: string, weightLabel: string, qty: number) => {
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.productId === id && i.weightLabel === weightLabel)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { ...next[idx], qty: Math.min(20, next[idx].qty + qty) }
        return next
      }
      return [...prev, { productId: id, weightLabel, qty }]
    })
  }, [])

  const setQty = useCallback((index: number, qty: number) => {
    setCart((prev) => prev.map((i, n) => (n === index ? { ...i, qty: Math.max(1, Math.min(20, qty)) } : i)))
  }, [])

  const removeAt = useCallback((index: number) => {
    setCart((prev) => prev.filter((_, n) => n !== index))
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  if (!data) {
    if (loadFailed) {
      return (
        <div className="grid min-h-dvh place-items-center px-6 text-center">
          <div className="flex flex-col items-center gap-4">
            <p className="text-mist">{t.error}</p>
            <button
              type="button"
              onClick={() => {
                setLoadFailed(false)
                setReload((r) => r + 1)
              }}
              className="cc-btn-primary px-6 py-3 text-[12.5px]"
            >
              {t.retry}
            </button>
          </div>
        </div>
      )
    }
    return (
      <div className="grid min-h-dvh place-items-center px-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <span className="h-8 w-8 animate-pulse rounded-full bg-aqua/70" />
          <p className="font-display text-[12px] uppercase tracking-[0.22em] text-mist">{t.loading}</p>
        </div>
      </div>
    )
  }

  if (!ageOk) {
    return (
      <AgeGate
        t={t}
        onAgree={() => {
          passAge()
          setAgeOk(true)
        }}
      />
    )
  }

  if (!zone) {
    return <DistrictGate t={t} data={data} lang={lang} zone={null} onSave={saveZone} />
  }

  const ctx: Ctx = {
    lang,
    setLang,
    t,
    data,
    zone,
    saveZone,
    openZoneGate: () => setZoneGate(true),
    cart,
    addToCart,
    setQty,
    removeAt,
    clearCart,
    cartCount: cart.reduce((n, i) => n + i.qty, 0),
    route,
    go,
    productId,
    openProduct: setProductId,
    tgUser: user,
  }

  let view = <CatalogView />
  if (route === 'cart' || (route === 'checkout' && cart.length === 0)) view = <CartView />
  else if (route === 'checkout') view = <CheckoutView />
  else if (route === 'faq') view = <FaqView />
  else if (route === 'feedback') view = <FeedbackView />
  else if (route === 'order') view = <ConfirmView />

  return (
    <AppCtx.Provider value={ctx}>
      <div className="min-h-dvh">
        <Header />
        <main className="mx-auto flex max-w-3xl flex-col gap-5 px-4 pt-5 pb-36">
          {view}
          <p className="mt-4 text-center font-display text-[10px] uppercase tracking-[0.24em] text-mist/40">
            {t.footer.rights}
          </p>
        </main>
        <BottomNav />
        <ProductSheet />
        {zoneGate && (
          <DistrictGate t={t} data={data} lang={lang} zone={zone} onSave={saveZone} onClose={() => setZoneGate(false)} />
        )}
      </div>
    </AppCtx.Provider>
  )
}
