export type Lang = 'cs' | 'en' | 'ru'

export const LANGS: { code: Lang; label: string; name: string }[] = [
  { code: 'cs', label: 'CS', name: 'Čeština' },
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'ru', label: 'RU', name: 'Русский' },
]

export const DEFAULT_LANG: Lang = 'cs'

export function parseLang(pathname: string): Lang {
  const seg = pathname.split('/')[1]
  return seg === 'en' || seg === 'ru' || seg === 'cs' ? seg : DEFAULT_LANG
}

export interface FaqItem {
  q: string
  a: string
}

export interface WhyItem {
  icon: 'leaf' | 'layers' | 'shield' | 'map' | 'lock' | 'send'
  title: string
  text: string
  gallery?: boolean
  cta?: string
}

export interface DeliveryRow {
  label: string
  status: string
}

export interface Dict {
  nav: { about: string; why: string; delivery: string; faq: string; contacts: string }
  header: { catalog: string; menu: string; close: string; lang: string }
  hero: {
    badge: string
    titleTop: string
    titleBottom: string
    lead: string
    cta: string
    secondary: string
    scroll: string
    strip: string[]
    teaser: string
  }
  about: {
    eyebrow: string
    title: string
    lead: string
    p1: string
    p2: string
    p3: string
    principles: { k: string; title: string; text: string }[]
    partnerLabel: string
    partnerName: string
    partnerCta: string
  }
  why: { eyebrow: string; title: string; lead: string; items: WhyItem[] }
  delivery: {
    eyebrow: string
    title: string
    lead: string
    cards: { title: string; badge: string; text: string; rows: DeliveryRow[] }[]
    note: string
  }
  catalog: { eyebrow: string; title: string; text: string; cta: string; badge: string }
  faq: { eyebrow: string; title: string; lead: string; items: FaqItem[] }
  contacts: {
    eyebrow: string
    title: string
    lead: string
    cards: { label: string; value: string; status: string }[]
    note: string
  }
  footer: {
    tagline: string
    navLabel: string
    langLabel: string
    legal1: string
    legal2: string
    legal3: string
    gdpr: string
    rights: string
    stage: string
  }
  age: {
    kicker: string
    title: string
    text: string
    legal: string
    yes: string
    no: string
    deniedTitle: string
    deniedText: string
  }
  modal: { badge: string; title: string; text: string; close: string }
  gallery: { badge: string; title: string; text: string; close: string }
}

