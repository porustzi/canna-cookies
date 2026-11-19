import { useState } from 'react'
import { api, type AdminOrder, type AdminState } from './api'

const STATUS_LABEL: Record<string, string> = {
  new: 'Новый',
  taken: 'Взят',
  done: 'Выполнен',
  cancelled: 'Отменён',
  confirmed: 'Подтверждён',
  declined: 'Отклонён',
}

function fmt(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getDate())}.${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}`
}

export function OrdersEditor({ state, onSaved }: { state: AdminState; onSaved: (msg: string) => void }) {
  const [busy, setBusy] = useState<string | null>(null)
  const orders = state.orders

  const revenue = orders.filter((o) => o.status === 'done').reduce((n, o) => n + o.grand, 0)
  const counts = {
    all: orders.length,
    new: orders.filter((o) => o.status === 'new').length,
    taken: orders.filter((o) => o.status === 'taken').length,
    done: orders.filter((o) => o.status === 'done').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
  }

  const act = async (id: string, action: 'cancel' | 'notify' | 'delete', confirmText?: string) => {
    if (confirmText && !window.confirm(confirmText)) return
    setBusy(`${id}:${action}`)
    try {
      await api.orderAction(id, action)
      onSaved(action === 'notify' ? 'Заказ отправлен курьерам' : action === 'cancel' ? 'Заказ отменён' : 'Заказ удалён')
    } catch (e) {
      onSaved(e instanceof Error ? e.message : 'Ошибка')
    } finally {
      setBusy(null)
    }
  }

  const courierName = (id?: string) => (id ? (state.couriers.find((c) => c.id === id)?.name ?? id) : '')

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 text-[13px] text-mist">
          <span className="cc-card px-3 py-1.5">Всего: <b className="text-snow">{counts.all}</b></span>
          <span className="cc-card px-3 py-1.5">Новых: <b className="text-aqua">{counts.new}</b></span>
          <span className="cc-card px-3 py-1.5">Взято: <b className="text-[#FFD28F]">{counts.taken}</b></span>
          <span className="cc-card px-3 py-1.5">Выполнено: <b className="text-aqua">{counts.done}</b></span>
          <span className="cc-card px-3 py-1.5">Отменено: <b className="text-mist">{counts.cancelled}</b></span>
          <span className="cc-card px-3 py-1.5">Выручка: <b className="text-aqua">{revenue} Kč</b></span>
        </div>
        <a href={api.ordersCsvUrl()} className="cc-btn-ghost px-4 py-2 text-[11px]">
          ⬇ CSV
        </a>
      </div>

      <div className="flex flex-col gap-3">
        {orders.length === 0 && <div className="cc-card p-6 text-center text-mist">Заказов пока нет.</div>}
        {orders.map((o: AdminOrder) => (
          <div key={o.id} className="cc-card flex flex-col gap-3 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-display text-[14.5px] font-semibold text-aqua">{o.id}</span>
                <span
                  className={`rounded-full border px-2.5 py-0.5 font-display text-[10px] uppercase tracking-[0.14em] ${
                    o.status === 'done'
                      ? 'border-aqua/50 bg-aqua/10 text-aqua'
                      : o.status === 'new'
                        ? 'border-white/20 bg-white/[0.05] text-snow'
                        : o.status === 'cancelled'
                          ? 'border-[#FF9D9D]/40 bg-[#FF9D9D]/10 text-[#FF9D9D]'
                          : 'border-[#FFD28F]/50 bg-[#FFD28F]/10 text-[#FFD28F]'
                  }`}
                >
                  {STATUS_LABEL[o.status] ?? o.status}
                </span>
                {o.reviewed && <span className="font-display text-[10px] uppercase text-aqua">⭐ получен</span>}
                {o.promo && <span className="font-display text-[10px] uppercase text-mist">промо {o.promo}</span>}
              </div>
              <span className="text-[12.5px] text-mist/70">{fmt(o.createdAt)}</span>
            </div>

            <div className="grid gap-1.5 text-[13.5px] text-mist sm:grid-cols-2">
              <p>
                👤 {o.name} · {o.phone}
              </p>
              <p>
                📍 {o.district?.name ?? '—'} · {o.address}
              </p>
              <p className="sm:col-span-2">
                {o.items.map((i) => `${i.name} ${i.weight} ×${i.qty}`).join(', ')}
              </p>
              <p>
                {o.total} + {o.delivery} {o.discount ? `− ${o.discount}` : ''} = <b className="text-aqua">{o.grand} Kč</b>
                {o.payment ? ` · ${o.payment}` : ''}
              </p>
              <p>
                {o.takenBy ? `🚴 ${courierName(o.takenBy)}` : '—'}
                {o.comment ? ` · 💬 ${o.comment}` : ''}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {(o.status === 'new' || o.status === 'taken') && (
                <button
                  type="button"
                  disabled={busy === `${o.id}:cancel`}
                  onClick={() => void act(o.id, 'cancel', `Отменить заказ ${o.id}?`)}
                  className="cc-btn-ghost px-4 py-2 text-[11px] hover:border-[rgba(255,90,90,0.5)] hover:text-[#FF9D9D]"
                >
                  ✕ Отменить
                </button>
              )}
              {o.status === 'new' && (
                <button
                  type="button"
                  disabled={busy === `${o.id}:notify`}
                  onClick={() => void act(o.id, 'notify')}
                  className="cc-btn-ghost px-4 py-2 text-[11px]"
                >
                  ↻ Отправить курьерам
                </button>
              )}
              <button
                type="button"
                disabled={busy === `${o.id}:delete`}
                onClick={() => void act(o.id, 'delete', `Удалить заказ ${o.id}?`)}
                className="cc-btn-ghost px-4 py-2 text-[11px] hover:border-[rgba(255,90,90,0.5)] hover:text-[#FF9D9D]"
              >
                🗑 Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
