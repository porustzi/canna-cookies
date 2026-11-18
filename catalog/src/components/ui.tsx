import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, type ReactNode } from 'react'

export function Sheet({
  open,
  onClose,
  children,
}: {
  open: boolean
  onClose: () => void
  children: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    document.body.classList.add('cc-locked')
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.classList.remove('cc-locked')
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/85 backdrop-blur-md sm:items-center sm:p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            className="cc-card max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl p-6 sm:rounded-3xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function Stepper({ value, onChange, min = 1, max = 20 }: { value: number; onChange: (n: number) => void; min?: number; max?: number }) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-white/12 bg-white/[0.03] p-1">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="grid h-8 w-8 place-items-center rounded-full text-mist hover:bg-white/10 hover:text-snow"
        aria-label="-"
      >
        −
      </button>
      <span className="w-7 text-center font-display text-[14px] text-snow">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="grid h-8 w-8 place-items-center rounded-full text-mist hover:bg-white/10 hover:text-snow"
        aria-label="+"
      >
        +
      </button>
    </div>
  )
}

export function ProductVisual({ name, className = '' }: { name: string; className?: string }) {
  return (
    <div
      className={`relative grid place-items-center overflow-hidden bg-gradient-to-br from-[#12222b] via-[#0d1519] to-[#0a0d10] ${className}`}
      aria-hidden="true"
    >
      <span className="font-display text-[clamp(2rem,8vw,3rem)] font-bold tracking-tighter text-aqua/25 select-none">
        {name.slice(0, 2).toUpperCase()}
      </span>
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_70%_20%,rgba(0,200,255,0.12),transparent_65%)]" />
    </div>
  )
}
