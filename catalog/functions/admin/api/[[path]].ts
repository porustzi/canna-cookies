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
import { broadcastNewOrder, createInvite, editOrderMessages, listCouriers, saveCourier } from '../../_lib/couriers'
import type { OrderRecord } from '../../_lib/orderNotify'

const MAX_BODY = 4_000_000
const ORDER_TTL = 7776000

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

async function listAll(env: Env, prefix: string, limit: number): Promise<{ name: string; value: unknown }[]> {
  const store = kv(env)
  if (!store) return []
  try {
    const listed = await store.list({ prefix, limit })
    const items = await Promise.all(
      listed.keys.map(async (k) => {
        const raw = await store.get(k.name)
        if (!raw) return null
        try {
          return { name: k.name, value: JSON.parse(raw) }
        } catch {
          return null
        }
      }),
    )
    return items.filter((x): x is { name: string; value: unknown } => Boolean(x))
  } catch {
    return []
  }
}

function csvCell(v: unknown): string {
  const s = v === null || v === undefined ? '' : String(v)
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
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
      const [categories, products, districts, settings, faq, ordersRaw, feedbackRaw, couriers] = await Promise.all([
        readJson(env, 'catalog:categories', DEFAULT_CATALOG.categories),
        readJson(env, 'catalog:products', DEFAULT_CATALOG.products),
        readJson(env, 'catalog:districts', DEFAULT_CATALOG.districts),
        readJson(env, 'catalog:settings', DEFAULT_CATALOG.settings),
        readJson<Faq>(env, 'catalog:faq', DEFAULT_CATALOG.faq),
        listAll(env, 'order:', 100),
        listAll(env, 'fb:', 100),
        listCouriers(env),
      ])
      const orders = ordersRaw
        .map((o) => o.value as OrderRecord)
        .filter((o) => o && o.id)
        .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
      const feedback = feedbackRaw
        .map((f) => f.value as Record<string, unknown>)
        .filter((f) => f && f.id)
        .sort((a, b) => String(b.createdAt ?? '').localeCompare(String(a.createdAt ?? '')))
      return json({ kv: true, categories, products, districts, settings, faq, orders, feedback, couriers })
    }

    if (path === 'orders' && method === 'PUT') {
      const body = (await readJsonBody(request)) as { id?: unknown; action?: unknown } | null
      const id = typeof body?.id === 'string' ? body.id.trim() : ''
      const action = typeof body?.action === 'string' ? body.action : ''
      if (!/^CC-[A-Z0-9]{4,24}$/i.test(id) || !['cancel', 'notify', 'delete'].includes(action)) {
        return json({ error: 'bad-payload' }, 400)
      }
      const key = `order:${id.toUpperCase()}`
      if (action === 'delete') {
        await store.delete(key)
        return json({ ok: true })
      }
      const order = await readJson<OrderRecord | null>(env, key, null)
      if (!order) return json({ error: 'not-found' }, 404)
      if (action === 'cancel') {
        if (order.status !== 'new' && order.status !== 'taken') return json({ error: 'too-late' }, 409)
        order.status = 'cancelled'
        await putJson(env, key, order, ORDER_TTL)
        await editOrderMessages(env, order)
      } else {
        await broadcastNewOrder(env, order)
      }
      return json({ ok: true })
    }

    if (path === 'orders.csv' && method === 'GET') {
      const rows = await listAll(env, 'order:', 500)
      const orders = rows
        .map((o) => o.value as OrderRecord)
        .filter((o) => o && o.id)
        .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
      const header = [
        'id', 'createdAt', 'status', 'name', 'phone', 'address', 'zone', 'items',
        'total', 'delivery', 'discount', 'grand', 'payment', 'promo', 'lang', 'comment', 'courier',
      ]
      const lines = [header.join(',')]
      for (const o of orders) {
        lines.push(
          [
            o.id, o.createdAt, o.status, o.name, o.phone, o.address, o.district?.name ?? '',
            o.items.map((i) => `${i.name} ${i.weight} x${i.qty}`).join(' | '),
            o.total, o.delivery, o.discount ?? 0, o.grand, o.payment, o.promo ?? '', o.lang ?? '',
            o.comment ?? '', o.takenBy ?? '',
          ]
            .map(csvCell)
            .join(','),
        )
      }
      return new Response(`﻿${lines.join('\n')}`, {
        headers: {
          'content-type': 'text/csv; charset=utf-8',
          'content-disposition': 'attachment; filename="orders.csv"',
          'cache-control': 'no-store',
        },
      })
    }

    if (path === 'feedback' && method === 'PUT') {
      const body = (await readJsonBody(request)) as { id?: unknown; action?: unknown } | null
      const id = typeof body?.id === 'string' ? body.id.trim() : ''
      const action = typeof body?.action === 'string' ? body.action : ''
      if (!/^FB-[A-Z0-9]{4,30}$/i.test(id) || action !== 'delete') return json({ error: 'bad-payload' }, 400)
      const key = `fb:${id.toUpperCase()}`
      const record = (await readJson<{ orderId?: string } | null>(env, key, null)) as { orderId?: string } | null
      await store.delete(key)
      if (record?.orderId && /^CC-[A-Z0-9]{4,24}$/i.test(record.orderId)) {
        await store.delete(`disputereply:${record.orderId.toUpperCase()}`)
      }
      return json({ ok: true })
    }

    if (path === 'couriers' && method === 'PUT') {
      const body = (await readJsonBody(request)) as { id?: unknown; action?: unknown; name?: unknown } | null
      const action = typeof body?.action === 'string' ? body.action : ''
      if (action === 'invite') {
        const name = typeof body?.name === 'string' ? body.name.trim().slice(0, 60) : ''
        if (name.length < 2) return json({ error: 'bad-payload' }, 400)
        const code = await createInvite(env, name)
        return json({ ok: true, code, link: `https://t.me/cookies_orders_bot?start=${code}` })
      }
      const id = typeof body?.id === 'string' ? body.id.trim() : ''
      if (!id || !['toggle'].includes(action)) return json({ error: 'bad-payload' }, 400)
      const couriers = await listCouriers(env)
      const courier = couriers.find((c) => c.id === id)
      if (!courier) return json({ error: 'not-found' }, 404)
      courier.active = action === 'toggle' ? !courier.active : courier.active
      await saveCourier(env, courier)
      return json({ ok: true, courier })
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
