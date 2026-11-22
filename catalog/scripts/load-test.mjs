// Load test: local mixed traffic (100 users) or prod read-only mode.
// Usage: node load-test.mjs [local|prod]
const MODE = process.argv[2] || 'local'
const BASE = MODE === 'prod' ? 'https://canna-cookies-catalog.pages.dev' : 'http://localhost:8789'

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

const results = []
async function hit(label, url, init, expect) {
  const t0 = performance.now()
  try {
    const res = await fetch(url, init)
    const ms = performance.now() - t0
    results.push({ label, status: res.status, ms })
    await res.text().catch(() => '')
    if (expect.includes(res.status)) return { status: res.status }
    return { status: res.status, unexpected: true }
  } catch (e) {
    results.push({ label, status: 0, ms: performance.now() - t0 })
    return { status: 0, error: String(e) }
  }
}

const N = MODE === 'prod' ? 100 : 100
const jobs = []

for (let i = 0; i < N; i++) {
  const ip = `10.${20 + (i % 200)}.${i % 250}.${(i * 7) % 250 + 1}`

  if (MODE === 'prod') {
    // prod: только безопасные чтения (без записи, без брутфорса).
    //429 = сработали per-IP блокировки брутфорса — это защита, не отказ.
    if (i % 5 === 0) jobs.push(hit('catalog', `${BASE}/api/catalog`, {}, [200]))
    else if (i % 5 === 1) jobs.push(hit('home', `${BASE}/`, {}, [200]))
    else if (i % 5 === 2) jobs.push(hit('admin-shell', `${BASE}/admin/`, {}, [200]))
    else if (i % 5 === 3) jobs.push(hit('myorders-401', `${BASE}/api/myorders?tg=1`, {}, [401, 429]))
    else jobs.push(hit('order-404', `${BASE}/api/order/CC-PROBEXX`, {}, [404, 429]))
    continue
  }

  // local: полный смешанный поток
  if (i % 5 === 0) {
    jobs.push(hit('catalog', `${BASE}/api/catalog`, {}, [200]))
  } else if (i % 5 === 1) {
    jobs.push(
      hit(
        'order',
        `${BASE}/api/order`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'cf-connecting-ip': ip },
          body: JSON.stringify({
            items: [{ productId: 'p1', weight: '3.5 g', qty: 1 }],
            districtId: 'zona-a',
            address: `Loadova ${i}, Praha`,
            name: `Customer ${i}`,
            phone: `+420${String(10000000 + i)}`,
            tg: `load_user_${i}`,
            payment: 'Cash',
            comment: '',
            lang: 'ru',
            website: '',
          }),
        },
        [200],
      ),
    )
  } else if (i % 5 === 2) {
    jobs.push(
      hit(
        'feedback',
        `${BASE}/api/feedback`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'cf-connecting-ip': ip },
          body: JSON.stringify({
            type: 'question',
            name: `Citizen ${i}`,
            tg: `load_user_${i}`,
            text: 'Overeni zatizeni systemu, dekuji za pozornost.',
            website: '',
          }),
        },
        [200],
      ),
    )
  } else if (i % 5 === 3) {
    jobs.push(hit('order-404', `${BASE}/api/order/CC-LOAD${i}XX`, { headers: { 'cf-connecting-ip': ip } }, [404]))
  } else {
    jobs.push(hit('myorders-401', `${BASE}/api/myorders?tg=1`, { headers: { 'cf-connecting-ip': ip } }, [401]))
  }
}

console.log(`--- load: ${MODE}, ${jobs.length} concurrent requests ---`)
const wall0 = performance.now()
const out = await Promise.all(jobs)
const wall = performance.now() - wall0

const unexpected = out.filter((o) => o.unexpected || o.error)
const byStatus = {}
for (const r of results) byStatus[r.status] = (byStatus[r.status] ?? 0) + 1
const times = results.map((r) => r.ms).sort((a, b) => a - b)
const p = (q) => times[Math.min(times.length - 1, Math.floor(times.length * q))]

console.log('statuses:', JSON.stringify(byStatus))
console.log(`latency: p50=${p(0.5).toFixed(0)}ms p95=${p(0.95).toFixed(0)}ms max=${times[times.length - 1].toFixed(0)}ms | wall=${wall.toFixed(0)}ms`)

ok(unexpected.length === 0, `no unexpected responses (${jobs.length} req)`, JSON.stringify(unexpected.slice(0, 5)))
const fivexx = results.filter((r) => r.status >= 500 || r.status === 0)
ok(fivexx.length === 0, 'no5xx / no network failures', JSON.stringify(fivexx.slice(0, 5)))

console.log(`${passed} passed, ${failed} failed`)
process.exit(failed ? 1 : 0)
