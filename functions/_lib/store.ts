import type { Env } from './auth'

export type ContactCard = { label: string; value: string; status: string; href?: string }
export type ContactsData = { cards: ContactCard[]; note: string }
export type GalleryItem = { id: string; alt: string; created: number }
export type ImageName = 'about' | 'hero'

export const LANGS = ['cs', 'en', 'ru'] as const
export type Lang = (typeof LANGS)[number]
export const IMAGE_NAMES: ImageName[] = ['about', 'hero']

export const MAX_GALLERY = 40
export const MAX_PHOTO_BYTES = 1_500_000
export const MAX_IMAGE_BYTES = 2_500_000

export function kvStore(env: Env) {
  const kv = env.SITE_CONTENT
  if (!kv) return null
  return {
    async getJson<T>(key: string): Promise<T | null> {
      const raw = (await kv.get(key)) as string | null
      if (!raw) return null
      try {
        return JSON.parse(raw) as T
      } catch {
        return null
      }
    },
    async putJson(key: string, value: unknown): Promise<void> {
      await kv.put(key, JSON.stringify(value))
    },
    async getBytes(key: string): Promise<ArrayBuffer | null> {
      return (await kv.get(key, 'arrayBuffer')) as ArrayBuffer | null
    },
    async putBytes(key: string, value: ArrayBuffer): Promise<void> {
      await kv.put(key, value)
    },
    async delete(key: string): Promise<void> {
      await kv.delete(key)
    },
  }
}

export type Store = NonNullable<ReturnType<typeof kvStore>>

export function parseLang(value: string): Lang | null {
  return (LANGS as readonly string[]).includes(value) ? (value as Lang) : null
}

export function parseImageName(value: string): ImageName | null {
  return (IMAGE_NAMES as readonly string[]).includes(value) ? (value as ImageName) : null
}

export function decodeBase64(data: string): ArrayBuffer {
  const bin = atob(data)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes.buffer
}

export function validateContacts(body: unknown): ContactsData | null {
  if (!body || typeof body !== 'object') return null
  const b = body as { cards?: unknown; note?: unknown }
  if (!Array.isArray(b.cards) || b.cards.length > 8) return null
  const cards: ContactCard[] = []
  for (const item of b.cards) {
    if (!item || typeof item !== 'object') return null
    const c = item as { label?: unknown; value?: unknown; status?: unknown; href?: unknown }
    if (typeof c.label !== 'string' || typeof c.value !== 'string' || typeof c.status !== 'string') return null
    if (c.label.length > 60 || c.value.length > 160 || c.status.length > 60) return null
    if (c.href !== undefined && c.href !== null && c.href !== '') {
      if (typeof c.href !== 'string' || c.href.length > 500) return null
      if (!/^https?:\/\//.test(c.href)) return null
      cards.push({ label: c.label, value: c.value, status: c.status, href: c.href })
    } else {
      cards.push({ label: c.label, value: c.value, status: c.status })
    }
  }
  if (typeof b.note !== 'string' || b.note.length > 600) return null
  return { cards, note: b.note }
}
