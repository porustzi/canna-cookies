import type { Dict, Lang } from './i18n'

export interface ContactCardData {
  label: string
  value: string
  status: string
  href?: string
}

export interface ContactsOverride {
  cards: ContactCardData[]
  note: string
}

export interface ContentOverrides {
  contacts?: Partial<Record<Lang, ContactsOverride>>
  images?: {
    about?: string | null
    hero?: string | null
  }
}

export const EMPTY_IMAGES: { about: string | null; hero: string | null } = { about: null, hero: null }

export function applyOverrides(base: Dict, overrides: ContentOverrides | null, lang: Lang): Dict {
  const contactOverride = overrides?.contacts?.[lang]
  if (!contactOverride || !Array.isArray(contactOverride.cards)) return base
  return {
    ...base,
    contacts: {
      ...base.contacts,
      cards: contactOverride.cards,
      note: contactOverride.note,
    },
  }
}

export async function fetchOverrides(): Promise<ContentOverrides | null> {
  try {
    const res = await fetch('/api/content', { headers: { accept: 'application/json' } })
    if (!res.ok) return null
    const data = (await res.json()) as ContentOverrides
    return data && typeof data === 'object' ? data : null
  } catch {
    return null
  }
}
