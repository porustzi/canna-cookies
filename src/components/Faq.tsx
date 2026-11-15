import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSite } from '../site'
import { Reveal, Section, SectionHead } from './ui'
import { IconPlus } from './Icons'

export function Faq() {
  const { t } = useSite()
  const [open, setOpen] = useState<number | null>(0)

  return (
    <Section id="faq" className="bg-slate-deep/60">
      <div className="cc-shell">
        <SectionHead eyebrow={t.faq.eyebrow} title={t.faq.title} lead={t.faq.lead} />

        <div className="max-w-4xl">
          {t.faq.items.map((item, i) => {
            const isOpen = open === i
            return (
              <Reveal key={item.q} delay={0.03 * i}>
                <div className="border-b border-white/8">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="group flex w-full items-center justify-between gap-6 py-6 text-left"
                  >
                    <span className="flex items-baseline gap-4">
                      <span className="font-display text-[11px] tracking-[0.25em] text-aqua/70">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="font-display text-[17px] leading-snug text-snow transition-colors duration-300 group-hover:text-aqua md:text-[19px]">
                        {item.q}
                      </span>
                    </span>
                    <span
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-all duration-300 ${
                        isOpen ? 'border-aqua/60 bg-aqua/10 text-aqua' : 'border-white/12 text-mist group-hover:border-aqua/50 group-hover:text-aqua'
                      }`}
                    >
                      <motion.span animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
                        <IconPlus className="h-4 w-4" />
                      </motion.span>
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-[72ch] pb-6 pr-4 text-[15px] leading-relaxed text-mist md:pl-9">{item.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </Section>
  )
}
