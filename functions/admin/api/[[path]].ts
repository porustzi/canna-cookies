import { isAuthenticated, json } from '../../_lib/auth'
import type { Env } from '../../_lib/auth'
import {
  MAX_GALLERY,
  MAX_IMAGE_BYTES,
  MAX_PHOTO_BYTES,
  decodeBase64,
  kvStore,
  parseImageName,
  parseLang,
  validateContacts,
} from '../../_lib/store'
import type { GalleryItem } from '../../_lib/store'

const MAX_BODY = 4_000_000

async function readJson(request: Request): Promise<unknown> {
  const text = await request.text()
  if (text.length > MAX_BODY) throw new Error('too-large')
  if (!text) return null
  return JSON.parse(text)
}

export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context
  if (!(await isAuthenticated(request, env))) return json({ error: 'unauthorized' }, 401)

  const store = kvStore(env)
  if (!store) return json({ error: 'storage-unavailable' }, 503)

  const url = new URL(request.url)
  const path = url.pathname.replace(/^\/admin\/api\/?/, '').replace(/\/$/, '')
  const method = request.method

  try {
    if (path === 'state' && method === 'GET') {
      const [cs, en, ru, gallery, imgAbout, imgHero] = await Promise.all([
        store.getJson('contacts:cs'),
        store.getJson('contacts:en'),
        store.getJson('contacts:ru'),
        store.getJson<GalleryItem[]>('gallery'),
        store.getJson('img-meta:about'),
        store.getJson('img-meta:hero'),
      ])
      return json({
        kv: true,
        contacts: { cs, en, ru },
        gallery: (gallery ?? []).map((g) => ({
          id: g.id,
          alt: g.alt,
          created: g.created,
          mime: (g as GalleryItem & { mime?: string }).mime ?? 'image/jpeg',
          url: `/api/media/photo-${g.id}`,
        })),
        images: { about: Boolean(imgAbout), hero: Boolean(imgHero) },
      })
    }

    if (path.startsWith('contacts/') && method === 'PUT') {
      const lang = parseLang(path.slice('contacts/'.length))
      if (!lang) return json({ error: 'bad-lang' }, 400)
      const data = validateContacts(await readJson(request))
      if (!data) return json({ error: 'bad-payload' }, 400)
      await store.putJson(`contacts:${lang}`, data)
      return json({ ok: true })
    }

    if (path.startsWith('contacts/') && method === 'DELETE') {
      const lang = parseLang(path.slice('contacts/'.length))
      if (!lang) return json({ error: 'bad-lang' }, 400)
      await store.delete(`contacts:${lang}`)
      return json({ ok: true })
    }

    if (path === 'gallery' && method === 'GET') {
      const items = (await store.getJson<GalleryItem[]>('gallery')) ?? []
      return json({ items })
    }

    if (path === 'gallery' && method === 'POST') {
      const items = (await store.getJson<GalleryItem[]>('gallery')) ?? []
      if (items.length >= MAX_GALLERY) return json({ error: 'gallery-full', max: MAX_GALLERY }, 409)
      const body = (await readJson(request)) as { alt?: unknown; mime?: unknown; data?: unknown } | null
      if (!body || typeof body.data !== 'string') return json({ error: 'bad-payload' }, 400)
      const mime = body.mime === 'image/webp' || body.mime === 'image/png' ? body.mime : 'image/jpeg'
      const bytes = decodeBase64(body.data)
      if (bytes.byteLength > MAX_PHOTO_BYTES) return json({ error: 'too-large', max: MAX_PHOTO_BYTES }, 413)
      const id = crypto.randomUUID()
      await store.putBytes(`photo:${id}`, bytes)
      const item: GalleryItem & { mime: string } = {
        id,
        alt: typeof body.alt === 'string' ? body.alt.slice(0, 200) : '',
        created: Date.now(),
        mime,
      }
      items.push(item)
      await store.putJson('gallery', items)
      return json({ ok: true, id })
    }

    if (path.startsWith('gallery/') && method === 'PUT') {
      const id = path.slice('gallery/'.length)
      if (!/^[\w-]{1,64}$/.test(id)) return json({ error: 'bad-id' }, 400)
      const items = (await store.getJson<GalleryItem[]>('gallery')) ?? []
      const item = items.find((g) => g.id === id)
      if (!item) return json({ error: 'not-found' }, 404)
      const body = (await readJson(request)) as { alt?: unknown } | null
      if (body && typeof body.alt === 'string') item.alt = body.alt.slice(0, 200)
      await store.putJson('gallery', items)
      return json({ ok: true })
    }

    if (path.startsWith('gallery/') && method === 'DELETE') {
      const id = path.slice('gallery/'.length)
      if (!/^[\w-]{1,64}$/.test(id)) return json({ error: 'bad-id' }, 400)
      const items = (await store.getJson<GalleryItem[]>('gallery')) ?? []
      const next = items.filter((g) => g.id !== id)
      if (next.length === items.length) return json({ error: 'not-found' }, 404)
      await store.delete(`photo:${id}`)
      await store.putJson('gallery', next)
      return json({ ok: true })
    }

    if (path === 'gallery/reorder' && method === 'POST') {
      const body = (await readJson(request)) as { ids?: unknown } | null
      if (!body || !Array.isArray(body.ids)) return json({ error: 'bad-payload' }, 400)
      const items = (await store.getJson<GalleryItem[]>('gallery')) ?? []
      const ids = body.ids.map(String)
      if (ids.length !== items.length || new Set(ids).size !== ids.length) return json({ error: 'bad-order' }, 400)
      const byId = new Map(items.map((g) => [g.id, g]))
      const ordered: GalleryItem[] = []
      for (const id of ids) {
        const item = byId.get(id)
        if (!item) return json({ error: 'bad-order' }, 400)
        ordered.push(item)
      }
      await store.putJson('gallery', ordered)
      return json({ ok: true })
    }

    if (path.startsWith('image/') && method === 'POST') {
      const name = parseImageName(path.slice('image/'.length))
      if (!name) return json({ error: 'bad-name' }, 400)
      const body = (await readJson(request)) as { mime?: unknown; data?: unknown } | null
      if (!body || typeof body.data !== 'string') return json({ error: 'bad-payload' }, 400)
      const mime = body.mime === 'image/png' ? 'image/png' : body.mime === 'image/webp' ? 'image/webp' : 'image/jpeg'
      const bytes = decodeBase64(body.data)
      if (bytes.byteLength > MAX_IMAGE_BYTES) return json({ error: 'too-large', max: MAX_IMAGE_BYTES }, 413)
      await store.putBytes(`img:${name}`, bytes)
      await store.putJson(`img-meta:${name}`, { mime, updated: Date.now() })
      return json({ ok: true })
    }

    if (path.startsWith('image/') && method === 'DELETE') {
      const name = parseImageName(path.slice('image/'.length))
      if (!name) return json({ error: 'bad-name' }, 400)
      await store.delete(`img:${name}`)
      await store.delete(`img-meta:${name}`)
      return json({ ok: true })
    }

    return json({ error: 'not-found' }, 404)
  } catch (err) {
    if (err instanceof Error && err.message === 'too-large') return json({ error: 'too-large' }, 413)
    return json({ error: 'bad-request' }, 400)
  }
}
