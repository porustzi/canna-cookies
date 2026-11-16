type Spot = { x: string; y: string; s: number; o: number; d: number; dur: number }

const PARTICLES: Spot[] = [
  { x: '5%', y: '14%', s: 34, o: 0.1, d: 0, dur: 11 },
  { x: '11%', y: '42%', s: 18, o: 0.07, d: 1.4, dur: 9 },
  { x: '4%', y: '70%', s: 44, o: 0.08, d: 2.2, dur: 13 },
  { x: '17%', y: '86%', s: 14, o: 0.06, d: 0.7, dur: 8.5 },
  { x: '87%', y: '12%', s: 36, o: 0.09, d: 1.8, dur: 12 },
  { x: '93%', y: '46%', s: 20, o: 0.07, d: 0.4, dur: 10 },
  { x: '83%', y: '74%', s: 46, o: 0.08, d: 2.6, dur: 14 },
  { x: '94%', y: '88%', s: 15, o: 0.06, d: 1.1, dur: 9 },
  { x: '24%', y: '7%', s: 13, o: 0.05, d: 3, dur: 10 },
  { x: '68%', y: '5%', s: 15, o: 0.05, d: 2.1, dur: 11.5 },
  { x: '46%', y: '92%', s: 12, o: 0.05, d: 1.6, dur: 9.5 },
  { x: '74%', y: '30%', s: 11, o: 0.05, d: 0.9, dur: 8 },
]

const CRUMBS = [
  { x: '8%', y: '28%', s: 5 },
  { x: '14%', y: '58%', s: 4 },
  { x: '3%', y: '50%', s: 6 },
  { x: '21%', y: '22%', s: 4 },
  { x: '89%', y: '32%', s: 5 },
  { x: '96%', y: '62%', s: 4 },
  { x: '79%', y: '88%', s: 6 },
  { x: '63%', y: '94%', s: 4 },
  { x: '33%', y: '4%', s: 5 },
  { x: '55%', y: '96%', s: 4 },
]

function CookieGlyph({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
      <defs>
        <mask id="cc-cookie-mask">
          <rect width="64" height="64" fill="#fff" />
          <circle cx="57" cy="12" r="9" fill="#000" />
        </mask>
      </defs>
      <g mask="url(#cc-cookie-mask)">
        <circle cx="32" cy="32" r="25" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="24" cy="26" r="3.2" fill="currentColor" />
        <circle cx="38" cy="21" r="2.4" fill="currentColor" />
        <circle cx="42" cy="38" r="3" fill="currentColor" />
        <circle cx="25" cy="42" r="2.2" fill="currentColor" />
        <circle cx="33" cy="33" r="1.7" fill="currentColor" opacity="0.75" />
      </g>
    </svg>
  )
}

export function CookieParticles() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {PARTICLES.map((p, i) => (
        <div
          key={`cookie-${i}`}
          className="absolute text-aqua"
          style={{
            left: p.x,
            top: p.y,
            width: p.s,
            height: p.s,
            opacity: p.o,
            animation: `cc-float ${p.dur}s ease-in-out ${p.d}s infinite`,
          }}
        >
          <CookieGlyph className="h-full w-full" />
        </div>
      ))}
      {CRUMBS.map((c, i) => (
        <span
          key={`crumb-${i}`}
          className="absolute rounded-full bg-aqua"
          style={{
            left: c.x,
            top: c.y,
            width: c.s,
            height: c.s,
            opacity: 0.4,
            boxShadow: '0 0 10px rgba(0,200,255,0.6)',
          }}
        />
      ))}
    </div>
  )
}

export function MegaCookie({
  className = '',
  size = 320,
  opacity = 0.07,
  spin = 70,
  glow = true,
}: {
  className?: string
  size?: number
  opacity?: number
  spin?: number
  glow?: boolean
}) {
  return (
    <div
      className={`pointer-events-none absolute ${className}`}
      aria-hidden="true"
      style={{ width: size, height: size, opacity, animation: 'cc-float 11s ease-in-out infinite' }}
    >
      {glow && (
        <div
          className="cc-glow"
          style={{
            width: size * 0.85,
            height: size * 0.85,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(0,200,255,0.22)',
          }}
        />
      )}
      <div className="relative h-full w-full text-aqua" style={{ animation: `cc-spin ${spin}s linear infinite` }}>
        <CookieGlyph className="h-full w-full" />
      </div>
    </div>
  )
}
