import { json, readJson, type Env } from '../../_lib/kv'
import { remindOrder } from '../../_lib/couriers'
import { cooldownRemaining, markCooldown } from '../../_lib/ratelimit'
import { safeEqual } from '../../_lib/safe'
import type { OrderRecord } from '../../_lib/orderNotify'

const REMINDER_SEC = 300 // 5 минут

/**
 * Cron-эндпоинт: напоминания по заказам, которые никто не взял.
 * Вызывается cron-воркером каждые 5 минут с заголовком x-cron-secret.
 */
export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context

  const secret = env.CRON_SECRET
  if (!secret || !safeEqual(request.headers.get('x-cron-secret') ?? '', secret)) {
    return json({ error: 'forbidden' }, 403)
  }

  // не чаще одного вызова в30сек с одного IP (защита эндпоинта)
  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown'
  if ((await cooldownRemaining(env, 'cron', ip)) > 0) {
    return json({ skipped: true })
  }
  await markCooldown(env, 'cron', ip, 30)

  const store = env.CATALOG
  if (!store) return json({ checked: 0, reminded: 0 })

  const now = Math.floor(Date.now() / 1000)
  let checked = 0
  let reminded = 0

  try {
    const listed = await store.list({ prefix: 'order:', limit: 500 })
    for (const key of listed.keys) {
      const order = await readJson<OrderRecord | null>(env, key.name, null)
      if (!order || order.status !== 'new') continue
      checked += 1

      const base = order.lastReminderAt ?? (order.createdAt ? Math.floor(new Date(order.createdAt).getTime() / 1000) : now)
      if (now - base < REMINDER_SEC) continue

      const result = await remindOrder(env, order)
      if (result !== 'skip') reminded += 1
    }
  } catch {
    return json({ error: 'kv-error' }, 500)
  }

  return json({ checked, reminded })
}
