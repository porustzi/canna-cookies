import { clientIp, json, readJson, type Env } from '../../_lib/kv'
import { clearFailures, isRateLimited, recordFailure } from '../../_lib/ratelimit'
import { publicOrder, type OrderRecord } from '../../_lib/orderNotify'

const ID_RE = /^CC-[A-Z0-9]{4,24}$/i

type DisputeReply = { text: string }

/**
 * Публичный статус заказа по номеру — санитизированные поля
 * (без имени, телефона и адреса) + ответ поддержки, если был.
 * Брутфорс ID:5 неверных попыток →429 на15 минут.
 */
export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context
  const ip = clientIp(request)

  if (await isRateLimited(env, 'orderget', ip)) {
    return json({ error: 'rate-limited' }, 429, { 'retry-after': '900' })
  }

  const url = new URL(request.url)
  const raw = decodeURIComponent(url.pathname.split('/').pop() ?? '')
  const id = raw.trim().toUpperCase()

  if (!ID_RE.test(id)) {
    await recordFailure(env, 'orderget', ip)
    return json({ error: 'not-found' }, 404)
  }

  const order = await readJson<OrderRecord | null>(env, `order:${id}`, null)
  if (!order || order.id.toUpperCase() !== id) {
    await recordFailure(env, 'orderget', ip)
    return json({ error: 'not-found' }, 404)
  }
  await clearFailures(env, 'orderget', ip)

  const reply = await readJson<DisputeReply | null>(env, `disputereply:${order.id}`, null)

  return json({ ok: true, order: publicOrder(order, reply?.text) })
}
