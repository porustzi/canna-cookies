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
  const [busy, setBusy] = useState<string | null>(null)

  const remove = async (item: AdminFeedback) => {
    if (!window.confirm(`Удалить обращение ${item.id}?`)) return
    setBusy(item.id)
    try {
      await api.deleteFeedback(item.id)
      onSaved('Обращение удалено')
    } catch (e) {
      onSaved(e instanceof Error ? e.message : 'Ошибка')
    } finally {
      setBusy(null)
    }
  }

  const items = state.feedback

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[13.5px] leading-relaxed text-mist/70">Вопросы, жалобы и споры клиентов. Просмотр и удаление.</p>
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
            {item.tg ? ` · ${item.tg.startsWith('@') ? item.tg : `@${item.tg}`}` : ''}
          </p>
          <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-snow">{item.text}</p>

          <div>
            <button
              type="button"
              disabled={busy === item.id}
              onClick={() => void remove(item)}
              className="cc-btn-ghost px-4 py-2 text-[11px] hover:border-[rgba(255,90,90,0.5)] hover:text-[#FF9D9D]"
            >
              🗑 Удалить
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
