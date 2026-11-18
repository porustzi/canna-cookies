import { useSite } from '../site'
import { CATALOG_URL } from '../config'
import { Card, Reveal, Section } from './ui'
import { IconSend } from './Icons'

export function Catalog() {
  const { t } = useSite()

  return (
    <Section id="catalog">
      <div className="cc-shell">
        <Reveal>
          <Card className="relative overflow-hidden p-7 md:p-12">
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(90% 120% at 85% 20%, rgba(0,200,255,0.14), transparent 60%), radial-gradient(70% 90% at 10% 90%, rgba(89,230,255,0.12), transparent 65%)',
              }}
            />
            <div className="cc-grid-lines pointer-events-none absolute inset-0 opacity-30" />

            <div className="relative grid gap-9 md:grid-cols-[1.3fr_auto] md:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-4">
                  <span className="rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 font-display text-[10px] uppercase tracking-[0.26em] text-mist">
                    {t.catalog.badge}
                  </span>
                  <span className="cc-eyebrow">{t.catalog.eyebrow}</span>
                </div>
                <h2 className="mt-5 text-[clamp(1.9rem,4.4vw,3.1rem)] leading-[1.05]">{t.catalog.title}</h2>
                <p className="mt-4 max-w-[56ch] text-[15.5px] leading-relaxed text-mist">{t.catalog.text}</p>
              </div>

              <div className="flex flex-col items-start gap-4 md:items-end">
                <a href={CATALOG_URL} className="cc-btn-primary w-full md:w-auto">
                  <IconSend className="h-4 w-4" />
                  {t.catalog.cta}
                </a>
                <span className="font-display text-[10.5px] uppercase tracking-[0.26em] text-mist/55">
                  Telegram Mini App · Live
                </span>
              </div>
            </div>
          </Card>
        </Reveal>
      </div>
    </Section>
  )
}
