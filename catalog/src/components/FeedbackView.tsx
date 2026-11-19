import { useState } from 'react'
import { useApp } from '../context'
import { submitFeedback } from '../api'
import { pick } from '../types'

export function FeedbackView() {
  const { t, go, data, lang } = useApp()

  const contacts = data.settings.contacts
  const hasContacts = Boolean(contacts && (contacts.phone || contacts.tg || contacts.address))
  const privacyText = pick(data.settings.texts?.privacy, lang) || t.feedback.privacy

  const [type, setType] = useState<'question' | 'complaint'>('question')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [tg, setTg] = useState('')
  const [text, setText] = useState('')
  const [website, setWebsite] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  const submit = async () => {
    setError(null)
    if (name.trim().length < 2 || text.trim().length < 5) {
      setError(t.required)
      return
    }
    setBusy(true)
    try {
      await submitFeedback({
        type,
        name: name.trim(),
        phone: phone.trim(),
        tg: tg.trim(),
        text: text.trim(),
        website,
      })
      setSent(true)
    } catch (e) {
      const msg = e instanceof Error ? e.message : ''
      setError(
        msg === 'rate-limited' ? t.rateLimit : msg === 'already-ordered' ? t.feedback.ordered : t.error,
      )
    } finally {
      setBusy(false)
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 pt-6 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full border border-aqua/40 bg-aqua/[0.1] font-display text-[24px] text-aqua">
          ✓
        </span>
        <h1 className="text-[clamp(1.3rem,6vw,1.7rem)]">{t.feedback.success}</h1>
        <p className="max-w-[34ch] text-[14.5px] leading-relaxed text-mist">{t.feedback.successText}</p>
        <button type="button" onClick={() => go('catalog')} className="cc-btn-primary px-6 py-3 text-[12.5px]">
          {t.confirm.again}
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[clamp(1.4rem,6vw,1.9rem)]">{t.feedback.title}</h1>
      <p className="text-[14.5px] leading-relaxed text-mist">{t.feedback.lead}</p>

      {hasContacts && (
        <div className="cc-card flex flex-col gap-1.5 p-5">
          <span className="font-display text-[11px] uppercase tracking-[0.2em] text-mist/70">{t.feedback.contactsTitle}</span>
          {contacts?.phone && (
            <a href={`tel:${contacts.phone.replace(/\s+/g, '')}`} className="text-[15px] text-aqua hover:underline">
              📞 {contacts.phone}
            </a>
          )}
          {contacts?.tg && (
            <a
              href={contacts.tg.startsWith('@') ? `https://t.me/${contacts.tg.slice(1)}` : `https://t.me/${contacts.tg}`}
              target="_blank"
              rel="noreferrer"
              className="text-[15px] text-aqua hover:underline"
            >
              ✈️ {contacts.tg.startsWith('@') ? contacts.tg : `@${contacts.tg}`}
            </a>
          )}
          {contacts?.address && <p className="text-[14.5px] text-mist">📍 {contacts.address}</p>}
        </div>
      )}

      <div className="cc-card flex flex-col gap-4 p-5">
        <div>
          <span className="font-display text-[11px] uppercase tracking-[0.2em] text-mist/70">{t.feedback.type}</span>
          <div className="mt-2 flex gap-2">
            {(['question', 'complaint'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setType(option)}
                className={`flex-1 rounded-full border px-4 py-2.5 font-display text-[11.5px] uppercase tracking-[0.14em] ${
                  type === option
                    ? 'border-aqua bg-aqua text-ink'
                    : 'border-white/12 bg-white/[0.04] text-mist hover:border-aqua/40 hover:text-snow'
                }`}
              >
                {option === 'question' ? t.feedback.question : t.feedback.complaint}
              </button>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="font-display text-[11px] uppercase tracking-[0.2em] text-mist/70">{t.feedback.name}</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.feedback.namePh}
            className="mt-2 w-full rounded-xl border border-white/12 bg-graphite px-4 py-3.5 text-[15px] text-snow placeholder:text-mist/40 outline-none focus:border-aqua/60"
          />
        </label>

        <label className="block">
          <span className="font-display text-[11px] uppercase tracking-[0.2em] text-mist/70">{t.feedback.phone}</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t.feedback.phonePh}
            inputMode="tel"
            className="mt-2 w-full rounded-xl border border-white/12 bg-graphite px-4 py-3.5 text-[15px] text-snow placeholder:text-mist/40 outline-none focus:border-aqua/60"
          />
        </label>

        <label className="block">
          <span className="font-display text-[11px] uppercase tracking-[0.2em] text-mist/70">{t.feedback.tg}</span>
          <input
            value={tg}
            onChange={(e) => setTg(e.target.value)}
            placeholder={t.feedback.tgPh}
            autoCapitalize="none"
            className="mt-2 w-full rounded-xl border border-white/12 bg-graphite px-4 py-3.5 text-[15px] text-snow placeholder:text-mist/40 outline-none focus:border-aqua/60"
          />
        </label>

        <label className="block">
          <span className="font-display text-[11px] uppercase tracking-[0.2em] text-mist/70">{t.feedback.text}</span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.feedback.textPh}
            rows={5}
            className="mt-2 w-full resize-none rounded-xl border border-white/12 bg-graphite px-4 py-3.5 text-[15px] text-snow placeholder:text-mist/40 outline-none focus:border-aqua/60"
          />
        </label>

        <input
          type="text"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute -left-[9999px] h-0 w-0 opacity-0"
        />

        {error && <p className="text-[13.5px] text-[#FFD28F]">{error}</p>}

        <p className="text-[12.5px] leading-relaxed text-mist/60">{privacyText}</p>

        <button
          type="button"
          onClick={() => void submit()}
          disabled={busy}
          className="cc-btn-primary w-full py-3.5 text-[13px] disabled:opacity-60"
        >
          {busy ? '…' : t.feedback.submit}
        </button>
      </div>
    </div>
  )
}
