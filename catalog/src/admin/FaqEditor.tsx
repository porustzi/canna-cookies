import { useState } from 'react'
import { api, LANG_LABELS, type AdminState } from './api'
import { TabButton } from './ui'
import type { FaqItem, Lang } from '../types'

function clone(items: FaqItem[]): FaqItem[] {
  return items.map((i) => ({ ...i }))
}

export function FaqEditor({ state, onSaved }: { state: AdminState; onSaved: (msg: string) => void }) {
  const [lang, setLang] = useState<Lang>('ru')
  const source = state.faq[lang] ?? []
  const [items, setItems] = useState<FaqItem[]>(() => clone(source))
  const [prev, setPrev] = useState<{ lang: Lang; source: FaqItem[] }>({ lang, source })
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  if (prev.lang !== lang || prev.source !== source) {
    setPrev({ lang, source })
    setItems(clone(source))
    setDirty(false)
  }

  const update = (next: FaqItem[]) => {
    setItems(next)
    setDirty(true)
  }

  const setItem = (i: number, patch: Partial<FaqItem>) => {
    update(items.map((item, idx) => (idx === i ? { ...item, ...patch } : item)))
  }

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= items.length) return
    const next = [...items]
    ;[next[i], next[j]] = [next[j], next[i]]
    update(next)
  }

  const save = async () => {
    const cleaned = items
      .map((i) => ({ q: i.q.trim(), a: i.a.trim() }))
      .filter((i) => i.q && i.a)
    if (cleaned.length !== items.length && !window.confirm('Пустые вопросы/ответы будут удалены. Продолжить?')) return
    setSaving(true)
    try {
      await api.saveFaq(lang, cleaned)
      setDirty(false)
      onSaved(`FAQ (${lang.toUpperCase()}) сохранено`)
    } catch (e) {
      onSaved(e instanceof Error ? e.message : 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          {LANG_LABELS.map((l) => (
            <TabButton key={l.code} active={lang === l.code} onClick={() => setLang(l.code)}>
              {l.label}
            </TabButton>
          ))}
        </div>
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

      <p className="mb-4 text-[13.5px] leading-relaxed text-mist/70">
        Вопросы и ответы для раздела FAQ на языке {LANG_LABELS.find((l) => l.code === lang)?.label}. Порядок — как в списке.
      </p>

      <div className="grid gap-4">
        {items.map((item, i) => (
          <div key={i} className="cc-card grid gap-3 p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <span className="cc-eyebrow">Вопрос {i + 1}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  aria-label="Выше"
                  className="grid h-9 w-9 place-items-center rounded-xl border border-white/12 text-mist hover:border-aqua/50 hover:text-aqua"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  aria-label="Ниже"
                  className="grid h-9 w-9 place-items-center rounded-xl border border-white/12 text-mist hover:border-aqua/50 hover:text-aqua"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => update(items.filter((_, idx) => idx !== i))}
                  aria-label="Удалить"
                  className="grid h-9 w-9 place-items-center rounded-xl border border-white/12 text-mist hover:border-[rgba(255,90,90,0.5)] hover:text-[#FF9D9D]"
                >
                  ×
                </button>
              </div>
            </div>
            <label className="block">
              <span className="font-display text-[10.5px] uppercase tracking-[0.2em] text-mist/60">Вопрос</span>
              <input
                value={item.q}
                onChange={(e) => setItem(i, { q: e.target.value })}
                placeholder="Как оформить заказ?"
                className="mt-1 w-full rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3 text-[14.5px] text-snow placeholder:text-mist/40 outline-none focus:border-aqua/60"
              />
            </label>
            <label className="block">
              <span className="font-display text-[10.5px] uppercase tracking-[0.2em] text-mist/60">Ответ</span>
              <textarea
                value={item.a}
                onChange={(e) => setItem(i, { a: e.target.value })}
                rows={3}
                placeholder="Подробный ответ…"
                className="mt-1 w-full resize-none rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3 text-[14.5px] leading-relaxed text-snow placeholder:text-mist/40 outline-none focus:border-aqua/60"
              />
            </label>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-4">
        <button
          type="button"
          onClick={() => update([...items, { q: '', a: '' }])}
          disabled={items.length >= 50}
          className="cc-btn-ghost px-5 py-3 text-[11.5px] disabled:opacity-40"
        >
          + Добавить вопрос
        </button>
        <span className="text-[13px] text-mist/60">{items.length}/50</span>
      </div>
    </div>
  )
}
