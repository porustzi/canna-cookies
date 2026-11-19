import type { Env } from './kv'

export type OrderLine = { name: string; weight: string; price: number; qty: number }

export type OrderRecord = {
  id: string
  createdAt?: string
  status: string
  items: OrderLine[]
  district?: { id?: string; name: string; fee: number }
  address: string
  name: string
  phone: string
  payment: string
  comment?: string
  lang?: string
  total: number
  delivery: number
  grand: number
}

const LANGS: Record<string, string> = { ru: 'русский', cs: 'чешский', en: 'английский' }

export const ORDER_STATUS_LABEL: Record<string, string> = {
  new: '🆕 Новый',
  confirmed: '✅ Подтверждён',
  declined: '❌ Отклонён',
}

function fmtDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getDate())}.${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}`
}

export function formatOrderCard(order: OrderRecord): string {
  const lines: string[] = []
  const label = ORDER_STATUS_LABEL[order.status] ?? order.status
  lines.push(`${label} заказ ${order.id}`)
  const date = order.createdAt ? fmtDate(order.createdAt) : ''
  if (date) lines.push(date)
  lines.push('')
  lines.push('Позиции:')
  for (const it of order.items.slice(0, 30)) {
    lines.push(`• ${it.name} · ${it.weight} ×${it.qty} — ${it.price * it.qty} Kč`)
  }
  lines.push('')
  const zone = order.district ? `${order.district.name} (+${order.district.fee} Kč)` : '—'
  lines.push(`Зона: ${zone}`)
  lines.push(`Сумма: ${order.total} Kč · доставка ${order.delivery} Kč · итого ${order.grand} Kč`)
  lines.push('')
  lines.push(`Имя: ${order.name}`)
  lines.push(`Телефон: ${order.phone}`)
  lines.push(`Адрес: ${order.address}`)
  if (order.payment) lines.push(`Оплата: ${order.payment}`)
  if (order.comment) lines.push(`Комментарий: ${order.comment}`)
  if (order.lang) lines.push(`Язык клиента: ${LANGS[order.lang] ?? order.lang}`)
  return lines.join('\n')
}

export function orderKeyboard(id: string): { inline_keyboard: { text: string; callback_data: string }[][] } {
  return {
    inline_keyboard: [
      [
        { text: '✅ Подтвердить', callback_data: `ord:${id}:ok` },
        { text: '❌ Отклонить', callback_data: `ord:${id}:no` },
      ],
    ],
  }
}

async function tg(token: string, method: string, payload: Record<string, unknown>): Promise<void> {
  try {
    await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    /* Telegram не должен ронять приём заказа */
  }
}

/**
 * Уведомление владельцу о новом заказе — отдельный бот заказов.
 * Нужны секреты TELEGRAM_ORDER_TOKEN и TELEGRAM_ORDER_CHAT_ID.
 * Ошибка Telegram не валит запрос — заказ уже сохранён в KV.
 */
export async function sendOrderNotification(env: Env, order: OrderRecord): Promise<void> {
  const token = env.TELEGRAM_ORDER_TOKEN
  const chatId = env.TELEGRAM_ORDER_CHAT_ID
  if (!token || !chatId) return
  await tg(token, 'sendMessage', {
    chat_id: chatId,
    text: formatOrderCard(order),
    reply_markup: JSON.stringify(orderKeyboard(order.id)),
  })
}
