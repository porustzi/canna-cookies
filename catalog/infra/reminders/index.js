// Каждые 5 минут дёргает cron-эндпоинт каталога: напоминания по заказам,
// которые курьеры не взяли. Секрет — CRON_SECRET (wrangler secret put).
const PAGES_URL = 'https://canna-cookies-catalog.pages.dev/api/cron/reminders'

export default {
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(
      fetch(PAGES_URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-cron-secret': env.CRON_SECRET ?? '',
        },
        body: '{}',
      }).catch(() => {}),
    )
  },
}
