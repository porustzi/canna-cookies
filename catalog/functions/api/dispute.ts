import { clientIp, json, putJson, readBody, readJson, str, type Env } from '../_lib/kv'
import { clearFailures, cooldownRemaining, isRateLimited, markCooldown, recordFailure } from '../_lib/ratelimit'
import { isGarbage } from '../_lib/garbage'
import { sendFeedbackToTelegram } from '../_lib/telegram'
import type { OrderRecord } from '../_lib/orderNotify'

type RawDispute = {
  orderId?: unknown
  text?: unknown
}

const TTL = 7776000 // 90 дней
const ID_RE = /^CC-[A-Z0-9]{4,24}$/i

function feedbackId(): string {
  const time = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `FB-${time}${rand}`
}

/**
 * Спор по заказу: клиент указывает номер заказа и проблему.
 * Обращение уходит в бот поддержки с привязкой к заказу;
 * имя и контакт берутся из самого заказа (подлинность по ID).
 */
export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context
  const ip = clientIp(request)

  if (await isRateLimited(env, 'dispute', ip)) {
    return json({ error: 'rate-limited' }, 429, { 'retry-after': '900' })
  }

  const body = await readBody<RawDispute>(request)
  if (!body) return json({ error: 'bad-payload' }, 400)

  const orderId = typeof body.orderId === 'string' ? body.orderId.trim().toUpperCase() : ''
  const text = str(body.text, 3000)

  if (!ID_RE.test(orderId) || !text || text.length < 5) {
    await recordFailure(env, 'dispute', ip)
    return json({ error: 'bad-payload' }, 400)
  }

  if (isGarbage(text)) {
    return json({ ok: true })
  }

  const order = await readJson<OrderRecord | null>(env, `order:${orderId}`, null)
  if (!order || order.id.toUpperCase() !== orderId) {
    await recordFailure(env, 'dispute', ip)
    return json({ error: 'not-found' }, 404)
  }

  // 1 спор в час с устройства
  const cool = await cooldownRemaining(env, 'dispute', ip)
  if (cool > 0) {
    return json({ error: 'rate-limited' }, 429, { 'retry-after': String(cool) })
  }

  const id = feedbackId()
  const contact = [order.phone ? `тел. ${order.phone}` : '', order.tg].filter(Boolean).join(' · ')
  const feedback = {
    id,
    createdAt: new Date().toISOString(),
    type: 'dispute',
    orderId: order.id,
    name: order.name,
    contact,
    text,
  }

  await putJson(env, `fb:${id}`, feedback, TTL)
  await clearFailures(env, 'dispute', ip)
  await markCooldown(env, 'dispute', ip, 60)
  await sendFeedbackToTelegram(env, {
    id,
    type: 'dispute',
    name: order.name,
    contact,
    text,
    orderId: order.id,
  })

  return json({ ok: true, id })
}
