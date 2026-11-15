# CANNA COOKIES — Этап 1 (сайт-визитка)

**DON'T PANIC, IT'S ORGANIC.** Премиальный тёмный сайт бренда CBD-продукции (Чехия, дистрибьютор CALIFARMS).

- Прод: https://canna-cookies.pages.dev
- GitHub: https://github.com/porustzi/canna-cookies
- Стек: **React 19 + TypeScript + Vite 8 + Tailwind CSS 4 + Framer Motion**
- Хостинг: **Cloudflare Pages** (статика, без Functions на этом этапе)

---

## Страницы и маршруты

| Путь  | Язык            | hreflang                          |
|-------|-----------------|-----------------------------------|
| `/cs/`| Čeština (основной) | `cs` + `x-default`             |
| `/en/`| English         | `en`                              |
| `/ru/`| Русский         | `ru`                              |

Каждый язык — отдельный статический HTML (`cs/index.html`, `en/index.html`, `ru/index.html`) со своим
`<title>`, `meta description`, `og:*`, `canonical`, `hreflang` и JSON-LD. Корневой `/` редиректит на
сохранённый/системный язык (`localStorage cc_lang` → `navigator.language` → `cs`).

Переключатель CS / EN / RU в Header и Footer работает без перезагрузки (history API), скролл и хэш
сохраняются; при жёсткой загрузке URL тот же. `robots.txt`, `sitemap.xml`, `favicon.svg` — в `public/`.

## Секции

Hero (21+ бейдж, marquee, орбитальный визуал) → About (01) → Why choose us (02) → Delivery (03) →
Catalog / Telegram (04) → FAQ (05) → Contacts (06) → Footer. Мобильное меню, sticky-хедер с активным
разделом, карточки со свечением по курсору, reveal-анимации, `prefers-reduced-motion`.

## Возрастное окно 21+

- Полноэкранный гейт при первом визите: **YES, ENTER** / **NO, EXIT** (локализовано на 3 языка).
- Подтверждение сохраняется в `localStorage` (`cc_age_v1 = ok`) между посещениями.
- Отказ → `cc_age_v1 = denied` → отдельный экран **«Доступ ограничен»**: контент сайта не рендерится,
  скролл заблокирован; выход только через честную кнопку подтверждения возраста.

## Telegram (заглушки)

Кнопки **OPEN CATALOG** (Header, Hero, Catalog, Footer, мобильное меню) открывают модальное окно
**Coming Soon** — это рабочая микроинтеракция, а не мёртвая кнопка. Реального каталога на этом этапе нет:
архитектура оставляет место под Telegram Mini App ( Этап 3), backend (Этап 4), бота (Этап 5).

## Команды

```bash
npm install
npm run dev        # локальный dev
npm run build      # tsc + vite build → dist/
npm run preview    # превью dist на :4173
npm run lint       # oxlint
npm run check:visual  # headless-проверка UI (требует локального Chrome)
npm run deploy     # wrangler pages deploy dist (нужен wrangler login)
```

## Деплой

**Сейчас (прямая загрузка):**

```bash
npx wrangler pages project create canna-cookies --production-branch=main   # один раз
npm run build && npm run deploy
```

**Автоматический деплой (рекомендуется, даёт Preview Deployments и откат):**
Cloudflare Dashboard → Workers & Pages → `canna-cookies` → Settings → **Deployments → Connect to Git**
→ GitHub → `porustzi/canna-cookies`:
- Build preset: **Vite**, build command `npm run build`, output `dist`
- каждый PR/ветка = Preview Deployment, `main` = Production
- откат: Deployments → нужный деплой → **Rollback**

**GitHub Actions:** `.github/workflows/deploy.yml` готов — добавьте в репозиторий secrets
`CLOUDFLARE_API_TOKEN` (права: Account → Cloudflare Pages → Edit) и `CLOUDFLARE_ACCOUNT_ID`
(`d8dd2eab287e01726a07d34a5f90e9fe`). Push в `main` → production, ветка PR → preview-деплой.

**Свой домен (Этап 2):** Dashboard → `canna-cookies` → Custom domains → Add domain → DNS на Cloudflare
(или CNAME на `canna-cookies.pages.dev`). После подключения домена заменить канонические URL в
`src/i18n.ts` (`SITE_URL`), `cs/en/ru/index.html`, `public/sitemap.xml` и `robots.txt`.

## GDPR / законодательство Чехии (проверено на этапе 1)

- **Закон č. 65/2017 Sb.** (o ochraně zdraví před účinky návykových látek): запрет продажи никотиновых,
  курильных и травяных изделий для курения лицам младше **18 лет** (§ 3, § 4, § 16a); обязательные
  видимые надписи о запрете продажи до 18 лет (§ 5 odst. 2, § 16b odst. 2, письменно, чёрным по белому,
  ≥ 2 см); **дистанционная продажа** требует системы электронной проверки возраста и уведомления
  Минздрава (§ 6). Эти правила касаются торговли — применяются при запуске продаж (Этап 3+),
  на этапе 1 сайт только информационный.
- **Порог 21+ — добровольная, более строгая политика бренда** (не требование закона). Гейт —
  подтверждение пользователем, не «проверка возраста» в юридическом смысле; при старте продаж нужна
  отдельная система age-gate для e-shop/Mini App (консультация юриста).
- **CBD и claims:** без лечебных утверждений (мед. твёрдения запрещены), без числовых спецификаций,
  которые не подтверждены; статус CBD как novel food (EU) проверить перед коммерческим запуском.
- **GDPR/ePrivacy:** сейчас используются только `localStorage` (язык + подтверждение возраста) —
  рекламных/отслеживающих cookie и аналитики нет, поэтому cookie-баннер не требуется. При подключении
  аналитики/рекламы добавить consent-banner и политику обработки данных (v Slovensku/ČR — ÚOOÚ).
- **Заглушки вместо выдуманных данных:** контакты, цены, зоны доставки, адреса — явно помечены
  «Ve fázi 2 / Coming soon», ничего не имитируется.

## Структура

```
index.html            → редирект на язык
cs/ en/ ru/index.html → MPA-входы (hreflang, мета, JSON-LD)
src/
  main.tsx            → выбор языка, вход приложения
  App.tsx             → контекст, гейт, SEO-мета, модалка
  i18n.ts             → все тексты CS/EN/RU + SEO-маппинг
  styles/index.css    → дизайн-система (Tailwind @theme, карточки, свечение)
  components/         → Header, Hero, About, Why, Delivery, Catalog, Faq,
                        Contacts, Footer, AgeGate, ComingSoon, Logo, Icons, ui
public/               → robots.txt, sitemap.xml, favicon.svg
scripts/              → visual-check.mjs (playwright-core, системный Chrome)
```

## Что осталось заглушками (Этап 2)

1. Реальные контакты (e-mail, Telegram, Instagram, адрес).
2. Фотографии продукта/команды, финальные тексты «О нас».
3. Зоны доставки, цены, сроки, адрес пункта выдачи.
4. Свои домен + обновление canonical/sitemap.
5. GDPR-политика и cookie-consent (когда появится аналитика).
