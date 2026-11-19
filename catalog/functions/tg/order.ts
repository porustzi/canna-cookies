import type { Env } from '../_lib/kv'
import { putJson, readJson } from '../_lib/kv'
import { formatOrderCard, ORDER_STATUS_LABEL, type OrderRecord } from '../_lib/orderNotify'

type CallbackQuery = {
  id: string
  data?: string
  message?: { message_id: number; chat: { id: number } }
}

type IncomingMessage = { chat: { id: number }; text?: string }

type Update = { message?: IncomingMessage; callback_query?: CallbackQuery }

const TTL = 7776000 // 90 дней, как у заказа

const WELCOME = [
  'Бот заказов Cookies 🍪',
  '',
  'Заказы из каталога приходят сюда автоматически.',
  'Кнопками подтверждайте или отклоняйте заказ — до выезда курьера.',
].join('\n')

async function tg(token: string, method: string, payload: Record<string, unknown>): Promise<void> {
  try {
    await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    /* сбой Telegram не должен ронять вебхук */
  }
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

  const adminId = env.TELEGRAM_ORDER_CHAT_ID
  const cb = update.callback_query
  const msg = update.message
  const chatId = cb?.message?.chat.id ?? msg?.chat.id
  const isAdmin = Boolean(adminId) && chatId !== undefined && String(chatId) === adminId

  if (cb?.data?.startsWith('ord:')) {
    if (!isAdmin || !cb.message) {
      await tg(token, 'answerCallbackQuery', { callback_query_id: cb.id })
      return new Response('ok')
    }

    const [, orderId, action] = cb.data.split(':')
    const key = `order:${orderId}`
    const order = await readJson<OrderRecord | null>(env, key, null)

    if (!order || order.id !== orderId) {
      await tg(token, 'answerCallbackQuery', { callback_query_id: cb.id, text: 'Заказ не найден' })
      return new Response('ok')
    }
    if (order.status !== 'new') {
      await tg(token, 'answerCallbackQuery', {
        callback_query_id: cb.id,
        text: `Уже обработан: ${ORDER_STATUS_LABEL[order.status] ?? order.status}`,
      })
      return new Response('ok')
    }

    const updated: OrderRecord = {
      ...order,
      status: action === 'ok' ? 'confirmed' : 'declined',
    }
    await putJson(env, key, updated, TTL)

    await tg(token, 'answerCallbackQuery', {
      callback_query_id: cb.id,
      text:
        action === 'ok'
          ? `Заказ ${orderId} подтверждён ✅`
          : `Заказ ${orderId} отклонён ❌`,
    })
    await tg(token, 'editMessageText', {
      chat_id: cb.message.chat.id,
      message_id: cb.message.message_id,
      text: formatOrderCard(updated),
      reply_markup: JSON.stringify({ inline_keyboard: [] }),
    })
    return new Response('ok')
  }

  if (!msg?.text || !isAdmin) return new Response('ok')

  const command = msg.text.trim().split(/[\s?]+/)[0].split('@')[0].toLowerCase()
  if (command === '/start' || command === '/help') {
    await tg(token, 'sendMessage', { chat_id: chatId, text: WELCOME })
  }

  return new Response('ok')
}
