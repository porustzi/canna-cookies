import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useSite } from '../site'
import { IconLock } from './Icons'
import { BrandLogo } from './Logo'

export function AgeGate({ mode, onAccept, onDeny }: { mode: 'gate' | 'denied'; onAccept: () => void; onDeny?: () => void }) {
  const { t } = useSite()
  const yesRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    document.body.classList.add('cc-locked')
    const timer = window.setTimeout(() => yesRef.current?.focus(), 350)
    return () => {
      window.clearTimeout(timer)
      document.body.classList.remove('cc-locked')
    }
  }, [])

  const denied = mode === 'denied'

  return (
    <motion.div
      className="cc-noise fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-ink/97 px-5 py-10 backdrop-blur-2xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-title"
    >
      <div
        className="cc-glow"
        style={{ width: 520, height: 520, top: -180, right: -140, background: 'rgba(0,217,232,0.14)' }}
      />
      <div
        className="cc-glow"
        style={{ width: 440, height: 440, bottom: -180, left: -120, background: 'rgba(22,207,192,0.1)' }}
      />
      <div className="cc-grid-lines pointer-events-none absolute inset-0 opacity-40" />

      <span
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none font-display text-[clamp(14rem,42vw,30rem)] font-semibold leading-none text-white/[0.025]"
        aria-hidden="true"
      >
        21+
      </span>

      <motion.div
        initial={{ opacity: 0, y: 26, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="cc-card relative z-10 w-full max-w-[560px] p-7 text-center md:p-11"
      >
        {denied ? (
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-aqua/30 bg-aqua/[0.08] text-aqua">
            <IconLock className="h-6 w-6" />
          </div>
        ) : (
          <BrandLogo className="mx-auto h-44 w-auto max-w-full" />
        )}

        <span className="cc-eyebrow mt-6">{t.age.kicker}</span>

        <h2 id="age-title" className="mt-4 text-[clamp(1.9rem,5vw,2.9rem)] leading-[1.05]">
          {denied ? t.age.deniedTitle : t.age.title}
        </h2>

        <p className="mx-auto mt-4 max-w-[44ch] text-[15px] leading-relaxed text-mist">
          {denied ? t.age.deniedText : t.age.text}
        </p>

        {!denied && (
          <p className="mx-auto mt-5 max-w-[52ch] border-t border-white/8 pt-5 text-[12.5px] leading-relaxed text-mist/60">
            {t.age.legal}
          </p>
        )}

        <div className={`mt-7 grid gap-3 ${denied ? '' : 'sm:grid-cols-2'}`}>
          <button ref={yesRef} type="button" onClick={onAccept} className="cc-btn-primary w-full">
            {t.age.yes}
          </button>
          {!denied && onDeny && (
            <button type="button" onClick={onDeny} className="cc-btn-ghost w-full">
              {t.age.no}
            </button>
          )}
        </div>

        <p className="mt-7 font-display text-[10.5px] uppercase tracking-[0.3em] text-mist/40">
          21+ · DON'T PANIC, IT'S ORGANIC
        </p>
      </motion.div>
    </motion.div>
  )
}
