import { useSite } from '../site'
import { Card, Reveal, Section, SectionHead } from './ui'
import { IconMap, IconPin } from './Icons'

const CARD_ICONS = [IconMap, IconPin]

export function Delivery() {
  const { t } = useSite()

  return (
    <Section id="delivery">
      <div className="cc-shell">
        <SectionHead eyebrow={t.delivery.eyebrow} title={t.delivery.title} lead={t.delivery.lead} />

        <div className="grid gap-5 lg:grid-cols-2">
          {t.delivery.cards.map((card, i) => {
            const Icon = CARD_ICONS[i] ?? IconMap
            return (
              <Reveal key={card.title} delay={0.07 * i}>
                <Card className="flex h-full flex-col p-7 md:p-9">
                  <div className="flex items-start justify-between gap-5">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl border border-aqua/25 bg-aqua/[0.07] text-aqua">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-aqua/30 bg-aqua/[0.08] px-3 py-1.5 font-display text-[10px] uppercase tracking-[0.2em] text-aqua">
                      <span className="relative flex h-1.5 w-1.5">
                        <span
                          className="absolute inline-flex h-full w-full rounded-full bg-aqua"
                          style={{ animation: 'cc-pulse-ring 2.4s ease-out infinite' }}
                        />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-aqua" />
                      </span>
                      {card.badge}
                    </span>
                  </div>

                  <h3 className="mt-7 text-[24px] leading-tight md:text-[27px]">{card.title}</h3>
                  <p className="mt-3 max-w-[46ch] text-[15px] leading-relaxed text-mist">{card.text}</p>

                  <ul className="mt-7 space-y-3.5 border-t border-white/8 pt-6">
                    {card.rows.map((row) => (
                      <li key={row.label} className="flex items-center justify-between gap-4">
                        <span className="text-[14.5px] text-mist">{row.label}</span>
                        <span className="flex items-center gap-3">
                          <span className="h-px w-8 bg-white/12 sm:w-14" />
                          <span className="font-display text-[10.5px] uppercase tracking-[0.22em] text-aqua/90">
                            {row.status}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </Reveal>
            )
          })}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-7 flex items-start gap-4 rounded-2xl border border-white/8 bg-white/[0.02] p-5 md:items-center">
            <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-aqua/40 font-display text-[12px] text-aqua">
              i
            </span>
            <p className="text-[14px] leading-relaxed text-mist">{t.delivery.note}</p>
          </div>
        </Reveal>
      </div>
    </Section>
  )
}
