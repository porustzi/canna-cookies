// Admin panel e2e for the catalog (canna-cookies-catalog).
// Usage: BASE=http://localhost:8789 node scripts/admin-e2e.mjs
// Rate-limit phase is opt-in: RUN_RATE_LIMIT=1 (locks this IP for 15 min — run locally / last).
const BASE = process.env.BASE || 'http://localhost:8789'
const PASSWORD = process.env.ADMIN_PASSWORD || 'a$ap2026!'
const OUT = process.env.OUT || 'C:/Users/Tim/AppData/Local/Temp/opencode/catalog-admin-e2e'
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const RUN_RL = process.env.RUN_RATE_LIMIT === '1'

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

const PNG_1PX = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

async function http(path, opts = {}) {
  const res = await fetch(BASE + path, { redirect: 'manual', ...opts })
  const text = await res.text()
  return { status: res.status, text, headers: res.headers }
}

const fs = await import('node:fs')
fs.mkdirSync(OUT, { recursive: true })

// ---------- Phase A: UI login + screenshots ----------
const { chromium } = await import('file:///C:/Users/Tim/canna-cookies/node_modules/playwright-core/index.mjs')
const browser = await chromium.launch({ executablePath: CHROME, headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const pageErrors = []
page.on('console', (m) => {
  if (m.type() === 'error') pageErrors.push(m.text())
})
page.on('pageerror', (e) => pageErrors.push(String(e)))

await page.goto(`${BASE}/admin/`, { waitUntil: 'networkidle' })
ok((await page.locator('input[name="password"]').count()) === 1, 'login form rendered')
await page.screenshot({ path: `${OUT}/login.png` })

await page.fill('input[name="password"]', 'wrong-pass')
await page.click('button[type="submit"]')
await page.waitForTimeout(1200)
ok(page.url().includes('/admin/login') || (await page.locator('.err').count()) > 0, 'wrong password shows error')

await page.goto(`${BASE}/admin/`, { waitUntil: 'networkidle' })
await page.fill('input[name="password"]', PASSWORD)
pageErrors.length = 0
await page.click('button[type="submit"]')
await page.waitForURL('**/admin/**', { timeout: 8000 }).catch(() => {})
await page.waitForTimeout(1500)
ok((await page.locator('text=Админка').count()) > 0, 'dashboard after UI login', page.url())
await page.screenshot({ path: `${OUT}/dashboard.png` })

for (const tab of ['Товары', 'Категории', 'Зоны', 'Настройки', 'FAQ']) {
  await page.click(`nav button:has-text("${tab}")`)
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${OUT}/tab-${tab}.png` })
}
ok((await page.locator('text=Вопрос 1').count()) > 0, 'faq editor shows items')

ok(pageErrors.length === 0, 'no console errors on admin', JSON.stringify(pageErrors))
await browser.close()

// ---------- Phase B: HTTP API ----------
console.log('--- api ---')

let r = await http('/admin/')
ok(r.status === 200 && r.text.includes('password'), 'unauthed /admin/ serves login page', `got ${r.status}`)

r = await http('/admin/api/state')
ok(r.status === 401, 'state without cookie -> 401', `got ${r.status}`)

r = await http('/admin/login', {
  method: 'POST',
  body: 'password=wrong',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
})
ok(r.status === 401, 'wrong password -> 401', `got ${r.status}`)

r = await http('/admin/login', {
  method: 'POST',
  body: `password=${encodeURIComponent(PASSWORD)}`,
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
})
ok(r.status === 303, 'correct password -> 303', `got ${r.status}`)
const setCookie = r.headers.get('set-cookie') || ''
const cookie = setCookie.split(';')[0]
ok(cookie.includes('cc_admin='), 'cookie set', setCookie.slice(0, 40))
ok(setCookie.includes('HttpOnly'), 'cookie HttpOnly')

r = await http('/admin/', { headers: { cookie } })
ok(r.status === 200 && r.text.includes('root'), 'authed /admin/ serves app shell', `got ${r.status}`)

r = await http('/admin/api/state', { headers: { cookie } })
const state = r.status === 200 ? JSON.parse(r.text) : null
ok(r.status === 200 && state?.kv === true, 'state kv=true', r.text.slice(0, 120))
ok(Array.isArray(state?.products) && Array.isArray(state?.faq?.ru), 'state has products and faq')

// baseline for cleanup
const baseProducts = state?.products ?? []
const baseFaqRu = state?.faq?.ru ?? []
const categoryId = state?.categories?.[0]?.id ?? 'flowers'

// add a test product
const testProduct = {
  id: 'e2e-test',
  name: { ru: 'E2E Тест', cs: 'E2E Test', en: 'E2E Test' },
  desc: { ru: 'Тестовый товар из e2e', cs: 'Testovací položka z e2e', en: 'Test item from e2e' },
  category: categoryId,
  weights: [{ label: '1 g', price: 100 }],
  available: true,
  image: null,
}
r = await http('/admin/api/products', {
  method: 'PUT',
  headers: { cookie, 'content-type': 'application/json' },
  body: JSON.stringify([...baseProducts, testProduct]),
})
ok(r.status === 200, 'PUT products', `got ${r.status} ${r.text}`)

r = await http('/api/catalog')
let cat = r.status === 200 ? JSON.parse(r.text) : null
const added = cat?.products?.find((p) => p.id === 'e2e-test')
ok(added?.name?.ru === 'E2E Тест', 'public catalog has test product', r.text.slice(0, 160))

// faq ru
const faqRu = [...baseFaqRu, { q: 'E2E вопрос?', a: 'E2E ответ.' }]
r = await http('/admin/api/faq/ru', {
  method: 'PUT',
  headers: { cookie, 'content-type': 'application/json' },
  body: JSON.stringify(faqRu),
})
ok(r.status === 200, 'PUT faq/ru', `got ${r.status} ${r.text}`)

r = await http('/api/catalog')
cat = r.status === 200 ? JSON.parse(r.text) : null
ok(
  Array.isArray(cat?.faq?.ru) && cat.faq.ru.some((i) => i.q === 'E2E вопрос?'),
  'public faq has test item',
  r.text.slice(0, 160),
)

// image upload
r = await http('/admin/api/product-image/e2e-test', {
  method: 'PUT',
  headers: { cookie, 'content-type': 'application/json' },
  body: JSON.stringify({ mime: 'image/png', data: PNG_1PX }),
})
ok(r.status === 200, 'upload product image', `got ${r.status} ${r.text}`)

r = await http('/api/img/product/e2e-test')
ok(
  r.status === 200 && (r.headers.get('content-type') || '').startsWith('image/'),
  'public image endpoint serves bytes',
  `got ${r.status} ${r.headers.get('content-type')}`,
)

r = await http('/api/catalog')
cat = r.status === 200 ? JSON.parse(r.text) : null
ok(cat?.products?.find((p) => p.id === 'e2e-test')?.image?.mime === 'image/png', 'product carries image meta')

r = await http('/admin/api/product-image/e2e-test', { method: 'DELETE', headers: { cookie } })
ok(r.status === 200, 'delete product image', `got ${r.status}`)

r = await http('/api/img/product/e2e-test')
ok(r.status === 404, 'image gone after delete', `got ${r.status}`)

// invalid payload rejected
r = await http('/admin/api/products', {
  method: 'PUT',
  headers: { cookie, 'content-type': 'application/json' },
  body: JSON.stringify([{ id: 'BAD ID', name: {}, desc: {}, category: '', weights: [], available: true }]),
})
ok(r.status === 400, 'invalid products -> 400', `got ${r.status}`)

// cleanup
r = await http('/admin/api/products', {
  method: 'PUT',
  headers: { cookie, 'content-type': 'application/json' },
  body: JSON.stringify(baseProducts),
})
ok(r.status === 200, 'cleanup: restore products', `got ${r.status}`)

r = await http('/admin/api/faq/ru', {
  method: 'PUT',
  headers: { cookie, 'content-type': 'application/json' },
  body: JSON.stringify(baseFaqRu),
})
ok(r.status === 200, 'cleanup: restore faq/ru', `got ${r.status}`)

r = await http('/api/catalog?cb=' + Date.now())
cat = r.status === 200 ? JSON.parse(r.text) : null
ok(
  !cat?.products?.some((p) => p.id === 'e2e-test') &&
    !(cat?.faq?.ru ?? []).some((i) => i.q === 'E2E вопрос?'),
  'catalog restored after cleanup',
  r.text.slice(0, 160),
)

r = await http('/admin/logout')
ok(r.status === 303, 'logout -> 303', `got ${r.status}`)

if (RUN_RL) {
  console.log('--- rate limit (RUN_RATE_LIMIT=1) ---')
  // re-login first so failures start clean
  r = await http('/admin/login', {
    method: 'POST',
    body: `password=${encodeURIComponent(PASSWORD)}`,
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
  })
  const freshCookie = (r.headers.get('set-cookie') || '').split(';')[0]
  void freshCookie
  for (let i = 1; i <= 5; i++) {
    r = await http('/admin/login', {
      method: 'POST',
      body: 'password=nope',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
    })
    ok(r.status === 401, `fail #${i} -> 401`, `got ${r.status}`)
  }
  r = await http('/admin/login', {
    method: 'POST',
    body: 'password=nope',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
  })
  ok(r.status === 429, 'fail #6 -> 429 locked', `got ${r.status}`)
  ok((r.headers.get('retry-after') || '').length > 0, '429 has Retry-After')
  r = await http('/admin/login', {
    method: 'POST',
    body: `password=${encodeURIComponent(PASSWORD)}`,
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
  })
  ok(r.status === 429, 'correct password also 429 while locked', `got ${r.status}`)
} else {
  console.log('--- rate limit skipped (set RUN_RATE_LIMIT=1 to enable) ---')
}

console.log(`\nresult: ${passed} passed, ${failed} failed`)
process.exit(failed === 0 ? 0 : 1)
