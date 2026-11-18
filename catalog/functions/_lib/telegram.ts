export type OrderPayload = {
  id: string
  grand: number
}

export type FeedbackPayload = {
  id: string
  type: string
}

/**
 * Заглушка: когда будут TELEGRAM_BOT_TOKEN и TELEGRAM_ORDER_CHAT_ID,
 * здесь уйдёт сообщение с заказом в чат курьеров через Bot API.
 */
export async function sendOrderToTelegram(_env: unknown, _order: OrderPayload): Promise<void> {
  /* TODO(telegram): Bot API sendMessage → чат курьеров */
}

/**
 * Заглушка: когда будут TELEGRAM_BOT_TOKEN и TELEGRAM_FEEDBACK_CHAT_ID,
 * здесь уйдёт сообщение с обращением.
 */
export async function sendFeedbackToTelegram(_env: unknown, _feedback: FeedbackPayload): Promise<void> {
  /* TODO(telegram): Bot API sendMessage → чат поддержки */
}
