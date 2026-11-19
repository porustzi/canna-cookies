import { useState } from 'react'
import { api, emptyL, type AdminState } from './api'
import { Field, LangTriple } from './ui'
import type { L, Settings } from '../types'

const DAYS: { key: string; label: string }[] = [
  { key: 'mon', label: 'Пн' },
  { key: 'tue', label: 'Вт' },
  { key: 'wed', label: 'Ср' },
  { key: 'thu', label: 'Чт' },
  { key: 'fri', label: 'Пт' },
  { key: 'sat', label: 'Сб' },
  { key: 'sun', label: 'Вс' },
]

const RANGE_RE = /^([01]\d|2[0-3]):[0-5]\d-([01]\d|2[0-3]):[0-5]\d$/

function cloneL(l: L | undefined): L {
  return { ...(l ?? emptyL()) }
}

function clone(s: Settings): Settings {
  const out: Settings = {
    payment: s.payment.map((p) => ({ ...p })),
    minOrder: s.minOrder,
    hours: { ...s.hours },
    closed: s.closed,
    banner: { ...s.banner },
    contacts: { phone: s.contacts?.phone ?? '', tg: s.contacts?.tg ?? '', address: s.contacts?.address ?? '' },
    freeDeliveryFrom: s.freeDeliveryFrom ?? 0,
    promo: s.promo ? { ...s.promo } : null,
    texts: {
      demo: cloneL(s.texts?.demo),
      closed: cloneL(s.texts?.closed),
      privacy: cloneL(s.texts?.privacy),
    },
    schedule: { ...(s.schedule ?? {}) },
  }
  return out
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
    if (!Number.isInteger(data.freeDeliveryFrom ?? 0) || (data.freeDeliveryFrom ?? 0) < 0) {
      setError('Бесплатная доставка — целое число ≥ 0.')
      return
    }
    for (const p of data.payment) {
      if (!p.ru && !p.cs && !p.en) {
        setError('Укажите способ оплаты хотя бы на одном языке или удалите строку.')
        return
      }
    }
    const promoCode = data.promo?.code?.trim() ?? ''
    if (promoCode) {
      const pct = data.promo?.percent ?? 0
      if (!Number.isInteger(pct) || pct < 1 || pct > 90) {
        setError('Промокод: скидка — целое число от1 до90%.')
        return
      }
    }
    for (const [day, range] of Object.entries(data.schedule ?? {})) {
      if (range && !RANGE_RE.test(range)) {
        setError(`Расписание (${day}): формат 10:00-20:00`)
        return
      }
    }
    setSaving(true)
    try {
      const payload: Settings = {
        ...data,
        promo: promoCode ? { code: promoCode, percent: data.promo?.percent ?? 0 } : null,
        schedule: data.schedule ?? {},
      }
      await api.saveSettings(payload)
      setDirty(false)
      onSaved('Настройки сохранены')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  const contacts = data.contacts ?? { phone: '', tg: '', address: '' }
  const texts = data.texts ?? { demo: emptyL(), closed: emptyL(), privacy: emptyL() }
  const schedule = data.schedule ?? {}

  return (
    <div className="grid max-w-3xl gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-[13.5px] leading-relaxed text-mist/70">Баннер, часы, контакты, доставка и оплата — на всех трёх языках.</p>
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
          <div className="min-w-[200px] flex-1">
            <Field
              label="Бесплатная доставка от, Kč (0 — выкл.)"
              value={data.freeDeliveryFrom ?? 0}
              onChange={(v) => update({ freeDeliveryFrom: v === '' ? 0 : Number(v) })}
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
        <LangTriple label="Часы работы (текст)" value={data.hours} onChange={(v) => update({ hours: v })} placeholder="Пн–Сб 10:00–20:00" />
      </div>

      <div className="cc-card grid gap-4 p-4 sm:p-6">
        <span className="cc-eyebrow">Контакты магазина (видны в приложении)</span>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Телефон" value={contacts.phone} onChange={(v) => update({ contacts: { ...contacts, phone: v } })} placeholder="+420 …" />
          <Field label="Telegram" value={contacts.tg} onChange={(v) => update({ contacts: { ...contacts, tg: v } })} placeholder="@username" />
        </div>
        <Field
          label="Адрес (склад/самовывоз)"
          value={contacts.address}
          onChange={(v) => update({ contacts: { ...contacts, address: v } })}
          placeholder="Ulice, město"
        />
      </div>

      <div className="cc-card grid gap-4 p-4 sm:p-6">
        <span className="cc-eyebrow">Промокод (0 полей — выкл.)</span>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Код"
            value={data.promo?.code ?? ''}
            onChange={(v) => update({ promo: v.trim() ? { code: v, percent: data.promo?.percent ?? 10 } : null })}
            placeholder="ЛЕТО20"
          />
          <Field
            label="Скидка, %"
            value={data.promo?.percent ?? 10}
            onChange={(v) =>
              update({ promo: (data.promo?.code ?? v) ? { code: data.promo?.code ?? '', percent: v === '' ? 10 : Number(v) } : null })
            }
            type="number"
          />
        </div>
        <p className="text-[12.5px] text-mist/50">Клиент вводит код при оформлении — скидка применяется к сумме товаров.</p>
      </div>

      <div className="cc-card grid gap-4 p-4 sm:p-6">
        <span className="cc-eyebrow">Расписание по дням (пусто — всегда открыт, кроме тумблера)</span>
        <div className="grid gap-2">
          {DAYS.map((d) => (
            <div key={d.key} className="flex items-center gap-3">
              <span className="w-8 font-display text-[12px] uppercase tracking-[0.14em] text-mist">{d.label}</span>
              <input
                value={schedule[d.key] ?? ''}
                onChange={(e) => update({ schedule: { ...schedule, [d.key]: e.target.value.trim() } })}
                placeholder="10:00-20:00"
                className="flex-1 rounded-xl border border-white/12 bg-graphite px-3.5 py-2.5 text-[14px] text-snow placeholder:text-mist/40 outline-none focus:border-aqua/60"
              />
            </div>
          ))}
        </div>
        <p className="text-[12.5px] text-mist/50">Формат HH:MM-HH:MM (по Праге). Пусто — день не ограничен.</p>
      </div>

      <div className="cc-card grid gap-4 p-4 sm:p-6">
        <span className="cc-eyebrow">Тексты интерфейса (пусто — стандартный текст)</span>
        <LangTriple label="Демо-баннер каталога" value={texts.demo} onChange={(v) => update({ texts: { ...texts, demo: v } })} />
        <LangTriple label="Сообщение «магазин закрыт»" value={texts.closed} onChange={(v) => update({ texts: { ...texts, closed: v } })} />
        <LangTriple label="Privacy в контакт-форме" value={texts.privacy} onChange={(v) => update({ texts: { ...texts, privacy: v } })} />
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
