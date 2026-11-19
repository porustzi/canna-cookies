import { DEFAULT_CATALOG, parseLang, pickL, type Product } from '../_lib/defaults'
import { clientIp, int, json, putJson, readBody, readJson, str, type Env } from '../_lib/kv'
import { clearFailures, cooldownRemaining, isRateLimited, markCooldown, recordFailure } from '../_lib/ratelimit'
import { isGarbage } from '../_lib/garbage'
import { broadcastNewOrder } from '../_lib/couriers'
import type { OrderRecord } from '../_lib/orderNotify'

type RawLine = { productId?: unknown; weight?: unknown; qty?: unknown }

type RawOrder = {
  items?: unknown
  districtId?: unknown
  address?: unknown
  name?: unknown
  phone?: unknown
  payment?: unknown
  comment?: unknown
  website?: unknown
  lang?: unknown
}

const TTL = 7776000 // 90 дней

function orderId(): string {
  const time = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `CC-${time}${rand}`
}

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context
  const ip = clientIp(request)

  if (await isRateLimited(env, 'order', ip)) {
    return json({ error: 'rate-limited' }, 429, { 'retry-after': '900' })
  }

  const body = await readBody<RawOrder>(request)
  if (!body) return json({ error: 'bad-payload' }, 400)

  if (typeof body.website === 'string' && body.website.trim() !== '') {
    // honeypot — молча принимаем, ничего не сохраняем
    return json({ ok: true, id: '—', grand: 0 })
  }

  const fail = async (): Promise<Response> => {
    await recordFailure(env, 'order', ip)
    return json({ error: 'bad-payload' }, 400)
  }

  const name = str(body.name, 100)
  const phoneRaw = str(body.phone, 40)
  const address = str(body.address, 300)
  const districtId = typeof body.districtId === 'string' ? body.districtId.slice(0, 60) : ''
  const payment = typeof body.payment === 'string' ? body.payment.slice(0, 100) : ''
  const comment = typeof body.comment === 'string' ? body.comment.slice(0, 1000) : ''
  const lang = parseLang(body.lang) ?? 'cs'

  // мусор («тест», «123», клавиатурный шум) — молча отбрасываем
  if (isGarbage(name, comment)) {
    return json({ ok: true, id: '—', grand: 0 })
  }

  if (!name || name.length < 2) return fail()
  if (!phoneRaw || phoneRaw.replace(/\D/g, '').length < 6) return fail()
  if (!address || address.length < 3) return fail()

  if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 50) return fail()

  const products = await readJson<Product[]>(env, 'catalog:products', DEFAULT_CATALOG.products)
  const districts = await readJson(env, 'catalog:districts', DEFAULT_CATALOG.districts)

  const lines: { productId: string; name: string; weight: string; price: number; qty: number }[] = []
  let total = 0

  for (const raw of body.items as RawLine[]) {
    const productId = str(raw.productId, 60)
    const weightLabel = str(raw.weight, 40)
    const qty = int(raw.qty, 1, 99)
    if (!productId || !weightLabel || qty === null) return fail()

    const product = products.find((p) => p.id === productId)
    if (!product) return fail()
    const weight = product.weights.find((w) => w.label === weightLabel)
    if (!weight) return fail()

    lines.push({ productId, name: pickL(product.name, lang), weight: weightLabel, price: weight.price, qty })
    total += weight.price * qty
  }

  // 1 заказ в час с устройства — только после успешной валидации
  const cool = await cooldownRemaining(env, 'order', ip)
  if (cool > 0) {
    return json({ error: 'rate-limited' }, 429, { 'retry-after': String(cool) })
  }

  const district = districts.find((d) => d.id === districtId)
  const delivery = district ? district.fee : 0
  const grand = total + delivery

  const id = orderId()
  const order: OrderRecord = {
    id,
    createdAt: new Date().toISOString(),
    status: 'new',
    items: lines,
    district: district
      ? { id: district.id, name: pickL(district.name, lang), fee: district.fee }
      : { id: districtId, name: districtId || '—', fee: 0 },
    address,
    name,
    phone: phoneRaw,
    payment,
    comment,
    lang,
    total,
    delivery,
    grand,
  }

  await putJson(env, `order:${id}`, order, TTL)
  await clearFailures(env, 'order', ip)
  await markCooldown(env, 'order', ip, 3600)
  await broadcastNewOrder(env, order)

  return json({ ok: true, id, grand })
}
