import { useSite } from '../site'
import { Card, Reveal, Section, SectionHead } from './ui'
import { IconAt, IconChat, IconMail, IconPin } from './Icons'

const CARD_ICONS = [IconMail, IconChat, IconAt, IconPin]

export function Contacts() {
  const { t } = useSite()

  return (
    <Section id="contacts">
      <div className="cc-shell">
        <SectionHead eyebrow={t.contacts.eyebrow} title={t.contacts.title} lead={t.contacts.lead} />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {t.contacts.cards.map((card, i) => {
            const Icon = CARD_ICONS[i] ?? IconMail
            const placeholder = card.value === '—'
            return (
              <Reveal key={card.label} delay={0.05 * i}>
                <Card className="flex h-full flex-col justify-between p-6">
                  <div className="flex items-start justify-between">
                    <span className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-aqua">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="rounded-full border border-white/10 px-2.5 py-1 font-display text-[9.5px] uppercase tracking-[0.2em] text-mist/70">
                      {card.status}
                    </span>
                  </div>
                  <div className="mt-8">
                    <span className="font-display text-[11px] uppercase tracking-[0.26em] text-mist/60">{card.label}</span>
                    {card.href && !placeholder ? (
                      <a
                        href={card.href}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 block font-display text-[20px] leading-tight text-snow transition-colors hover:text-aqua"
                      >
                        {card.value}
                      </a>
                    ) : (
                      <p
                        className={`mt-2 font-display leading-tight ${
                          placeholder ? 'text-[34px] text-white/15' : 'text-[20px] text-snow'
                        }`}
                      >
                        {card.value}
                      </p>
                    )}
                  </div>
                </Card>
              </Reveal>
            )
          })}
        </div>

        <Reveal delay={0.1}>
          <p className="mt-7 max-w-[70ch] text-[14px] leading-relaxed text-mist/70">{t.contacts.note}</p>
        </Reveal>
      </div>
    </Section>
  )
}
