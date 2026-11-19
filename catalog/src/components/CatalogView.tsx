import { useState } from 'react'
import { useApp } from '../context'
import { pick, productImageUrl } from '../types'
import { ProductVisual } from './ui'

export function CatalogView() {
  const { t, data, lang, openProduct } = useApp()
  const [categoryId, setCategoryId] = useState('all')

  const products = categoryId === 'all' ? data.products : data.products.filter((p) => p.category === categoryId)

  return (
    <div className="flex flex-col gap-4">
      {pick(data.settings.banner, lang) && (
        <div className="rounded-xl border border-aqua/25 bg-aqua/[0.07] px-4 py-3 text-[13.5px] leading-relaxed text-teal">
          {pick(data.settings.banner, lang)}
        </div>
      )}

      {data.settings.closed && (
        <div className="rounded-xl border border-[#FFD28F]/30 bg-[#FFD28F]/[0.07] px-4 py-3 text-[13.5px] leading-relaxed text-[#FFD28F]">
          {t.closed}
        </div>
      )}

      <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[13px] leading-relaxed text-mist/80">
        {t.demoNotice}
      </div>

      {pick(data.settings.hours, lang) && (
        <p className="font-display text-[11px] uppercase tracking-[0.18em] text-mist/60">
          {t.hoursLabel}: <span className="text-mist">{pick(data.settings.hours, lang)}</span>
        </p>
      )}

      {data.categories.length > 1 && (
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {[
            { id: 'all', label: t.catalog.all },
            ...data.categories.map((c) => ({ id: c.id, label: pick(c.name, lang) })),
          ].map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategoryId(c.id)}
              className={`shrink-0 rounded-full border px-4 py-2 font-display text-[11px] uppercase tracking-[0.14em] ${
                categoryId === c.id
                  ? 'border-aqua bg-aqua text-ink'
                  : 'border-white/12 bg-white/[0.04] text-mist hover:border-aqua/40 hover:text-snow'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      {products.length === 0 ? (
        <div className="cc-card grid place-items-center p-10 text-center text-mist">{t.catalog.empty}</div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {products.map((product) => {
            const minPrice = product.weights.length > 0 ? Math.min(...product.weights.map((w) => w.price)) : 0
            const name = pick(product.name, lang)
            return (
              <button
                key={product.id}
                type="button"
                onClick={() => openProduct(product.id)}
                className="cc-card group overflow-hidden p-0 text-left"
              >
                <div className="relative">
                  <ProductVisual name={name} src={productImageUrl(product)} className="aspect-4/3 w-full" />
                  {!product.available && (
                    <span className="absolute inset-0 grid place-items-center bg-ink/70 font-display text-[11px] uppercase tracking-[0.2em] text-mist">
                      {t.catalog.soldOut}
                    </span>
                  )}
                </div>
                <div className="p-3.5">
                  <p className="line-clamp-2 font-display text-[14px] leading-snug text-snow">{name}</p>
                  <p className="mt-1.5 font-display text-[13px] text-aqua">
                    {t.catalog.from} {minPrice} Kč
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
