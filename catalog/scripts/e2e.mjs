const BASE = process.env.BASE || 'http://localhost:8789'
const OUT = process.env.OUT || 'C:/Users/Tim/AppData/Local/Temp/opencode/catalog-e2e'
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const SKIP_RL = process.env.SKIP_RATE_LIMIT === '1'

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

const fs = await import('node:fs')
fs.mkdirSync(OUT, { recursive: true })

// каждый прогон — свой «устройство» (IP), чтобы кулдаун 1/час не ломал повторные прогоны
const FAKE_IP = `10.${Math.floor(Math.random() * 200) + 20}.${Math.floor(Math.random() * 250) + 1}.${Math.floor(Math.random() * 250) + 1}`
const FAKE_IP2 = `10.${Math.floor(Math.random() * 200) + 20}.${Math.floor(Math.random() * 250) + 1}.${Math.floor(Math.random() * 250) + 1}`

async function http(path, opts = {}) {
  const res = await fetch(BASE + path, {
    redirect: 'manual',
    ...opts,
    headers: { 'cf-connecting-ip': FAKE_IP, ...(opts.headers ?? {}) },
  })
  let text = ''
  try {
    text = await res.text()
  } catch {
    /* ignore */
  }
  return { status: res.status, text, headers: res.headers }
}

// ---------- UI flow (mobile viewport, RU) ----------
const { chromium } = await import('file:///C:/Users/Tim/canna-cookies/node_modules/playwright-core/index.mjs')
const browser = await chromium.launch({ executablePath: CHROME, headless: true })
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
})
await page.setExtraHTTPHeaders({ 'cf-connecting-ip': FAKE_IP })
await page.addInitScript(() => {
  try {
    localStorage.setItem('cc_app_lang', 'ru')
  } catch {
    /* ignore */
  }
})
const errors = []
page.on('console', (m) => {
  if (m.type() === 'error') {
    // ожидаемый 403: вопрос с устройства, уже сделавшего заказ (проверяем блок)
    if (m.text().includes('Failed to load resource') && m.text().includes('403')) return
    errors.push(m.text())
  }
})
page.on('pageerror', (e) => errors.push(String(e)))

const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)

await page.goto(BASE + '/', { waitUntil: 'networkidle' })

// age gate
ok((await page.locator('text=21').count()) > 0, 'age gate rendered')
await page.screenshot({ path: `${OUT}/c1-age.png` })
await page.click('button:has-text("Да, мне 21+")')

// district gate
await page.waitForSelector('text=Куда доставляем?', { timeout: 8000 })
ok(true, 'district gate rendered')
await page.screenshot({ path: `${OUT}/c2-district.png` })
await page.locator('select').first().selectOption('zona-a')
await page.fill('input[placeholder="Улица, дом, город"]', 'Testovací 1, Praha')
await page.click('button:has-text("Сохранить и продолжить")')

// catalog
await page.waitForSelector('text=Демо-позиции', { timeout: 8000 })
ok(true, 'catalog rendered after gates')
ok((await page.locator('button:has-text("Тестовый товар 1")').count()) > 0, 'product card visible')
ok((await overflow()) === 0, 'no horizontal overflow on catalog', String(await overflow()))
await page.screenshot({ path: `${OUT}/c3-catalog.png` })

// lang switch EN and back
await page.click('button:has-text("EN")')
await page.waitForTimeout(300)
ok((await page.locator('text=Sample items').count()) > 0, 'language switch to EN')
await page.click('button:has-text("RU")')
await page.waitForTimeout(300)

// product sheet
await page.click('button:has-text("Тестовый товар 1")')
await page.waitForSelector('[role="dialog"]', { timeout: 5000 })
ok(true, 'product sheet opened')
await page.screenshot({ path: `${OUT}/c4-product.png` })
await page.locator('[role="dialog"] button[aria-label="+"]').click()
await page.locator('[role="dialog"] button:has-text("В корзину")').click()
await page.waitForSelector('[role="dialog"]', { state: 'detached', timeout: 5000 })
ok(true, 'sheet closed after add')

// cart
await page.click('nav button:has-text("Корзина")')
try {
  await page.waitForSelector('text=Тестовый товар 1', { timeout: 5000 })
} catch (e) {
  console.log('CART DEBUG hash=', await page.evaluate(() => location.hash))
  console.log('CART DEBUG cart=', await page.evaluate(() => localStorage.getItem('cc_app_cart')))
  console.log('CART DEBUG main=', (await page.locator('main').innerText()).slice(0, 400))
  await page.screenshot({ path: `${OUT}/fail-cart.png`, fullPage: true })
  throw e
}
ok(true, 'cart shows item')
ok((await overflow()) === 0, 'no horizontal overflow on cart')
await page.screenshot({ path: `${OUT}/c5-cart.png` })

// checkout
await page.click('button:has-text("К заказу")')
await page.waitForSelector('text=Отправить заказ', { timeout: 5000 })
await page.fill('input[placeholder="Как к вам обращаться"]', 'Jan Novak')
await page.fill('input[placeholder="+420 …"]', '+420111222333')
ok((await page.locator('textarea').count()) > 0, 'comment field present')
await page.screenshot({ path: `${OUT}/c6-checkout.png` })
await page.click('button:has-text("Отправить заказ")')

// confirmation
await page.waitForSelector('text=Заказ принят', { timeout: 8000 })
const orderId = (await page.locator('text=CC-').first().textContent()) ?? ''
ok(orderId.includes('CC-'), 'order confirmation with id', orderId)
ok((await overflow()) === 0, 'no horizontal overflow on confirm')
await page.screenshot({ path: `${OUT}/c7-confirm.png` })

