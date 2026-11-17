import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSite } from '../site'
import { useGallery } from '../gallery'
import { IconArrow, IconCamera, IconClose } from './Icons'

export function Gallery({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useSite()
  const photos = useGallery()
  const closeRef = useRef<HTMLButtonElement>(null)
  const [active, setActive] = useState<number | null>(null)

  const close = () => {
    setActive(null)
    onClose()
  }

  useEffect(() => {
    if (!open) return
    document.body.classList.add('cc-locked')
    const count = photos.length
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (active !== null) setActive(null)
        else onClose()
      }
      if (active !== null && count > 0) {
        if (e.key === 'ArrowRight') setActive((i) => ((i ?? 0) + 1) % count)
        if (e.key === 'ArrowLeft') setActive((i) => ((i ?? 0) - 1 + count) % count)
      }
    }
    window.addEventListener('keydown', onKey)
    const timer = window.setTimeout(() => closeRef.current?.focus(), 250)
    return () => {
      document.body.classList.remove('cc-locked')
      window.removeEventListener('keydown', onKey)
      window.clearTimeout(timer)
    }
  }, [open, onClose, active, photos.length])

  const hasPhotos = photos.length > 0

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] grid place-items-center bg-ink/85 px-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-labelledby="gallery-modal-title"
        >
          <motion.div
            className="cc-card flex max-h-[88vh] w-full max-w-[980px] flex-col overflow-hidden"
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: 'radial-gradient(80% 100% at 50% 0%, rgba(0,200,255,0.14), transparent 65%)' }}
            />

            <div className="relative flex items-start justify-between gap-4 border-b border-white/8 px-6 py-5 md:px-8">
              <div>
                <span className="inline-block rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 font-display text-[10px] uppercase tracking-[0.26em] text-mist">
                  {t.gallery.badge}
                </span>
                <h2 id="gallery-modal-title" className="mt-3 text-[clamp(1.3rem,3.5vw,1.8rem)]">
                  {t.gallery.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label={t.gallery.close}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/12 bg-white/[0.04] text-mist transition hover:border-aqua/50 hover:text-aqua"
              >
                <IconClose className="h-4 w-4" />
              </button>
            </div>

            <div className="relative overflow-y-auto px-6 py-6 md:px-8 md:py-7">
              {!hasPhotos ? (
                <div className="flex flex-col items-center px-4 py-10 text-center md:py-14">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl border border-aqua/30 bg-aqua/[0.08] text-aqua">
                    <IconCamera className="h-6 w-6" />
                  </span>
                  <p className="mt-5 max-w-[44ch] text-[15px] leading-relaxed text-mist">{t.gallery.text}</p>
                  <button ref={closeRef} type="button" onClick={close} className="cc-btn-ghost mt-7">
                    {t.gallery.close}
                  </button>
                </div>
              ) : active === null ? (
                <>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {photos.map((photo, i) => (
                      <button
                        key={photo.src}
                        type="button"
                        onClick={() => setActive(i)}
                        className="group relative overflow-hidden rounded-2xl border border-white/10 transition hover:border-aqua/50"
                        aria-label={photo.alt}
                      >
                        <img
                          src={photo.src}
                          alt={photo.alt}
                          loading="lazy"
                          className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                        />
                        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent opacity-0 transition group-hover:opacity-100" />
                      </button>
                    ))}
                  </div>
                  <div className="mt-6 flex justify-center">
                    <button ref={closeRef} type="button" onClick={close} className="cc-btn-ghost">
                      {t.gallery.close}
                    </button>
                  </div>
                </>
              ) : (
                <div className="relative">
                  <img
                    src={photos[active].src}
                    alt={photos[active].alt}
                    className="mx-auto max-h-[58vh] w-auto max-w-full rounded-2xl border border-white/10 object-contain"
                  />
                  <div className="mt-5 flex items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={() => setActive((active - 1 + photos.length) % photos.length)}
                      aria-label="Previous"
                      className="grid h-11 w-11 place-items-center rounded-full border border-white/12 bg-white/[0.04] text-mist transition hover:border-aqua/50 hover:text-aqua"
                    >
                      <IconArrow className="h-4 w-4 rotate-180" />
                    </button>
                    <span className="font-display text-[12px] tracking-[0.3em] text-mist/70">
                      {active + 1} / {photos.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActive((active + 1) % photos.length)}
                      aria-label="Next"
                      className="grid h-11 w-11 place-items-center rounded-full border border-white/12 bg-white/[0.04] text-mist transition hover:border-aqua/50 hover:text-aqua"
                    >
                      <IconArrow className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-5 flex justify-center">
                    <button type="button" onClick={() => setActive(null)} className="cc-btn-ghost text-[12px]">
                      в†ђ {t.gallery.badge}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
