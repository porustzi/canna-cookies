import { useState } from 'react'
import { useApp } from '../context'

export function FaqView() {
  const { t, data, lang } = useApp()
  const items = data.faq[lang] ?? []
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[clamp(1.4rem,6vw,1.9rem)]">{t.faq.title}</h1>

      {items.length === 0 ? (
        <div className="cc-card grid place-items-center p-10 text-center text-mist">{t.faq.empty}</div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {items.map((item, i) => (
            <div key={item.q} className="cc-card overflow-hidden p-0">
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
                aria-expanded={open === i}
              >
                <span className="font-display text-[14.5px] leading-snug text-snow">{item.q}</span>
                <span
                  className={`shrink-0 text-aqua transition-transform duration-300 ${open === i ? 'rotate-45' : ''}`}
                  aria-hidden="true"
                >
                  +
                </span>
              </button>
              {open === i && (
                <p className="border-t border-white/8 px-5 py-4 text-[14px] leading-relaxed text-mist">{item.a}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
