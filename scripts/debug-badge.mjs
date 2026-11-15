import { chromium } from 'playwright-core'

const BASE = 'http://localhost:4173'
const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
})
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
const p = await ctx.newPage()
await p.goto(`${BASE}/cs/`, { waitUntil: 'networkidle' })
await p.click('.cc-btn-primary')
await p.waitForTimeout(900)

const badge = p.locator('section#top span', { hasText: 'CZECH REPUBLIC' }).first()
await badge.screenshot({ path: 'C:/Users/Tim/AppData/Local/Temp/opencode/shots/badge-el.png' })
const box = await badge.boundingBox()
console.log('badge box:', JSON.stringify(box))
await p.screenshot({
  path: 'C:/Users/Tim/AppData/Local/Temp/opencode/shots/badge-zoom.png',
  clip: { x: 0, y: Math.max(0, box.y - 25), width: 390, height: 90 },
})

const layout = await p.evaluate(() => ({
  innerWidth: window.innerWidth,
  scrollWidth: document.documentElement.scrollWidth,
  logoW: document.querySelector('header a')?.getBoundingClientRect().width,
  switchW: document.querySelector('header [role=group]')?.getBoundingClientRect().width,
  switchBtnPadding: getComputedStyle(document.querySelector('header [role=group] button')).padding,
  shellPad: getComputedStyle(document.querySelector('header .cc-shell')).paddingInline,
  groupLeft: document.querySelector('header .flex.items-center.gap-3')?.getBoundingClientRect().left,
}))
console.log('layout:', JSON.stringify(layout, null, 1))

await browser.close()
