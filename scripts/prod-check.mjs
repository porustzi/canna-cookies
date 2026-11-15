import { chromium } from 'playwright-core'

const BASE = process.env.BASE || 'https://canna-cookies.pages.dev'
const OUT = 'C:/Users/Tim/AppData/Local/Temp/opencode/shots'
const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
})
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const errors = []
const p = await ctx.newPage()
p.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
p.on('pageerror', (e) => errors.push(`PAGEERROR ${e.message}`))
p.on('requestfailed', (r) => errors.push(`REQFAIL ${r.url()} ${r.failure()?.errorText}`))

await p.goto(`${BASE}/cs/`, { waitUntil: 'networkidle' })
await p.screenshot({ path: `${OUT}/prod-01-gate.png` })
await p.click('.cc-btn-primary')
await p.waitForTimeout(1400)
await p.screenshot({ path: `${OUT}/prod-02-hero.png` })

const fonts = await p.evaluate(() => ({
  h1: getComputedStyle(document.querySelector('h1')).fontFamily,
  body: getComputedStyle(document.body).fontFamily,
  bg: getComputedStyle(document.body).backgroundColor,
}))
console.log('fonts:', JSON.stringify(fonts))

await p.click('header button[title="Русский"]')
await p.waitForTimeout(600)
const ru = await p.evaluate(() => ({
  path: location.pathname,
  title: document.title,
  lang: document.documentElement.lang,
  nav: [...document.querySelectorAll('header nav a')].map((a) => a.textContent.trim()),
}))
console.log('switch to RU:', JSON.stringify(ru, null, 1))
await p.screenshot({ path: `${OUT}/prod-03-ru.png` })

await p.reload({ waitUntil: 'networkidle' })
await p.waitForTimeout(800)
console.log('age persists on prod:', !(await p.$('#age-title')))

await browser.close()
console.log('ERRORS:', errors.length ? errors : 'none')
