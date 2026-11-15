import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSite } from '../site'
import { IconClose, IconSend } from './Icons'

export function ComingSoon({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useSite()
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    document.body.classList.add('cc-locked')
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const timer = window.setTimeout(() => closeRef.current?.focus(), 250)
    return () => {
      document.body.classList.remove('cc-locked')
      window.removeEventListener('keydown', onKey)
      window.clearTimeout(timer)
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] grid place-items-center bg-ink/85 px-5 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="catalog-modal-title"
        >
          <motion.div
            className="cc-card w-full max-w-[520px] overflow-hidden p-7 text-center md:p-10"
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: 'radial-gradient(80% 100% at 50% 0%, rgba(0,217,232,0.16), transparent 65%)',
              }}
            />

            <div className="relative">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-aqua/30 bg-aqua/[0.08] text-aqua">
                <IconSend className="h-6 w-6" />
              </span>

              <span className="mt-5 inline-block rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 font-display text-[10px] uppercase tracking-[0.26em] text-mist">
                {t.modal.badge}
              </span>

              <h2 id="catalog-modal-title" className="mt-4 text-[clamp(1.6rem,4.5vw,2.2rem)]">
                {t.modal.title}
              </h2>

              <p className="mx-auto mt-4 max-w-[44ch] text-[15px] leading-relaxed text-mist">{t.modal.text}</p>

              <button ref={closeRef} type="button" onClick={onClose} className="cc-btn-ghost relative mt-7 w-full">
                {t.modal.close}
              </button>

              <p className="mt-6 flex items-center justify-center gap-2 font-display text-[10.5px] uppercase tracking-[0.28em] text-mist/45">
                <IconClose className="h-3.5 w-3.5" />
                DON'T PANIC, IT'S ORGANIC · 21+
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
