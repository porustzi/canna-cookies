import { useState } from 'react'
import { api, emptyL, type AdminState } from './api'
import { Field, LangTriple } from './ui'
import type { L, Settings } from '../types'

function clone(s: Settings): Settings {
  return {
    payment: s.payment.map((p) => ({ ...p })),
    minOrder: s.minOrder,
    hours: { ...s.hours },
    closed: s.closed,
    banner: { ...s.banner },
  }
}

export function SettingsEditor({ state, onSaved }: { state: AdminState; onSaved: (msg: string) => void }) {
  const [data, setData] = useState<Settings>(() => clone(state.settings))
  const [prev, setPrev] = useState<Settings>(state.settings)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)

  if (prev !== state.settings) {
    setPrev(state.settings)
    setData(clone(state.settings))
    setDirty(false)
    setError(null)
  }

  const update = (patch: Partial<Settings>) => {
    setData((d) => ({ ...d, ...patch }))
    setDirty(true)
    setError(null)
  }

  const setPayment = (i: number, v: L) => {
    update({ payment: data.payment.map((p, idx) => (idx === i ? v : p)) })
  }

  const save = async () => {
    if (!Number.isInteger(data.minOrder) || data.minOrder < 0) {
      setError('Минимальный заказ — целое число ≥ 0.')
      return
    }
    for (const p of data.payment) {
      if (!p.ru && !p.cs && !p.en) {
        setError('Укажите способ оплаты хотя бы на одном языке или удалите строку.')
        return
      }
    }
    setSaving(true)
    try {
      await api.saveSettings(data)
      setDirty(false)
      onSaved('Настройки сохранены')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid max-w-3xl gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-[13.5px] leading-relaxed text-mist/70">Баннер, часы и способы оплаты — на всех трёх языках.</p>
        <div className="flex flex-wrap items-center gap-3">
          {dirty ? (
            <span className="font-display text-[10px] uppercase tracking-[0.2em] text-[#FFD28F] sm:text-[11px]">Есть несохранённые правки</span>
          ) : null}
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving || !dirty}
            className="cc-btn-primary px-5 py-2.5 text-[11px] disabled:opacity-50 sm:px-6 sm:py-3 sm:text-[12px]"
          >
            {saving ? 'Сохранение…' : 'Сохранить'}
          </button>
        </div>
      </div>

      {error && <p className="text-[13.5px] text-[#FF9D9D]">{error}</p>}

      <div className="cc-card grid gap-5 p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-6">
          <button
            type="button"
            onClick={() => update({ closed: !data.closed })}
            className={`rounded-full border px-5 py-2.5 font-display text-[11.5px] uppercase tracking-[0.14em] ${
              data.closed ? 'border-[#FF9D9D]/50 bg-[#FF9D9D]/10 text-[#FF9D9D]' : 'border-aqua/50 bg-aqua/10 text-aqua'
            }`}
          >
            {data.closed ? '✗ Магазин закрыт' : '✓ Магазин открыт'}
          </button>
          <div className="min-w-[180px] flex-1">
            <Field
              label="Минимальный заказ, Kč"
              value={data.minOrder}
              onChange={(v) => update({ minOrder: v === '' ? 0 : Number(v) })}
              type="number"
            />
          </div>
        </div>
        <LangTriple
          label="Баннер (строка над каталогом)"
          value={data.banner}
          onChange={(v) => update({ banner: v })}
          placeholder="Пусто — баннер не показывается"
        />
        <LangTriple label="Часы работы" value={data.hours} onChange={(v) => update({ hours: v })} placeholder="Пн–Сб 10:00–20:00" />
      </div>

      <div className="cc-card grid gap-4 p-4 sm:p-6">
        <span className="cc-eyebrow">Способы оплаты</span>
        {data.payment.map((p, i) => (
          <div key={i} className="grid gap-3 md:grid-cols-[1fr_auto]">
            <LangTriple label={`Способ ${i + 1}`} value={p} onChange={(v) => setPayment(i, v)} required />
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => update({ payment: data.payment.filter((_, idx) => idx !== i) })}
                aria-label="Удалить"
                className="grid h-11 w-11 place-items-center rounded-xl border border-white/12 text-mist hover:border-[rgba(255,90,90,0.5)] hover:text-[#FF9D9D]"
              >
                ×
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => update({ payment: [...data.payment, emptyL()] })}
          disabled={data.payment.length >= 6}
          className="cc-btn-ghost justify-self-start px-5 py-3 text-[11.5px] disabled:opacity-40"
        >
          + Добавить способ оплаты
        </button>
        <p className="text-[12.5px] text-mist/50">Пустой список — в заказе не будет выбора оплаты.</p>
      </div>
    </div>
  )
}
