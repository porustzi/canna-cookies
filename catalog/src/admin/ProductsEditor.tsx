import { useState } from 'react'
import { api, emptyL, fileToPayload, type AdminState } from './api'
import { Field, LangTriple, Modal } from './ui'
import { pick, productImageUrl } from '../types'
import type { Product, Weight } from '../types'

const SLUG = /^[a-z0-9][a-z0-9-]{0,59}$/

function blankProduct(categoryId: string): Product {
  return {
    id: '',
    name: emptyL(),
    desc: emptyL(),
    category: categoryId,
    weights: [{ label: '', price: 0 }],
    available: true,
    image: null,
  }
}

export function ProductsEditor({
  state,
  onSaved,
  notify,
}: {
  state: AdminState
  onSaved: (msg: string) => void
  notify: (msg: string) => void
}) {
  const [form, setForm] = useState<Product | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [pendingImage, setPendingImage] = useState<{ mime: string; data: string; url: string } | null>(null)
  const [imageRemoved, setImageRemoved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const openNew = () => {
    setForm(blankProduct(state.categories[0]?.id ?? ''))
    setIsNew(true)
    setPendingImage(null)
    setImageRemoved(false)
    setError(null)
  }

  const openEdit = (p: Product) => {
    setForm({ ...p, name: { ...p.name }, desc: { ...p.desc }, weights: p.weights.map((w) => ({ ...w })) })
    setIsNew(false)
    setPendingImage(null)
    setImageRemoved(false)
    setError(null)
  }

  const close = () => {
    if (pendingImage) URL.revokeObjectURL(pendingImage.url)
    setForm(null)
    setPendingImage(null)
    setImageRemoved(false)
    setError(null)
  }

  const patch = (p: Partial<Product>) => setForm((f) => (f ? { ...f, ...p } : f))

  const toggleAvailable = async (p: Product) => {
    try {
      await api.saveProducts(
        state.products.map((x) => (x.id === p.id ? { ...x, available: !x.available } : x)),
      )
      onSaved(p.available ? `«${pick(p.name, 'ru')}» — снято с наличия` : `«${pick(p.name, 'ru')}» — в наличии`)
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Ошибка сохранения')
    }
  }

  const remove = async (p: Product) => {
    if (!window.confirm(`Удалить товар «${pick(p.name, 'ru')}»?`)) return
    try {
      await api.saveProducts(state.products.filter((x) => x.id !== p.id))
      onSaved('Товар удалён')
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Ошибка удаления')
    }
  }

  const onFile = async (file: File | undefined) => {
    if (!file) return
    try {
      const payload = await fileToPayload(file)
      if (pendingImage) URL.revokeObjectURL(pendingImage.url)
      setPendingImage({ ...payload, url: URL.createObjectURL(file) })
      setImageRemoved(false)
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Не удалось обработать файл')
    }
  }

  const submit = async () => {
    if (!form) return
    const id = isNew ? form.id.trim() || `p-${Date.now().toString(36)}` : form.id
    if (!SLUG.test(id)) {
      setError('ID: только строчные буквы, цифры и дефис (например, blue-cookie).')
      return
    }
    if (!form.name.ru && !form.name.cs && !form.name.en) {
      setError('Укажите название хотя бы на одном языке.')
      return
    }
    const weights = form.weights.map((w) => ({ ...w, label: w.label.trim() }))
    if (weights.length < 1 || weights.some((w) => !w.label || !Number.isInteger(w.price) || w.price < 0)) {
      setError('Добавьте хотя бы один вес с названием и ценой (целое число ≥ 0).')
      return
    }
    if (!form.category) {
      setError('Выберите категорию.')
      return
    }

    const product: Product = {
      id,
      name: form.name,
      desc: form.desc,
      category: form.category,
      weights,
      available: form.available,
      image: form.image,
    }

    setSaving(true)
    setError(null)
    try {
      const next = isNew
        ? [...state.products, product]
        : state.products.map((x) => (x.id === product.id ? product : x))
      await api.saveProducts(next)
      if (pendingImage) {
        await api.uploadImage(product.id, pendingImage.mime, pendingImage.data)
      } else if (imageRemoved && !isNew) {
        await api.deleteImage(product.id)
      }
      if (pendingImage) URL.revokeObjectURL(pendingImage.url)
      setForm(null)
      setPendingImage(null)
      setImageRemoved(false)
      onSaved('Товар сохранён')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  const setWeight = (i: number, w: Partial<Weight>) => {
    if (!form) return
    patch({ weights: form.weights.map((x, idx) => (idx === i ? { ...x, ...w } : x)) })
  }

  const preview = pendingImage
    ? pendingImage.url
    : form && !isNew && form.image && !imageRemoved
      ? productImageUrl(form)
      : null

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] leading-relaxed text-mist/70 sm:text-[13.5px]">
          {state.products.length} товаров · переключатель «в наличии» работает сразу, остальное — по кнопке «Сохранить» в
          карточке.
        </p>
        <button type="button" onClick={openNew} className="cc-btn-primary px-4 py-2.5 text-[11px] sm:px-6 sm:py-3 sm:text-[12px]">
          + Добавить товар
        </button>
      </div>

      <div className="grid gap-3">
        {state.products.map((p) => {
          const minPrice = p.weights.length > 0 ? Math.min(...p.weights.map((w) => w.price)) : 0
          const url = p.image ? productImageUrl(p) : null
          const categoryName = state.categories.find((c) => c.id === p.category)
          return (
            <div key={p.id} className="cc-card flex flex-col gap-3 p-3.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 sm:p-4">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-[#12222b] to-[#0a0d10] sm:h-14 sm:w-14">
                  {url ? (
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="grid h-full w-full place-items-center font-display text-[14px] font-bold text-aqua/40 sm:text-[15px]">
                      {pick(p.name, 'ru').slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-[14px] text-snow sm:text-[14.5px]">{pick(p.name, 'ru')}</p>
                  <p className="mt-0.5 truncate text-[12px] text-mist/70">
                    {p.id} · {categoryName ? pick(categoryName.name, 'ru') : p.category} · от {minPrice} Kč
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => void toggleAvailable(p)}
                  className={`rounded-full border px-3.5 py-2 font-display text-[10px] uppercase tracking-[0.14em] sm:px-4 sm:text-[11px] ${
                    p.available
                      ? 'border-aqua/50 bg-aqua/10 text-aqua hover:bg-aqua/20'
                      : 'border-[#FF9D9D]/40 bg-[#FF9D9D]/10 text-[#FF9D9D] hover:bg-[#FF9D9D]/20'
                  }`}
                >
                  {p.available ? 'В наличии' : 'Нет в наличии'}
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(p)}
                  className="cc-btn-ghost px-4 py-2 text-[10px] sm:px-5 sm:py-2.5 sm:text-[11px]"
                >
                  Изменить
                </button>
                <button
                  type="button"
                  onClick={() => void remove(p)}
                  aria-label="Удалить"
                  className="grid h-10 w-10 place-items-center rounded-xl border border-white/12 text-mist hover:border-[rgba(255,90,90,0.5)] hover:text-[#FF9D9D]"
                >
                  ×
                </button>
              </div>
            </div>
          )
        })}
        {state.products.length === 0 && (
          <div className="cc-card grid place-items-center p-10 text-center text-mist">Товаров пока нет</div>
        )}
      </div>

      <Modal open={form !== null} onClose={close}>
        {form && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[18px]">{isNew ? 'Новый товар' : 'Редактирование'}</h2>
              <button
                type="button"
                onClick={close}
                className="font-display text-[11px] uppercase tracking-[0.2em] text-mist hover:text-snow"
              >
                Закрыть
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="ID"
                value={form.id}
                onChange={(v) => patch({ id: v })}
                placeholder={isNew ? 'auto' : form.id}
                type="text"
              />
              <label className="block">
                <span className="cc-eyebrow">Категория</span>
                <select
                  value={form.category}
                  onChange={(e) => patch({ category: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3 text-[14.5px] text-snow outline-none focus:border-aqua/60"
                >
                  {state.categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {pick(c.name, 'ru')} ({c.id})
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <LangTriple label="Название" value={form.name} onChange={(v) => patch({ name: v })} required />
            <LangTriple label="Описание" value={form.desc} onChange={(v) => patch({ desc: v })} textarea rows={3} />

            <div>
              <span className="cc-eyebrow">Веса и цены *</span>
              <div className="mt-2 grid gap-2">
                {form.weights.map((w, i) => (
                  <div key={i} className="flex flex-wrap items-center gap-2">
                    <input
                      value={w.label}
                      onChange={(e) => setWeight(i, { label: e.target.value })}
                      placeholder="3.5 g"
                      className="min-w-[110px] flex-1 rounded-xl border border-white/12 bg-white/[0.03] px-3.5 py-3 text-[14.5px] text-snow placeholder:text-mist/40 outline-none focus:border-aqua/60 sm:px-4"
                    />
                    <input
                      value={w.price}
                      onChange={(e) => setWeight(i, { price: e.target.value === '' ? 0 : Number(e.target.value) })}
                      placeholder="450"
                      inputMode="numeric"
                      className="w-24 rounded-xl border border-white/12 bg-white/[0.03] px-3.5 py-3 text-[14.5px] text-snow placeholder:text-mist/40 outline-none focus:border-aqua/60 sm:w-28 sm:px-4"
                    />
                    <span className="shrink-0 text-[13px] text-mist/60">Kč</span>
                    <button
                      type="button"
                      onClick={() => patch({ weights: form.weights.filter((_, idx) => idx !== i) })}
                      aria-label="Удалить вес"
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/12 text-mist hover:border-[rgba(255,90,90,0.5)] hover:text-[#FF9D9D]"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => patch({ weights: [...form.weights, { label: '', price: 0 }] })}
                disabled={form.weights.length >= 20}
                className="cc-btn-ghost mt-3 px-5 py-2.5 text-[11px] disabled:opacity-40"
              >
                + Добавить вес
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => patch({ available: !form.available })}
                className={`rounded-full border px-5 py-2.5 font-display text-[11.5px] uppercase tracking-[0.14em] ${
                  form.available
                    ? 'border-aqua/50 bg-aqua/10 text-aqua'
                    : 'border-[#FF9D9D]/40 bg-[#FF9D9D]/10 text-[#FF9D9D]'
                }`}
              >
                {form.available ? '✓ В наличии' : '✗ Нет в наличии'}
              </button>
            </div>

            <div>
              <span className="cc-eyebrow">Картинка</span>
              <div className="mt-2 flex flex-wrap items-center gap-4">
                <div className="h-24 w-32 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-[#12222b] to-[#0a0d10]">
                  {preview ? (
                    <img src={preview} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="grid h-full w-full place-items-center font-display text-[13px] text-aqua/40">
                      Нет фото
                    </span>
                  )}
                </div>
                <label className="cc-btn-ghost cursor-pointer px-5 py-2.5 text-[11px]">
                  {preview ? 'Заменить' : 'Загрузить с устройства'}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => void onFile(e.target.files?.[0])}
                  />
                </label>
                {(preview || pendingImage || imageRemoved) && !imageRemoved && (
                  <button
                    type="button"
                    onClick={() => {
                      if (pendingImage) URL.revokeObjectURL(pendingImage.url)
                      setPendingImage(null)
                      setImageRemoved(true)
                    }}
                    className="cc-btn-ghost px-5 py-2.5 text-[11px] hover:border-[rgba(255,90,90,0.5)] hover:text-[#FF9D9D]"
                  >
                    Удалить картинку
                  </button>
                )}
                {imageRemoved && (
                  <button
                    type="button"
                    onClick={() => setImageRemoved(false)}
                    className="cc-btn-ghost px-5 py-2.5 text-[11px]"
                  >
                    Отменить удаление
                  </button>
                )}
              </div>
              <p className="mt-2 text-[12px] text-mist/50">JPEG/PNG/WebP, до 1.4 МБ после обработки (макс. сторона 1280 px).</p>
            </div>

            {error && <p className="text-[13.5px] text-[#FF9D9D]">{error}</p>}

            <button
              type="button"
              onClick={() => void submit()}
              disabled={saving}
              className="cc-btn-primary w-full py-3.5 text-[13px] disabled:opacity-60"
            >
              {saving ? 'Сохранение…' : 'Сохранить товар'}
            </button>
          </div>
        )}
      </Modal>
    </div>
  )
}
