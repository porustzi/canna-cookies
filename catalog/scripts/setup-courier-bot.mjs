// Полная настройка курьерского бота под новый токен.
// Usage: ORDER_WEBHOOK_SECRET=<prod secret> node scripts/setup-courier-bot.mjs <token>
// Делает: getMe + скан рискованных слов, нейтральное описание, команды, вебхук, отчёт.
import { readFileSync } from 'node:fs'

const TOKEN = process.argv[2]
if (!TOKEN) {
  console.error('Usage: node scripts/setup-courier-bot.mjs <bot-token>')
  process.exit(1)
}

const WEBHOOK_URL = 'https://canna-cookies-catalog.pages.dev/tg/order'
const SECRET =
  process.env.ORDER_WEBHOOK_SECRET ||
  readFileSync('C:/Users/Tim/AppData/Local/Temp/opencode/order_prod_secret.txt', 'utf8').trim()

// слова, из-за которых Telegram банит бота
const RISK = /canna|каннаб|cannabis|weed|марихуан|гашиш|конопл|нарко|drug|плант|strain|thc|cbd/i

async function api(method, payload) {
  const res = await fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload ?? {}),
    signal: AbortSignal.timeout(10000),
  })
  return res.json()
}

let failed = 0
function ok(cond, name, extra = '') {
  if (cond) console.log(`  ok  ${name}`)
  else {
    failed += 1
    console.log(`FAIL  ${name} ${extra}`)
  }
}

// 1. getMe + риски
const me = await api('getMe')
ok(me.ok, 'getMe')
if (!me.ok) {
  console.error(JSON.stringify(me))
  process.exit(1)
}
const bot = me.result
console.log(`  → @${bot.username} | "${bot.first_name}"`)

const risky = [bot.first_name, bot.username].filter((s) => s && RISK.test(s))
ok(risky.length === 0, 'bot name/username contain no risky words', `FOUND: ${risky.join(', ')}`)
if (risky.length > 0) {
  console.log('  ⚠️ Переименуй бота в BotFather — убери эти слова из имени и username.')
}

// 2. нейтральный профиль (перезаписывает любое старое описание)
const short = await api('setMyShortDescription', { short_description: 'Заказы и доставка для курьеров.' })
ok(short.ok, 'setMyShortDescription', JSON.stringify(short))

const desc = await api('setMyDescription', {
  description: 'Новые заказы с кнопками, статистика и подтверждение доставки. Команды: /start, /me, /help.',
})
ok(desc.ok, 'setMyDescription', JSON.stringify(desc))

const cmds = await api('setMyCommands', {
  commands: [
    { command: 'start', description: 'Вход / регистрация' },
    { command: 'me', description: 'Мой кабинет и статистика' },
    { command: 'help', description: 'Справка' },
  ],
})
ok(cmds.ok, 'setMyCommands', JSON.stringify(cmds))

// 3. вебхук
const wh = await api('setWebhook', { url: WEBHOOK_URL, secret_token: SECRET })
ok(wh.ok, 'setWebhook', JSON.stringify(wh))

const info = await api('getWebhookInfo')
ok(info.ok && info.result.url === WEBHOOK_URL && info.result.pending_update_count === 0, 'webhook wired', JSON.stringify(info.result))

// 4. отчёт
const profile = await api('getMyDescription')
const shortProfile = await api('getMyShortDescription')
console.log('\n--- профиль бота сейчас ---')
console.log('name:', bot.first_name)
console.log('short:', shortProfile.result?.short_description)
console.log('desc:', profile.result?.description)
console.log(`webhook: ${info.result?.url}`)
console.log(failed === 0 ? '\nALL OK — осталось: wrangler secrets + deploy + /start курьерам' : `\n${failed} FAILED`)
process.exit(failed ? 1 : 0)
