import { json, readJson, type Env } from '../../_lib/kv'
import type { OrderRecord } from '../../_lib/orderNotify'

const ID_RE = /^CC-[A-Z0-9]{4,24}$/i

/**
 * Публичный статус заказа по номеру — только санитизированные поля
 * (без имени, телефона и адреса клиента).
 */
export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context
  const url = new URL(request.url)
  const raw = decodeURIComponent(url.pathname.split('/').pop() ?? '')
  const id = raw.trim().toUpperCase()

  if (!ID_RE.test(id)) return json({ error: 'not-found' }, 404)

  const order = await readJson<OrderRecord | null>(env, `order:${id}`, null)
  if (!order || order.id.toUpperCase() !== id) return json({ error: 'not-found' }, 404)

  return json({
    ok: true,
    order: {
      id: order.id,
      status: order.status,
      createdAt: order.createdAt,
      total: order.total,
      delivery: order.delivery,
      grand: order.grand,
      payment: order.payment,
      district: order.district ? { name: order.district.name, fee: order.district.fee } : undefined,
      assigned: Boolean(order.takenBy),
      reviewed: Boolean(order.reviewed),
      items: order.items.map((it) => ({ name: it.name, weight: it.weight, price: it.price, qty: it.qty })),
    },
  })
}
