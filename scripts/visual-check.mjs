import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'

const BASE = 'http://localhost:4173'
const OUT = 'C:/Users/Tim/AppData/Local/Temp/opencode/shots'
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
})
const errors = []

async function page(ctx, url) {
  const p = await ctx.newPage()
  p.on('console', (m) => m.type() === 'error' && errors.push(`${url} :: ${m.text()}`))
  p.on('pageerror', (e) => errors.push(`${url} :: PAGEERROR ${e.message}`))
  await p.goto(url, { waitUntil: 'networkidle' })
  return p
}

const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })

// 1. age gate on /cs/
let p = await page(ctx, `${BASE}/cs/`)
await p.screenshot({ path: `${OUT}/01-age-gate-cs.png` })
console.log('gate title:', await p.textContent('#age-title'))
console.log('yes/no:', (await p.textContent('.cc-btn-primary'))?.trim(), '/', (await p.textContent('.cc-btn-ghost'))?.trim())

// 2. decline -> blocked screen
await p.click('.cc-btn-ghost')
await p.waitForTimeout(700)
await p.screenshot({ path: `${OUT}/02-denied.png` })
console.log('denied title:', await p.textContent('#age-title'))

// 3. accept from denied
await p.click('.cc-btn-primary')
await p.waitForTimeout(1200)
await p.screenshot({ path: `${OUT}/03-hero.png` })
console.log('hero h1:', (await p.textContent('h1'))?.replace(/\s+/g, ' ').trim())

// 4. full page desktop (scroll through first so reveal animations fire)
await p.evaluate(async () => {
  const total = document.body.scrollHeight
  for (let y = 0; y <= total; y += 350) {
    window.scrollTo({ top: y, behavior: 'instant' })
    await new Promise((r) => setTimeout(r, 70))
  }
  window.scrollTo(0, 0)
})
await p.waitForTimeout(900)
await p.screenshot({ path: `${OUT}/04-full-desktop.png`, fullPage: true })
await p.locator('#about').scrollIntoViewIfNeeded()
await p.waitForTimeout(700)
await p.screenshot({ path: `${OUT}/04b-about.png` })
await p.locator('#delivery').scrollIntoViewIfNeeded()
await p.waitForTimeout(700)
await p.screenshot({ path: `${OUT}/04c-delivery.png` })
await p.locator('#contacts').scrollIntoViewIfNeeded()
await p.waitForTimeout(700)
await p.screenshot({ path: `${OUT}/04d-contacts.png` })
await p.evaluate(() => window.scrollTo(0, 0))

// 5. head checks
const head = await p.evaluate(() => ({
  title: document.title,
  lang: document.documentElement.lang,
  canonical: document.querySelector('link[rel=canonical]')?.href,
  hreflang: [...document.querySelectorAll('link[hreflang]')].map((l) => `${l.hreflang}=${l.href}`),
}))
console.log('HEAD cs:', JSON.stringify(head, null, 1))

// 6. persistence after reload
await p.reload({ waitUntil: 'networkidle' })
await p.waitForTimeout(500)
const stillGate = await p.$('#age-title')
console.log('age persists after reload:', !stillGate)

// 7. language switch (client-side)
await p.click('header [aria-pressed="true"] + button, header button[title="English"]')
await p.waitForTimeout(500)
console.log('after switch url:', new URL(p.url()).pathname, '| title:', await p.title())
await p.screenshot({ path: `${OUT}/05-hero-en.png` })

// 8. hard load /ru/ and /en/
for (const l of ['en', 'ru']) {
  const q = await page(ctx, `${BASE}/${l}/`)
  const data = await q.evaluate(() => ({
    title: document.title,
    lang: document.documentElement.lang,
    canonical: document.querySelector('link[rel=canonical]')?.href,
    h1: document.querySelector('h1')?.textContent?.replace(/\s+/g, ' ').trim(),
  }))
  console.log(`hard ${l}:`, JSON.stringify(data))
  await q.close()
}

// 9. FAQ accordion + catalog link
const p2 = await page(ctx, `${BASE}/cs/`)
const catalogHref = await p2.getAttribute('header a:has-text("OPEN CATALOG")', 'href')
console.log('catalog link:', catalogHref)
await p2.screenshot({ path: `${OUT}/06-catalog-link.png` })

await p2.locator('#faq').scrollIntoViewIfNeeded()
await p2.waitForTimeout(900)
const faqBtns = p2.locator('#faq button[aria-expanded]')
console.log('faq items:', await faqBtns.count())
await faqBtns.nth(2).click()
await p2.waitForTimeout(700)
await p2.screenshot({ path: `${OUT}/07-faq.png` })

// 10. mobile
const m = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
const mp = await page(m, `${BASE}/cs/`)
await mp.waitForTimeout(1000)
await mp.screenshot({ path: `${OUT}/08-mobile-hero.png` })
await mp.click('header button[aria-label="Menu"]')
await mp.waitForTimeout(700)
await mp.screenshot({ path: `${OUT}/09-mobile-menu.png` })
await mp.close()

await browser.close()
console.log('CONSOLE ERRORS:', errors.length ? errors : 'none')
