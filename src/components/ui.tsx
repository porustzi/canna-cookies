import { motion, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'
import type { CSSProperties, ReactNode } from 'react'

export function Reveal({
  children,
  delay = 0,
  y = 26,
  className,
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? undefined : { opacity: 0, y }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-70px' }}
      transition={{ duration: 0.85, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

export function Card({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null)

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const node = ref.current
    if (!node) return
    const rect = node.getBoundingClientRect()
    node.style.setProperty('--mx', `${e.clientX - rect.left}px`)
    node.style.setProperty('--my', `${e.clientY - rect.top}px`)
  }

  return (
    <div ref={ref} onMouseMove={handleMove} className={`cc-card ${className ?? ''}`} style={style}>
      {children}
    </div>
  )
}

export function SectionHead({
  eyebrow,
  title,
  lead,
  id,
}: {
  eyebrow: string
  title: string
  lead?: string
  id?: string
}) {
  return (
    <div className="mb-12 md:mb-16" id={id}>
      <Reveal>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="cc-eyebrow">{eyebrow}</span>
            <h2 className="mt-5 text-[clamp(2.1rem,5vw,3.6rem)] leading-[1.02]">{title}</h2>
          </div>
          {lead ? <p className="max-w-md text-[15px] leading-relaxed text-mist md:text-right">{lead}</p> : null}
        </div>
      </Reveal>
    </div>
  )
}

export function Section({
  id,
  children,
  className,
}: {
  id: string
  children: ReactNode
  className?: string
}) {
  return (
    <section id={id} className={`relative py-24 md:py-32 ${className ?? ''}`}>
      {children}
    </section>
  )
}
