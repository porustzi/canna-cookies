# CANNA COOKIES

**English:** Premium CBD brand website (Czechia, CALIFARMS distributor) — multi-language landing, age gate, catalog with Telegram order flow, admin panel, and courier bot.  
**Русский:** Премиальный сайт бренда CBD-продукции (Чехия, дистрибьютор CALIFARMS) — мультиязычный лендинг, возрастной гейт, каталог с заказом через Telegram, админка и бот курьера.

→ **Live:** [canna-cookies.pages.dev](https://canna-cookies.pages.dev) · **DON'T PANIC, IT'S ORGANIC.**

---

## English

Full e-commerce stack for a CBD brand:

### What's inside

| Layer | Details |
|-------|---------|
| **Marketing site** | CS / EN / RU static pages, hreflang, JSON-LD, age gate 21+, SEO |
| **Catalog SPA** | React + TypeScript product catalog, cart, i18n |
| **API (Cloudflare Workers)** | Orders, reviews, feedback, dispute, cron reminders, rate limiting |
| **Admin panel** | Password login, product/order management |
| **Telegram bots** | Order notifications + courier delivery flow, webhooks, initData auth |
| **Security** | initData validation, security headers, constant-time secrets, ID brute-force lock, CSV/injection guards |

### Stack

React 19 · TypeScript · Vite · Tailwind CSS 4 · Framer Motion · Cloudflare Pages & Workers · Telegram Bot API

### Structure

```
index.html            — root redirect / language pick
cs/ en/ ru/           — localized marketing pages
src/                  — React app (Header, Hero, Catalog, FAQ, AgeGate…)
catalog/              — shop SPA + Cloudflare Functions (API, admin, tg bots)
  functions/api/      — order, reviews, myorders, dispute, cron…
  functions/tg/       — order & courier webhooks
  functions/admin/    — admin API + login
admin/                — admin UI entry
scripts/              — visual / e2e / security checks
```

### Commands

```bash
npm install
npm run dev           # local dev
npm run build         # tsc + vite build → dist/
npm run lint          # oxlint
npm run check:visual  # headless UI check (needs Chrome)
npm run deploy        # wrangler pages deploy dist
```

### Deploy

Cloudflare Pages (direct upload or Git integration). Secrets via `.dev.vars` (gitignored): admin password, Telegram tokens, cron secret.

---

## Русский

Полный стек интернет-магазина для CBD-бренда:

- **Маркетинговый сайт:** CS / EN / RU, hreflang, JSON-LD, age-gate 21+, SEO
- **Каталог:** React + TypeScript, корзина, i18n
- **API на Cloudflare Workers:** заказы, отзывы, споры, cron-напоминания, rate-limit
- **Админка:** вход по паролю, управление товарами и заказами
- **Telegram-боты:** уведомления о заказах + доставка курьером, webhooks, initData
- **Безопасность:** валидация initData, security headers, constant-time secrets, защита от brute-force и CSV/injection

### Стек

React 19 · TypeScript · Vite · Tailwind CSS 4 · Framer Motion · Cloudflare Pages & Workers · Telegram Bot API

---

Built by [porustzi](https://github.com/porustzi) · [krvtsv corp](https://krvtsvcorp.pp.ua)
