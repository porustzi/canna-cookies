import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSite } from '../site'
import { LANGS } from '../i18n'
import { CATALOG_URL } from '../config'
import { Logo } from './Logo'
import { IconClose, IconMenu, IconSend } from './Icons'

const SECTIONS = [
  { id: 'about', key: 'about' },
  { id: 'why', key: 'why' },
  { id: 'delivery', key: 'delivery' },
  { id: 'faq', key: 'faq' },
  { id: 'contacts', key: 'contacts' },
] as const

export function LangSwitch({ compact = false }: { compact?: boolean }) {
  const { lang, switchLang, t } = useSite()
  return (
    <div
      className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1 backdrop-blur"
      role="group"
      aria-label={t.header.lang}
    >
      {LANGS.map((l) => {
        const active = l.code === lang
        return (
          <button
            key={l.code}
            type="button"
            onClick={() => switchLang(l.code)}
            title={l.name}
            aria-pressed={active}
            className={`rounded-full font-display text-[10.5px] font-medium tracking-[0.14em] transition-all duration-300 sm:text-[11px] sm:tracking-[0.16em] ${
              compact ? 'px-3 py-1.5' : 'px-2.5 py-1.5 sm:px-3'
            } ${active ? 'bg-white/10 text-snow shadow-[0_0_18px_-6px_rgba(0,200,255,0.8)]' : 'text-mist hover:text-snow'}`}
          >
            {l.label}
          </button>
        )
      })}
    </div>
  )
}

export function Header() {
  const { t, lang } = useSite()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [active, setActive] = useState<string>('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 14)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id)
        })
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
    )
    SECTIONS.forEach(({ id }) => {
      const node = document.getElementById(id)
      if (node) observer.observe(node)
    })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    document.body.classList.toggle('cc-locked', menuOpen)
    return () => document.body.classList.remove('cc-locked')
  }, [menuOpen])

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled ? 'border-b border-white/8 bg-ink/85 backdrop-blur-xl' : 'border-b border-transparent'
        }`}
      >
        <div className="cc-shell flex h-[72px] items-center justify-between gap-3 sm:gap-6">
          <a href={`/${lang}/`} className="shrink-0" aria-label="CANNA COOKIES — home">
            <Logo compact />
          </a>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Main">
            {SECTIONS.map(({ id, key }) => (
              <a
                key={id}
                href={`#${id}`}
                className={`cc-link font-display text-[12px] uppercase tracking-[0.18em] transition-colors duration-300 ${
                  active === id ? 'text-aqua' : 'text-mist hover:text-snow'
                }`}
                style={active === id ? { color: '#00c8ff' } : undefined}
              >
                {t.nav[key]}
              </a>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <LangSwitch />
            <a
              href={CATALOG_URL}
              className="cc-btn-primary hidden px-5 py-3 text-[11px] sm:inline-flex"
            >
              <IconSend className="h-4 w-4" />
              {t.header.catalog}
            </a>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 text-snow transition-colors hover:border-aqua/50 hover:text-aqua lg:hidden"
              aria-label={t.header.menu}
            >
              <IconMenu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[60] bg-ink/97 backdrop-blur-xl lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="cc-shell flex h-full flex-col justify-between pb-8 pt-5">
              <div className="flex h-[56px] items-center justify-between">
                <Logo className="text-[15px]" />
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 text-snow hover:border-aqua/50 hover:text-aqua"
                  aria-label={t.header.close}
                >
                  <IconClose className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex flex-col gap-1" aria-label="Mobile">
                {SECTIONS.map(({ id, key }, i) => (
                  <motion.a
                    key={id}
                    href={`#${id}`}
                    onClick={() => setMenuOpen(false)}
                    initial={{ opacity: 0, x: -18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.06 * i + 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="group flex items-baseline gap-4 border-b border-white/6 py-4 font-display text-[clamp(1.7rem,8vw,2.4rem)] uppercase tracking-tight text-snow transition-colors hover:text-aqua"
                  >
                    <span className="text-[11px] tracking-[0.3em] text-aqua/70">{String(i + 1).padStart(2, '0')}</span>
                    {t.nav[key]}
                  </motion.a>
                ))}
              </nav>

              <div className="flex flex-col gap-4">
                <a
                  href={CATALOG_URL}
                  onClick={() => setMenuOpen(false)}
                  className="cc-btn-primary w-full"
                >
                  <IconSend className="h-4 w-4" />
                  {t.header.catalog}
                </a>
                <LangSwitch />
                <p className="text-center font-display text-[10px] tracking-[0.3em] text-mist/50">
                  DON'T PANIC, IT'S ORGANIC · 21+
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
