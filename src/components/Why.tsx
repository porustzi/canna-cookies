import { useState } from 'react'
import { useSite } from '../site'
import { Card, Reveal, Section, SectionHead } from './ui'
import { IconCamera, IconLayers, IconLeaf, IconLock, IconMap, IconSend, IconShield } from './Icons'
import { Gallery } from './Gallery'
import type { WhyItem } from '../i18n'

const ICONS: Record<WhyItem['icon'], typeof IconLeaf> = {
  leaf: IconLeaf,
  layers: IconLayers,
  shield: IconShield,
  map: IconMap,
  lock: IconLock,
  send: IconSend,
}

export function Why() {
  const { t } = useSite()
  const [galleryOpen, setGalleryOpen] = useState(false)

  return (
    <Section id="why" className="bg-slate-deep/60">
      <div className="cc-shell">
        <SectionHead eyebrow={t.why.eyebrow} title={t.why.title} lead={t.why.lead} />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {t.why.items.map((item, i) => {
            const Icon = ICONS[item.icon]
            return (
              <Reveal key={item.title} delay={0.05 * (i % 3)}>
                <Card className="h-full p-7">
                  <div className="flex items-start justify-between">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl border border-aqua/25 bg-aqua/[0.07] text-aqua">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="font-display text-[11px] tracking-[0.3em] text-mist/35">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="mt-6 text-[19px] leading-snug">{item.title}</h3>
                  <p className="mt-3 text-[14.5px] leading-relaxed text-mist">{item.text}</p>
                  {item.gallery && item.cta ? (
                    <button
                      type="button"
                      onClick={() => setGalleryOpen(true)}
                      className="cc-btn-ghost mt-5 inline-flex w-full justify-center px-6 py-3.5 text-[12px]"
                    >
                      <IconCamera className="h-4 w-4" />
                      {item.cta}
                    </button>
                  ) : null}
                </Card>
              </Reveal>
            )
          })}
        </div>

        <Gallery open={galleryOpen} onClose={() => setGalleryOpen(false)} />
      </div>
    </Section>
  )
}
