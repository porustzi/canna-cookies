import { LANGS, type Category, type District, type Faq, type FaqItem, type L, type Lang, type Product, type Settings, type Weight } from './defaults'

export const MAX_PRODUCTS = 200
export const MAX_CATEGORIES = 30
export const MAX_DISTRICTS = 20
export const MAX_WEIGHTS = 20
export const MAX_FAQ = 50
export const MAX_PAYMENT = 6
export const MAX_IMAGE_BYTES = 1_500_000

const SLUG = /^[a-z0-9][a-z0-9-]{0,59}$/

export function isSlug(value: string): boolean {
  return SLUG.test(value)
}

function isObj(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function strMax(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null
  const v = value.trim()
  if (v.length > max) return null
  return v
}

/** Validates an L object: each of cs/en/ru must be a string ≤ max (may be empty). */
export function vL(value: unknown, max: number): L | null {
  if (!isObj(value)) return null
  const out = { cs: '', en: '', ru: '' }
  for (const lang of LANGS) {
    const v = value[lang]
    if (typeof v !== 'string') return null
    if (v.length > max) return null
    out[lang] = v.trim()
  }
  return out
}

function hasText(l: L): boolean {
  return l.cs !== '' || l.en !== '' || l.ru !== ''
}

function vWeight(value: unknown): Weight | null {
  if (!isObj(value)) return null
  const label = strMax(value.label, 40)
  if (label === null || label.length < 1) return null
  const price = value.price
  if (typeof price !== 'number' || !Number.isInteger(price) || price < 0 || price > 1_000_000) return null
  return { label, price }
}

export function vProduct(value: unknown): Product | null {
  if (!isObj(value)) return null
  const id = typeof value.id === 'string' ? value.id : ''
  if (!isSlug(id)) return null
  const name = vL(value.name, 120)
  if (!name || !hasText(name)) return null
  const desc = vL(value.desc, 1000)
  if (!desc) return null
  const category = typeof value.category === 'string' ? value.category.trim().slice(0, 60) : ''
  if (category.length < 1) return null
  if (!Array.isArray(value.weights) || value.weights.length < 1 || value.weights.length > MAX_WEIGHTS) return null
  const weights: Weight[] = []
  const seen = new Set<string>()
  for (const raw of value.weights) {
    const w = vWeight(raw)
    if (!w || seen.has(w.label)) return null
    seen.add(w.label)
    weights.push(w)
  }
  if (typeof value.available !== 'boolean') return null
  let image: Product['image'] = null
  if (value.image !== null && value.image !== undefined) {
    if (!isObj(value.image)) return null
    const mime = typeof value.image.mime === 'string' ? value.image.mime : ''
    const v = value.image.v
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(mime)) return null
    if (typeof v !== 'number' || !Number.isInteger(v) || v < 0) return null
    image = { mime, v }
  }
  return { id, name, desc, category, weights, available: value.available, image }
}

export function vProducts(value: unknown): Product[] | null {
  if (!Array.isArray(value) || value.length > MAX_PRODUCTS) return null
  const out: Product[] = []
  const seen = new Set<string>()
  for (const raw of value) {
    const p = vProduct(raw)
    if (!p || seen.has(p.id)) return null
    seen.add(p.id)
    out.push(p)
  }
  return out
}

export function vCategory(value: unknown): Category | null {
  if (!isObj(value)) return null
  const id = typeof value.id === 'string' ? value.id : ''
  if (!isSlug(id)) return null
  const name = vL(value.name, 60)
  if (!name || !hasText(name)) return null
  return { id, name }
}

export function vCategories(value: unknown): Category[] | null {
  if (!Array.isArray(value) || value.length > MAX_CATEGORIES) return null
  const out: Category[] = []
  const seen = new Set<string>()
  for (const raw of value) {
    const c = vCategory(raw)
    if (!c || seen.has(c.id)) return null
    seen.add(c.id)
    out.push(c)
  }
  return out
}

export function vDistrict(value: unknown): District | null {
  if (!isObj(value)) return null
  const id = typeof value.id === 'string' ? value.id : ''
  if (!isSlug(id)) return null
  const name = vL(value.name, 60)
  if (!name || !hasText(name)) return null
  const eta = vL(value.eta, 60)
  if (!eta) return null
  const fee = value.fee
  if (typeof fee !== 'number' || !Number.isInteger(fee) || fee < 0 || fee > 100_000) return null
  return { id, name, fee, eta }
}

export function vDistricts(value: unknown): District[] | null {
  if (!Array.isArray(value) || value.length > MAX_DISTRICTS) return null
  const out: District[] = []
  const seen = new Set<string>()
  for (const raw of value) {
    const d = vDistrict(raw)
    if (!d || seen.has(d.id)) return null
    seen.add(d.id)
    out.push(d)
  }
  return out
}

export function vSettings(value: unknown): Settings | null {
  if (!isObj(value)) return null
  const paymentRaw = value.payment
  if (!Array.isArray(paymentRaw) || paymentRaw.length > MAX_PAYMENT) return null
  const payment: L[] = []
  for (const raw of paymentRaw) {
    const label = vL(raw, 60)
    if (!label || !hasText(label)) return null
    payment.push(label)
  }
  const minOrder = value.minOrder
  if (typeof minOrder !== 'number' || !Number.isInteger(minOrder) || minOrder < 0 || minOrder > 1_000_000) return null
  const hours = vL(value.hours, 80)
  if (!hours) return null
  if (typeof value.closed !== 'boolean') return null
  const banner = vL(value.banner, 300)
  if (!banner) return null
  return { payment, minOrder, hours, closed: value.closed, banner }
}

export function vFaqItem(value: unknown): FaqItem | null {
  if (!isObj(value)) return null
  const q = strMax(value.q, 300)
  const a = strMax(value.a, 3000)
  if (q === null || a === null || q.length < 1 || a.length < 1) return null
  return { q, a }
}

export function vFaqList(value: unknown): FaqItem[] | null {
  if (!Array.isArray(value) || value.length > MAX_FAQ) return null
  const out: FaqItem[] = []
  for (const raw of value) {
    const item = vFaqItem(raw)
    if (!item) return null
    out.push(item)
  }
  return out
}

/** Merges a validated per-lang faq list into the full faq record. */
export function mergeFaq(faq: Faq, lang: Lang, list: FaqItem[]): Faq {
  const next: Faq = { ...faq }
  for (const l of LANGS) next[l] = faq[l] ?? []
  next[lang] = list
  return next
}

export type ImagePayload = { mime: string; data: ArrayBuffer }

export function vImage(value: unknown): ImagePayload | null {
  if (!isObj(value)) return null
  const mime = typeof value.mime === 'string' ? value.mime : ''
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(mime)) return null
  const b64 = typeof value.data === 'string' ? value.data : ''
  if (b64.length < 1 || b64.length > Math.ceil((MAX_IMAGE_BYTES * 4) / 3) + 16) return null
  if (!/^[A-Za-z0-9+/=\s]+$/.test(b64)) return null
  try {
    const bin = atob(b64.replace(/\s+/g, ''))
    if (bin.length < 1 || bin.length > MAX_IMAGE_BYTES) return null
    const bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
    return { mime, data: bytes.buffer }
  } catch {
    return null
  }
}
