import { DEFAULT_CATALOG, type Faq } from '../../_lib/defaults'
import { isAuthenticated, json, type Env } from '../../_lib/auth'
import { kv, putJson, readJson } from '../../_lib/kv'
import {
  MAX_IMAGE_BYTES,
  mergeFaq,
  vCategories,
  vDistricts,
  vFaqList,
  vImage,
  vProducts,
  vSettings,
} from '../../_lib/validate'

const MAX_BODY = 4_000_000

async function readJsonBody(request: Request): Promise<unknown> {
  const text = await request.text()
  if (text.length > MAX_BODY) throw new Error('too-large')
  if (!text) return null
  return JSON.parse(text)
}

function imgKey(productId: string): string {
  return `img:product:${productId}`
}

function toBase64(bytes: Uint8Array): string {
  let bin = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(bin)
}

export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context
  if (!(await isAuthenticated(request, env))) return json({ error: 'unauthorized' }, 401)

  const store = kv(env)
  if (!store) return json({ error: 'storage-unavailable' }, 503)

  const url = new URL(request.url)
  const path = url.pathname.replace(/^\/admin\/api\/?/, '').replace(/\/$/, '')
  const method = request.method

  try {
    if (path === 'state' && method === 'GET') {
      const [categories, products, districts, settings, faq] = await Promise.all([
        readJson(env, 'catalog:categories', DEFAULT_CATALOG.categories),
        readJson(env, 'catalog:products', DEFAULT_CATALOG.products),
        readJson(env, 'catalog:districts', DEFAULT_CATALOG.districts),
        readJson(env, 'catalog:settings', DEFAULT_CATALOG.settings),
        readJson<Faq>(env, 'catalog:faq', DEFAULT_CATALOG.faq),
      ])
      return json({ kv: true, categories, products, districts, settings, faq })
    }

    if (path === 'products' && method === 'PUT') {
      const next = vProducts(await readJsonBody(request))
      if (!next) return json({ error: 'bad-payload' }, 400)
      const prev = await readJson(env, 'catalog:products', DEFAULT_CATALOG.products)
      await putJson(env, 'catalog:products', next)
      for (const p of prev) {
        if (!next.some((n) => n.id === p.id)) await store.delete(imgKey(p.id))
      }
      return json({ ok: true })
    }

    if (path === 'categories' && method === 'PUT') {
      const next = vCategories(await readJsonBody(request))
      if (!next) return json({ error: 'bad-payload' }, 400)
      await putJson(env, 'catalog:categories', next)
      return json({ ok: true })
    }

    if (path === 'districts' && method === 'PUT') {
      const next = vDistricts(await readJsonBody(request))
      if (!next) return json({ error: 'bad-payload' }, 400)
      await putJson(env, 'catalog:districts', next)
      return json({ ok: true })
    }

    if (path === 'settings' && method === 'PUT') {
      const next = vSettings(await readJsonBody(request))
      if (!next) return json({ error: 'bad-payload' }, 400)
      await putJson(env, 'catalog:settings', next)
      return json({ ok: true })
    }

    if (path.startsWith('faq/') && method === 'PUT') {
      const lang = path.slice('faq/'.length)
      if (lang !== 'cs' && lang !== 'en' && lang !== 'ru') return json({ error: 'bad-lang' }, 400)
      const list = vFaqList(await readJsonBody(request))
      if (!list) return json({ error: 'bad-payload' }, 400)
      const faq = await readJson<Faq>(env, 'catalog:faq', DEFAULT_CATALOG.faq)
      await putJson(env, 'catalog:faq', mergeFaq(faq, lang, list))
      return json({ ok: true })
    }

    if (path.startsWith('product-image/') && method === 'PUT') {
      const productId = path.slice('product-image/'.length)
      if (!/^[a-z0-9][a-z0-9-]{0,59}$/.test(productId)) return json({ error: 'bad-id' }, 400)
      const products = await readJson(env, 'catalog:products', DEFAULT_CATALOG.products)
      const product = products.find((p) => p.id === productId)
      if (!product) return json({ error: 'product-not-found' }, 404)
      const image = vImage(await readJsonBody(request))
      if (!image) return json({ error: 'bad-payload' }, 400)
      if (image.data.byteLength > MAX_IMAGE_BYTES) return json({ error: 'too-large' }, 413)
      const payload = JSON.stringify({ mime: image.mime, data: toBase64(new Uint8Array(image.data)) })
      await store.put(imgKey(productId), payload)
      const next = products.map((p) =>
        p.id === productId ? { ...p, image: { mime: image.mime, v: Date.now() } } : p,
      )
      await putJson(env, 'catalog:products', next)
      return json({ ok: true })
    }

    if (path.startsWith('product-image/') && method === 'DELETE') {
      const productId = path.slice('product-image/'.length)
      if (!/^[a-z0-9][a-z0-9-]{0,59}$/.test(productId)) return json({ error: 'bad-id' }, 400)
      await store.delete(imgKey(productId))
      const products = await readJson(env, 'catalog:products', DEFAULT_CATALOG.products)
      if (products.some((p) => p.id === productId)) {
        const next = products.map((p) => (p.id === productId ? { ...p, image: null } : p))
        await putJson(env, 'catalog:products', next)
      }
      return json({ ok: true })
    }

    return json({ error: 'not-found' }, 404)
  } catch (e) {
    if (e instanceof Error && e.message === 'too-large') return json({ error: 'too-large' }, 413)
    return json({ error: 'bad-payload' }, 400)
  }
}
