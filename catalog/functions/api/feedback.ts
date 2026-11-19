import { clientIp, json, putJson, readBody, str, type Env } from '../_lib/kv'
import { clearFailures, cooldownRemaining, isRateLimited, markCooldown, recordFailure } from '../_lib/ratelimit'
import { isGarbage } from '../_lib/garbage'
import { sendFeedbackToTelegram } from '../_lib/telegram'

type RawFeedback = {
  type?: unknown
  name?: unknown
  phone?: unknown
  tg?: unknown
  contact?: unknown
  text?: unknown
  website?: unknown
}

const TTL = 7776000 // 90 дней

function feedbackId(): string {
  const time = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `FB-${time}${rand}`
}

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context
  const ip = clientIp(request)

  if (await isRateLimited(env, 'fb', ip)) {
    return json({ error: 'rate-limited' }, 429, { 'retry-after': '900' })
  }

  const body = await readBody<RawFeedback>(request)
  if (!body) return json({ error: 'bad-payload' }, 400)

  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return json({ ok: true })
  }

  const type = body.type === 'complaint' ? 'complaint' : body.type === 'question' ? 'question' : null
  const name = str(body.name, 100)
  const text = str(body.text, 3000)
  const phone = typeof body.phone === 'string' ? body.phone.slice(0, 40).trim() : ''
  const tgRaw = typeof body.tg === 'string' ? body.tg.trim().replace(/^@+/, '') : ''
  const tg = tgRaw ? `@${tgRaw}` : ''
  // старый одиночный контакт поддерживаем как запасной вариант
  const legacyContact = typeof body.contact === 'string' ? body.contact.slice(0, 120).trim() : ''
  const contact = [phone ? `тел. ${phone}` : '', tg, legacyContact].filter(Boolean).join(' · ')

  // мусор («тест», «123», клавиатурный шум) — молча отбрасываем
  if (isGarbage(name, text)) {
    return json({ ok: true })
  }

  if (!type || !name || name.length < 2 || !text || text.length < 5) {
    await recordFailure(env, 'fb', ip)
    return json({ error: 'bad-payload' }, 400)
  }

  // Telegram-username обязателен
  if (!/^@[A-Za-z0-9_]{3,32}$/.test(tg)) {
    await recordFailure(env, 'fb', ip)
    return json({ error: 'tg-required' }, 400)
  }

  // с этого устройства уже был заказ — вопрос не принимаем (жалобы можно)
  if (type === 'question') {
    try {
      const ordered = await env.CATALOG?.get(`iporder:${ip}`)
      if (ordered) return json({ error: 'already-ordered' }, 403)
    } catch {
      /* KV недоступен — не блокируем */
    }
  }

  // 1 обращение в час с устройства — только после успешной валидации
  const cool = await cooldownRemaining(env, 'fb', ip)
  if (cool > 0) {
    return json({ error: 'rate-limited' }, 429, { 'retry-after': String(cool) })
  }

  const id = feedbackId()
  const feedback = {
    id,
    createdAt: new Date().toISOString(),
    type,
    name,
    phone,
    tg,
    contact,
    text,
  }

  await putJson(env, `fb:${id}`, feedback, TTL)
  await clearFailures(env, 'fb', ip)
  await markCooldown(env, 'fb', ip, 60)
  await sendFeedbackToTelegram(env, { id, type, name, contact, text })

  return json({ ok: true })
}
