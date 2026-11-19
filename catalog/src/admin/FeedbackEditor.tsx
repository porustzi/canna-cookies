import { useState } from 'react'
import { api, type AdminFeedback, type AdminState } from './api'

const TYPE_LABEL: Record<string, string> = {
  question: '💬 Вопрос',
  complaint: '⚠️ Жалоба',
  dispute: '⚔️ Спор',
}

function fmt(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getDate())}.${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}`
}

export function FeedbackEditor({ state, onSaved }: { state: AdminState; onSaved: (msg: string) => void }) {
  const [replyFor, setReplyFor] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)

  const send = async (item: AdminFeedback) => {
    const body = text.trim()
    if (!body) return
    setBusy(true)
    try {
      await api.replyFeedback(item.id, item.orderId, body)
      onSaved(item.orderId ? `Ответ отправлен (заказ ${item.orderId})` : 'Ответ сохранён')
    } catch (e) {
      onSaved(e instanceof Error ? e.message : 'Ошибка')
    } finally {
      setBusy(false)
    }
  }

  const items = state.feedback

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[13.5px] leading-relaxed text-mist/70">
        Вопросы, жалобы и споры. Ответ по спору увидит клиент в приложении (Мои заказы → Ответ поддержки).
      </p>
      {items.length === 0 && <div className="cc-card p-6 text-center text-mist">Обращений пока нет.</div>}
      {items.map((item) => (
        <div key={item.id} className="cc-card flex flex-col gap-2.5 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-display text-[12px] uppercase tracking-[0.14em] text-snow">
                {TYPE_LABEL[item.type] ?? item.type}
              </span>
              <span className="font-display text-[11px] text-mist/60">{item.id}</span>
              {item.orderId && <span className="font-display text-[11px] text-aqua">заказ {item.orderId}</span>}
            </div>
            <span className="text-[12px] text-mist/60">{fmt(item.createdAt)}</span>
          </div>

          <p className="text-[13.5px] text-mist">
            <b className="text-snow">{item.name}</b>
            {item.contact ? ` · ${item.contact}` : ''}
            {item.phone ? ` · ${item.phone}` : ''}
            {item.tg ? ` · @${item.tg}` : ''}
          </p>
          <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-snow">{item.text}</p>

          {item.reply ? (
            <div className="rounded-xl border border-aqua/40 bg-aqua/[0.07] p-3">
              <p className="font-display text-[11px] uppercase tracking-[0.16em] text-aqua">✓ Ответ отправлен</p>
              <p className="mt-1 whitespace-pre-wrap text-[13.5px] text-snow">{item.reply}</p>
            </div>
          ) : replyFor === item.id ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Ответ клиенту…"
                rows={3}
                className="w-full resize-none rounded-xl border border-white/12 bg-graphite px-4 py-3 text-[14.5px] leading-relaxed text-snow placeholder:text-mist/40 outline-none focus:border-aqua/60"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={busy || !text.trim()}
                  onClick={() => void send(item)}
                  className="cc-btn-primary px-5 py-2.5 text-[11.5px] disabled:opacity-50"
                >
                  {busy ? '…' : 'Отправить ответ'}
                </button>
                <button type="button" onClick={() => setReplyFor(null)} className="cc-btn-ghost px-4 py-2.5 text-[11px]">
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setReplyFor(item.id)
                setText('')
              }}
              className="cc-btn-ghost self-start px-4 py-2 text-[11px]"
            >
              ↩ Ответить
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
