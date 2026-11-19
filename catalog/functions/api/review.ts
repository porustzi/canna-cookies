import { clientIp, json, putJson, readBody, readJson, type Env } from '../_lib/kv'
import { clearFailures, cooldownRemaining, isRateLimited, markCooldown, recordFailure } from '../_lib/ratelimit'
import { getCourier, saveCourier, tg } from '../_lib/couriers'
import type { OrderRecord } from '../_lib/orderNotify'

type RawReview = {
  orderId?: unknown
}

const TTL = 7776000 // 90 дней
const ID_RE = /^CC-[A-Z0-9]{4,24}$/i

/**
 * «Получил заказ» — клиент подтверждает доставку.
 * Курьер, который вёз заказ, получает +1 к рейтингу и уведомление в бот.
 */
export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context
  const ip = clientIp(request)

  if (await isRateLimited(env, 'review', ip)) {
    return json({ error: 'rate-limited' }, 429, { 'retry-after': '900' })
  }

  const body = await readBody<RawReview>(request)
  const orderId = body && typeof body.orderId === 'string' ? body.orderId.trim().toUpperCase() : ''
  if (!ID_RE.test(orderId)) {
    await recordFailure(env, 'review', ip)
    return json({ error: 'bad-payload' }, 400)
  }

  const order = await readJson<OrderRecord | null>(env, `order:${orderId}`, null)
  if (!order || order.id.toUpperCase() !== orderId) {
    await recordFailure(env, 'review', ip)
    return json({ error: 'not-found' }, 404)
  }

  // уже подтверждено — идемпотентно, без повторного рейтинга
  if (order.reviewed) return json({ ok: true, already: true })

  if (!order.takenBy) {
    await recordFailure(env, 'review', ip)
    return json({ error: 'not-assigned' }, 400)
  }

  // 1 подтверждение в час с устройства
  const cool = await cooldownRemaining(env, 'review', ip)
  if (cool > 0) {
    return json({ error: 'rate-limited' }, 429, { 'retry-after': String(cool) })
  }

  order.reviewed = true
  await putJson(env, `order:${order.id}`, order, TTL)

  const courier = await getCourier(env, order.takenBy)
  if (courier) {
    courier.stats.rating = (courier.stats.rating ?? 0) + 1
    await saveCourier(env, courier)
    const token = env.TELEGRAM_ORDER_TOKEN
    if (token) {
      await tg(token, 'sendMessage', {
        chat_id: courier.chatId,
        text: `⭐ Клиент подтвердил получение заказа ${order.id}\nКлиент: ${order.name}\n\nСпасибо за работу! Твой рейтинг: ${courier.stats.rating}`,
      })
    }
  }

  await clearFailures(env, 'review', ip)
  await markCooldown(env, 'review', ip, 60)

  return json({ ok: true })
}
