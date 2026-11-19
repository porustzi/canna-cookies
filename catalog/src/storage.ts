import type { CartItem, Lang, Zone } from './types'
import { parseLang } from './i18n'
import { tgLang } from './telegram'

function lsGet(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function lsSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* storage unavailable */
  }
}

export const KEY = {
  lang: 'cc_app_lang',
  age: 'cc_app_age',
  zone: 'cc_app_zone',
  cart: 'cc_app_cart',
} as const

export function detectLang(): Lang {
  const stored = parseLang(lsGet(KEY.lang))
  if (stored) return stored
  const tgL = parseLang(tgLang())
  if (tgL) return tgL
  const nav = parseLang(navigator.language)
  return nav ?? 'cs'
}

export function saveLang(lang: Lang): void {
  lsSet(KEY.lang, lang)
}

export function isAgeOk(): boolean {
  return lsGet(KEY.age) === '1'
}

export function passAge(): void {
  lsSet(KEY.age, '1')
}

export function readZone(): Zone | null {
  const raw = lsGet(KEY.zone)
  if (!raw) return null
  try {
    const z = JSON.parse(raw) as Zone
    if (typeof z.districtId === 'string' && typeof z.address === 'string' && z.address.trim()) return z
  } catch {
    /* corrupt — reset */
  }
  return null
}

export function writeZone(zone: Zone): void {
  lsSet(KEY.zone, JSON.stringify(zone))
}

export function readCart(): CartItem[] {
  const raw = lsGet(KEY.cart)
  if (!raw) return []
  try {
    const items = JSON.parse(raw) as CartItem[]
    if (!Array.isArray(items)) return []
    return items.filter(
      (i) => typeof i.productId === 'string' && typeof i.weightLabel === 'string' && typeof i.qty === 'number' && i.qty > 0,
    )
  } catch {
    return []
  }
}

export function writeCart(items: CartItem[]): void {
  lsSet(KEY.cart, JSON.stringify(items))
}

export type LastOrder = { id: string; grand: number }

export function readLastOrder(): LastOrder | null {
  try {
    const raw = sessionStorage.getItem('cc_last_order')
    if (!raw) return null
    const o = JSON.parse(raw) as LastOrder
    if (typeof o.id === 'string' && typeof o.grand === 'number') return o
  } catch {
    /* ignore */
  }
  return null
}

export function writeLastOrder(order: LastOrder): void {
  try {
    sessionStorage.setItem('cc_last_order', JSON.stringify(order))
  } catch {
    /* ignore */
  }
}

export type MyOrder = { id: string; at: number }

const MY_ORDERS_KEY = 'cc_app_orders'

export function readMyOrders(): MyOrder[] {
  const raw = lsGet(MY_ORDERS_KEY)
  if (!raw) return []
  try {
    const list = JSON.parse(raw) as MyOrder[]
    if (!Array.isArray(list)) return []
    return list.filter((o) => typeof o.id === 'string' && typeof o.at === 'number')
  } catch {
    return []
  }
}

export function addMyOrder(id: string): void {
  const list = readMyOrders().filter((o) => o.id !== id)
  list.unshift({ id, at: Date.now() })
  lsSet(MY_ORDERS_KEY, JSON.stringify(list.slice(0, 20)))
}
