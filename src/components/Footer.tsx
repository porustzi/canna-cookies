import { useSite } from '../site'
import { LANGS } from '../i18n'
import { Logo } from './Logo'
import { IconSend } from './Icons'
import { MegaCookie } from './CookieDecor'

const NAV = [
  { id: 'about', key: 'about' },
  { id: 'why', key: 'why' },
  { id: 'delivery', key: 'delivery' },
  { id: 'faq', key: 'faq' },
  { id: 'contacts', key: 'contacts' },
] as const

export function Footer() {
  const { t, lang, switchLang, openCatalog } = useSite()

  return (
    <footer className="cc-noise relative overflow-hidden border-t border-white/8 bg-graphite/50">
      <div
        className="cc-glow"
        style={{ width: 520, height: 320, bottom: -220, left: '30%', background: 'rgba(0,200,255,0.1)' }}
      />
      <MegaCookie className="right-[-130px] bottom-[-120px]" size={340} opacity={0.08} spin={95} />

      <div className="cc-shell relative z-10 pt-16 md:pt-20">
        <div className="flex flex-col gap-8 border-b border-white/8 pb-12 md:flex-row md:items-end md:justify-between">
          <div>
            <Logo className="text-[22px] md:text-[26px]" />
            <p className="mt-4 font-display text-[clamp(1rem,2.4vw,1.5rem)] uppercase tracking-[0.14em] text-aqua">
              {t.footer.tagline}
            </p>
          </div>
          <button type="button" onClick={openCatalog} className="cc-btn-primary w-full sm:w-auto">
            <IconSend className="h-4 w-4" />
            {t.header.catalog}
          </button>
        </div>

        <div className="grid gap-10 py-12 md:grid-cols-3">
          <div>
            <span className="cc-eyebrow">{t.footer.navLabel}</span>
            <ul className="mt-5 space-y-3">
              {NAV.map(({ id, key }) => (
                <li key={id}>
                  <a href={`#${id}`} className="cc-link text-[14.5px] text-mist hover:text-snow">
                    {t.nav[key]}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <span className="cc-eyebrow">{t.footer.langLabel}</span>
            <ul className="mt-5 space-y-3">
              {LANGS.map((l) => (
                <li key={l.code}>
                  <button
                    type="button"
                    onClick={() => switchLang(l.code)}
                    className={`cc-link text-[14.5px] ${l.code === lang ? 'text-aqua' : 'text-mist hover:text-snow'}`}
                  >
                    {l.name} <span className="ml-1 text-[11px] tracking-[0.2em] text-mist/50">{l.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4 text-[13.5px] leading-relaxed text-mist/75">
            <p>{t.footer.legal1}</p>
            <p>{t.footer.legal2}</p>
            <p className="font-display text-[12px] uppercase tracking-[0.16em] text-mist/60">{t.footer.legal3}</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/8 py-7 text-[12.5px] text-mist/60 md:flex-row md:items-center md:justify-between">
          <p>{t.footer.rights}</p>
          <p className="text-mist/45">{t.footer.gdpr}</p>
          <span className="font-display uppercase tracking-[0.24em] text-mist/40">{t.footer.stage}</span>
        </div>
      </div>
    </footer>
  )
}
