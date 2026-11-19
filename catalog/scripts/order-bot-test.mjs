// Local E2E for order notification bot (order webhook + KV status + cooldown/garbage).
const BASE = process.env.BASE || 'http://localhost:8789'
const SECRET = process.env.ORDER_WEBHOOK_SECRET || '24a1ab9a45ae4ef1b43755adff3d4bc6'

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

const headers = { 'content-type': 'application/json', 'cf-connecting-ip': `11.${Math.floor(Math.random() * 200) + 20}.7.7` }

// 1. garbage order -> silently ignored (no cooldown consumed, no notification)
let r = await fetch(`${BASE}/api/order`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    items: [],
    name: 'тест 123',
    phone: '+420000000000',
    address: 'x',
    comment: 'test',
    website: '',
  }),
})
let body = await r.json()
ok(r.status === 200 && body.id === '—', 'garbage order silently ignored', JSON.stringify(body))

// 2. valid order -> notification (real TG message to owner chat)
r = await fetch(`${BASE}/api/order`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    items: [{ productId: 'p1', weight: '3.5 g', qty: 2 }],
    districtId: 'zona-a',
    address: 'Testova 12, Praha 5',
    name: 'Ivan Novak',
    phone: '+420111222333',
    payment: 'Наличные',
    comment: 'Прогон бота заказов, можно отклонить',
    lang: 'ru',
    website: '',
  }),
})
body = await r.json()
const freshRun = r.status === 200 && body.ok && String(body.id).startsWith('CC-')
ok(freshRun || r.status === 429, 'valid order accepted or cooldown active', `got ${r.status} ${JSON.stringify(body)}`)
const id = freshRun ? body.id : null

// 3. second valid order within the hour -> 429
if (freshRun) {
  r = await fetch(`${BASE}/api/order`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      items: [{ productId: 'p1', weight: '3.5 g', qty: 1 }],
      districtId: 'zona-a',
      address: 'Testova 12, Praha 5',
      name: 'Ivan Novak',
      phone: '+420111222333',
      payment: 'Наличные',
      comment: '',
      lang: 'ru',
      website: '',
    }),
  })
  const retry = Number(r.headers.get('retry-after') || 0)
  ok(r.status === 429 && retry > 20 && retry <= 60, 'second order within minute -> 429 with retry-after', `got ${r.status} ra=${retry}`)
} else {
  ok(true, 'cooldown already active (rerun) — second-order check skipped')
}

// 4. webhook rejects wrong secret
r = await fetch(`${BASE}/tg/order`, { method: 'POST', headers: { ...headers, 'x-telegram-bot-api-secret-token': 'nope' }, body: JSON.stringify({}) })
ok(r.status === 403, 'wrong webhook secret -> 403', `got ${r.status}`)

const cb = (data, chatId = 2136883966) =>
  fetch(`${BASE}/tg/order`, {
    method: 'POST',
    headers: { ...headers, 'x-telegram-bot-api-secret-token': SECRET },
    body: JSON.stringify({
      callback_query: { id: 'cb-test-1', data, message: { message_id: 1, chat: { id: chatId } } },
    }),
  })

// 5. callback from non-admin chat is ignored (200, no crash)
r = await cb(`ord:${id ?? 'CC-UNKNOWN'}:ok`, 999)
ok(r.status === 200, 'non-admin callback ignored', `got ${r.status}`)

// 6. confirm from admin chat (fresh run only — needs the real order id)
if (id) {
  r = await cb(`ord:${id}:ok`)
  ok(r.status === 200, 'confirm callback accepted', `got ${r.status}`)
  r = await cb(`ord:${id}:ok`)
  ok(r.status === 200, 'duplicate callback accepted', `got ${r.status}`)
} else {
  ok(true, 'rerun — confirm callbacks skipped (no fresh order id)')
}

// 7. /start from admin chat
r = await fetch(`${BASE}/tg/order`, {
  method: 'POST',
  headers: { ...headers, 'x-telegram-bot-api-secret-token': SECRET },
  body: JSON.stringify({ message: { chat: { id: 2136883966 }, text: '/start' } }),
})
ok(r.status === 200, '/start accepted', `got ${r.status}`)

// 8. feedback: garbage ignored; question from ordered device blocked; complaint ok
r = await fetch(`${BASE}/api/feedback`, {
  method: 'POST',
  headers,
  body: JSON.stringify({ type: 'question', name: 'тест123', text: 'test test', website: '' }),
})
ok(r.status === 200, 'garbage feedback silently ignored', `got ${r.status}`)

// same device that placed an order in step 2 -> question blocked
r = await fetch(`${BASE}/api/feedback`, {
  method: 'POST',
  headers,
  body: JSON.stringify({ type: 'question', name: 'Anna', text: 'Dobry den, zajima me doprava.', website: '' }),
})
ok(r.status === 403 && (await r.text()).includes('already-ordered'), 'question after order -> 403', `got ${r.status}`)

const fbHeaders = { 'content-type': 'application/json', 'cf-connecting-ip': `13.${Math.floor(Math.random() * 200) + 20}.5.5` }
r = await fetch(`${BASE}/api/feedback`, {
  method: 'POST',
  headers: fbHeaders,
  body: JSON.stringify({ type: 'complaint', name: 'Anna', phone: '+420777888999', tg: 'anna_tg', text: 'Problem s objednavkou, prosim o kontakt.', website: '' }),
})
ok(r.status === 200 || r.status === 429, 'complaint from fresh device accepted', `got ${r.status}`)

if (r.status === 200) {
  const r2 = await fetch(`${BASE}/api/feedback`, {
    method: 'POST',
    headers: fbHeaders,
    body: JSON.stringify({ type: 'complaint', name: 'Anna', text: 'Druha stiznost pro overeni limitu.', website: '' }),
  })
  const retry = Number(r2.headers.get('retry-after') || 0)
  ok(r2.status === 429 && retry > 20 && retry <= 60, 'second feedback within minute -> 429', `got ${r2.status} ra=${retry}`)
} else {
  ok(true, 'feedback cooldown already active (rerun) — second check skipped')
}

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed ? 1 : 0)
