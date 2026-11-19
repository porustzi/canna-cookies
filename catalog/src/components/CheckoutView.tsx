import { useState } from 'react'
import { useApp } from '../context'
import { cartTotals, linePrice } from '../cart'
import { submitOrder } from '../api'
import { writeLastOrder } from '../storage'
import { pick } from '../types'
import type { OrderLine } from '../types'

export function CheckoutView() {
  const { t, data, lang, cart, zone, saveZone, go, clearCart } = useApp()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [districtId, setDistrictId] = useState(zone.districtId)
  const [address, setAddress] = useState(zone.address)
  const paymentOptions = data.settings.payment
  const [paymentIdx, setPaymentIdx] = useState<number | null>(paymentOptions.length > 0 ? 0 : null)
  const [comment, setComment] = useState('')
  const [website, setWebsite] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const district = data.districts.find((d) => d.id === districtId)
  const totals = cartTotals(data, cart, district?.fee ?? 0)

  const lines: OrderLine[] = cart.flatMap((item) => {
    const product = data.products.find((p) => p.id === item.productId)
    if (!product) return []
    const price = linePrice(data, item)
    if (price === null) return []
    return [
      { productId: product.id, name: pick(product.name, lang), weight: item.weightLabel, price: price / item.qty, qty: item.qty },
    ]
  })

  const submit = async () => {
    setError(null)
    if (name.trim().length < 2 || phone.replace(/\D/g, '').length < 6 || address.trim().length < 3) {
      setError(t.required)
      return
    }
    if (paymentOptions.length > 0 && paymentIdx === null) {
      setError(t.required)
      return
    }
    setBusy(true)
    try {
      const res = await submitOrder({
        items: lines,
        districtId,
        address: address.trim(),
        name: name.trim(),
        phone: phone.trim(),
        payment: paymentIdx !== null ? pick(paymentOptions[paymentIdx], lang) : '',
        comment: comment.trim(),
        website,
        lang,
      })
      saveZone({ districtId, address: address.trim() })
      clearCart()
      writeLastOrder({ id: res.id, grand: res.grand })
      go('order')
    } catch (e) {
      const msg = e instanceof Error ? e.message : ''
      setError(msg === 'rate-limited' ? t.rateLimit : t.error)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-[clamp(1.4rem,6vw,1.9rem)]">{t.checkout.title}</h1>
        <button
          type="button"
          onClick={() => go('cart')}
          className="font-display text-[11px] uppercase tracking-[0.16em] text-mist hover:text-snow"
        >
          ← {t.checkout.backToCart}
        </button>
      </div>

      <div className="cc-card flex flex-col gap-1.5 p-5 text-[14px]">
        {lines.map((l) => (
          <div key={`${l.productId}-${l.weight}`} className="flex justify-between gap-3 text-mist">
            <span className="truncate">
              {l.name} · {l.weight} × {l.qty}
            </span>
            <span className="shrink-0 text-snow">{l.price * l.qty} Kč</span>
          </div>
        ))}
        <div className="mt-1 flex justify-between border-t border-white/10 pt-2 text-mist">
          <span>{t.checkout.weight}</span>
          <span className="text-snow">{totals.grams !== null ? `${totals.grams} g` : '—'}</span>
        </div>
        <div className="flex justify-between text-mist">
          <span>{t.cart.delivery}</span>
          <span className="text-snow">{totals.delivery > 0 ? `${totals.delivery} Kč` : '0 Kč'}</span>
        </div>
        <div className="mt-1 flex justify-between border-t border-white/10 pt-2 font-display text-[16px]">
          <span className="text-snow">{t.cart.total}</span>
          <span className="text-aqua">{totals.grand} Kč</span>
        </div>
      </div>

      <div className="cc-card flex flex-col gap-4 p-5">
        <label className="block">
          <span className="font-display text-[11px] uppercase tracking-[0.2em] text-mist/70">{t.checkout.name}</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.checkout.namePh}
            className="mt-2 w-full rounded-xl border border-white/12 bg-graphite px-4 py-3.5 text-[15px] text-snow placeholder:text-mist/40 outline-none focus:border-aqua/60"
          />
        </label>

        <label className="block">
          <span className="font-display text-[11px] uppercase tracking-[0.2em] text-mist/70">{t.checkout.phone}</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t.checkout.phonePh}
            inputMode="tel"
            className="mt-2 w-full rounded-xl border border-white/12 bg-graphite px-4 py-3.5 text-[15px] text-snow placeholder:text-mist/40 outline-none focus:border-aqua/60"
          />
        </label>

        <label className="block">
          <span className="font-display text-[11px] uppercase tracking-[0.2em] text-mist/70">{t.checkout.district}</span>
          <select
            value={districtId}
            onChange={(e) => setDistrictId(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/12 bg-graphite px-4 py-3.5 text-[15px] text-snow outline-none focus:border-aqua/60"
          >
            {data.districts.map((d) => (
              <option key={d.id} value={d.id}>
                {pick(d.name, lang)}
                {d.fee > 0 ? ` · ${d.fee} Kč` : ''}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="font-display text-[11px] uppercase tracking-[0.2em] text-mist/70">{t.checkout.address}</span>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={t.district.addressPh}
            className="mt-2 w-full rounded-xl border border-white/12 bg-graphite px-4 py-3.5 text-[15px] text-snow placeholder:text-mist/40 outline-none focus:border-aqua/60"
          />
        </label>

        {paymentOptions.length > 0 && (
          <div>
            <span className="font-display text-[11px] uppercase tracking-[0.2em] text-mist/70">{t.checkout.payment}</span>
            <div className="mt-2 flex flex-col gap-2">
              {paymentOptions.map((option, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPaymentIdx(idx)}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-[14.5px] ${
                    paymentIdx === idx
                      ? 'border-aqua bg-aqua/[0.08] text-snow'
                      : 'border-white/12 bg-white/[0.03] text-mist hover:border-aqua/40'
                  }`}
                >
                  <span
                    className={`grid h-4.5 w-4.5 shrink-0 place-items-center rounded-full border-2 ${
                      paymentIdx === idx ? 'border-aqua bg-aqua' : 'border-white/25'
                    }`}
                  >
                    {paymentIdx === idx && <span className="h-1.5 w-1.5 rounded-full bg-ink" />}
                  </span>
                  {pick(option, lang)}
                </button>
              ))}
            </div>
          </div>
        )}

        <label className="block">
          <span className="font-display text-[11px] uppercase tracking-[0.2em] text-mist/70">{t.checkout.comment}</span>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t.checkout.commentPh}
            rows={3}
            className="mt-2 w-full resize-none rounded-xl border border-white/12 bg-graphite px-4 py-3.5 text-[15px] text-snow placeholder:text-mist/40 outline-none focus:border-aqua/60"
          />
        </label>

        <input
          type="text"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute -left-[9999px] h-0 w-0 opacity-0"
        />

        {error && <p className="text-[13.5px] text-[#FFD28F]">{error}</p>}

        <p className="text-[12.5px] leading-relaxed text-mist/60">{t.checkout.privacy}</p>

        <button
          type="button"
          onClick={() => void submit()}
          disabled={busy}
          className="cc-btn-primary w-full py-3.5 text-[13px] disabled:opacity-60"
        >
          {busy ? t.checkout.sending : t.checkout.submit}
        </button>
      </div>
    </div>
  )
}
