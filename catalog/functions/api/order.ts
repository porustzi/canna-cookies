import { DEFAULT_CATALOG, parseLang, pickL, type Product, type Settings } from '../_lib/defaults'
import { clientIp, int, json, putJson, readBody, readJson, str, type Env } from '../_lib/kv'
import { clearFailures, cooldownRemaining, isRateLimited, markCooldown, recordFailure } from '../_lib/ratelimit'
import { isGarbage } from '../_lib/garbage'
import { broadcastNewOrder } from '../_lib/couriers'
import { isOpenBySchedule } from '../_lib/schedule'
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
  tgId?: unknown
  tg?: unknown
  promo?: unknown
}

const TTL = 7776000 // 90 дней
const IPORDER_TTL = 172800 // маркер «устройство заказывало» — 48 часов

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
  const tgId = typeof body.tgId === 'string' && /^\d{1,20}$/.test(body.tgId) ? body.tgId : undefined
  const tgRaw = typeof body.tg === 'string' ? body.tg.trim().replace(/^@+/, '') : ''
  const tg = tgRaw ? `@${tgRaw}` : ''
  const promoCode = typeof body.promo === 'string' ? body.promo.trim().slice(0, 30) : ''

  // мусор («тест», «123», клавиатурный шум) — молча отбрасываем
  if (isGarbage(name, comment)) {
    return json({ ok: true, id: '—', grand: 0 })
  }

  if (!name || name.length < 2) return fail()
  if (!phoneRaw || phoneRaw.replace(/\D/g, '').length < 6) return fail()
  if (!address || address.length < 3) return fail()
  // Telegram-username обязателен
  if (!/^@[A-Za-z0-9_]{3,32}$/.test(tg)) {
    await recordFailure(env, 'order', ip)
    return json({ error: 'tg-required' }, 400)
  }

  const settings = await readJson<Settings>(env, 'catalog:settings', DEFAULT_CATALOG.settings)

  // магазин закрыт (ручной тумблер или расписание по дням)
  if (settings.closed || isOpenBySchedule(settings.schedule) === false) {
    return json({ error: 'closed' }, 403)
  }

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
    // товар снят с наличия — отказываем (гонка «распродано»)
    if (!product.available) return json({ error: 'sold-out' }, 409)
    const weight = product.weights.find((w) => w.label === weightLabel)
    if (!weight) return fail()

    lines.push({ productId, name: pickL(product.name, lang), weight: weightLabel, price: weight.price, qty })
    total += weight.price * qty
  }

  // минимальная сумма заказа
  if (settings.minOrder > 0 && total < settings.minOrder) {
    return json({ error: 'min-order', minOrder: settings.minOrder }, 400)
  }

  // 1 заказ в минуту с устройства — только после успешной валидации
  const cool = await cooldownRemaining(env, 'order', ip)
  if (cool > 0) {
    return json({ error: 'rate-limited' }, 429, { 'retry-after': String(cool) })
  }

  const district = districts.find((d) => d.id === districtId)
  let delivery = district ? district.fee : 0
  if ((settings.freeDeliveryFrom ?? 0) > 0 && total >= (settings.freeDeliveryFrom ?? 0)) delivery = 0

  // промокод
  let discount = 0
  let promoApplied = ''
  const promo = settings.promo
  if (promo && promo.code && promoCode && promoCode.toLowerCase() === promo.code.toLowerCase()) {
    discount = Math.min(total, Math.round((total * promo.percent) / 100))
    promoApplied = promo.code
  }

  const grand = Math.max(0, total + delivery - discount)

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
    tg,
    tgId,
    discount,
    promo: promoApplied || undefined,
    total,
    delivery,
    grand,
  }

  await putJson(env, `order:${id}`, order, TTL)
  await clearFailures(env, 'order', ip)
  await markCooldown(env, 'order', ip, 60)
  // это устройство сделало заказ —48 часов не принимаем «вопросы»
  try {
    await env.CATALOG?.put(`iporder:${ip}`, String(Date.now()), { expirationTtl: IPORDER_TTL })
  } catch {
    /* KV недоступен — маркер не ставим */
  }
  await broadcastNewOrder(env, order)

  return json({ ok: true, id, grand })
}
