import { useState } from 'react'
import type { Dict } from '../i18n'
import type { CatalogData, Zone } from '../types'
import { Sheet } from './ui'

function Form({
  t,
  data,
  zone,
  onSave,
}: {
  t: Dict
  data: CatalogData
  zone: Zone | null
  onSave: (zone: Zone) => void
}) {
  const [districtId, setDistrictId] = useState(zone?.districtId ?? '')
  const [address, setAddress] = useState(zone?.address ?? '')
  const [tried, setTried] = useState(false)

  const valid = districtId !== '' && address.trim().length >= 3

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        setTried(true)
        if (valid) onSave({ districtId, address: address.trim() })
      }}
      className="flex flex-col gap-4"
    >
      <div>
        <span className="cc-eyebrow">{t.district.title}</span>
        <p className="mt-3 text-[14px] leading-relaxed text-mist">{t.district.lead}</p>
      </div>

      <label className="block">
        <span className="font-display text-[11px] uppercase tracking-[0.2em] text-mist/70">{t.district.label}</span>
        <select
          value={districtId}
          onChange={(e) => setDistrictId(e.target.value)}
          className="mt-2 w-full rounded-xl border border-white/12 bg-graphite px-4 py-3.5 text-[15px] text-snow outline-none focus:border-aqua/60"
        >
          <option value="">{t.district.pick}</option>
          {data.districts.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
              {d.fee > 0 ? ` · ${d.fee} Kč` : ''}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="font-display text-[11px] uppercase tracking-[0.2em] text-mist/70">{t.district.address}</span>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder={t.district.addressPh}
          className="mt-2 w-full rounded-xl border border-white/12 bg-graphite px-4 py-3.5 text-[15px] text-snow placeholder:text-mist/40 outline-none focus:border-aqua/60"
        />
      </label>

      {tried && !valid && <p className="text-[13px] text-[#FFD28F]">{t.required}</p>}

      <button type="submit" className="cc-btn-primary w-full py-3.5 text-[13px]">
        {t.district.save}
      </button>
    </form>
  )
}

export function DistrictGate({
  t,
  data,
  zone,
  onSave,
  onClose,
}: {
  t: Dict
  data: CatalogData
  zone: Zone | null
  onSave: (zone: Zone) => void
  onClose?: () => void
}) {
  if (onClose) {
    return (
      <Sheet open onClose={onClose}>
        <Form t={t} data={data} zone={zone} onSave={onSave} />
      </Sheet>
    )
  }

  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden px-5 py-10">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(70% 50% at 50% 0%, rgba(0,200,255,0.10), transparent 65%)' }}
      />
      <div className="cc-card relative w-full max-w-md p-7">
        <img src="/cc.png" alt="" className="mb-4 h-10 w-10" />
        <Form t={t} data={data} zone={zone} onSave={onSave} />
      </div>
    </div>
  )
}
