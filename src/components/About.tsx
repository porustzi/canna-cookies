import { useSite } from '../site'
import { Card, Reveal, Section, SectionHead } from './ui'
import { IconArrow } from './Icons'

export function About() {
  const { t, images } = useSite()

  return (
    <Section id="about">
      <div className="cc-shell">
        <SectionHead eyebrow={t.about.eyebrow} title={t.about.title} lead={t.about.lead} />

        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="font-display text-[clamp(1.2rem,2.3vw,1.6rem)] leading-snug text-snow/90">{t.about.p1}</p>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="mt-6 max-w-[62ch] text-[15.5px] leading-relaxed text-mist">{t.about.p2}</p>
            </Reveal>
            <Reveal delay={0.14}>
              <p className="mt-7 border-l border-aqua/45 pl-5 text-[13.5px] leading-relaxed text-mist/60">{t.about.p3}</p>
            </Reveal>

            <div className="mt-9 grid gap-4 sm:grid-cols-3">
              {t.about.principles.map((p, i) => (
                <Reveal key={p.k} delay={0.06 * i}>
                  <Card className="h-full p-5">
                    <span className="font-display text-[11px] tracking-[0.3em] text-aqua/80">{p.k}</span>
                    <h3 className="mt-3 text-[16px] leading-snug">{p.title}</h3>
                    <p className="mt-2 text-[13.5px] leading-relaxed text-mist">{p.text}</p>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            <Reveal delay={0.1}>
              <Card className="relative flex min-h-[420px] flex-col justify-between overflow-hidden p-7">
                <div
                  className="pointer-events-none absolute inset-0 opacity-70"
                  style={{
                    background:
                      'radial-gradient(120% 90% at 20% 0%, rgba(0,200,255,0.16), transparent 55%), radial-gradient(100% 80% at 90% 100%, rgba(89,230,255,0.14), transparent 60%)',
                  }}
                />
                <div className="cc-grid-lines pointer-events-none absolute inset-0 opacity-40" />

                <div className="relative flex items-center justify-between font-display text-[10.5px] uppercase tracking-[0.3em] text-mist/70">
                  <span>CANNA COOKIES</span>
                  <span>21+ · CBD</span>
                </div>

                <div className="relative grid place-items-center py-6">
                  <img
                    src={images.about ?? '/about-emblem.png'}
                    alt="CANNA COOKIES"
                    width={1100}
                    height={733}
                    className="w-full max-w-[400px] drop-shadow-[0_0_50px_rgba(0,200,255,0.28)]"
                  />
                </div>

                <div className="relative border-t border-white/8 pt-5">
                  <span className="cc-eyebrow">{t.about.partnerLabel}</span>
                  <div className="mt-3 flex items-center justify-between gap-4">
                    <span className="font-display text-[22px] tracking-tight text-snow">{t.about.partnerName}</span>
                    <a
                      href="https://www.califarms.cz/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cc-link inline-flex items-center gap-1.5 text-[14px] text-aqua"
                    >
                      {t.about.partnerCta}
                      <IconArrow className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </Card>
            </Reveal>
          </div>
        </div>
      </div>
    </Section>
  )
}
