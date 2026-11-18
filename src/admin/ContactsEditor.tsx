import { useState } from 'react'
import { api } from './api'
import type { AdminState, ContactCard, ContactsData } from './api'
import { DICTS } from '../i18n'
import type { Lang } from '../i18n'

const LANG_LABELS: { code: Lang; label: string }[] = [
  { code: 'cs', label: 'Čeština' },
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
]

function clone(data: ContactsData): ContactsData {
  return { cards: data.cards.map((c) => ({ ...c })), note: data.note }
}

export function ContactsEditor({ state, onSaved }: { state: AdminState; onSaved: (msg: string) => void }) {
  const [lang, setLang] = useState<Lang>('cs')
  const source = state.contacts[lang] ?? DICTS[lang].contacts
  const [data, setData] = useState<ContactsData>(() => clone(source))
  const [prev, setPrev] = useState<{ lang: Lang; source: ContactsData }>({ lang, source })
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  if (prev.lang !== lang || prev.source !== source) {
    setPrev({ lang, source })
    setData(clone(source))
    setDirty(false)
  }

  const update = (next: ContactsData) => {
    setData(next)
    setDirty(true)
  }

  const setCard = (i: number, patch: Partial<ContactCard>) => {
    const cards = data.cards.map((c, idx) => (idx === i ? { ...c, ...patch } : c))
    update({ ...data, cards })
  }

  const addCard = () => {
    if (data.cards.length >= 8) return
    update({ ...data, cards: [...data.cards, { label: '', value: '', status: '' }] })
  }

  const removeCard = (i: number) => {
    update({ ...data, cards: data.cards.filter((_, idx) => idx !== i) })
  }

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= data.cards.length) return
    const cards = [...data.cards]
    ;[cards[i], cards[j]] = [cards[j], cards[i]]
    update({ ...data, cards })
  }

  const save = async () => {
    setSaving(true)
    try {
      await api.saveContacts(lang, data)
      setDirty(false)
      onSaved(`Контакты (${lang.toUpperCase()}) сохранены`)
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
            <button
              key={l.code}
              type="button"
              onClick={() => setLang(l.code)}
              className={`rounded-full px-4 py-2 font-display text-[11.5px] uppercase tracking-[0.18em] transition ${
                lang === l.code ? 'bg-aqua text-ink' : 'border border-white/12 text-mist hover:text-snow'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {dirty ? <span className="font-display text-[11px] uppercase tracking-[0.2em] text-[#FFD28F]">Есть несохранённые правки</span> : null}
          {state.contacts[lang] ? (
            <button
              type="button"
              onClick={() => {
                void api
                  .resetContacts(lang)
                  .then(() => onSaved(`Контакты (${lang.toUpperCase()}) — возврат к текстам сайта`))
                  .catch((e: unknown) => onSaved(e instanceof Error ? e.message : 'Ошибка'))
              }}
              className="cc-btn-ghost px-5 py-3 text-[11.5px]"
            >
              Вернуть по умолчанию
            </button>
          ) : null}
          <button type="button" onClick={() => void save()} disabled={saving} className="cc-btn-primary px-6 py-3 text-[12px]">
            {saving ? 'Сохранение…' : 'Сохранить'}
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {data.cards.map((card, i) => (
          <div key={i} className="cc-card grid gap-3 p-5 md:grid-cols-[1fr_1.4fr_1fr_1fr_auto]">
            <label className="block">
              <span className="cc-eyebrow">Подпись</span>
              <input
                value={card.label}
                onChange={(e) => setCard(i, { label: e.target.value })}
                className="mt-2 w-full rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3 text-[14.5px] text-snow outline-none focus:border-aqua/60"
                placeholder="E-mail"
              />
            </label>
            <label className="block">
              <span className="cc-eyebrow">Значение</span>
              <input
                value={card.value}
                onChange={(e) => setCard(i, { value: e.target.value })}
                className="mt-2 w-full rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3 text-[14.5px] text-snow outline-none focus:border-aqua/60"
                placeholder="—"
              />
            </label>
            <label className="block">
              <span className="cc-eyebrow">Статус-бейдж</span>
              <input
                value={card.status}
                onChange={(e) => setCard(i, { status: e.target.value })}
                className="mt-2 w-full rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3 text-[14.5px] text-snow outline-none focus:border-aqua/60"
                placeholder="Ve fázi 2"
              />
            </label>
            <label className="block">
              <span className="cc-eyebrow">Ссылка</span>
              <input
                value={card.href ?? ''}
                onChange={(e) => setCard(i, { href: e.target.value || undefined })}
                className="mt-2 w-full rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3 text-[14.5px] text-snow outline-none focus:border-aqua/60"
                placeholder="https://t.me/…"
              />
            </label>
            <div className="flex items-end gap-2">
              <button type="button" onClick={() => move(i, -1)} aria-label="Выше" className="grid h-11 w-11 place-items-center rounded-xl border border-white/12 text-mist hover:border-aqua/50 hover:text-aqua">
                ↑
              </button>
              <button type="button" onClick={() => move(i, 1)} aria-label="Ниже" className="grid h-11 w-11 place-items-center rounded-xl border border-white/12 text-mist hover:border-aqua/50 hover:text-aqua">
                ↓
              </button>
              <button type="button" onClick={() => removeCard(i)} aria-label="Удалить" className="grid h-11 w-11 place-items-center rounded-xl border border-white/12 text-mist hover:border-[rgba(255,90,90,0.5)] hover:text-[#FF9D9D]">
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <button type="button" onClick={addCard} disabled={data.cards.length >= 8} className="cc-btn-ghost px-5 py-3 text-[11.5px] disabled:opacity-40">
          + Добавить карточку
        </button>
        <span className="text-[13px] text-mist/60">{data.cards.length}/8 карточек · значок карточки на сайте выбирается по порядку</span>
      </div>

      <label className="mt-8 block">
        <span className="cc-eyebrow">Заметка под карточками</span>
        <textarea
          value={data.note}
          onChange={(e) => update({ ...data, note: e.target.value })}
          rows={3}
          className="mt-2 w-full rounded-2xl border border-white/12 bg-white/[0.03] px-4 py-3.5 text-[14.5px] leading-relaxed text-snow outline-none focus:border-aqua/60"
        />
      </label>
    </div>
  )
}
