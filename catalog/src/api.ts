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