const cs: Dict = {
  nav: { about: 'O nás', why: 'Proč my', delivery: 'Doručení', faq: 'FAQ', contacts: 'Kontakty' },
  header: { catalog: 'OPEN CATALOG', menu: 'Menu', close: 'Zavřít', lang: 'Jazyk' },
  hero: {
    badge: 'CBD · CZECH REPUBLIC · 21+',
    titleTop: "DON'T PANIC,",
    titleBottom: "IT'S ORGANIC.",
    lead: 'Prémiová CBD značka z České republiky. Organický základ, čisté složení a klid v hlavě — žádná panika.',
    cta: 'OPEN CATALOG',
    secondary: 'Objevte značku',
    scroll: 'SCROLL',
    strip: ["DON'T PANIC", "IT'S ORGANIC", '21+ ONLY', 'CZECH REPUBLIC', 'CALIFARMS PARTNER'],
    teaser: 'Katalog v Telegramu — připravujeme',
  },
  about: {
    eyebrow: '01 — About us',
    title: 'O nás',
    lead: 'Značka, která nekřičí. Jen si stojí za tím, co dává dovnitř.',
    p1: 'CANNA COOKIES je samostatná maloobchodní značka CBD produktů působící v České republice.',
    p2: 'Pracujeme s distributorem CALIFARMS a věříme v jednoduchou rovnici: méně huku, více obsahu. Složení, původ a dlouhodobá důvěra jsou důležitější než rychlé sliby.',
    p3: 'Kompletní příběh značky, fotografie a konkrétní specifikace doplníme ve druhé etapě — po odsouhlasení designu.',
    principles: [
      { k: '01', title: 'Organický přístup', text: 'Přirozené složení a vybrané suroviny místo zbytečných přísad.' },
      { k: '02', title: 'Transparentní složení', text: 'U každého produktu jasně uvedené informace o obsahu a použití.' },
      { k: '03', title: 'Klidná mysl', text: 'DON’T PANIC, IT’S ORGANIC — přístup, který platí pro produkty i komunikaci.' },
    ],
    partnerLabel: 'Distribuce',
    partnerName: 'CALIFARMS',
    partnerCta: 'califarms.cz',
  },
  why: {
    eyebrow: '02 — Why choose us',
    title: 'Proč zvolit nás',
    lead: 'Šest důvodů, proč dává smysl držet se jedné značky.',
    items: [
      { icon: 'leaf', title: 'Organický základ', text: 'Sázíme na přirozené složení a suroviny, kterým rozumíme.' },
      { icon: 'layers', title: 'Složení bez tajemství', text: 'Žádné drobné písmo. Každý produkt má jasně popsán obsah.' },
      { icon: 'shield', title: 'Kontrola kvality', text: 'Spolupracujeme s osvědčenými dodavateli a postupy, které dávají smysl.' },
      { icon: 'map', title: 'Fyzický bod', text: 'Máme vlastní prodejní místo v ČR — vše legálně, kontrolovaně a podle místních pravidel.', gallery: true, cta: 'Prohlédnout fotky' },
      { icon: 'lock', title: 'Pouze 21+', text: 'Prodej výhradně plnoletým — hranici 21 let jsme stanovili sami.' },
      { icon: 'send', title: 'Katalog v Telegramu', text: 'Připravujeme Telegram Mini App s katalogem, košíkem a objednávkami.' },
    ],
  },
  delivery: {
    eyebrow: '03 — Delivery',
    title: 'Doručení a vyzvednutí',
    lead: 'Logistiku stavíme tak, aby odpovídala tempu značky. Přesné podmínky zveřejníme před spuštěním prodeje.',
    cards: [
      {
        title: 'Doručení po ČR',
        badge: 'Připravujeme',
        text: 'Stavíme službu doručení po celé České republice.',
        rows: [
          { label: 'Zóny doručení', status: 'brzy' },
          { label: 'Ceník', status: 'brzy' },
          { label: 'Termíny', status: 'brzy' },
        ],
      },
      {
        title: 'Osobní odběr',
        badge: 'Připravujeme',
        text: 'Místo a časy vyzvednutí doplníme po odsouhlasení provozovny.',
        rows: [
          { label: 'Adresa odběru', status: 'brzy' },
          { label: 'Otevírací doba', status: 'brzy' },
          { label: 'Rezervace termínu', status: 'brzy' },
        ],
      },
    ],
    note: 'Zóny, ceny a termíny zveřejníme ve fázi 2. Mezitím sledujte Telegram katalog.',
  },
  catalog: {
    eyebrow: '04 — Catalog',
    title: 'Katalog v Telegramu',
    text: 'Katalog, košík a objednávky budou součástí Telegram Mini App. Pracujeme na tom — první verze dorazí ve fázi 3.',
    cta: 'OPEN CATALOG',
    badge: 'Coming soon',
  },
  faq: {
    eyebrow: '05 — FAQ',
    title: 'Časté dotazy',
    lead: 'Stručně a bez obalu. Co víme, to píšeme.',
    items: [
      {
        q: 'Co je CANNA COOKIES?',
        a: 'CANNA COOKIES je samostatná maloobchodní značka CBD produktů z České republiky. Pracujeme s distributorem CALIFARMS.',
      },
      {
        q: 'Pro koho je web určen?',
        a: 'Pouze pro osoby starší 21 let. Při první návštěvě vás požádáme o potvrzení věku; bez potvrzení není obsah dostupný.',
      },
      {
        q: 'Kde si produkty koupím?',
        a: 'Připravujeme katalog v Telegramu s objednávkami a doručením. Spuštění oznámíme — žádná funkce nebude nefunkční.',
      },
      {
        q: 'Jak probíhá doručení?',
        a: 'Zóny, ceny a termíny zveřejníme ve fázi 2. Připravujeme doručení po ČR i osobní odběr.',
      },
      {
        q: 'Jsou produkty léčivé?',
        a: 'Ne. CBD produkty nejsou léčivé přípravky a nenahrazují lékařskou péči. Žádné zdravotní účinky neuvádíme.',
      },
      {
        q: 'Jak nakládáte s osobními údaji?',
        a: 'Web nepoužívá reklamní ani sledovací cookies. Ukládáme pouze jazyk a potvrzení věku (localStorage). GDPR zásady doplníme ve fázi 2.',
      },
      {
        q: 'Bude plný e-shop?',
        a: 'Ano — v plánu je obchod přes Telegram Mini App (katalog, košík, objednávky) a následně backend s administrací.',
      },
    ],
  },
  contacts: {
    eyebrow: '06 — Contacts',
    title: 'Kontakty',
    lead: 'Jsme na příjmu. Kontaktní údaje doplníme spolu s finálním designem.',
    cards: [
      { label: 'E-mail', value: '—', status: 'Ve fázi 2' },
      { label: 'Telegram', value: '—', status: 'Ve fázi 2' },
      { label: 'Instagram', value: '—', status: 'Ve fázi 2' },
      { label: 'Sídlo', value: 'Česká republika', status: 'Adresa ve fázi 2' },
    ],
    note: 'Nesimulujeme údaje, které ještě nemáme. Reálné kontakty, fotografie a texty doplníme ve druhé etapě.',
  },
  footer: {
    tagline: "DON'T PANIC, IT'S ORGANIC.",
    navLabel: 'Navigace',
    langLabel: 'Jazyk',
    legal1: 'Obsah webu je určen výhradně osobám starším 21 let.',
    legal2: 'CBD produkty nejsou léčivé přípravky a nejsou určeny k diagnostice, léčbě ani prevenci nemocí.',
    legal3: 'Značka: CANNA COOKIES · Distribuce: CALIFARMS',
    gdpr: 'GDPR: web používá pouze nezbytné lokální úložiště (jazyk, potvrzení věku). Žádné sledovací cookies.',
    rights: '© 2026 CANNA COOKIES. Všechna práva vyhrazena.',
    stage: 'Etapa 1 — prezentace',
  },
  age: {
    kicker: 'Vstup pouze pro dospělé',
    title: 'Je vám 21 let?',
    text: 'Tento web a produkty CANNA COOKIES jsou určeny výhradně osobám starším 21 let.',
    legal: 'Potvrzením prohlašujete, že vám bylo alespoň 21 let a že splňujete podmínky platné ve vašem regionu. CBD produkty nejsou léčivé přípravky.',
    yes: 'ANO, VSTOUPIT',
    no: 'NE, ODEJÍT',
    deniedTitle: 'Přístup omezen',
    deniedText: 'Obsah je dostupný pouze plnoletým návštěvníkům. Pokud je vám alespoň 21 let, můžete potvrdit vstup.',
  },
  modal: {
    badge: 'Coming soon',
    title: 'Katalog připravujeme',
    text: 'Telegram Mini App s katalogem, košíkem a objednávkami je ve vývoji (etapa 3). Spuštění oznámíme na našich kanálech.',
    close: 'Rozumím',
  },
  gallery: {
    badge: 'Galerie',
    title: 'Fotky našeho místa',
    text: 'Fotografie prodejního místa právě připravujeme — galerie se brzy doplní.',
    close: 'Zavřít',
  },
}

