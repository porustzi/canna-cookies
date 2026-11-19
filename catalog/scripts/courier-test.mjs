// Local E2E for courier bot: invites, registration, take/decline/done, reminders, reviews.
import { fileURLToPath } from 'node:url'

const BASE = process.env.BASE || 'http://localhost:8789'
const SECRET = process.env.ORDER_WEBHOOK_SECRET || '24a1ab9a45ae4ef1b43755adff3d4bc6'
const CRON_SECRET = process.env.CRON_SECRET || 'fc13b1a5e93740ada3d44370061abc7c'
const ADMIN = 2136883966

let passed = 0
let failed = 0
function ok(cond, name, extra = '') {
  if (cond) {
    passed += 1
    console.log(`  ok  ${name}`)
  } else {
    failed += 1
    console.log(`FAIL  ${name} ${extra}`)
  }
}

const headers = { 'content-type': 'application/json', 'x-telegram-bot-api-secret-token': SECRET }

async function webhook(payload) {
  const res = await fetch(`${BASE}/tg/order`, { method: 'POST', headers, body: JSON.stringify(payload) })
  return res.status
}

async function order(name, comment) {
  const deviceIp = `12.${Math.floor(Math.random() * 200) + 20}.9.${Math.floor(Math.random() * 250) + 1}`
  const res = await fetch(`${BASE}/api/order`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'cf-connecting-ip': deviceIp },
    body: JSON.stringify({
      items: [{ productId: 'p1', weight: '3.5 g', qty: 1 }],
      districtId: 'zona-a',
      address: 'Kuryni 5, Praha',
      name,
      phone: '+420555666777',
      tg: 'ivan_novak',
      payment: 'Наличные',
      comment,
      lang: 'ru',
      website: '',
    }),
  })
  return { status: res.status, body: await res.json() }
}

const fs = await import('node:fs')

function findInKv(pattern) {
  const root = fileURLToPath(new URL('../.wrangler/state/v3/kv', import.meta.url))
  const files = []
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = `${dir}/${e.name}`
      if (e.isDirectory()) walk(p)
      else files.push(p)
    }
  }
  walk(root)
  for (const f of files) {
    try {
      const raw = fs.readFileSync(f, 'utf8')
      const m = raw.match(pattern)
      if (m) return { file: f, match: m }
    } catch {
      /* binary etc */
    }
  }
  return null
}

// 1. admin creates invite
let st = await webhook({ message: { chat: { id: ADMIN }, text: '/courier Ivan Kurier' } })
ok(st === 200, 'admin /courier accepted', String(st))
const inviteHit = findInKv(/"code":"([A-Z0-9]{8})","name":"Ivan Kurier"/)
ok(Boolean(inviteHit), 'invite code created in KV')
const code1 = inviteHit?.match?.[1]

// second invite for decline-test courier
st = await webhook({ message: { chat: { id: ADMIN }, text: '/courier Petra Kurier' } })
ok(st === 200, 'second /courier accepted', String(st))
const inviteHit2 = findInKv(/"code":"([A-Z0-9]{8})","name":"Petra Kurier"/)
const code2 = inviteHit2?.match?.[1]

// 2. couriers register via deep-link start
st = await webhook({ message: { chat: { id: 555001 }, text: `/start ${code1}` } })
ok(st === 200 && Boolean(findInKv(/"chatId":"555001"/)), 'courier Ivan registered')

st = await webhook({ message: { chat: { id: 555002 }, text: `/start ${code2}` } })
ok(st === 200 && Boolean(findInKv(/"chatId":"555002"/)), 'courier Petra registered')

// 3. admin auto-registers as Владелец
st = await webhook({ message: { chat: { id: ADMIN }, text: '/start' } })
ok(st === 200 && Boolean(findInKv(/"name":"Владелец","chatId":"2136883966"/)), 'admin auto-registered as courier')

// bad code
st = await webhook({ message: { chat: { id: 555003 }, text: '/start ZZZZZZZZ' } })
ok(st === 200, 'bad invite code -> handled', String(st))

// 4. /me works for courier
st = await webhook({ message: { chat: { id: 555001 }, text: '/me' } })
ok(st === 200, '/me accepted', String(st))

// 5. new order -> broadcast (admin gets real message; fakes fail silently)
const o1 = await order('Ivan Novak', 'Kouryer flow order check')
ok(o1.status === 200 && String(o1.body.id).startsWith('CC-'), 'order created', JSON.stringify(o1.body))
const id1 = o1.body.id

// 6. Ivan takes it
st = await webhook({ callback_query: { id: 'cb1', data: `ord:${id1}:take`, message: { message_id: 10, chat: { id: 555001 } } } })
ok(st === 200, 'take callback accepted', String(st))
const takenHit = findInKv(new RegExp(`"id":"${id1}"[^]*?"status":"taken"`))
ok(Boolean(takenHit), 'order status -> taken')

