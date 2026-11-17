import { json } from '../_lib/auth'
import type { Env } from '../_lib/auth'
import { kvStore } from '../_lib/store'
import type { GalleryItem } from '../_lib/store'

export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const { env } = context
  const store = kvStore(env)
  if (!store) return json({ items: [] })
  try {
    const items = ((await store.getJson<Array<GalleryItem & { mime?: string }>>('gallery')) ?? []).map((g) => ({
      id: g.id,
      alt: g.alt,
      url: `/api/media/photo-${g.id}`,
      mime: g.mime ?? 'image/jpeg',
    }))
    return json({ items }, 200, { 'cache-control': 'public, max-age=60' })
  } catch {
    return json({ items: [] }, 200, { 'cache-control': 'public, max-age=30' })
  }
}
