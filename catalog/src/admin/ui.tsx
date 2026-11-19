import type { ReactNode } from 'react'
import type { L } from '../types'
import { LANG_LABELS } from './api'

const INPUT =
  'mt-1 w-full rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3 text-[14.5px] text-snow placeholder:text-mist/40 outline-none focus:border-aqua/60'

export function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string
  value: string | number
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <label className="block">
      <span className="cc-eyebrow">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={INPUT}
      />
    </label>
  )
}

export function LangTriple({
  label,
  value,
  onChange,
  placeholder,
  textarea = false,
  rows = 3,
  required = false,
}: {
  label: string
  value: L
  onChange: (v: L) => void
  placeholder?: string
  textarea?: boolean
  rows?: number
  required?: boolean
}) {
  const missing = required && !value.ru && !value.cs && !value.en
  return (
    <div>
      <span className="cc-eyebrow">
        {label}
        {required ? ' *' : ''}
      </span>
      <div className={`mt-2 grid gap-2 ${textarea ? '' : 'md:grid-cols-3'}`}>
        {LANG_LABELS.map((l) => (
          <label key={l.code} className="block">
            <span className="font-display text-[10px] uppercase tracking-[0.2em] text-mist/60">{l.code}</span>
            {textarea ? (
              <textarea
                value={value[l.code]}
                onChange={(e) => onChange({ ...value, [l.code]: e.target.value })}
                placeholder={placeholder}
                rows={rows}
                className={`${INPUT} resize-none leading-relaxed`}
              />
            ) : (
              <input
                value={value[l.code]}
                onChange={(e) => onChange({ ...value, [l.code]: e.target.value })}
                placeholder={placeholder}
                className={INPUT}
              />
            )}
          </label>
        ))}
      </div>
      {missing && <p className="mt-1.5 text-[12.5px] text-[#FF9D9D]">Заполните хотя бы один язык</p>}
    </div>
  )
}

export function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/85 backdrop-blur-md sm:items-center sm:p-5"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="cc-card max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-t-3xl p-5 sm:rounded-3xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

export function TabButton({ active, children, onClick }: { active: boolean; children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-4 py-2 font-display text-[11.5px] uppercase tracking-[0.16em] transition ${
        active ? 'bg-aqua text-ink' : 'text-mist hover:bg-white/5 hover:text-snow'
      }`}
    >
      {children}
    </button>
  )
}
