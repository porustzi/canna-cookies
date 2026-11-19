import { useApp } from '../context'
import { pick } from '../types'
import type { Lang } from '../types'

const LANGS: { id: Lang; label: string }[] = [
  { id: 'cs', label: 'CS' },
  { id: 'en', label: 'EN' },
  { id: 'ru', label: 'RU' },
]

export function Header() {
  const { t, lang, setLang, zone, data, openZoneGate, go } = useApp()
  const district = data.districts.find((d) => d.id === zone.districtId)

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-ink/88 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-4 py-3">
        <button type="button" onClick={() => go('catalog')} className="flex shrink-0 items-center gap-2" aria-label="Cookies">
          <img src="/cc.png" alt="" className="h-8 w-8" />
          <span className="hidden font-display text-[12.5px] font-semibold tracking-[0.2em] text-snow sm:block">
            COOKIES
          </span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openZoneGate}
            className="max-w-[130px] truncate rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 font-display text-[10.5px] uppercase tracking-[0.14em] text-mist hover:border-aqua/40 hover:text-snow"
            title={t.district.change}
          >
            {district ? pick(district.name, lang) : t.district.change}
          </button>

          <div className="flex items-center rounded-full border border-white/12 bg-white/[0.04] p-0.5">
            {LANGS.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setLang(l.id)}
                className={`rounded-full px-2 py-1 font-display text-[10px] tracking-[0.1em] ${
                  lang === l.id ? 'bg-aqua text-ink' : 'text-mist hover:text-snow'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}
