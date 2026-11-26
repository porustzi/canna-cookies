const BASE = process.env.BASE || 'http://localhost:8788'
const { readFileSync } = await import('node:fs')
const devVars = readFileSync(new URL('../.dev.vars', import.meta.url), 'utf8')
const PASSWORD = process.env.ADMIN_PASSWORD || (devVars.match(/^ADMIN_PASSWORD=(.+)$/m) ?? [])[1]?.trim()
if (!PASSWORD) {
  console.error('ADMIN_PASSWORD not found in .dev.vars')
  process.exit(1)
}
const OUT = process.env.OUT || 'C:/Users/Tim/AppData/Local/Temp/opencode/admin-e2e'
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'

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
const { chromium } = await import('playwright-core')
const browser = await chromium.launch({ executablePath: CHROME, headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const pageErrors = []
page.on('console', (m) => { if (m.type() === 'error') pageErrors.push(m.text()) })
page.on('pageerror', (e) => pageErrors.push(String(e)))

await page.goto(`${BASE}/admin/`, { waitUntil: 'networkidle' })
ok(await page.locator('input[name="password"]').count() === 1, 'login form rendered')
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
ok((await page.locator('text=Админ').count()) > 0, 'dashboard after UI login', page.url())
await page.screenshot({ path: `${OUT}/dashboard.png` })

await page.click('button:has-text("Контакты")')
await page.waitForTimeout(700)
await page.screenshot({ path: `${OUT}/contacts.png` })

await page.click('button:has-text("Галерея точки")')
await page.waitForTimeout(700)
await page.screenshot({ path: `${OUT}/gallery.png` })

await page.click('button:has-text("Изображения")')
await page.waitForTimeout(700)
await page.screenshot({ path: `${OUT}/images.png` })

ok(pageErrors.length === 0, 'no console errors on admin', JSON.stringify(pageErrors))
await browser.close()

// ---------- Phase B: HTTP API ----------
console.log('--- api ---')
const SKIP_RL = process.env.SKIP_RATE_LIMIT === '1'

let r = await http('/admin/api/state')
ok(r.status === 401, 'state without cookie -> 401', `got ${r.status}`)

r = await http('/admin/login', { method: 'POST', body: 'password=wrong', headers: { 'content-type': 'application/x-www-form-urlencoded' } })
ok(r.status === 401, 'wrong password -> 401', `got ${r.status}`)

r = await http('/admin/login', { method: 'POST', body: `password=${encodeURIComponent(PASSWORD)}`, headers: { 'content-type': 'application/x-www-form-urlencoded' } })
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

r = await http('/admin/api/contacts/cs', {
  method: 'PUT',
  headers: { cookie, 'content-type': 'application/json' },
  body: JSON.stringify({ cards: [{ label: 'E-mail', value: 'test@canna.cz', status: 'OK' }], note: 'test note' }),
})
ok(r.status === 200, 'save contacts cs', `got ${r.status} ${r.text}`)

r = await http('/api/content')
const content = r.status === 200 ? JSON.parse(r.text) : null
ok(content?.contacts?.cs?.cards?.[0]?.value === 'test@canna.cz', 'public content has override', r.text.slice(0, 160))

r = await http('/admin/api/gallery', {
  method: 'POST',
  headers: { cookie, 'content-type': 'application/json' },
  body: JSON.stringify({ alt: 'test photo', mime: 'image/png', data: PNG_1PX }),
})
const photo = r.status === 200 ? JSON.parse(r.text) : null
ok(r.status === 200 && photo?.id, 'upload photo', `got ${r.status} ${r.text}`)

r = await http('/api/gallery')
const gallery = r.status === 200 ? JSON.parse(r.text) : null
ok(gallery?.items?.length === 1 && gallery.items[0].url.includes('/api/media/photo-'), 'public gallery lists photo', r.text)

if (photo?.id) {
  r = await http(`/api/media/photo-${photo.id}`)
  ok(r.status === 200 && (r.headers.get('content-type') || '').startsWith('image/'), 'media serves photo bytes', `got ${r.status}`)
}

r = await http('/admin/api/image/about', {
  method: 'POST',
  headers: { cookie, 'content-type': 'application/json' },
  body: JSON.stringify({ mime: 'image/png', data: PNG_1PX }),
})
ok(r.status === 200, 'upload image override', `got ${r.status}`)

r = await http('/api/content')
const content2 = r.status === 200 ? JSON.parse(r.text) : null
ok(content2?.images?.about === '/api/media/img-about', 'content exposes image override', r.text)

r = await http('/api/media/img-about')
ok(r.status === 200 && (r.headers.get('content-type') || '').startsWith('image/'), 'media serves image override', `got ${r.status}`)

r = await http('/admin/logout', { method: 'POST' })
ok(r.status === 303, 'logout -> 303', `got ${r.status}`)

// cleanup
r = await http('/admin/login', { method: 'POST', body: `password=${encodeURIComponent(PASSWORD)}`, headers: { 'content-type': 'application/x-www-form-urlencoded' } })
const cookie2 = (r.headers.get('set-cookie') || '').split(';')[0]
if (photo?.id) await http(`/admin/api/gallery/${photo.id}`, { method: 'DELETE', headers: { cookie: cookie2 } })
await http('/admin/api/image/about', { method: 'DELETE', headers: { cookie: cookie2 } })
await http('/admin/api/contacts/cs', { method: 'DELETE', headers: { cookie: cookie2 } })

r = await http(`/api/content?cb=${Date.now()}`)
const content3 = r.status === 200 ? JSON.parse(r.text) : null
ok(!content3?.contacts?.cs && content3?.images?.about === null, 'overrides removed after cleanup', r.text)
r = await http(`/api/gallery?cb=${Date.now()}`)
const gallery2 = r.status === 200 ? JSON.parse(r.text) : null
ok(gallery2?.items?.length === 0, 'gallery empty after cleanup', r.text)

if (SKIP_RL) {
  console.log('--- rate limit skipped (SKIP_RATE_LIMIT=1) ---')
} else {
  // rate limit (last — locks this IP locally)
  console.log('--- rate limit ---')
  for (let i = 1; i <= 5; i++) {
    r = await http('/admin/login', { method: 'POST', body: 'password=nope', headers: { 'content-type': 'application/x-www-form-urlencoded' } })
    ok(r.status === 401, `fail #${i} -> 401`, `got ${r.status}`)
  }
  r = await http('/admin/login', { method: 'POST', body: 'password=nope', headers: { 'content-type': 'application/x-www-form-urlencoded' } })
  ok(r.status === 429, 'fail #6 -> 429 locked', `got ${r.status}`)
  ok((r.headers.get('retry-after') || '').length > 0, '429 has Retry-After')
  r = await http('/admin/login', { method: 'POST', body: `password=${encodeURIComponent(PASSWORD)}`, headers: { 'content-type': 'application/x-www-form-urlencoded' } })
  ok(r.status === 429, 'correct password also 429 while locked', `got ${r.status}`)
}

console.log(`\nresult: ${passed} passed, ${failed} failed`)
process.exit(failed === 0 ? 0 : 1)