const en: Dict = {
  nav: { about: 'About', why: 'Why us', delivery: 'Delivery', faq: 'FAQ', contacts: 'Contacts' },
  header: { catalog: 'OPEN CATALOG', menu: 'Menu', close: 'Close', lang: 'Language' },
  hero: {
    badge: 'CBD · CZECH REPUBLIC · 21+',
    titleTop: "DON'T PANIC,",
    titleBottom: "IT'S ORGANIC.",
    lead: 'A premium CBD brand from the Czech Republic. Organic foundation, clean composition and a calm head — no panic.',
    cta: 'OPEN CATALOG',
    secondary: 'Discover the brand',
    scroll: 'SCROLL',
    strip: ["DON'T PANIC", "IT'S ORGANIC", '21+ ONLY', 'CZECH REPUBLIC', 'CALIFARMS PARTNER'],
    teaser: 'Telegram catalogue — coming soon',
  },
  about: {
    eyebrow: '01 — About us',
    title: 'About us',
    lead: 'A brand that does not shout. It simply stands for what it puts inside.',
    p1: 'CANNA COOKIES is an independent retail CBD brand operating in the Czech Republic.',
    p2: 'We work with distributor CALIFARMS and believe in a simple equation: less noise, more content. Composition, origin and long-term trust matter more than quick promises.',
    p3: 'The complete brand story, photography and specific specifications will be added in stage 2 — after the design is approved.',
    principles: [
      { k: '01', title: 'Organic approach', text: 'Natural composition and selected ingredients instead of unnecessary additives.' },
      { k: '02', title: 'Transparent composition', text: 'Clear information about contents and use for every single product.' },
      { k: '03', title: 'Calm mind', text: 'DON’T PANIC, IT’S ORGANIC — an attitude that applies to products and communication alike.' },
    ],
    partnerLabel: 'Distribution',
    partnerName: 'CALIFARMS',
    partnerCta: 'califarms.cz',
  },
  why: {
    eyebrow: '02 — Why choose us',
    title: 'Why choose us',
    lead: 'Six reasons why staying with one brand makes sense.',
    items: [
      { icon: 'leaf', title: 'Organic foundation', text: 'We rely on natural composition and ingredients we understand.' },
      { icon: 'layers', title: 'No hidden details', text: 'No fine print. Every product has clearly described contents.' },
      { icon: 'shield', title: 'Quality control', text: 'We work with proven suppliers and procedures that make sense.' },
      { icon: 'map', title: 'Physical point', text: 'Our own point of sale in the CZ — everything is legal, controlled and by the local rules.', gallery: true, cta: 'View photos' },
      { icon: 'lock', title: '21+ only', text: 'Sales strictly to adults — we set the 21+ threshold ourselves.' },
      { icon: 'send', title: 'Telegram catalogue', text: 'A Telegram Mini App with catalogue, cart and ordering is in the works.' },
    ],
  },
  delivery: {
    eyebrow: '03 — Delivery',
    title: 'Delivery & pickup',
    lead: 'We are building logistics at the brand’s own pace. Exact terms will be published before sales start.',
    cards: [
      {
        title: 'Delivery across CZ',
        badge: 'Coming soon',
        text: 'We are building a delivery service covering the entire Czech Republic.',
        rows: [
          { label: 'Delivery zones', status: 'soon' },
          { label: 'Pricing', status: 'soon' },
          { label: 'Timeframes', status: 'soon' },
        ],
      },
      {
        title: 'Personal pickup',
        badge: 'Coming soon',
        text: 'Pickup location and hours will be added once the venue is approved.',
        rows: [
          { label: 'Pickup address', status: 'soon' },
          { label: 'Opening hours', status: 'soon' },
          { label: 'Slot booking', status: 'soon' },
        ],
      },
    ],
    note: 'Zones, prices and timeframes will be published in stage 2. Meanwhile, watch the Telegram catalogue.',
  },
  catalog: {
    eyebrow: '04 — Catalog',
    title: 'Catalogue in Telegram',
    text: 'Catalogue, cart and orders will live inside a Telegram Mini App. We are building it — the first version arrives in stage 3.',
    cta: 'OPEN CATALOG',
    badge: 'Coming soon',
  },
  faq: {
    eyebrow: '05 — FAQ',
    title: 'Frequently asked',
    lead: 'Short and straight. If we know it, we write it.',
    items: [
      {
        q: 'What is CANNA COOKIES?',
        a: 'CANNA COOKIES is an independent retail CBD brand from the Czech Republic. We work with distributor CALIFARMS.',
      },
      {
        q: 'Who is this website for?',
        a: 'Persons aged 21 and over only. On your first visit we ask you to confirm your age; without confirmation the content stays locked.',
      },
      {
        q: 'Where can I buy the products?',
        a: 'We are preparing a Telegram catalogue with ordering and delivery. We will announce the launch — nothing will ship half-working.',
      },
      {
        q: 'How does delivery work?',
        a: 'Zones, prices and timeframes will be published in stage 2. Both delivery across CZ and personal pickup are being prepared.',
      },
      {
        q: 'Are the products medicinal?',
        a: 'No. CBD products are not medicines and do not replace medical care. We make no health claims.',
      },
      {
        q: 'How do you handle personal data?',
        a: 'The site uses no advertising or tracking cookies. We only store your language choice and age confirmation (localStorage). Full GDPR terms arrive in stage 2.',
      },
      {
        q: 'Will there be a full shop?',
        a: 'Yes — the plan is a store inside Telegram Mini App (catalogue, cart, orders), followed by a backend with an admin panel.',
      },
    ],
  },
  contacts: {
    eyebrow: '06 — Contacts',
    title: 'Contacts',
    lead: 'We are reachable. Contact details will be added together with the final design.',
    cards: [
      { label: 'E-mail', value: '—', status: 'Stage 2' },
      { label: 'Telegram', value: '—', status: 'Stage 2' },
      { label: 'Instagram', value: '—', status: 'Stage 2' },
      { label: 'HQ', value: 'Czech Republic', status: 'Address in stage 2' },
    ],
    note: 'We do not simulate data we do not have yet. Real contacts, photography and copy arrive in stage 2.',
  },
  footer: {
    tagline: "DON'T PANIC, IT'S ORGANIC.",
    navLabel: 'Navigation',
    langLabel: 'Language',
    legal1: 'This website is intended exclusively for persons aged 21 and over.',
    legal2: 'CBD products are not medicines and are not intended to diagnose, treat or prevent any disease.',
    legal3: 'Brand: CANNA COOKIES · Distribution: CALIFARMS',
    gdpr: 'GDPR: the site only uses essential local storage (language, age confirmation). No tracking cookies.',
    rights: '© 2026 CANNA COOKIES. All rights reserved.',
    stage: 'Stage 1 — presentation',
  },
  age: {
    kicker: 'Adults only',
    title: 'Are you 21 or older?',
    text: 'This website and CANNA COOKIES products are intended exclusively for persons aged 21 and over.',
    legal: 'By confirming, you declare that you are at least 21 years old and meet the conditions valid in your region. CBD products are not medicines.',
    yes: 'YES, ENTER',
    no: 'NO, EXIT',
    deniedTitle: 'Access restricted',
    deniedText: 'Content is available to adults only. If you are at least 21 years old, you can confirm entry.',
  },
  modal: {
    badge: 'Coming soon',
    title: 'Catalogue in the works',
    text: 'The Telegram Mini App with catalogue, cart and ordering is in development (stage 3). We will announce the launch on our channels.',
    close: 'Got it',
  },
  gallery: {
    badge: 'Gallery',
    title: 'Photos of our place',
    text: 'We are preparing photos of the point of sale — the gallery will be filled in soon.',
    close: 'Close',
  },
}

