import type { Env, KvNamespace } from '../_lib/kv'
import { FEEDBACK_KEYBOARD } from '../_lib/telegram'

type FbItem = {
  id: string
  createdAt: string
  type: string
  name: string
  contact: string
  text: string
}

type CallbackQuery = {
  id: string
  data?: string
  message?: { message_id: number; chat: { id: number } }
}

type IncomingMessage = { chat: { id: number }; text?: string }

type Update = { message?: IncomingMessage; callback_query?: CallbackQuery }

const replyMarkup = () => JSON.stringify({ inline_keyboard: FEEDBACK_KEYBOARD })

const WELCOME = [
  'Бот поддержки Cookies 🍪',
  '',
  'Обращения с вкладки «Контакт» приходят сюда автоматически.',
  '',
  'Команды:',
  '/reports — все обращения',
  '/questions — только вопросы',
  '/complaints — только жалобы',
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

function fmtDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getDate())}.${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}`
}

async function loadFeedback(store: KvNamespace | undefined): Promise<FbItem[]> {
  if (!store) return []
  try {
    const listed = await store.list({ prefix: 'fb:', limit: 200 })
    const items = await Promise.all(
      listed.keys.map(async (k) => {
        const raw = await store.get(k.name)
        if (!raw) return null
        try {
          return JSON.parse(raw) as FbItem
        } catch {
          return null
        }
      }),
    )
    return items.filter((x): x is FbItem => Boolean(x && x.id))
  } catch {
    return []
  }
}

function formatList(items: FbItem[], title: string): string {
  if (items.length === 0) return `${title} — пока пусто 🙌`
  const shown = items.slice(0, 10)
  const more = items.length > shown.length ? ` (показаны ${shown.length} последних)` : ''
  const header = `${title} · ${items.length} шт.${more}`
  const body = shown
    .map((it, i) => {
      const kind = it.type === 'complaint' ? 'жалоба' : 'вопрос'
      const who = it.contact ? `${it.name} · ${it.contact}` : it.name
      const text = it.text.length > 240 ? `${it.text.slice(0, 240)}…` : it.text
      return `${i + 1}. ${it.id} · ${fmtDate(it.createdAt)}\n${who} [${kind}]\n${text}`
    })
    .join('\n\n')
  return `${header}\n\n${body}`
}

const TITLES: Record<string, { title: string; type: string | null }> = {
  '/reports': { title: '📋 Все обращения', type: null },
  '/questions': { title: '💬 Вопросы', type: 'question' },
  '/complaints': { title: '⚠️ Жалобы', type: 'complaint' },
}

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context

  const secret = env.TELEGRAM_WEBHOOK_SECRET
  if (!secret || request.headers.get('x-telegram-bot-api-secret-token') !== secret) {
    return new Response('forbidden', { status: 403 })
  }

  const token = env.TELEGRAM_FEEDBACK_TOKEN
  if (!token) return new Response('ok')

  let update: Update
  try {
    update = (await request.json()) as Update
  } catch {
    return new Response('ok')
  }

  const adminId = env.TELEGRAM_FEEDBACK_CHAT_ID
  const cb = update.callback_query
  const msg = update.message
  const chatId = cb?.message?.chat.id ?? msg?.chat.id
  const isAdmin = Boolean(adminId) && chatId !== undefined && String(chatId) === adminId

  if (cb) {
    if (!isAdmin || !cb.message) {
      await tg(token, 'answerCallbackQuery', { callback_query_id: cb.id })
      return new Response('ok')
    }

    if (cb.data === 'fb:clear') {
      let count = 0
      const store = env.CATALOG
      if (store) {
        try {
          const listed = await store.list({ prefix: 'fb:', limit: 200 })
          await Promise.all(
            listed.keys.map(async (k) => {
              await store.delete(k.name)
              count += 1
            }),
          )
        } catch {
          /* KV недоступен */
        }
      }
      await tg(token, 'answerCallbackQuery', { callback_query_id: cb.id, text: `🗑 Удалено обращений: ${count}` })
      await tg(token, 'editMessageText', {
        chat_id: cb.message.chat.id,
        message_id: cb.message.message_id,
        text: `🗑 Очищено · удалено ${count} шт.\n\nСписок пуст 🙌`,
        reply_markup: replyMarkup(),
      })
      return new Response('ok')
    }

    const spec =
      cb.data === 'fb:question'
        ? { title: '💬 Вопросы', type: 'question' }
        : cb.data === 'fb:complaint'
          ? { title: '⚠️ Жалобы', type: 'complaint' }
          : { title: '📋 Все обращения', type: null }
    const items = await loadFeedback(env.CATALOG)
    const filtered = spec.type ? items.filter((i) => i.type === spec.type) : items
    filtered.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
    await tg(token, 'answerCallbackQuery', { callback_query_id: cb.id })
    await tg(token, 'editMessageText', {
      chat_id: cb.message.chat.id,
      message_id: cb.message.message_id,
      text: formatList(filtered, spec.title),
      reply_markup: replyMarkup(),
    })
    return new Response('ok')
  }

  if (!msg?.text || !isAdmin) return new Response('ok')

  const command = msg.text.trim().split(/[\s?]+/)[0].split('@')[0].toLowerCase()

  if (command === '/start' || command === '/help') {
    await tg(token, 'sendMessage', { chat_id: chatId, text: WELCOME, reply_markup: replyMarkup() })
    return new Response('ok')
  }

  const spec = TITLES[command]
  if (spec) {
    const items = await loadFeedback(env.CATALOG)
    const filtered = spec.type ? items.filter((i) => i.type === spec.type) : items
    filtered.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
    await tg(token, 'sendMessage', { chat_id: chatId, text: formatList(filtered, spec.title), reply_markup: replyMarkup() })
  }

  return new Response('ok')
}
