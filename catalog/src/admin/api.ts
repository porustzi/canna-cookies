import type { CatalogData, Category, District, FaqItem, L, Lang, Product, Settings } from '../types'

export type AdminCourier = {
  id: string
  name: string
  chatId: string
  active: boolean
  createdAt: string
  stats: { taken: number; done: number; declined: number; rating?: number }
}

export type AdminOrder = {
  id: string
  createdAt?: string
  status: string
  items: { productId?: string; name: string; weight: string; price: number; qty: number }[]
  district?: { id?: string; name: string; fee: number }
  address: string
  name: string
  phone: string
  payment: string
  comment?: string
  lang?: string
  tg?: string
  total: number
  delivery: number
  discount?: number
  promo?: string
  grand: number
  takenBy?: string
  reviewed?: boolean
}

export type AdminFeedback = {
  id: string
  createdAt?: string
  type: string
  name: string
  contact?: string
  phone?: string
  tg?: string
  text: string
  orderId?: string
  reply?: string
}

export type AdminState = CatalogData & {
  kv: boolean
  orders: AdminOrder[]
  feedback: AdminFeedback[]
  couriers: AdminCourier[]
}

export const LANG_LABELS: { code: Lang; label: string }[] = [
  { code: 'ru', label: 'Русский' },
  { code: 'cs', label: 'Čeština' },
  { code: 'en', label: 'English' },
]

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
  })
  if (res.status === 401) {
    location.reload()
    throw new Error('Сессия истекла — войдите снова.')
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(body.error ?? `Ошибка ${res.status}`)
  }
  return (await res.json()) as T
}

export const api = {
  state: () => req<AdminState>('/admin/api/state'),
  saveProducts: (products: Product[]) =>
    req<{ ok: boolean }>('/admin/api/products', { method: 'PUT', body: JSON.stringify(products) }),
  saveCategories: (categories: Category[]) =>
    req<{ ok: boolean }>('/admin/api/categories', { method: 'PUT', body: JSON.stringify(categories) }),
  saveDistricts: (districts: District[]) =>
    req<{ ok: boolean }>('/admin/api/districts', { method: 'PUT', body: JSON.stringify(districts) }),
  saveSettings: (settings: Settings) =>
    req<{ ok: boolean }>('/admin/api/settings', { method: 'PUT', body: JSON.stringify(settings) }),
  saveFaq: (lang: Lang, items: FaqItem[]) =>
    req<{ ok: boolean }>(`/admin/api/faq/${lang}`, { method: 'PUT', body: JSON.stringify(items) }),
  uploadImage: (productId: string, mime: string, data: string) =>
    req<{ ok: boolean }>(`/admin/api/product-image/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ mime, data }),
    }),
  deleteImage: (productId: string) =>
    req<{ ok: boolean }>(`/admin/api/product-image/${productId}`, { method: 'DELETE' }),
  orderAction: (id: string, action: 'cancel' | 'notify' | 'delete') =>
    req<{ ok: boolean }>('/admin/api/orders', { method: 'PUT', body: JSON.stringify({ id, action }) }),
  replyFeedback: (id: string, orderId: string | undefined, text: string) =>
    req<{ ok: boolean }>('/admin/api/feedback-reply', {
      method: 'PUT',
      body: JSON.stringify({ id, orderId, text }),
    }),
  courierAction: (body: { id?: string; action: 'toggle' | 'invite'; name?: string }) =>
    req<{ ok: boolean; code?: string; link?: string }>('/admin/api/couriers', {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  ordersCsvUrl: () => '/admin/api/orders.csv',
}

export async function fileToPayload(file: File): Promise<{ mime: string; data: string }> {
  const bitmap = await createImageBitmap(file)
  const maxSide = 1280
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  const w = Math.max(1, Math.round(bitmap.width * scale))
  const h = Math.max(1, Math.round(bitmap.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas-unavailable')
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close()
  const keepPng = file.type === 'image/png'
  const url = keepPng ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', 0.82)
  const data = url.slice(url.indexOf(',') + 1)
  const bytes = Math.round((data.length * 3) / 4)
  if (bytes > 1_400_000) throw new Error('Файл слишком большой после обработки.')
  return { mime: keepPng ? 'image/png' : 'image/jpeg', data }
}

export function emptyL(): L {
  return { ru: '', cs: '', en: '' }
}
