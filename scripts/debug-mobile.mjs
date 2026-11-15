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

const info = await p.evaluate(() => {
  const btn = document.querySelector('header .cc-btn-primary')
  const burger = document.querySelector('header button[aria-label="Menu"]')
  const overflow = [...document.querySelectorAll('header *')]
    .map((el) => {
      const r = el.getBoundingClientRect()
      return { cls: el.className?.toString().slice(0, 60), right: Math.round(r.right), left: Math.round(r.left) }
    })
    .filter((x) => x.right > window.innerWidth + 1 || x.left < -1)
  return {
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    btn: btn
      ? { display: getComputedStyle(btn).display, visible: !!btn.offsetParent, rect: btn.getBoundingClientRect().toJSON() }
      : null,
    burger: burger
      ? { display: getComputedStyle(burger).display, visible: !!burger.offsetParent, rect: burger.getBoundingClientRect().toJSON() }
      : null,
    overflowingInHeader: overflow,
  }
})
console.log(JSON.stringify(info, null, 2))

const badge = await p.evaluate(() => {
  const pill = document.querySelector('section#top .rounded-full.border')
  const r = pill.getBoundingClientRect()
  return { rect: r.toJSON(), html: pill.outerHTML.slice(0, 500) }
})
console.log(JSON.stringify(badge, null, 2))

await p.screenshot({ path: 'C:/Users/Tim/AppData/Local/Temp/opencode/shots/badge-zoom.png', clip: { x: 0, y: badge.rect.y - 10, width: 390, height: 70 } })
await p.screenshot({ path: 'C:/Users/Tim/AppData/Local/Temp/opencode/shots/header-zoom.png', clip: { x: 0, y: 0, width: 390, height: 80 } })

await browser.close()
