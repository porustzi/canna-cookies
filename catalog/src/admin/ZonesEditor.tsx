import { useState } from 'react'
import { api, emptyL, type AdminState } from './api'
import { Field, LangTriple } from './ui'
import type { District } from '../types'

const SLUG = /^[a-z0-9][a-z0-9-]{0,59}$/

function clone(items: District[]): District[] {
  return items.map((d) => ({ ...d, name: { ...d.name }, eta: { ...d.eta } }))
}

export function ZonesEditor({ state, onSaved }: { state: AdminState; onSaved: (msg: string) => void }) {
  const [items, setItems] = useState<District[]>(() => clone(state.districts))
  const [prev, setPrev] = useState<District[]>(state.districts)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (prev !== state.districts) {
    setPrev(state.districts)
    setItems(clone(state.districts))
    setError(null)
  }

  const update = (next: District[]) => {
    setItems(next)
    setError(null)
  }

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= items.length) return
    const next = [...items]
    ;[next[i], next[j]] = [next[j], next[i]]
    update(next)
  }

  const save = async () => {
    const cleaned = items.map((d) => ({ ...d, id: d.id.trim() }))
    for (const d of cleaned) {
      if (!SLUG.test(d.id)) {
        setError(`Некорректный ID «${d.id}»: строчные буквы, цифры и дефис.`)
        return
      }
      if (!d.name.ru && !d.name.cs && !d.name.en) {
        setError(`Укажите название зоны «${d.id}» хотя бы на одном языке.`)
        return
      }
      if (!Number.isInteger(d.fee) || d.fee < 0) {
        setError(`Цена доставки зоны «${d.id}» — целое число ≥ 0.`)
        return
      }
    }
    const ids = cleaned.map((d) => d.id)
    if (new Set(ids).size !== ids.length) {
      setError('ID зон не должны повторяться.')
      return
    }
    setSaving(true)
    try {
      await api.saveDistricts(cleaned)
      onSaved('Зоны сохранены')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-[13.5px] leading-relaxed text-mist/70">
          Зоны доставки: название и срок — на всех трёх языках, цена доставки — общая.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {error && <span className="max-w-[340px] text-[12.5px] text-[#FF9D9D]">{error}</span>}
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="cc-btn-primary px-5 py-2.5 text-[11px] disabled:opacity-50 sm:px-6 sm:py-3 sm:text-[12px]"
          >
            {saving ? 'Сохранение…' : 'Сохранить'}
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {items.map((d, i) => (
          <div key={i} className="cc-card grid gap-4 p-4 sm:p-5 md:grid-cols-2">
            <div className="grid gap-4 md:grid-cols-[1fr_140px_auto] md:col-span-2">
              <Field
                label="ID"
                value={d.id}
                onChange={(v) => update(items.map((x, idx) => (idx === i ? { ...x, id: v } : x)))}
                placeholder="zona-a"
              />
              <Field
                label="Доставка, Kč"
                value={d.fee}
                onChange={(v) =>
                  update(items.map((x, idx) => (idx === i ? { ...x, fee: v === '' ? 0 : Number(v) } : x)))
                }
                type="number"
              />
              <div className="flex items-end gap-1.5">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  aria-label="Выше"
                  className="grid h-11 w-9 place-items-center rounded-xl border border-white/12 text-mist hover:border-aqua/50 hover:text-aqua"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  aria-label="Ниже"
                  className="grid h-11 w-9 place-items-center rounded-xl border border-white/12 text-mist hover:border-aqua/50 hover:text-aqua"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => update(items.filter((_, idx) => idx !== i))}
                  aria-label="Удалить"
                  className="grid h-11 w-11 place-items-center rounded-xl border border-white/12 text-mist hover:border-[rgba(255,90,90,0.5)] hover:text-[#FF9D9D]"
                >
                  ×
                </button>
              </div>
            </div>
            <LangTriple
              label="Название"
              value={d.name}
              onChange={(v) => update(items.map((x, idx) => (idx === i ? { ...x, name: v } : x)))}
              required
            />
            <LangTriple
              label="Срок"
              value={d.eta}
              onChange={(v) => update(items.map((x, idx) => (idx === i ? { ...x, eta: v } : x)))}
              placeholder="до 60 мин"
            />
            <div className="md:col-span-2">
              <LangTriple
                label="Покрытие (адреса/улицы зоны, необязательно)"
                value={d.coverage ?? { ru: '', cs: '', en: '' }}
                onChange={(v) => update(items.map((x, idx) => (idx === i ? { ...x, coverage: v } : x)))}
                placeholder="Например: Прага5, Смихов, только центр…"
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => update([...items, { id: '', name: emptyL(), fee: 0, eta: emptyL() }])}
        disabled={items.length >= 20}
        className="cc-btn-ghost mt-4 px-5 py-3 text-[11.5px] disabled:opacity-40"
      >
        + Добавить зону
      </button>
    </div>
  )
}