const ru: Dict = {
  nav: { about: 'О нас', why: 'Почему мы', delivery: 'Доставка', faq: 'FAQ', contacts: 'Контакты' },
  header: { catalog: 'ОТКРЫТЬ КАТАЛОГ', menu: 'Меню', close: 'Закрыть', lang: 'Язык' },
  hero: {
    badge: 'CBD · CZECH REPUBLIC · 21+',
    titleTop: "DON'T PANIC,",
    titleBottom: "IT'S ORGANIC.",
    lead: 'Премиальный CBD-бренд из Чехии. Органическая основа, чистый состав и спокойная голова — без паники.',
    cta: 'ОТКРЫТЬ КАТАЛОГ',
    secondary: 'О бренде',
    scroll: 'SCROLL',
    strip: ["DON'T PANIC", "IT'S ORGANIC", '21+ ONLY', 'CZECH REPUBLIC', 'CALIFARMS PARTNER'],
    teaser: 'Каталог в Telegram — уже в разработке',
  },
  about: {
    eyebrow: '01 — About us',
    title: 'О нас',
    lead: 'Бренд, который не кричит. Он просто стоит за тем, что кладёт внутрь.',
    p1: 'CANNA COOKIES — самостоятельный розничный CBD-бренд, работающий в Чехии.',
    p2: 'Мы работаем с дистрибьютором CALIFARMS и верим в простую формулу: меньше шума, больше содержания. Состав, происхождение и долгое доверие важнее быстрых обещаний.',
    p3: 'Полную историю бренда, фотографии и конкретные спецификации добавим на 2-м этапе — после согласования дизайна.',
    principles: [
      { k: '01', title: 'Органический подход', text: 'Натуральный состав и отобранные ингредиенты вместо лишних добавок.' },
      { k: '02', title: 'Прозрачный состав', text: 'Понятная информация о содержании и применении каждого продукта.' },
      { k: '03', title: 'Спокойный ум', text: 'DON’T PANIC, IT’S ORGANIC — принцип, который работает и для продукта, и для коммуникации.' },
    ],
    partnerLabel: 'Дистрибуция',
    partnerName: 'CALIFARMS',
    partnerCta: 'califarms.cz',
  },
  why: {
    eyebrow: '02 — Why choose us',
    title: 'Почему мы',
    lead: 'Шесть причин, почему стоит держаться одного бренда.',
    items: [
      { icon: 'leaf', title: 'Органическая основа', text: 'Делаем ставку на натуральный состав и ингредиенты, которые понимаем.' },
      { icon: 'layers', title: 'Состав без тайн', text: 'Никакого мелкого шрифта. У каждого продукта описано содержание.' },
      { icon: 'shield', title: 'Контроль качества', text: 'Работаем с проверенными поставщиками и процессами, которые имеют смысл.' },
      { icon: 'map', title: 'Физическая точка', text: 'Собственная точка продаж в Чехии — всё легально, по местным правилам и под контролем.', gallery: true, cta: 'Смотреть фото' },
      { icon: 'lock', title: 'Только 21+', text: 'Продаём исключительно совершеннолетним — порог 21 года мы установили сами.' },
      { icon: 'send', title: 'Каталог в Telegram', text: 'Готовим Telegram Mini App с каталогом, корзиной и оформлением заказов.' },
    ],
  },
  delivery: {
    eyebrow: '03 — Delivery',
    title: 'Доставка и самовывоз',
    lead: 'Логистику выстраиваем в темпе бренда. Точные условия опубликуем до старта продаж.',
    cards: [
      {
        title: 'Доставка по Чехии',
        badge: 'Готовим',
        text: 'Создаём службу доставки по всей Чехии.',
        rows: [
          { label: 'Зоны доставки', status: 'скоро' },
          { label: 'Цены', status: 'скоро' },
          { label: 'Сроки', status: 'скоро' },
        ],
      },
      {
        title: 'Самовывоз',
        badge: 'Готовим',
        text: 'Адрес и время выдачи добавим после согласования точки.',
        rows: [
          { label: 'Адрес выдачи', status: 'скоро' },
          { label: 'Часы работы', status: 'скоро' },
          { label: 'Запись на время', status: 'скоро' },
        ],
      },
    ],
    note: 'Зоны, цены и сроки опубликуем на 2-м этапе. А пока следите за каталогом в Telegram.',
  },
  catalog: {
    eyebrow: '04 — Catalog',
    title: 'Каталог в Telegram',
    text: 'Каталог, корзина и заказы станут частью Telegram Mini App. Мы это делаем — первая версия появится на 3-м этапе.',
    cta: 'ОТКРЫТЬ КАТАЛОГ',
    badge: 'Coming soon',
  },
  faq: {
    eyebrow: '05 — FAQ',
    title: 'Частые вопросы',
    lead: 'Коротко и по делу. Если знаем — пишем.',
    items: [
      {
        q: 'Что такое CANNA COOKIES?',
        a: 'CANNA COOKIES — самостоятельный розничный CBD-бренд из Чехии. Мы работаем с дистрибьютором CALIFARMS.',
      },
      {
        q: 'Для кого этот сайт?',
        a: 'Только для лиц старше 21 года. При первом визите мы попросим подтвердить возраст; без подтверждения контент заблокирован.',
      },
      {
        q: 'Где купить продукты?',
        a: 'Готовим каталог в Telegram с заказами и доставкой. О запуске сообщим — ничего не будет работать наполовину.',
      },
      {
        q: 'Как работает доставка?',
        a: 'Зоны, цены и сроки опубликуем на 2-м этапе. Готовим и доставку по Чехии, и самовывоз.',
      },
      {
        q: 'Продукты лекарственные?',
        a: 'Нет. CBD-продукты не являются лекарственными средствами и не заменяют медицинскую помощь. Мы не заявляем лечебных эффектов.',
      },
      {
        q: 'Как вы работаете с персональными данными?',
        a: 'Сайт не использует рекламные и отслеживающие cookie. Сохраняем только язык и подтверждение возраста (localStorage). Полные правила GDPR — на 2-м этапе.',
      },
      {
        q: 'Будет ли полноценный магазин?',
        a: 'Да — в планах магазин в Telegram Mini App (каталог, корзина, заказы), а затем backend с административной панелью.',
      },
    ],
  },
  contacts: {
    eyebrow: '06 — Contacts',
    title: 'Контакты',
    lead: 'Мы на связи. Контактные данные добавим вместе с финальным дизайном.',
    cards: [
      { label: 'E-mail', value: '—', status: '2-й этап' },
      { label: 'Telegram', value: '—', status: '2-й этап' },
      { label: 'Instagram', value: '—', status: '2-й этап' },
      { label: 'Офис', value: 'Чехия', status: 'Адрес на 2-м этапе' },
    ],
    note: 'Мы не имитируем данные, которых ещё нет. Реальные контакты, фотографии и тексты появятся на 2-м этапе.',
  },
  footer: {
    tagline: "DON'T PANIC, IT'S ORGANIC.",
    navLabel: 'Навигация',
    langLabel: 'Язык',
    legal1: 'Содержимое сайта предназначено исключительно для лиц старше 21 года.',
    legal2: 'CBD-продукты не являются лекарственными средствами и не предназначены для диагностики, лечения или профилактики заболеваний.',
    legal3: 'Бренд: CANNA COOKIES · Дистрибуция: CALIFARMS',
    gdpr: 'GDPR: сайт использует только необходимое локальное хранилище (язык, подтверждение возраста). Без отслеживающих cookie.',
    rights: '© 2026 CANNA COOKIES. Все права защищены.',
    stage: 'Этап 1 — презентация',
  },
  age: {
    kicker: 'Только для взрослых',
    title: 'Вам есть 21 год?',
    text: 'Этот сайт и продукты CANNA COOKIES предназначены исключительно для лиц старше 21 года.',
    legal: 'Подтверждая вход, вы декларируете, что вам не менее 21 года и вы выполняете требования, действующие в вашем регионе. CBD-продукты не являются лекарственными средствами.',
    yes: 'ДА, ВОЙТИ',
    no: 'НЕТ, ВЫЙТИ',
    deniedTitle: 'Доступ ограничен',
    deniedText: 'Контент доступен только совершеннолетним. Если вам не менее 21 года, подтвердите вход.',
  },
  modal: {
    badge: 'Coming soon',
    title: 'Каталог в разработке',
    text: 'Telegram Mini App с каталогом, корзиной и заказами в разработке (3-й этап). О запуске сообщим в наших каналах.',
    close: 'Понятно',
  },
  gallery: {
    badge: 'Галерея',
    title: 'Фото нашей точки',
    text: 'Фотографии точки продаж уже готовим — галерея скоро пополнится.',
    close: 'Закрыть',
  },
}

