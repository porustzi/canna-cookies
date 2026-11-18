import { createContext, useContext } from 'react'
import type { Dict } from './i18n'
import type { CatalogData, CartItem, Lang, Zone } from './types'
import type { TgUser } from './telegram'

export type Ctx = {
  lang: Lang
  setLang: (lang: Lang) => void
  t: Dict
  data: CatalogData
  zone: Zone
  saveZone: (zone: Zone) => void
  openZoneGate: () => void
  cart: CartItem[]
  addToCart: (productId: string, weightLabel: string, qty: number) => void
  setQty: (index: number, qty: number) => void
  removeAt: (index: number) => void
  clearCart: () => void
  cartCount: number
  route: string
  go: (route: string) => void
  productId: string | null
  openProduct: (id: string | null) => void
  tgUser: TgUser | null
}

export const AppCtx = createContext<Ctx | null>(null)

export function useApp(): Ctx {
  const ctx = useContext(AppCtx)
  if (!ctx) throw new Error('AppCtx missing')
  return ctx
}
