import type { Env } from '../../_lib/auth'
import { kvStore } from '../../_lib/store'
import type { GalleryItem } from '../../_lib/store'

const MIME_RE = /^[\w.+-]+\/[\w.+-]+$/

export async function onRequest(context: { request: Request; env: Env; params: Record<string, string> }): Promise<Response> {
  const { env, params } = context
  const id = params.id ?? ''
  const store = kvStore(env)
  if (!store) return new Response('Not found', { status: 404 })

  try {
    if (id.startsWith('photo-')) {
      const photoId = id.slice('photo-'.length)
      if (!/^[\w-]{1,64}$/.test(photoId)) return new Response('Not found', { status: 404 })
      const bytes = await store.getBytes(`photo:${photoId}`)
      if (!bytes) return new Response('Not found', { status: 404 })
      const items = (await store.getJson<Array<GalleryItem & { mime?: string }>>('gallery')) ?? []
      const mime = items.find((g) => g.id === photoId)?.mime ?? 'image/jpeg'
      return new Response(bytes, {
        headers: {
          'content-type': MIME_RE.test(mime) ? mime : 'image/jpeg',
          'cache-control': 'public, max-age=31536000, immutable',
        },
      })
    }

    if (id.startsWith('img-')) {
      const name = id.slice('img-'.length)
      if (name !== 'about' && name !== 'hero') return new Response('Not found', { status: 404 })
      const bytes = await store.getBytes(`img:${name}`)
      if (!bytes) return new Response('Not found', { status: 404 })
      const meta = (await store.getJson<{ mime?: string }>(`img-meta:${name}`)) ?? {}
      const mime = meta.mime ?? 'image/jpeg'
      return new Response(bytes, {
        headers: {
          'content-type': MIME_RE.test(mime) ? mime : 'image/jpeg',
          'cache-control': 'public, max-age=300',
        },
      })
    }

    return new Response('Not found', { status: 404 })
  } catch {
    return new Response('Not found', { status: 404 })
  }
}
