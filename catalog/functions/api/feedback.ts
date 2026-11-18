import { clientIp, json, putJson, readBody, str, type Env } from '../_lib/kv'
import { clearFailures, isRateLimited, recordFailure } from '../_lib/ratelimit'
import { sendFeedbackToTelegram } from '../_lib/telegram'

type RawFeedback = {
  type?: unknown
  name?: unknown
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
  const contact = typeof body.contact === 'string' ? body.contact.slice(0, 120) : ''

  if (!type || !name || name.length < 2 || !text || text.length < 5) {
    await recordFailure(env, 'fb', ip)
    return json({ error: 'bad-payload' }, 400)
  }

  const id = feedbackId()
  const feedback = {
    id,
    createdAt: new Date().toISOString(),
    type,
    name,
    contact,
    text,
  }

  await putJson(env, `fb:${id}`, feedback, TTL)
  await clearFailures(env, 'fb', ip)
  await sendFeedbackToTelegram(env, { id, type })

  return json({ ok: true })
}
