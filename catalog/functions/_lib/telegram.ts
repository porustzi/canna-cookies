import type { Env } from './kv'

export type FeedbackPayload = {
  id: string
  type: string
  name: string
  contact: string
  text: string
  orderId?: string
}

export const FEEDBACK_KEYBOARD = [
  [
    { text: '💬 Вопросы', callback_data: 'fb:question' },
    { text: '⚠️ Жалобы', callback_data: 'fb:complaint' },
    { text: '📋 Всё', callback_data: 'fb:all' },
  ],
  [
    { text: '⚔️ Споры', callback_data: 'fb:dispute' },
    { text: '🗑 Очистить', callback_data: 'fb:clear' },
  ],
]

/**
 * Отправляет обращение с вкладки «Контакт» в Telegram-бота поддержки.
 * Нужны секреты TELEGRAM_FEEDBACK_TOKEN и TELEGRAM_FEEDBACK_CHAT_ID.
 * Ошибка Telegram не валит запрос — обращение уже сохранено в KV.
 */
export async function sendFeedbackToTelegram(env: Env, feedback: FeedbackPayload): Promise<void> {
  const token = env.TELEGRAM_FEEDBACK_TOKEN
  const chatIds = (env.TELEGRAM_FEEDBACK_CHAT_ID ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  if (!token || chatIds.length === 0) return

  const label =
    feedback.type === 'complaint' ? '⚠️ Жалоба' : feedback.type === 'dispute' ? '⚔️ Спор' : '💬 Вопрос'
  const lines = [
    `${label} · ${feedback.id}`,
    feedback.orderId ? `Заказ: ${feedback.orderId}` : null,
    `Имя: ${feedback.name}`,
    `Контакт: ${feedback.contact || '—'}`,
    '',
    feedback.text,
  ].filter((x): x is string => Boolean(x))

  const reply_markup = JSON.stringify({ inline_keyboard: FEEDBACK_KEYBOARD })

  for (const chatId of chatIds) {
    try {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: lines.join('\n'), reply_markup }),
        signal: AbortSignal.timeout(5000),
      })
    } catch {
      /* Telegram недоступен — обращение уже лежит в KV */
    }
  }
}
