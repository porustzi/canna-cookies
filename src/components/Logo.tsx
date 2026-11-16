export function Mark({ className = 'h-9 w-9' }: { className?: string }) {
  return <img src="/mark.png" alt="" width={384} height={384} aria-hidden="true" className={className} />
}

export function BrandLogo({ className = '' }: { className?: string }) {
  return <img src="/logo.png" alt="CANNA COOKIES" width={640} height={640} className={className} />
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