export const DICTS: Record<Lang, Dict> = { cs, en, ru }

export const SEO: Record<Lang, { title: string; description: string; locale: string }> = {
  cs: {
    title: "CANNA COOKIES — Prémiová CBD značka | DON'T PANIC, IT'S ORGANIC",
    description:
      'CANNA COOKIES je samostatná prémiová CBD značka působící v České republice. DON’T PANIC, IT’S ORGANIC. Katalog v Telegramu připravujeme.',
    locale: 'cs_CZ',
  },
  en: {
    title: "CANNA COOKIES — Premium CBD Brand | DON'T PANIC, IT'S ORGANIC",
    description:
      'CANNA COOKIES is an independent premium CBD brand based in the Czech Republic. DON’T PANIC, IT’S ORGANIC. Telegram catalogue coming soon.',
    locale: 'en_US',
  },
  ru: {
    title: "CANNA COOKIES — Премиальный CBD-бренд | DON'T PANIC, IT'S ORGANIC",
    description:
      'CANNA COOKIES — самостоятельный премиальный CBD-бренд из Чехии. DON’T PANIC, IT’S ORGANIC. Каталог в Telegram уже в разработке.',
    locale: 'ru_RU',
  },
}

export const SITE_URL = 'https://canna-cookies.pages.dev'
