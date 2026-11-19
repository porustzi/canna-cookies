import type { CartItem, CatalogData } from './types'

export function findProduct(data: CatalogData, productId: string) {
  return data.products.find((p) => p.id === productId) ?? null
}

export function linePrice(data: CatalogData, item: CartItem): number | null {
  const product = findProduct(data, item.productId)
  if (!product) return null
  const weight = product.weights.find((w) => w.label === item.weightLabel) ?? product.weights[0]
  if (!weight) return null
  return weight.price * item.qty
}

export function weightGrams(label: string): number | null {
  const m = label.replace(',', '.').match(/(\d+(?:\.\d+)?)/)
  return m ? Number(m[1]) : null
}

export type Totals = {
  count: number
  subtotal: number
  delivery: number
  grand: number
  grams: number | null
}

export function cartTotals(data: CatalogData, cart: CartItem[], districtFee: number): Totals {
  let subtotal = 0
  let grams = 0
  let anyGrams = false
  for (const item of cart) {
    const line = linePrice(data, item)
    if (line !== null) subtotal += line
    const g = weightGrams(item.weightLabel)
    if (g !== null) {
      grams += g * item.qty
      anyGrams = true
    }
  }
  let delivery = cart.length > 0 ? districtFee : 0
  const freeFrom = data.settings.freeDeliveryFrom ?? 0
  if (freeFrom > 0 && subtotal >= freeFrom) delivery = 0
  return {
    count: cart.reduce((n, i) => n + i.qty, 0),
    subtotal,
    delivery,
    grand: subtotal + delivery,
    grams: anyGrams ? grams : null,
  }
}

/** Скидка по промокоду:0 — код не задан или не совпал. */
export function promoDiscount(data: CatalogData, code: string, subtotal: number): number {
  const promo = data.settings.promo
  if (!promo?.code || !code.trim()) return 0
  if (code.trim().toLowerCase() !== promo.code.toLowerCase()) return 0
  return Math.min(subtotal, Math.round((subtotal * promo.percent) / 100))
}
