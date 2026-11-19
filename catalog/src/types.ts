export type Lang = 'cs' | 'en' | 'ru'

export type L = Record<Lang, string>

export type Weight = { label: string; price: number }

export type ProductImage = { mime: string; v: number }

export type Product = {
  id: string
  name: L
  desc: L
  category: string
  weights: Weight[]
  available: boolean
  image: ProductImage | null
}

export type Category = { id: string; name: L }

export type District = { id: string; name: L; fee: number; eta: L; coverage?: L }

export type Contacts = { phone: string; tg: string; address: string }

export type Promo = { code: string; percent: number }

export type Settings = {
  payment: L[]
  minOrder: number
  hours: L
  closed: boolean
  banner: L
  contacts?: Contacts
  freeDeliveryFrom?: number
  promo?: Promo | null
  texts?: { demo: L; closed: L; privacy: L }
  schedule?: Record<string, string>
}

export type FaqItem = { q: string; a: string }

export type CatalogData = {
  categories: Category[]
  products: Product[]
  districts: District[]
  settings: Settings
  faq: Record<Lang, FaqItem[]>
}

export function pick(l: L | null | undefined, lang: Lang): string {
  if (!l) return ''
  return l[lang] || l.cs || l.en || l.ru || ''
}

export function productImageUrl(p: Product): string | null {
  return p.image ? `/api/img/product/${encodeURIComponent(p.id)}?v=${p.image.v}` : null
}

export type CartItem = { productId: string; weightLabel: string; qty: number }

export type Zone = { districtId: string; address: string }

export type OrderLine = { productId: string; name: string; weight: string; price: number; qty: number }

export type OrderPayload = {
  items: OrderLine[]
  districtId: string
  address: string
  name: string
  phone: string
  payment: string
  comment: string
  website: string
  lang: Lang
  tgId?: string
  tg?: string
  promo?: string
}
