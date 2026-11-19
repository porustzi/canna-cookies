import type { Env } from './kv'
import { putJson, type KvNamespace } from './kv'
import { formatOrderCard, type OrderRecord } from './orderNotify'

export type Courier = {
  id: string
  name: string
  chatId: string
  active: boolean
  createdAt: string
  stats: { taken: number; done: number; declined: number; rating?: number }
}

export type Invite = { code: string; name: string; createdAt: string }

const ORDER_TTL = 7776000 // 90 дней, как у заказа
const REMIND_MAX = 12 // не больше 12 напоминаний на заказ (~1 час каждые 5 минут)

function store(env: Env): KvNamespace | null {
  return env.CATALOG ?? null
}

function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

export async function tg(
  token: string,
  method: string,
  payload: Record<string, unknown>,
): Promise<{ ok: boolean; result?: unknown; description?: string } | null> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return (await res.json()) as { ok: boolean; result?: unknown; description?: string }
  } catch {
    return null
  }
}

// ---------- Курьеры ----------

export async function saveCourier(env: Env, courier: Courier): Promise<void> {
  const s = store(env)
  if (!s) return
  await s.put(`courier:${courier.id}`, JSON.stringify(courier))
  await s.put(`ccour:${courier.chatId}`, courier.id)
}

export async function getCourier(env: Env, id: string): Promise<Courier | null> {
  const s = store(env)
  if (!s) return null
  try {
    const raw = await s.get(`courier:${id}`)
    return raw ? (JSON.parse(raw) as Courier) : null
  } catch {
    return null
  }
}

export async function courierByChat(env: Env, chatId: string | number): Promise<Courier | null> {
  const s = store(env)
  if (!s) return null
  try {
    const id = await s.get(`ccour:${String(chatId)}`)
    return id ? await getCourier(env, id) : null
  } catch {
    return null
  }
}

export async function listCouriers(env: Env): Promise<Courier[]> {
  const s = store(env)
  if (!s) return []
  try {
    const listed = await s.list({ prefix: 'courier:', limit: 500 })
    const items = await Promise.all(listed.keys.map((k) => getCourier(env, k.name.slice('courier:'.length))))
    return items.filter((c): c is Courier => Boolean(c && c.id))
  } catch {
    return []
  }
}

export async function createCourier(env: Env, name: string, chatId: string | number): Promise<Courier> {
  const courier: Courier = {
    id: newId('c'),
    name,
    chatId: String(chatId),
    active: true,
    createdAt: new Date().toISOString(),
    stats: { taken: 0, done: 0, declined: 0, rating: 0 },
  }
  await saveCourier(env, courier)
  return courier
}

// ---------- Инвайты ----------

