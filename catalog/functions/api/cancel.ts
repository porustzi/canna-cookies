import { clientIp, json, putJson, readBody, readJson, type Env } from '../_lib/kv'
import { clearFailures, cooldownRemaining, isRateLimited, markCooldown, recordFailure } from '../_lib/ratelimit'
import { editOrderMessages } from '../_lib/couriers'
import type { OrderRecord } from '../_lib/orderNotify'

type RawCancel = { orderId?: unknown }

const TTL = 7776000 // 90 дней
const ID_RE = /^CC-[A-Z0-9]{4,24}$/i

/**
 * Отмена заказа клиентом — только пока курьер не взял.
 * Сообщения курьерам обновляются: «🚫 Заказ отменён».
 */
export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context
  const ip = clientIp(request)

  if (await isRateLimited(env, 'cancel', ip)) {
    return json({ error: 'rate-limited' }, 429, { 'retry-after': '900' })
  }

  const body = await readBody<RawCancel>(request)
  const orderId = body && typeof body.orderId === 'string' ? body.orderId.trim().toUpperCase() : ''
  if (!ID_RE.test(orderId)) {
    await recordFailure(env, 'cancel', ip)
    return json({ error: 'bad-payload' }, 400)
  }

  const order = await readJson<OrderRecord | null>(env, `order:${orderId}`, null)
  if (!order || order.id.toUpperCase() !== orderId) {
    await recordFailure(env, 'cancel', ip)
    return json({ error: 'not-found' }, 404)
  }

  if (order.status !== 'new') {
    return json({ error: 'too-late' }, 409)
  }

  const cool = await cooldownRemaining(env, 'cancel', ip)
  if (cool > 0) {
    return json({ error: 'rate-limited' }, 429, { 'retry-after': String(cool) })
  }

  order.status = 'cancelled'
  await putJson(env, `order:${order.id}`, order, TTL)
  await editOrderMessages(env, order)

  await clearFailures(env, 'cancel', ip)
  await markCooldown(env, 'cancel', ip, 60)

  return json({ ok: true })
}
