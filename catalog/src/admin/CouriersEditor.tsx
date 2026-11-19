import { useState } from 'react'
import { api, type AdminState } from './api'

export function CouriersEditor({ state, onSaved }: { state: AdminState; onSaved: (msg: string) => void }) {
  const [inviteName, setInviteName] = useState('')
  const [invite, setInvite] = useState<{ code: string; link: string } | null>(null)
  const [busy, setBusy] = useState(false)

  const createInvite = async () => {
    const name = inviteName.trim()
    if (name.length < 2) {
      onSaved('Введите имя курьера')
      return
    }
    setBusy(true)
    try {
      const res = await api.courierAction({ action: 'invite', name })
      setInvite({ code: res.code ?? '', link: res.link ?? '' })
      setInviteName('')
      onSaved(`Инвайт для «${name}» создан`)
    } catch (e) {
      onSaved(e instanceof Error ? e.message : 'Ошибка')
    } finally {
      setBusy(false)
    }
  }

  const toggle = async (id: string) => {
    setBusy(true)
    try {
      await api.courierAction({ id, action: 'toggle' })
      onSaved('Курьер обновлён')
    } catch (e) {
      onSaved(e instanceof Error ? e.message : 'Ошибка')
    } finally {
      setBusy(false)
    }
  }

  const couriers = state.couriers

  return (
    <div className="flex flex-col gap-4">
      <div className="cc-card flex flex-col gap-3 p-4 sm:flex-row sm:items-end sm:gap-3">
        <label className="block flex-1">
          <span className="font-display text-[11px] uppercase tracking-[0.2em] text-mist/70">Новое приглашение</span>
          <input
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
            placeholder="Имя курьера (например, Pavel)"
            className="mt-2 w-full rounded-xl border border-white/12 bg-graphite px-4 py-3 text-[15px] text-snow placeholder:text-mist/40 outline-none focus:border-aqua/60"
          />
        </label>
        <button type="button" onClick={() => void createInvite()} disabled={busy} className="cc-btn-primary px-5 py-3 text-[11.5px] disabled:opacity-50">
          + Инвайт-код
        </button>
      </div>

      {invite && (
        <div className="cc-card border-aqua/40 p-4">
          <p className="text-[13.5px] text-mist">
            Код: <b className="font-display text-aqua">{invite.code}</b>
          </p>
          <p className="mt-1 break-all text-[13px] text-mist/70">{invite.link}</p>
          <p className="mt-2 text-[12.5px] text-mist/60">Отправьте ссылку курьеру — он откроет бота и введётся автоматически.</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {couriers.length === 0 && <div className="cc-card p-6 text-center text-mist">Курьеров пока нет — создайте инвайт.</div>}
        {couriers.map((c) => (
          <div key={c.id} className="cc-card flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-display text-[15px] text-snow">
                {c.name} {!c.active && <span className="text-[11px] text-[#FF9D9D]">(отключён)</span>}
              </p>
              <p className="mt-1 text-[13px] text-mist/70">
                Взято: {c.stats.taken} · Выполнено: {c.stats.done} · Отклонено: {c.stats.declined} · ⭐ {c.stats.rating ?? 0}
              </p>
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={() => void toggle(c.id)}
              className={`rounded-full border px-4 py-2 font-display text-[11px] uppercase tracking-[0.14em] ${
                c.active ? 'border-aqua/50 bg-aqua/10 text-aqua' : 'border-white/15 bg-white/[0.04] text-mist'
              }`}
            >
              {c.active ? 'Активен' : 'Отключён'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