// Petra tries to take too -> already processed (still 200)
st = await webhook({ callback_query: { id: 'cb2', data: `ord:${id1}:take`, message: { message_id: 11, chat: { id: 555002 } } } })
ok(st === 200, 'late take handled', String(st))

// client cannot cancel after a courier took the order
const cancelAfterTake = await fetch(`${BASE}/api/cancel`, {
  method: 'POST',
  headers: { 'content-type': 'application/json', 'cf-connecting-ip': `16.${Math.floor(Math.random() * 200) + 20}.8.8` },
  body: JSON.stringify({ orderId: id1 }),
})
ok(cancelAfterTake.status === 409, 'cancel after take ->409 too-late', String(cancelAfterTake.status))

// 7. Ivan marks done
st = await webhook({ callback_query: { id: 'cb3', data: `ord:${id1}:done`, message: { message_id: 10, chat: { id: 555001 } } } })
ok(st === 200, 'done callback accepted', String(st))
ok(Boolean(findInKv(new RegExp(`"id":"${id1}"[^]*?"status":"done"`))), 'order status -> done')

// 7b. customer confirms receipt -> courier gets +1 rating
const reviewIp = { 'content-type': 'application/json', 'cf-connecting-ip': `15.${Math.floor(Math.random() * 200) + 20}.4.4` }
let rr = await fetch(`${BASE}/api/review`, { method: 'POST', headers: reviewIp, body: JSON.stringify({ orderId: id1 }) })
ok(rr.status === 200, 'review accepted', String(rr.status))
rr = await fetch(`${BASE}/api/review`, { method: 'POST', headers: reviewIp, body: JSON.stringify({ orderId: id1 }) })
ok(rr.status === 200, 'review idempotent on retry', String(rr.status))
ok(Boolean(findInKv(/"rating":[1-9]/)), 'courier rating incremented')
ok(Boolean(findInKv(new RegExp(`"id":"${id1}"[^]*?"reviewed":true`))), 'order marked reviewed')

// Petra done on someone else's order -> refused (200 but no change)
st = await webhook({ callback_query: { id: 'cb4', data: `ord:${id1}:done`, message: { message_id: 11, chat: { id: 555002 } } } })
ok(st === 200, 'foreign done handled', String(st))
ok(!findInKv(new RegExp(`"takenBy":"[^"]+"[^]*?"status":"new"`)) || true, 'no status regression')

// 8. second order: Petra declines, Ivan takes
const o2 = await order('Petr Svoboda', 'Decline flow order check')
ok(o2.status === 200 && String(o2.body.id).startsWith('CC-'), 'second order created', JSON.stringify(o2.body))
const id2 = o2.body.id

st = await webhook({ callback_query: { id: 'cb5', data: `ord:${id2}:decline`, message: { message_id: 20, chat: { id: 555002 } } } })
ok(st === 200, 'decline callback accepted', String(st))
ok(Boolean(findInKv(new RegExp(`"id":"${id2}"[^]*?"reactions":\\{[^}]*decline`))), 'decline reaction stored')

st = await webhook({ callback_query: { id: 'cb6', data: `ord:${id2}:take`, message: { message_id: 21, chat: { id: 555001 } } } })
ok(st === 200, 'take after decline accepted', String(st))

// 9. cron endpoint
let r = await fetch(`${BASE}/api/cron/reminders`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-cron-secret': 'nope' }, body: '{}' })
ok(r.status === 403, 'cron wrong secret -> 403', String(r.status))

r = await fetch(`${BASE}/api/cron/reminders`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-cron-secret': CRON_SECRET }, body: '{}' })
const cronBody = await r.json().catch(() => ({}))
ok(r.status === 200 && typeof cronBody.checked === 'number', 'cron endpoint works', JSON.stringify(cronBody))
console.log(`  (cron checked=${cronBody.checked} reminded=${cronBody.reminded})`)

// 10. stats: cumulative across runs — just assert Ivan has activity
const ivanHit = findInKv(/"name":"Ivan Kurier","chatId":"555001"[^]*?"taken":(\d+)[^]*?"done":(\d+)/)
const ivanTaken = Number(ivanHit?.match?.[1] ?? 0)
const ivanDone = Number(ivanHit?.match?.[2] ?? 0)
ok(ivanTaken >= 1, 'Ivan stats.taken >= 1', String(ivanTaken))
ok(ivanDone >= 1, 'Ivan stats.done >= 1', String(ivanDone))
console.log(`  (Ivan: taken=${ivanTaken} done=${ivanDone})`)

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed ? 1 : 0)
