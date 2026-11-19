import { json, readJson, type Env } from '../_lib/kv'
import { publicOrder, type OrderRecord } from '../_lib/orderNotify'

/**
 * История заказов по TG-id клиента (сквозная история «Мои заказы»).
 * Возвращает санитизированные заказы, последние сверху.
 */
export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context
  const url = new URL(request.url)
  const tgId = url.searchParams.get('tg') ?? ''

  if (!/^\d{1,20}$/.test(tgId)) return json({ error: 'bad-payload' }, 400)

  const store = env.CATALOG
  if (!store) return json({ orders: [] })

  try {
    const listed = await store.list({ prefix: 'order:', limit: 500 })
    const orders: OrderRecord[] = []
    for (const key of listed.keys) {
      const order = await readJson<OrderRecord | null>(env, key.name, null)
      if (order && order.tgId === tgId) orders.push(order)
    }
    orders.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
    return json({ orders: orders.slice(0, 30).map((o) => publicOrder(o)) })
  } catch {
    return json({ orders: [] })
  }
}
