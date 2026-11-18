import { useApp } from '../context'
import { cartTotals, findProduct, linePrice } from '../cart'
import { Stepper } from './ui'

export function CartView() {
  const { t, data, cart, zone, setQty, removeAt, go } = useApp()
  const district = data.districts.find((d) => d.id === zone.districtId)
  const totals = cartTotals(data, cart, district?.fee ?? 0)
  const underMin = data.settings.minOrder > 0 && totals.subtotal > 0 && totals.subtotal < data.settings.minOrder

  if (cart.length === 0) {
    return (
      <div className="cc-card grid place-items-center gap-4 p-10 text-center">
        <p className="text-mist">{t.cart.empty}</p>
        <button type="button" onClick={() => go('catalog')} className="cc-btn-primary px-6 py-3 text-[12.5px]">
          {t.cart.emptyCta}
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[clamp(1.4rem,6vw,1.9rem)]">{t.cart.title}</h1>

      <div className="flex flex-col gap-3">
        {cart.map((item, i) => {
          const product = findProduct(data, item.productId)
          const line = linePrice(data, item)
          return (
            <div key={`${item.productId}-${item.weightLabel}`} className="cc-card flex items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-[14.5px] text-snow">{product?.name ?? '—'}</p>
                <p className="mt-0.5 font-display text-[11.5px] tracking-wide text-mist/70">{item.weightLabel}</p>
              </div>
              <Stepper value={item.qty} onChange={(n) => setQty(i, n)} />
              <div className="w-[74px] text-right font-display text-[15px] text-aqua">{line ?? '—'} Kč</div>
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-mist hover:bg-white/10 hover:text-snow"
                aria-label={t.cart.remove}
                title={t.cart.remove}
              >
                ✕
              </button>
            </div>
          )
        })}
      </div>

      <div className="cc-card flex flex-col gap-2 p-5 text-[14px]">
        <div className="flex justify-between text-mist">
          <span>{t.checkout.price}</span>
          <span className="text-snow">{totals.subtotal} Kč</span>
        </div>
        <div className="flex justify-between text-mist">
          <span>
            {t.cart.delivery} · {district?.name ?? '—'}
          </span>
          <span className="text-snow">{totals.delivery > 0 ? `${totals.delivery} Kč` : '0 Kč'}</span>
        </div>
        <div className="mt-1 flex justify-between border-t border-white/10 pt-3 font-display text-[16px]">
          <span className="text-snow">{t.cart.total}</span>
          <span className="text-aqua">{totals.grand} Kč</span>
        </div>
        {underMin && <p className="mt-1 text-[13px] text-[#FFD28F]">{t.cart.minOrder.replace('{n}', String(data.settings.minOrder))}</p>}
      </div>

      <button
        type="button"
        onClick={() => go('checkout')}
        disabled={underMin}
        className="cc-btn-primary w-full py-3.5 text-[13px] disabled:cursor-not-allowed disabled:opacity-45"
      >
        {t.cart.checkout}
      </button>
    </div>
  )
}
