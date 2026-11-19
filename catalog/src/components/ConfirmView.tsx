import { useEffect, useState } from 'react'
import { useApp } from '../context'
import { readLastOrder, type LastOrder } from '../storage'

export function ConfirmView() {
  const { t, go } = useApp()
  const [order] = useState<LastOrder | null>(() => readLastOrder())

  useEffect(() => {
    if (!order) go('catalog')
  }, [order, go])

  if (!order) return null

  return (
    <div className="flex flex-col items-center gap-5 pt-6 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full border border-aqua/40 bg-aqua/[0.1] font-display text-[28px] text-aqua">
        ✓
      </span>

      <h1 className="text-[clamp(1.4rem,6vw,1.9rem)]">{t.confirm.title}</h1>

      <div className="cc-card w-full p-6">
        <p className="font-display text-[11px] uppercase tracking-[0.2em] text-mist/70">{t.confirm.no}</p>
        <p className="mt-2 font-display text-[26px] font-semibold tracking-wide text-aqua">{order.id}</p>
        <p className="mt-3 font-display text-[15px] text-snow">{order.grand} Kč</p>
      </div>

      <p className="max-w-[36ch] text-[14.5px] leading-relaxed text-mist">{t.confirm.text}</p>

      <button type="button" onClick={() => go('catalog')} className="cc-btn-primary w-full py-3.5 text-[13px]">
        {t.confirm.again}
      </button>
      <button type="button" onClick={() => go('orders')} className="cc-btn-ghost w-full py-3 text-[11.5px]">
        {t.nav.orders}
      </button>
    </div>
  )
}
