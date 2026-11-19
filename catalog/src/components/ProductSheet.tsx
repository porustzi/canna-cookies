import { useState } from 'react'
import { useApp } from '../context'
import { findProduct } from '../cart'
import { pick, productImageUrl } from '../types'
import { ProductVisual, Sheet, Stepper } from './ui'

function Body({ productId }: { productId: string }) {
  const { t, data, lang, addToCart, openProduct } = useApp()
  const product = findProduct(data, productId)
  const [selected, setSelected] = useState(product?.weights[0]?.label ?? '')
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  if (!product) return null

  const weight = product.weights.find((w) => w.label === selected) ?? product.weights[0] ?? null
  const line = weight ? weight.price * qty : 0
  const name = pick(product.name, lang)

  const add = () => {
    if (!weight) return
    addToCart(product.id, weight.label, qty)
    setAdded(true)
    window.setTimeout(() => openProduct(null), 650)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="relative -mx-1 overflow-hidden rounded-2xl">
        <ProductVisual name={name} src={productImageUrl(product)} className="aspect-4/3 w-full" />
        {!product.available && (
          <span className="absolute inset-0 grid place-items-center bg-ink/70 font-display text-[12px] uppercase tracking-[0.2em] text-mist">
            {t.catalog.soldOut}
          </span>
        )}
      </div>

      <div>
        <h2 className="text-[clamp(1.2rem,5vw,1.5rem)]">{name}</h2>
        {pick(product.desc, lang) && <p className="mt-2 text-[14px] leading-relaxed text-mist">{pick(product.desc, lang)}</p>}
      </div>

      {product.weights.length > 0 && (
        <div>
          <span className="font-display text-[11px] uppercase tracking-[0.2em] text-mist/70">{t.product.weight}</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {product.weights.map((w) => (
              <button
                key={w.label}
                type="button"
                onClick={() => setSelected(w.label)}
                className={`rounded-full border px-4 py-2 font-display text-[12px] tracking-wide ${
                  selected === w.label
                    ? 'border-aqua bg-aqua text-ink'
                    : 'border-white/12 bg-white/[0.04] text-mist hover:border-aqua/40 hover:text-snow'
                }`}
              >
                {w.label} · {w.price} Kč
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="font-display text-[11px] uppercase tracking-[0.2em] text-mist/70">{t.product.qty}</span>
          <div className="mt-2">
            <Stepper value={qty} onChange={setQty} />
          </div>
        </div>
        <div className="text-right">
          <span className="font-display text-[11px] uppercase tracking-[0.2em] text-mist/70">{t.checkout.price}</span>
          <p className="mt-1 font-display text-[24px] font-semibold text-aqua">{line} Kč</p>
        </div>
      </div>

      <button
        type="button"
        onClick={add}
        disabled={!product.available || !weight}
        className="cc-btn-primary w-full py-3.5 text-[13px] disabled:cursor-not-allowed disabled:opacity-45"
      >
        {added ? t.product.added : t.product.add}
      </button>
    </div>
  )
}

export function ProductSheet() {
  const { t, productId, openProduct } = useApp()

  return (
    <Sheet open={productId !== null} onClose={() => openProduct(null)}>
      {productId !== null && <Body key={productId} productId={productId} />}
      <button
        type="button"
        onClick={() => openProduct(null)}
        className="mt-4 w-full font-display text-[11px] uppercase tracking-[0.2em] text-mist/60 hover:text-mist"
      >
        {t.close}
      </button>
    </Sheet>
  )
}
