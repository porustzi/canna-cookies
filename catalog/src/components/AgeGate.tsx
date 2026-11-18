import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Dict } from '../i18n'

export function AgeGate({ t, onAgree }: { t: Dict; onAgree: () => void }) {
  const [declined, setDeclined] = useState(false)

  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden px-5 py-10">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(70% 50% at 50% 0%, rgba(0,200,255,0.12), transparent 65%), radial-gradient(60% 45% at 85% 95%, rgba(89,230,255,0.08), transparent 60%)',
        }}
      />
      <div className="cc-grid-lines pointer-events-none absolute inset-0 opacity-30" />

      <motion.div
        className="cc-card relative w-full max-w-md p-8 text-center"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center justify-center gap-4">
          <img src="/moon.png" alt="" className="h-20 w-auto" />
          <img src="/cc.png" alt="" className="h-14 w-14" />
        </div>

        <span className="mt-5 inline-block rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 font-display text-[10px] uppercase tracking-[0.26em] text-mist">
          {t.age.badge}
        </span>

        <div className="mt-5 font-display text-[64px] leading-none font-bold text-aqua">21+</div>

        <h1 className="mt-3 text-[clamp(1.3rem,5vw,1.7rem)]">{t.age.title}</h1>

        <div className="mt-7 flex flex-col gap-3">
          <button type="button" onClick={onAgree} className="cc-btn-primary w-full py-3.5 text-[13px]">
            {t.age.yes}
          </button>
          <button type="button" onClick={() => setDeclined(true)} className="cc-btn-ghost w-full py-3.5 text-[13px]">
            {t.age.no}
          </button>
        </div>

        {declined && <p className="mt-5 text-[13.5px] leading-relaxed text-mist">{t.age.note}</p>}

        <p className="mt-7 font-display text-[10px] uppercase tracking-[0.28em] text-mist/45">{t.footer.rights}</p>
      </motion.div>
    </div>
  )
}
