import type { Env } from '../_lib/kv'
import { putJson, readJson } from '../_lib/kv'
import {
  courierByChat,
  createCourier,
  createInvite,
  getCourier,
  listCouriers,
  takeInvite,
  tg,
  takeKeyboard,
  doneKeyboard,
  type Courier,
} from '../_lib/couriers'
import { formatOrderCard, type OrderRecord } from '../_lib/orderNotify'

const TTL = 7776000 // 90 дней, как у заказа

type CallbackQuery = {
  id: string
  data?: string
  message?: { message_id: number; chat: { id: number } }
}

type IncomingMessage = { chat: { id: number }; text?: string }

type Update = { message?: IncomingMessage; callback_query?: CallbackQuery }

const HELP = [
  'Курьер Canna Cookies 🍪',
  '',
  'Команды:',
  '/me — мой кабинет (статистика)',
  '/help — эта справка',
  '',
  'Админ:',
  '/courier <имя> — создать инвайт-код',
  '/couriers — список курьеров',
].join('\n')

const NO_ACCESS = '⛔ Нет доступа. Запросите инвайт-код у администратора.'

function isAdmin(env: Env, chatId: number | string): boolean {
  return Boolean(env.TELEGRAM_ORDER_CHAT_ID) && String(chatId) === env.TELEGRAM_ORDER_CHAT_ID
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
async function editOrderMessages(env: Env, order: OrderRecord): Promise<void> {
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

async function handleCallback(env: Env, cb: CallbackQuery, token: string): Promise<void> {
  const courier = await courierByChat(env, cb.message?.chat.id ?? 0)
  if (!courier || !cb.message) {
    await tg(token, 'answerCallbackQuery', { callback_query_id: cb.id, text: 'Сначала зарегистрируйтесь: /start с инвайт-кодом' })
    return
  }

  const [, orderId, action] = (cb.data ?? '').split(':')
  const key = `order:${orderId}`
  const order = await readJson<OrderRecord | null>(env, key, null)
  if (!order || order.id !== orderId) {
    await tg(token, 'answerCallbackQuery', { callback_query_id: cb.id, text: 'Заказ не найден' })
    return
  }

  if (action === 'take') {
    if (order.status !== 'new') {
      await tg(token, 'answerCallbackQuery', { callback_query_id: cb.id, text: 'Заказ уже обработан' })
      return
    }
    order.status = 'taken'
    order.takenBy = courier.id
    order.reactions = { ...order.reactions, [courier.id]: 'take' }
    courier.stats.taken += 1
    await putJson(env, `courier:${courier.id}`, courier)
    await putJson(env, key, order, TTL)
    await editOrderMessages(env, order)
    await tg(token, 'answerCallbackQuery', {
      callback_query_id: cb.id,
      text: `Заказ ${orderId} взят! Свяжитесь с клиентом: ${order.phone}`,
    })
    return
  }

  if (action === 'decline') {
    if (order.status !== 'new') {
      await tg(token, 'answerCallbackQuery', { callback_query_id: cb.id, text: 'Заказ уже обработан' })
      return
    }
    order.reactions = { ...order.reactions, [courier.id]: 'decline' }
    courier.stats.declined += 1
    await putJson(env, `courier:${courier.id}`, courier)
    await putJson(env, key, order, TTL)
    await editOrderMessages(env, order)
    await tg(token, 'answerCallbackQuery', { callback_query_id: cb.id, text: 'Отклонено' })
    return
  }

  if (action === 'done') {
    if (order.status !== 'taken' || order.takenBy !== courier.id) {
      await tg(token, 'answerCallbackQuery', { callback_query_id: cb.id, text: 'Заказ вам не принадлежит' })
      return
    }
    order.status = 'done'
    courier.stats.done += 1
    await putJson(env, `courier:${courier.id}`, courier)
    await putJson(env, key, order, TTL)
    await editOrderMessages(env, order)
    await tg(token, 'answerCallbackQuery', { callback_query_id: cb.id, text: 'Отлично! Заказ закрыт ✅' })
    return
  }

  await tg(token, 'answerCallbackQuery', { callback_query_id: cb.id })
}

async function handleMessage(env: Env, msg: IncomingMessage, token: string): Promise<void> {
  const chatId = msg.chat.id
  const text = (msg.text ?? '').trim()
  const [rawCmd, ...rest] = text.split(/[\s?]+/)
  const command = (rawCmd ?? '').split('@')[0].toLowerCase()
  const arg = rest.join(' ').trim()
  const admin = isAdmin(env, chatId)

  if (command === '/start') {
    const existing = await courierByChat(env, chatId)
    if (existing) {
      await tg(token, 'sendMessage', { chat_id: chatId, text: `Ты уже зарегистрирован как «${existing.name}». /me — кабинет.` })
      return
    }
    if (arg) {
      const invite = await takeInvite(env, arg)
      if (!invite) {
        await tg(token, 'sendMessage', { chat_id: chatId, text: 'Инвайт-код недействителен или истёк.' })
        return
      }
      const courier = await createCourier(env, invite.name, chatId)
      await tg(token, 'sendMessage', {
        chat_id: chatId,
        text: `✅ Добро пожаловать, ${courier.name}!\nТы зарегистрирован как курьер Canna Cookies.\n\nЗаказы будут приходить сюда с кнопками ✅ Взять / ❌ Отклонить.\n/me — твой кабинет.`,
      })
      return
    }
    if (admin) {
      const courier = await createCourier(env, 'Владелец', chatId)
      await tg(token, 'sendMessage', {
        chat_id: chatId,
        text: `✅ Ты зарегистрирован как курьер «${courier.name}».\n\n${HELP}`,
      })
      return
    }
    await tg(token, 'sendMessage', { chat_id: chatId, text: NO_ACCESS })
    return
  }

  const courier = await courierByChat(env, chatId)

  if (command === '/help') {
    await tg(token, 'sendMessage', { chat_id: chatId, text: HELP })
    return
  }

  if (command === '/me') {
    if (!courier) {
      await tg(token, 'sendMessage', { chat_id: chatId, text: NO_ACCESS })
      return
    }
    const s = courier.stats
    await tg(token, 'sendMessage', {
      chat_id: chatId,
      text: [
        `👤 ${courier.name}`,
        `Взято заказов: ${s.taken}`,
        `Выполнено: ${s.done}`,
        `Отклонено: ${s.declined}`,
        courier.active ? 'Статус: активен' : 'Статус: отключён',
      ].join('\n'),
    })
    return
  }

  if (command === '/courier' || command === '/курьер') {
    if (!admin) {
      await tg(token, 'sendMessage', { chat_id: chatId, text: NO_ACCESS })
      return
    }
    if (!arg) {
      await tg(token, 'sendMessage', { chat_id: chatId, text: 'Использование: /courier <имя>' })
      return
    }
    const code = await createInvite(env, arg)
    await tg(token, 'sendMessage', {
      chat_id: chatId,
      text: `Инвайт для «${arg}»:\n${code}\n\nСсылка:\nhttps://t.me/cookies_orders_bot?start=${code}`,
    })
    return
  }

  if (command === '/couriers' || command === '/курьеры') {
    if (!admin) {
      await tg(token, 'sendMessage', { chat_id: chatId, text: NO_ACCESS })
      return
    }
    const all = await listCouriers(env)
    const lines = all.map(
      (c) => `• ${c.name} — взято ${c.stats.taken}, выполнено ${c.stats.done}, отклонено ${c.stats.declined}${c.active ? '' : ' (отключён)'}`,
    )
    await tg(token, 'sendMessage', {
      chat_id: chatId,
      text: lines.length ? `Курьеры (${all.length}):\n${lines.join('\n')}` : 'Курьеров пока нет. /courier <имя>',
    })
    return
  }

  // любые прочие команды от курьера — тихо
}

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context

  const secret = env.TELEGRAM_ORDER_WEBHOOK_SECRET
  if (!secret || request.headers.get('x-telegram-bot-api-secret-token') !== secret) {
    return new Response('forbidden', { status: 403 })
  }

  const token = env.TELEGRAM_ORDER_TOKEN
  if (!token) return new Response('ok')

  let update: Update
  try {
    update = (await request.json()) as Update
  } catch {
    return new Response('ok')
  }

  if (update.callback_query) {
    await handleCallback(env, update.callback_query, token)
    return new Response('ok')
  }

  if (update.message?.text) {
    await handleMessage(env, update.message, token)
  }
  return new Response('ok')
}
