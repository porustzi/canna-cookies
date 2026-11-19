import type { CatalogData, OrderPayload } from './types'

async function req<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  let body: unknown = null
  try {
    body = await res.json()
  } catch {
    /* non-JSON */
  }
  if (!res.ok) {
    const err = (body as { error?: string } | null)?.error
    throw new Error(err ?? `HTTP ${res.status}`)
  }
  return body as T
}

export function getCatalog(): Promise<CatalogData> {
  return req<CatalogData>('/api/catalog')
}

export function submitOrder(payload: OrderPayload): Promise<{ ok: boolean; id: string; grand: number }> {
  return req('/api/order', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function submitFeedback(payload: {
  type: string
  name: string
  phone: string
  tg: string
  text: string
  website: string
}): Promise<{ ok: boolean }> {
  return req('/api/feedback', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export type OrderInfo = {
  id: string
  status: string
  createdAt?: string
  total: number
  delivery: number
  discount: number
  grand: number
  payment?: string
  district?: { name: string; fee: number }
  assigned: boolean
  reviewed: boolean
  reply?: string
  items: { name: string; weight: string; price: number; qty: number }[]
}

export function getOrder(id: string): Promise<OrderInfo> {
  return req<{ order: OrderInfo }>(`/api/order/${encodeURIComponent(id)}`).then((r) => r.order)
}

export function myOrders(tgId: string): Promise<OrderInfo[]> {
  return req<{ orders: OrderInfo[] }>(`/api/myorders?tg=${encodeURIComponent(tgId)}`).then((r) => r.orders)
}

export function cancelOrder(orderId: string): Promise<{ ok: boolean }> {
  return req('/api/cancel', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ orderId }),
  })
}

export function openDispute(orderId: string, text: string): Promise<{ ok: boolean }> {
  return req('/api/dispute', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ orderId, text }),
  })
}

export function confirmReceived(orderId: string): Promise<{ ok: boolean }> {
  return req('/api/review', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ orderId }),
  })
}
