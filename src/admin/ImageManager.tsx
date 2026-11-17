import { useRef, useState } from 'react'
import { api, fileToPayload } from './api'
import type { AdminState } from './api'

type Slot = { key: 'about' | 'hero'; title: string; hint: string; fallback: string }

const SLOTS: Slot[] = [
  { key: 'about', title: 'Картинка в блоке «O nás»', hint: 'Прозрачный PNG или JPG, рекомендуем ~1100×733', fallback: '/about-emblem.png' },
  { key: 'hero', title: 'Эмблема в герое', hint: 'Прозрачный PNG, квадрат — логотип бренда', fallback: '/logo.png' },
]

export function ImageManager({ state, onRefresh, onNotify }: { state: AdminState; onRefresh: () => void; onNotify: (msg: string) => void }) {
  const [busy, setBusy] = useState<string | null>(null)
  const [nonce, setNonce] = useState(0)
  const refs = { about: useRef<HTMLInputElement>(null), hero: useRef<HTMLInputElement>(null) }

  const upload = async (slot: Slot, file: File | undefined) => {
    if (!file) return
    setBusy(slot.key)
    try {
      const { mime, data } = await fileToPayload(file, { maxSide: 1600, quality: 0.85, keepPng: true })
      await api.uploadImage(slot.key, mime, data)
      setNonce((n) => n + 1)
      onNotify(`Изображение «${slot.key}» обновлено`)
      onRefresh()
    } catch (e) {
      onNotify(e instanceof Error ? e.message : 'Ошибка загрузки')
    } finally {
      setBusy(null)
      const input = refs[slot.key].current
      if (input) input.value = ''
    }
  }

  const reset = async (slot: Slot) => {
    if (!window.confirm('Убрать замену и вернуть картинку по умолчанию?')) return
    setBusy(slot.key)
    try {
      await api.deleteImage(slot.key)
      setNonce((n) => n + 1)
      onNotify('Возвращена картинка по умолчанию')
      onRefresh()
    } catch (e) {
      onNotify(e instanceof Error ? e.message : 'Ошибка')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {SLOTS.map((slot) => {
        const hasOverride = state.images[slot.key]
        const src = hasOverride ? `/api/media/img-${slot.key}?v=${nonce}` : slot.fallback
        return (
          <section key={slot.key} className="cc-card p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="cc-eyebrow">{hasOverride ? 'Заменено вами' : 'Картинка по умолчанию'}</span>
                <h2 className="mt-3 text-[19px]">{slot.title}</h2>
              </div>
              <span className={`rounded-full border px-3 py-1 font-display text-[10px] uppercase tracking-[0.2em] ${hasOverride ? 'border-aqua/40 text-aqua' : 'border-white/12 text-mist/70'}`}>
                {hasOverride ? 'Override' : 'Default'}
              </span>
            </div>

            <div className="mt-5 grid place-items-center overflow-hidden rounded-2xl border border-white/8 bg-ink/70 p-4" style={{ minHeight: 200 }}>
              <img src={src} alt="" className="max-h-48 w-auto max-w-full object-contain drop-shadow-[0_0_30px_rgba(0,200,255,0.2)]" />
            </div>

            <p className="mt-4 text-[13px] leading-relaxed text-mist/70">{slot.hint}</p>

            <div className="mt-5 flex flex-wrap gap-3">
              <label className={`cc-btn-primary cursor-pointer px-6 py-3 text-[12px] ${busy === slot.key ? 'pointer-events-none opacity-60' : ''}`}>
                {busy === slot.key ? 'Обработка…' : 'Загрузить с устройства'}
                <input
                  ref={refs[slot.key]}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => void upload(slot, e.target.files?.[0])}
                />
              </label>
              {hasOverride ? (
                <button type="button" onClick={() => void reset(slot)} disabled={busy === slot.key} className="cc-btn-ghost px-6 py-3 text-[12px] disabled:opacity-40">
                  Вернуть по умолчанию
                </button>
              ) : null}
            </div>
          </section>
        )
      })}
    </div>
  )
}
