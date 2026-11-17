import { useRef, useState } from 'react'
import { api, fileToPayload } from './api'
import type { AdminState, GalleryItem } from './api'

export function GalleryManager({ state, onRefresh, onNotify }: { state: AdminState; onRefresh: () => void; onNotify: (msg: string) => void }) {
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setBusy(true)
    let done = 0
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue
        setProgress(`Обработка ${done + 1}/${files.length}…`)
        const { mime, data } = await fileToPayload(file, { maxSide: 1600, quality: 0.82, keepPng: false })
        await api.addPhoto('', mime, data)
        done += 1
      }
      onNotify(done > 0 ? `Загружено фото: ${done}` : 'Нет файлов-изображений')
      onRefresh()
    } catch (e) {
      onNotify(e instanceof Error ? e.message : 'Ошибка загрузки')
    } finally {
      setBusy(false)
      setProgress('')
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const remove = async (item: GalleryItem) => {
    if (!window.confirm('Удалить это фото?')) return
    try {
      await api.deletePhoto(item.id)
      onNotify('Фото удалено')
      onRefresh()
    } catch (e) {
      onNotify(e instanceof Error ? e.message : 'Ошибка удаления')
    }
  }

  const move = async (index: number, dir: -1 | 1) => {
    const items = state.gallery
    const j = index + dir
    if (j < 0 || j >= items.length) return
    const ids = items.map((g) => g.id)
    ;[ids[index], ids[j]] = [ids[j], ids[index]]
    try {
      await api.reorderPhotos(ids)
      onRefresh()
    } catch (e) {
      onNotify(e instanceof Error ? e.message : 'Ошибка порядка')
    }
  }

  const saveAlt = async (item: GalleryItem, alt: string) => {
    if (alt === item.alt) return
    try {
      await api.setPhotoAlt(item.id, alt)
      onNotify('Подпись обновлена')
      onRefresh()
    } catch (e) {
      onNotify(e instanceof Error ? e.message : 'Ошибка подписи')
    }
  }

  return (
    <div>
      <div className="cc-card mb-6 flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <span className="cc-eyebrow">Загрузка с устройства</span>
          <p className="mt-2 text-[13.5px] text-mist">
            {state.gallery.length}/40 фото · уменьшается до 1600px, JPEG · порядок задают стрелки
          </p>
        </div>
        <div className="flex items-center gap-4">
          {progress ? <span className="font-display text-[11px] uppercase tracking-[0.2em] text-aqua">{progress}</span> : null}
          <label className={`cc-btn-primary cursor-pointer px-6 py-3 text-[12px] ${busy ? 'pointer-events-none opacity-60' : ''}`}>
            {busy ? 'Загрузка…' : 'Выбрать файлы'}
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => void upload(e.target.files)} />
          </label>
        </div>
      </div>

      {state.gallery.length === 0 ? (
        <div className="grid place-items-center rounded-3xl border border-dashed border-white/12 px-6 py-16 text-center">
          <p className="text-[15px] text-mist">Фото точки пока нет — загрузите первые с устройства.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {state.gallery.map((item, i) => (
            <figure key={item.id} className="cc-card overflow-hidden p-0">
              <div className="relative aspect-[4/3] overflow-hidden bg-ink">
                <img src={`${item.url}?v=${item.created}`} alt={item.alt} className="h-full w-full object-cover" loading="lazy" />
                <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 font-display text-[10px] tracking-[0.2em] text-mist">
                  {i + 1}
                </span>
              </div>
              <figcaption className="flex flex-col gap-3 p-4">
                <input
                  defaultValue={item.alt}
                  placeholder="Подпись (alt)"
                  onBlur={(e) => void saveAlt(item, e.target.value.trim())}
                  className="w-full rounded-xl border border-white/12 bg-white/[0.03] px-3.5 py-2.5 text-[13.5px] text-snow outline-none focus:border-aqua/60"
                />
                <div className="flex items-center justify-between gap-2">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => void move(i, -1)} disabled={i === 0} aria-label="Раньше" className="grid h-9 w-9 place-items-center rounded-lg border border-white/12 text-mist hover:border-aqua/50 hover:text-aqua disabled:opacity-30">
                      ←
                    </button>
                    <button type="button" onClick={() => void move(i, 1)} disabled={i === state.gallery.length - 1} aria-label="Позже" className="grid h-9 w-9 place-items-center rounded-lg border border-white/12 text-mist hover:border-aqua/50 hover:text-aqua disabled:opacity-30">
                      →
                    </button>
                  </div>
                  <button type="button" onClick={() => void remove(item)} className="rounded-lg border border-white/12 px-3.5 py-2 font-display text-[10.5px] uppercase tracking-[0.18em] text-mist hover:border-[rgba(255,90,90,0.5)] hover:text-[#FF9D9D]">
                    Удалить
                  </button>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  )
}
