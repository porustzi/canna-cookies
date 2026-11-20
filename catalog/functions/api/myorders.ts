import { clientIp, json, readJson, type Env } from '../_lib/kv'
import { publicOrder, type OrderRecord } from '../_lib/orderNotify'
import { verifyInitData } from '../_lib/initData'
import { clearFailures, isRateLimited, recordFailure } from '../_lib/ratelimit'

/**
 * История заказов клиента. Требует валидный Telegram initData —
 * сервер берёт id пользователя из подписанного Telegram payload,
 * перебор чужих id невозможен.
 */
export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context
  const ip = clientIp(request)

  if (await isRateLimited(env, 'init', ip)) {
    return json({ error: 'rate-limited' }, 429, { 'retry-after': '900' })
  }

  const initData = request.headers.get('x-telegram-init-data') ?? ''
  const verified = await verifyInitData(initData, env.TELEGRAM_WEBAPP_TOKEN ?? '')
  if (!verified.ok) {
    await recordFailure(env, 'init', ip)
    return json({ error: 'unauthorized' }, 401)
  }
  await clearFailures(env, 'init', ip)

  const store = env.CATALOG
  if (!store) return json({ orders: [] })

  try {
    const listed = await store.list({ prefix: 'order:', limit: 500 })
    const orders: OrderRecord[] = []
    for (const key of listed.keys) {
      const order = await readJson<OrderRecord | null>(env, key.name, null)
      if (order && order.tgId === verified.userId) orders.push(order)
    }
    orders.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
    return json({ orders: orders.slice(0, 30).map((o) => publicOrder(o)) })
  } catch {
    return json({ orders: [] })
  }
}
