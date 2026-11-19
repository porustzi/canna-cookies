import { json, type Env } from '../../../_lib/kv'

type ImgRecord = { mime?: unknown; data?: unknown }

export async function onRequestGet(context: { params: { id?: string }; env: Env }): Promise<Response> {
  const { params, env } = context
  const id = typeof params.id === 'string' ? params.id : ''
  if (!/^[a-z0-9][a-z0-9-]{0,59}$/.test(id)) return json({ error: 'bad-id' }, 400)

  const store = env.CATALOG
  if (!store) return json({ error: 'storage-unavailable' }, 503)

  const raw = await store.get(`img:product:${id}`)
  if (!raw) return json({ error: 'not-found' }, 404)

  let rec: ImgRecord
  try {
    rec = JSON.parse(raw) as ImgRecord
  } catch {
    return json({ error: 'corrupt' }, 500)
  }
  if (typeof rec.mime !== 'string' || typeof rec.data !== 'string') return json({ error: 'corrupt' }, 500)

  let bytes: Uint8Array
  try {
    const bin = atob(rec.data)
    bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  } catch {
    return json({ error: 'corrupt' }, 500)
  }

  return new Response(bytes.slice().buffer, {
    headers: {
      'content-type': rec.mime,
      'cache-control': 'public, max-age=31536000, immutable',
      'x-content-type-options': 'nosniff',
    },
  })
}
