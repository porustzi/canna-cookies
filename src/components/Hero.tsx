import { motion, useReducedMotion } from 'framer-motion'
import { useSite } from '../site'
import { IconArrow, IconSend } from './Icons'
import { Mark } from './Logo'

export function Hero() {
  const { t, openCatalog } = useSite()
  const reduce = useReducedMotion()

  const line = (delay: number) => ({
    initial: reduce ? undefined : { y: '110%' },
    animate: reduce ? undefined : { y: '0%' },
    transition: { duration: 1.1, delay, ease: [0.16, 1, 0.3, 1] as const },
  })

  return (
    <section id="top" className="cc-noise relative isolate flex min-h-[100svh] flex-col overflow-hidden">
      <div
        className="cc-grid-lines pointer-events-none absolute inset-0 opacity-70"
        style={{
          maskImage: 'radial-gradient(ellipse 90% 70% at 50% 35%, black 10%, transparent 78%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 50% 35%, black 10%, transparent 78%)',
        }}
      />
      <div className="cc-glow" style={{ width: 540, height: 540, top: -170, right: -110, background: 'rgba(0,217,232,0.15)' }} />
      <div className="cc-glow" style={{ width: 480, height: 480, bottom: -190, left: -140, background: 'rgba(22,207,192,0.12)' }} />
      <div
        className="cc-glow hidden md:block"
        style={{ width: 300, height: 300, top: '42%', left: '38%', background: 'rgba(0,217,232,0.07)' }}
      />

      <div
        className="pointer-events-none absolute right-[3%] top-1/2 hidden -translate-y-1/2 lg:block"
        style={{ animation: reduce ? undefined : 'cc-float 8s ease-in-out infinite' }}
        aria-hidden="true"
      >
        <div className="relative h-[420px] w-[420px]">
          <div className="absolute inset-0 rounded-full border border-white/10" />
          <div
            className="absolute inset-9 rounded-full border border-dashed border-aqua/30"
            style={{ animation: reduce ? undefined : 'cc-spin 46s linear infinite' }}
          />
          <div className="absolute inset-20 rounded-full bg-gradient-to-br from-aqua/12 via-transparent to-teal/10 shadow-[0_0_120px_-40px_rgba(0,217,232,0.9)]" />
          <div className="absolute inset-0 grid place-items-center">
            <Mark className="h-24 w-24" />
          </div>
          <div className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-aqua shadow-[0_0_18px_4px_rgba(0,217,232,0.7)]" />
          <div className="absolute bottom-6 right-10 h-1.5 w-1.5 rounded-full bg-teal shadow-[0_0_14px_3px_rgba(22,207,192,0.7)]" />
        </div>
      </div>

      <div className="cc-shell relative z-10 flex flex-1 flex-col justify-center pb-14 pt-32">
        <motion.span
          initial={reduce ? undefined : { opacity: 0, y: 16 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="mb-7 inline-flex w-fit items-center gap-3 rounded-full border border-white/12 bg-white/[0.03] px-4 py-2 font-display text-[10.5px] uppercase tracking-[0.28em] text-mist backdrop-blur"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-aqua" style={{ animation: 'cc-pulse-ring 2.2s ease-out infinite' }} />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-aqua" />
          </span>
          {t.hero.badge}
        </motion.span>

        <h1 className="font-display text-[clamp(2.6rem,9vw,7rem)] font-medium uppercase leading-[0.92] tracking-[-0.045em]">
          <span className="block overflow-hidden pb-[0.06em]">
            <motion.span className="block" {...line(0.12)}>
              {t.hero.titleTop}
            </motion.span>
          </span>
          <span className="block overflow-hidden pb-[0.06em]">
            <motion.span className="cc-text-gradient block" {...line(0.26)}>
              {t.hero.titleBottom}
            </motion.span>
          </span>
        </h1>

        <div className="mt-9 grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 22 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="max-w-[46ch] text-[16px] leading-relaxed text-mist md:text-[17px]">{t.hero.lead}</p>
            <p className="mt-5 inline-flex items-center gap-2.5 rounded-full border border-aqua/25 bg-aqua/[0.06] px-3.5 py-1.5 font-display text-[11px] uppercase tracking-[0.2em] text-aqua">
              <IconSend className="h-3.5 w-3.5" />
              {t.hero.teaser}
            </p>
          </motion.div>

          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 22 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.62, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center gap-4"
          >
            <button type="button" onClick={openCatalog} className="cc-btn-primary">
              <IconSend className="h-4 w-4" />
              {t.hero.cta}
            </button>
            <a href="#about" className="cc-btn-ghost">
              {t.hero.secondary}
              <IconArrow className="h-4 w-4" />
            </a>
          </motion.div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-28 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex">
        <span className="font-display text-[10px] tracking-[0.4em] text-mist/50">{t.hero.scroll}</span>
        <span className="h-10 w-px bg-gradient-to-b from-aqua/70 to-transparent" />
      </div>

      <div className="relative z-10 overflow-hidden border-y border-white/8 bg-ink/50 py-4 backdrop-blur-sm">
        <div className="cc-marquee">
          {[0, 1].map((half) => (
            <div key={half} className="flex shrink-0 items-center" aria-hidden={half === 1}>
              {t.hero.strip.map((item, i) => (
                <span
                  key={i}
                  className="flex items-center gap-8 whitespace-nowrap px-8 font-display text-[11px] uppercase tracking-[0.4em] text-mist/70"
                >
                  {item}
                  <span className="text-aqua/80">◆</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
