export function Mark({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label="CANNA COOKIES">
      <defs>
        <linearGradient id="ccMarkGrad" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#00D9E8" />
          <stop offset="1" stopColor="#16CFC0" />
        </linearGradient>
        <mask id="ccBite">
          <rect width="48" height="48" fill="#fff" />
          <circle cx="41" cy="9" r="8.5" fill="#000" />
        </mask>
      </defs>
      <g mask="url(#ccBite)">
        <circle cx="24" cy="24" r="17" fill="url(#ccMarkGrad)" />
      </g>
      <circle cx="24" cy="24" r="21" fill="none" stroke="url(#ccMarkGrad)" strokeOpacity="0.35" strokeWidth="1" />
      <circle cx="18.5" cy="20" r="2.1" fill="#080A0C" />
      <circle cx="27.5" cy="17.5" r="1.6" fill="#080A0C" />
      <circle cx="24" cy="28.5" r="2.4" fill="#080A0C" />
      <circle cx="31" cy="26" r="1.4" fill="#080A0C" />
    </svg>
  )
}

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-baseline gap-[0.35em] font-display leading-none ${className}`}>
      <span className="font-semibold tracking-[-0.02em] text-snow">CANNA</span>
      <span className="font-light tracking-[0.22em] text-mist">COOKIES</span>
    </span>
  )
}

export function Logo({ className = '', compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2.5 sm:gap-3 ${className}`}>
      <Mark className="h-8 w-8 shrink-0" />
      {compact ? (
        <span className="hidden min-[420px]:inline-flex">
          <Wordmark className="text-[15px]" />
        </span>
      ) : (
        <Wordmark className="text-[15px]" />
      )}
    </span>
  )
}