export async function createInvite(env: Env, name: string): Promise<string> {
  const s = store(env)
  const code = Array.from({ length: 8 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('')
  if (s) {
    const invite: Invite = { code, name, createdAt: new Date().toISOString() }
    await s.put(`invite:${code}`, JSON.stringify(invite), { expirationTtl: 604800 }) // 7 дней
  }
  return code
}

export async function takeInvite(env: Env, code: string): Promise<Invite | null> {
  const s = store(env)
  if (!s) return null
  try {
    const raw = await s.get(`invite:${code.toUpperCase()}`)
    if (!raw) return null
    await s.delete(`invite:${code.toUpperCase()}`)
    return JSON.parse(raw) as Invite
  } catch {
    return null
  }
}

// ---------- Клавиатуры ----------

export function takeKeyboard(id: string): string {
  return JSON.stringify({
    inline_keyboard: [
      [
        { text: '✅ Взять', callback_data: `ord:${id}:take` },
        { text: '❌ Отклонить', callback_data: `ord:${id}:decline` },
      ],
    ],
  })
}

export function doneKeyboard(id: string): string {
  return JSON.stringify({
    inline_keyboard: [
      [{ text: '✅ Заказ выполнен', callback_data: `ord:${id}:done` }],
      [{ text: '↩️ Вернуть в пул', callback_data: `ord:${id}:return` }],
    ],
  })
}

async function cardFor(env: Env, order: OrderRecord, viewer: Courier | null): Promise<string> {
  let takenByName: string | undefined
  if (order.takenBy) {
    const taker = await getCourier(env, order.takenBy)
    takenByName = taker?.name
  }
  return formatOrderCard(order, {
    viewerDeclined: Boolean(viewer && order.status === 'new' && order.reactions?.[viewer.id] === 'decline'),
    takenByName,
  })
}

function keyboardFor(order: OrderRecord, viewer: Courier | null): string | undefined {
  if (!viewer) return undefined
  if (order.status === 'new' && !order.reactions?.[viewer.id]) return takeKeyboard(order.id)
  if (order.status === 'taken' && order.takenBy === viewer.id) return doneKeyboard(order.id)
  return undefined
}

/** Редактирует все сообщения заказа у всех курьеров под их локальный вид. */
export async function editOrderMessages(env: Env, order: OrderRecord): Promise<void> {
  const token = env.TELEGRAM_ORDER_TOKEN
  if (!token || !order.msgIds) return
  const couriers = await listCouriers(env)
  const byId = new Map(couriers.map((c) => [c.id, c]))
  for (const [courierId, ids] of Object.entries(order.msgIds)) {
    const viewer = byId.get(courierId)
    if (!viewer) continue
    const text = await cardFor(env, order, viewer)
    const markup = keyboardFor(order, viewer)
    for (const messageId of ids) {
      await tg(token, 'editMessageText', {
        chat_id: viewer.chatId,
        message_id: messageId,
        text,
        reply_markup: markup ? markup : JSON.stringify({ inline_keyboard: [] }),
      })
    }
  }
}

// ---------- Рассылка ----------

/**
 * Отправляет новый заказ всем активным курьерам.
 * Если курьеров нет — plain-карточка админу (без кнопок).
 * Обновляет msgIds/lastReminderAt в заказе и сохраняет его.
 */
export async function broadcastNewOrder(env: Env, order: OrderRecord): Promise<void> {
  const token = env.TELEGRAM_ORDER_TOKEN
  if (!token) return

  const couriers = (await listCouriers(env)).filter((c) => c.active)
  const text = formatOrderCard(order)

  if (couriers.length === 0) {
    const admin = env.TELEGRAM_ORDER_CHAT_ID
    if (admin) {
      await tg(token, 'sendMessage', { chat_id: admin, text: `⚠️ Курьеры не зарегистрированы.\n\n${text}` })
    }
    return
  }

  const msgIds: Record<string, number[]> = { ...(order.msgIds ?? {}) }
  for (const courier of couriers) {
    const res = await tg(token, 'sendMessage', {
      chat_id: courier.chatId,
      text,
      reply_markup: takeKeyboard(order.id),
    })
    const messageId = (res?.result as { message_id?: number } | undefined)?.message_id
    if (messageId) msgIds[courier.id] = [...(msgIds[courier.id] ?? []), messageId].slice(-10)
  }

  order.msgIds = msgIds
  order.lastReminderAt = Math.floor(Date.now() / 1000)
  await putJson(env, `order:${order.id}`, order, ORDER_TTL)
}

/**
 * Напоминание по заказу: тем курьерам, кто ещё не отреагировал.
 * Максимум REMIND_MAX напоминаний (~1 час), затем один раз — админу и тишина.
 */
export async function remindOrder(env: Env, order: OrderRecord): Promise<'reminded' | 'admin' | 'skip'> {
  const token = env.TELEGRAM_ORDER_TOKEN
  if (!token || order.status !== 'new') return 'skip'

  const couriers = (await listCouriers(env)).filter((c) => c.active)
  const nonReactors = couriers.filter((c) => !order.reactions?.[c.id])
  const text = formatOrderCard(order)
  const maxed = (order.reminders ?? 0) >= REMIND_MAX

  if (nonReactors.length > 0 && !maxed) {
    order.msgIds = order.msgIds ?? {}
    for (const courier of nonReactors) {
      const res = await tg(token, 'sendMessage', {
        chat_id: courier.chatId,
        text: `⏳ Напоминание (никто не взял заказ за 5 минут)\n\n${text}`,
        reply_markup: takeKeyboard(order.id),
      })
      const messageId = (res?.result as { message_id?: number } | undefined)?.message_id
      if (messageId) order.msgIds[courier.id] = [...(order.msgIds[courier.id] ?? []), messageId].slice(-10)
    }
    order.reminders = (order.reminders ?? 0) + 1
    order.lastReminderAt = Math.floor(Date.now() / 1000)
    await putJson(env, `order:${order.id}`, order, ORDER_TTL)
    return 'reminded'
  }

  if (!order.adminAlerted) {
    const admin = env.TELEGRAM_ORDER_CHAT_ID
    if (admin) {
      await tg(token, 'sendMessage', {
        chat_id: admin,
        text: `⏳ Заказ ${order.id} никто не взял (${maxed ? 'напоминания исчерпаны' : 'все курьеры отреагировали или курьеров нет'}). Требуется решение вручную.\n\n${text}`,
      })
    }
    order.adminAlerted = true
    order.lastReminderAt = Math.floor(Date.now() / 1000)
    await putJson(env, `order:${order.id}`, order, ORDER_TTL)
    return 'admin'
  }

  return 'skip'
}
