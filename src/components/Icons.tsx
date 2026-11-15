import type { SVGProps } from 'react'

type Props = SVGProps<SVGSVGElement>

function Base({ children, ...props }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

export const IconLeaf = (p: Props) => (
  <Base {...p}>
    <path d="M4.5 19.5c0-7 4.5-12 15-13.5.5 8.5-3.5 13.5-9.5 13.5-2.7 0-4.2-1.4-5.5-3.4Z" />
    <path d="M9 16.5c1.8-3.4 4.4-5.8 8.5-7.5" />
  </Base>
)

export const IconLayers = (p: Props) => (
  <Base {...p}>
    <path d="m12 3.5 8.5 4.6L12 12.7 3.5 8.1 12 3.5Z" />
    <path d="m4.5 12.4 7.5 4.1 7.5-4.1" />
    <path d="m4.5 16.4 7.5 4.1 7.5-4.1" />
  </Base>
)

export const IconShield = (p: Props) => (
  <Base {...p}>
    <path d="M12 3.2 5 6v6c0 4.3 3 7.4 7 8.8 4-1.4 7-4.5 7-8.8V6l-7-2.8Z" />
    <path d="m9 12 2.2 2.2L15.4 10" />
  </Base>
)

export const IconMap = (p: Props) => (
  <Base {...p}>
    <path d="M12 21s6.5-5.7 6.5-11a6.5 6.5 0 1 0-13 0C5.5 15.3 12 21 12 21Z" />
    <circle cx="12" cy="10" r="2.4" />
  </Base>
)

export const IconLock = (p: Props) => (
  <Base {...p}>
    <rect x="4.5" y="10" width="15" height="10.5" rx="2.6" />
    <path d="M8 10V7.6a4 4 0 0 1 8 0V10" />
    <path d="M12 14.2v2.6" />
  </Base>
)

export const IconSend = (p: Props) => (
  <Base {...p}>
    <path d="M21 4 3.8 10.7c-.7.3-.7 1.3 0 1.6l4.4 1.6 1.7 5c.3.8 1.3.8 1.6.1L21 4Z" />
    <path d="m8.4 13.7 6.6-5.4" />
  </Base>
)

export const IconPlus = (p: Props) => (
  <Base {...p}>
    <path d="M12 5.5v13M5.5 12h13" />
  </Base>
)

export const IconArrow = (p: Props) => (
  <Base {...p}>
    <path d="M6 18 18 6" />
    <path d="M8.5 6H18v9.5" />
  </Base>
)

export const IconMenu = (p: Props) => (
  <Base {...p}>
    <path d="M4 8h16M4 16h16" />
  </Base>
)

export const IconClose = (p: Props) => (
  <Base {...p}>
    <path d="m6 6 12 12M18 6 6 18" />
  </Base>
)

export const IconMail = (p: Props) => (
  <Base {...p}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
    <path d="m4.5 8 7.5 5 7.5-5" />
  </Base>
)

export const IconChat = (p: Props) => (
  <Base {...p}>
    <path d="M20.5 12c0 4.1-3.8 7.4-8.5 7.4-1 0-2-.15-2.9-.43L4 20.5l1.4-3.6C4.2 15.6 3.5 13.9 3.5 12c0-4.1 3.8-7.4 8.5-7.4s8.5 3.3 8.5 7.4Z" />
  </Base>
)

export const IconAt = (p: Props) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="3.6" />
    <path d="M15.6 12v1.7a2.6 2.6 0 0 0 5.2 0V12a8.8 8.8 0 1 0-3.5 7" />
  </Base>
)

export const IconPin = (p: Props) => IconMap(p)