// faq
await page.click('nav button:has-text("FAQ")')
await page.waitForSelector('text=Как оформить заказ?', { timeout: 5000 })
ok(true, 'faq items rendered')
await page.click('button:has-text("Как работает доставка?")')
await page.waitForTimeout(300)
await page.screenshot({ path: `${OUT}/c8-faq.png` })

// feedback
await page.click('nav button:has-text("Контакт")')
await page.waitForSelector('text=Обратная связь', { timeout: 5000 })
await page.fill('input[placeholder="Ваше имя"]', 'Anna')
await page.fill('input[placeholder="+420 … (необязательно)"]', '+420777888999')
await page.fill('input[placeholder="@username (необязательно)"]', 'anna_tg')
await page.fill('textarea[placeholder="Напишите, что произошло…"]', 'Dobry den, zajima me doprava do Prahy 5.')
await page.screenshot({ path: `${OUT}/c9-feedback.png` })
// вопрос с устройства, которое уже делало заказ — блок
await page.click('button:has-text("Отправить")')
await page.waitForSelector('text=Вы уже делали заказ', { timeout: 5000 })
ok(true, 'question blocked after order')
// жалоба с того же устройства — проходит
await page.click('button:has-text("Жалоба")')
await page.click('button:has-text("Отправить")')
await page.waitForSelector('text=Спасибо за сообщение!', { timeout: 5000 })
ok(true, 'feedback submitted as complaint')

// zone chip opens gate
await page.click('header button:has-text("Зона A")')
await page.waitForSelector('text=Куда доставляем?', { timeout: 5000 })
ok(true, 'zone gate reopens from header')
await page.keyboard.press('Escape')
await page.waitForTimeout(300)

ok(errors.length === 0, 'no console errors', JSON.stringify(errors))
await browser.close()

// ---------- API checks ----------
console.log('--- api ---')

let r = await http('/api/catalog')
let cat = null
try {
  cat = JSON.parse(r.text)
} catch {
  /* ignore */
}
ok(r.status === 200 && Array.isArray(cat?.products) && cat.products.length > 0, 'GET /api/catalog', r.text.slice(0, 120))
ok(Array.isArray(cat?.districts) && cat.districts.length > 0, 'catalog has districts')
ok(cat?.faq?.ru?.length > 0 && cat?.faq?.en?.length > 0 && cat?.faq?.cs?.length > 0, 'faq in 3 languages')

r = await http('/api/order', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ items: [], website: 'spam' }),
})
let orderBody = null
try {
  orderBody = JSON.parse(r.text)
} catch {
  /* ignore */
}
ok(r.status === 200 && orderBody?.id === '—', 'honeypot order silently ignored', r.text)

r = await http('/api/order', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    items: [],
    name: 'тест 123',
    phone: '+420000000000',
    address: 'x',
    comment: 'test',
    website: '',
  }),
})
let garbageBody = null
try {
  garbageBody = JSON.parse(r.text)
} catch {
  /* ignore */
}
ok(r.status === 200 && garbageBody?.id === '—', 'garbage order silently ignored', r.text)

r = await http('/api/order', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ items: [], website: '' }),
})
ok(r.status === 400, 'invalid order -> 400', `got ${r.status}`)

r = await http('/api/feedback', {
  method: 'POST',
  headers: { 'content-type': 'application/json', 'cf-connecting-ip': FAKE_IP },
  body: JSON.stringify({ type: 'question', name: 'Anna', text: 'Dobry den, zajima me doprava do Prahy 5.', website: '' }),
})
ok(r.status === 403 && r.text.includes('already-ordered'), 'question after order -> 403', `got ${r.status} ${r.text.slice(0, 80)}`)

r = await http('/api/feedback', {
  method: 'POST',
  headers: { 'content-type': 'application/json', 'cf-connecting-ip': FAKE_IP },
  body: JSON.stringify({ type: 'complaint', name: 'Anna', phone: '+420777888999', tg: 'anna_tg', text: 'Problem s objednavkou, prosim o kontakt.', website: '' }),
})
// 200 — первый заход; 429 — кулдаун 1/час с этого же IP после прошлого прогона
ok(r.status === 200 || r.status === 429, 'complaint after order allowed', `got ${r.status}`)

r = await http('/api/feedback', {
  method: 'POST',
  headers: { 'content-type': 'application/json', 'cf-connecting-ip': FAKE_IP2 },
  body: JSON.stringify({ type: 'question', name: 'Petr', text: 'Dobry den, mám dotaz k doprave.', website: '' }),
})
ok(r.status === 200 || r.status === 429, 'question from fresh device allowed', `got ${r.status}`)

r = await http('/api/feedback', {
  method: 'POST',
  headers: { 'content-type': 'application/json', 'cf-connecting-ip': FAKE_IP2 },
  body: JSON.stringify({ type: 'question', name: 'тест123', text: 'test test', website: '' }),
})
ok(r.status === 200, 'garbage feedback silently ignored', `got ${r.status}`)

if (SKIP_RL) {
  console.log('--- rate limit skipped (SKIP_RATE_LIMIT=1) ---')
} else {
  console.log('--- rate limit ---')
  let saw429 = false
  for (let i = 0; i < 10; i++) {
    r = await http('/api/order', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ items: [], website: '' }),
    })
    if (r.status === 429) {
      saw429 = true
      break
    }
  }
  ok(saw429, 'order rate limit kicks in with 429')
}

console.log(`\nresult: ${passed} passed, ${failed} failed`)
process.exit(failed === 0 ? 0 : 1)
