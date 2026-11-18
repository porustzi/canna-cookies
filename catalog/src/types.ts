export type Lang = 'cs' | 'en' | 'ru'

export type Weight = { label: string; price: number }

export type Product = {
  id: string
  name: string
  desc: string
  category: string
  weights: Weight[]
  available: boolean
}

export type Category = { id: string; name: string }

export type District = { id: string; name: string; fee: number; eta: string }

export type Settings = {
  payment: string[]
  minOrder: number
  hours: string
  closed: boolean
  banner: string
}

export type FaqItem = { q: string; a: string }

export type CatalogData = {
  categories: Category[]
  products: Product[]
  districts: District[]
  settings: Settings
  faq: Record<Lang, FaqItem[]>
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
}
