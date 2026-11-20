// Local security checks: initData validation for myorders + verified tgId in orders.
// Usage: node scripts/security-test.mjs (requires local server on8789)
import { readFileSync } from 'node:fs'

const BASE = process.env.BASE || 'http://localhost:8789'
const devVars = readFileSync(new URL('../.dev.vars', import.meta.url), 'utf8')
const TOKEN = (devVars.match(/^TELEGRAM_WEBAPP_TOKEN=(.+)$/m) ?? [])[1]?.trim()
if (!TOKEN) {
  console.error('TELEGRAM_WEBAPP_TOKEN not found in .dev.vars')
  process.exit(1)
}

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

function hex(buf) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function signInitData(userObj) {
  const enc = new TextEncoder()
  const authDate = Math.floor(Date.now() / 1000)
  const params = new URLSearchParams()
  params.set('user', JSON.stringify(userObj))
  params.set('auth_date', String(authDate))
  params.set('query_id', 'AAH-test')
  const dcs = [...params.entries()].map(([k, v]) => `${k}=${v}`).sort().join('\n')
  const secretKey = await crypto.subtle.sign(
    'HMAC',
    await crypto.subtle.importKey('raw', enc.encode('WebAppData'), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']),
    enc.encode(TOKEN),
  )
  const hash = hex(
    await crypto.subtle.sign(
      'HMAC',
      await crypto.subtle.importKey('raw', secretKey, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']),
      enc.encode(dcs),
    ),
  )
  params.set('hash', hash)
  return params.toString()
}

// 1. no header ->401
let r = await fetch(`${BASE}/api/myorders?tg=1`)
ok(r.status === 401, 'myorders without initData ->401', String(r.status))

// 2. garbage header ->401
r = await fetch(`${BASE}/api/myorders?tg=1`, { headers: { 'x-telegram-init-data': 'user=%7B%22id%22%3A1%7D&hash=00' } })
ok(r.status === 401, 'myorders with forged initData ->401', String(r.status))

// 3. valid initData ->200 (empty list for this user)
const good = await signInitData({ id: 777000111, username: 'sec_user', first_name: 'Sec' })
r = await fetch(`${BASE}/api/myorders?tg=777000111`, { headers: { 'x-telegram-init-data': good } })
const body = await r.json().catch(() => ({}))
ok(r.status === 200 && Array.isArray(body.orders), 'myorders with valid initData ->200', `got ${r.status}`)

// 4. order placed with initData -> appears in that user's history (verified tgId)
r = await fetch(`${BASE}/api/order`, {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'x-telegram-init-data': good,
    'cf-connecting-ip': `31.${Math.floor(Math.random() * 200) + 20}.3.3`,
  },
  body: JSON.stringify({
    items: [{ productId: 'p1', weight: '3.5 g', qty: 1 }],
    districtId: 'zona-a',
    address: 'Sec Test 1, Praha',
    name: 'Sec User',
    phone: '+420999888777',
    tg: 'client_claimed_name',
    payment: 'Cash',
    lang: 'ru',
    website: '',
  }),
})
const order = await r.json().catch(() => ({}))
ok(r.status === 200 && String(order.id).startsWith('CC-'), 'order with initData accepted', JSON.stringify(order))

r = await fetch(`${BASE}/api/myorders?tg=777000111`, { headers: { 'x-telegram-init-data': good } })
const hist = await r.json().catch(() => ({}))
ok(
  r.status === 200 && Array.isArray(hist.orders) && hist.orders.some((o) => o.id === order.id),
  'verified order appears in my history',
  JSON.stringify(hist.orders?.map((o) => o.id)),
)

// 5. tampered initData (change user id, keep hash) ->401
const tampered = good.replace('777000111', '777000112')
r = await fetch(`${BASE}/api/myorders?tg=777000112`, { headers: { 'x-telegram-init-data': tampered } })
ok(r.status === 401, 'tampered initData ->401', String(r.status))

console.log(`${passed} passed, ${failed} failed`)
process.exit(failed ? 1 : 0)
