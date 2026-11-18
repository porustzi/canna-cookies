import type { Env } from './kv'

export type OrderPayload = {
  id: string
  grand: number
}

export type FeedbackPayload = {
  id: string
  type: string
  name: string
  contact: string
  text: string
}

/**
 * Заглушка: отправка заказа курьерам через их бота (отдельный токен, не трогаем).
 */
export async function sendOrderToTelegram(_env: Env, _order: OrderPayload): Promise<void> {
  /* TODO(telegram): Bot API sendMessage → чат курьеров */
}

/**
 * Отправляет обращение с вкладки «Контакт» в Telegram-бота поддержки.
 * Нужны секреты TELEGRAM_FEEDBACK_TOKEN и TELEGRAM_FEEDBACK_CHAT_ID.
 * Ошибка Telegram не валит запрос — обращение уже сохранено в KV.
 */
export async function sendFeedbackToTelegram(env: Env, feedback: FeedbackPayload): Promise<void> {
  const token = env.TELEGRAM_FEEDBACK_TOKEN
  const chatId = env.TELEGRAM_FEEDBACK_CHAT_ID
  if (!token || !chatId) return

  const label = feedback.type === 'complaint' ? '⚠️ Жалоба' : '💬 Вопрос'
  const lines = [
    `${label} · ${feedback.id}`,
    `Имя: ${feedback.name}`,
    `Контакт: ${feedback.contact || '—'}`,
    '',
    feedback.text,
  ]

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: lines.join('\n') }),
    })
  } catch {
    /* Telegram недоступен — обращение уже лежит в KV */
  }
}
