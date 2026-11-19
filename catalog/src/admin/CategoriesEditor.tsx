import { useState } from 'react'
import { api, emptyL, type AdminState } from './api'
import { Field, LangTriple } from './ui'
import type { Category } from '../types'

const SLUG = /^[a-z0-9][a-z0-9-]{0,59}$/

function clone(items: Category[]): Category[] {
  return items.map((c) => ({ id: c.id, name: { ...c.name } }))
}

export function CategoriesEditor({ state, onSaved }: { state: AdminState; onSaved: (msg: string) => void }) {
  const [items, setItems] = useState<Category[]>(() => clone(state.categories))
  const [prev, setPrev] = useState<Category[]>(state.categories)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (prev !== state.categories) {
    setPrev(state.categories)
    setItems(clone(state.categories))
    setError(null)
  }

  const update = (next: Category[]) => {
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
    const cleaned = items.map((c) => ({ id: c.id.trim(), name: c.name }))
    for (const c of cleaned) {
      if (!SLUG.test(c.id)) {
        setError(`Некорректный ID «${c.id}»: строчные буквы, цифры и дефис.`)
        return
      }
      if (!c.name.ru && !c.name.cs && !c.name.en) {
        setError(`Укажите название категории «${c.id}» хотя бы на одном языке.`)
        return
      }
    }
    const ids = cleaned.map((c) => c.id)
    if (new Set(ids).size !== ids.length) {
      setError('ID категорий не должны повторяться.')
      return
    }
    const removed = state.categories.filter((c) => !ids.includes(c.id))
    const blocked = removed.find((c) => state.products.some((p) => p.category === c.id))
    if (blocked) {
      setError(`Нельзя удалить «${blocked.id}» — используется в товарах. Сначала переназначьте их категорию.`)
      return
    }
    setSaving(true)
    try {
      await api.saveCategories(cleaned)
      onSaved('Категории сохранены')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-[13.5px] leading-relaxed text-mist/70">Название категории — на всех трёх языках. ID не меняется.</p>
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
        {items.map((c, i) => (
          <div key={i} className="cc-card grid gap-4 p-4 sm:p-5 md:grid-cols-[200px_1fr_auto]">
            <Field
              label="ID"
              value={c.id}
              onChange={(v) => update(items.map((x, idx) => (idx === i ? { ...x, id: v } : x)))}
              placeholder="flowers"
            />
            <LangTriple
              label="Название"
              value={c.name}
              onChange={(v) => update(items.map((x, idx) => (idx === i ? { ...x, name: v } : x)))}
              required
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
        ))}
      </div>

      <button
        type="button"
        onClick={() => update([...items, { id: '', name: emptyL() }])}
        disabled={items.length >= 30}
        className="cc-btn-ghost mt-4 px-5 py-3 text-[11.5px] disabled:opacity-40"
      >
        + Добавить категорию
      </button>
    </div>
  )
}
