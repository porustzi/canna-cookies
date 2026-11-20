export type Lang = 'cs' | 'en' | 'ru'

export type L = Record<Lang, string>

export type Weight = { label: string; price: number }

export type ProductImage = { mime: string; v: number }

export type Product = {
  id: string
  name: L
  desc: L
  category: string
  weights: Weight[]
  available: boolean
  image: ProductImage | null
}

export type Category = { id: string; name: L }

export type District = { id: string; name: L; fee: number; eta: L; coverage?: L }

export type Contacts = { phone: string; tg: string; address: string }

export type Promo = { code: string; percent: number }

export type Settings = {
  payment: L[]
  minOrder: number
  hours: L
  closed: boolean
  banner: L
  contacts?: Contacts
  freeDeliveryFrom?: number
  promo?: Promo | null
  texts?: { demo: L; closed: L; privacy: L }
  schedule?: Record<string, string>
}

export type FaqItem = { q: string; a: string }

export type Faq = Record<string, FaqItem[]>

export type DefaultCatalog = {
  categories: Category[]
  products: Product[]
  districts: District[]
  settings: Settings
  faq: Faq
}

export const LANGS: readonly Lang[] = ['cs', 'en', 'ru']

export function parseLang(value: unknown): Lang | null {
  return typeof value === 'string' && (LANGS as readonly string[]).includes(value) ? (value as Lang) : null
}

export function pickL(l: L | null | undefined, lang: Lang): string {
  if (!l) return ''
  return l[lang] || l.cs || l.en || l.ru || ''
}

export const DEFAULT_CATALOG: DefaultCatalog = {
  categories: [
    { id: 'flowers', name: { cs: 'Květy', en: 'Flowers', ru: 'Цветы' } },
    { id: 'oils', name: { cs: 'Oleje', en: 'Oils', ru: 'Масла' } },
    { id: 'edibles', name: { cs: 'Dobroty', en: 'Edibles', ru: 'Сладости' } },
  ],
  products: [
    {
      id: 'p1',
      name: { cs: 'Ukázkový produkt 1', en: 'Sample product 1', ru: 'Тестовый товар 1' },
      desc: {
        cs: 'Demo položka — reálný katalog doplníme přes administraci.',
        en: 'Demo item — the real catalogue is filled in via the admin panel.',
        ru: 'Демо-позиция — реальный каталог заполним через админку.',
      },
      category: 'flowers',
      weights: [
        { label: '1 g', price: 150 },
        { label: '3.5 g', price: 450 },
      ],
      available: true,
      image: null,
    },
    {
      id: 'p2',
      name: { cs: 'Ukázkový produkt 2', en: 'Sample product 2', ru: 'Тестовый товар 2' },
      desc: {
        cs: 'Demo položka — reálný katalog doplníme přes administraci.',
        en: 'Demo item — the real catalogue is filled in via the admin panel.',
        ru: 'Демо-позиция — реальный каталог заполним через админку.',
      },
      category: 'flowers',
      weights: [
        { label: '3.5 g', price: 480 },
        { label: '7 g', price: 900 },
      ],
      available: true,
      image: null,
    },
    {
      id: 'p3',
      name: { cs: 'Ukázkový produkt 3', en: 'Sample product 3', ru: 'Тестовый товар 3' },
      desc: {
        cs: 'Demo položka — skladem momentálně není.',
        en: 'Demo item — currently out of stock.',
        ru: 'Демо-позиция — сейчас отсутствует на складе.',
      },
      category: 'flowers',
      weights: [{ label: '1 g', price: 160 }],
      available: false,
      image: null,
    },
    {
      id: 'p4',
      name: { cs: 'Ukázkový produkt 4', en: 'Sample product 4', ru: 'Тестовый товар 4' },
      desc: {
        cs: 'Demo položka — reálný katalog doplníme přes administraci.',
        en: 'Demo item — the real catalogue is filled in via the admin panel.',
        ru: 'Демо-позиция — реальный каталог заполним через админку.',
      },
      category: 'oils',
      weights: [
        { label: '5 ml', price: 550 },
        { label: '10 ml', price: 990 },
      ],
      available: true,
      image: null,
    },
    {
      id: 'p5',
      name: { cs: 'Ukázkový produkt 5', en: 'Sample product 5', ru: 'Тестовый товар 5' },
      desc: {
        cs: 'Demo položka — reálný katalog doplníme přes administraci.',
        en: 'Demo item — the real catalogue is filled in via the admin panel.',
        ru: 'Демо-позиция — реальный каталог заполним через админку.',
      },
      category: 'oils',
      weights: [{ label: '10 ml', price: 1050 }],
      available: true,
      image: null,
    },
    {
      id: 'p6',
      name: { cs: 'Ukázkový produkt 6', en: 'Sample product 6', ru: 'Тестовый товар 6' },
      desc: {
        cs: 'Demo položka — reálný katalog doplníme přes administraci.',
        en: 'Demo item — the real catalogue is filled in via the admin panel.',
        ru: 'Демо-позиция — реальный каталог заполним через админку.',
      },
      category: 'edibles',
      weights: [
        { label: '1 ks', price: 120 },
        { label: '3 ks', price: 330 },
      ],
      available: true,
      image: null,
    },
  ],
  districts: [
    {
      id: 'zona-a',
      name: { cs: 'Zóna A', en: 'Zone A', ru: 'Зона A' },
      fee: 0,
      eta: { cs: 'do 60 min', en: 'within 60 min', ru: 'до 60 мин' },
    },
    {
      id: 'zona-b',
      name: { cs: 'Zóna B', en: 'Zone B', ru: 'Зона B' },
      fee: 50,
      eta: { cs: 'do 90 min', en: 'within 90 min', ru: 'до 90 мин' },
    },
    {
      id: 'zona-c',
      name: { cs: 'Zóna C', en: 'Zone C', ru: 'Зона C' },
      fee: 80,
      eta: { cs: 'do 120 min', en: 'within 120 min', ru: 'до 120 мин' },
    },
    {
      id: 'mimo',
      name: { cs: 'Mimo zónu', en: 'Outside zone', ru: 'За зоной' },
      fee: 150,
      eta: { cs: 'dohodou', en: 'by arrangement', ru: 'по договорённости' },
    },
  ],
  settings: {
    payment: [
      { cs: 'Hotově', en: 'Cash', ru: 'Наличные' },
      { cs: 'Bankovní převod', en: 'Bank transfer', ru: 'Банковский перевод' },
      { cs: 'Krypto', en: 'Crypto', ru: 'Криптовалюта' },
    ],
    minOrder: 300,
    hours: { cs: 'Denně 9:00–22:00', en: 'Daily 9:00–22:00', ru: 'Ежедневно 9:00–22:00' },
    closed: false,
    banner: { cs: '', en: '', ru: '' },
  },
  faq: {
    cs: [
      {
        q: 'Jak objednat?',
        a: 'Vyberte zboží v katalogu, vložte ho do košíku a odešlete objednávkový formulář. Ozveme se vám a domluvíme detaily doručení.',
      },
      {
        q: 'Jak probíhá doručení?',
        a: 'Doručujeme po zónách — vyberte svou zónu a napište adresu. Přesný čas potvrdíme po přijetí objednávky.',
      },
      {
        q: 'Jak lze platit?',
        a: 'Platit můžete hotově, bankovním převodem nebo krypto — způsob si vyberete přímo v objednávce.',
      },
    ],
    en: [
      {
        q: 'How do I order?',
        a: 'Pick items in the catalogue, add them to the cart and send the order form. We will get back to you to arrange delivery.',
      },
      {
        q: 'How does delivery work?',
        a: 'We deliver by zones — choose your zone and enter the address. The exact time is confirmed after we receive the order.',
      },
      {
        q: 'What payment methods are there?',
        a: 'You can pay in cash, by bank transfer or in crypto — pick the method right in the order form.',
      },
    ],
    ru: [
      {
        q: 'Как оформить заказ?',
        a: 'Выберите товары в каталоге, добавьте в корзину и отправьте форму заказа. Мы свяжемся с вами и согласуем доставку.',
      },
      {
        q: 'Как работает доставка?',
        a: 'Доставляем по зонам — выберите свою зону и укажите адрес. Точное время подтвердим после получения заказа.',
      },
      {
        q: 'Как можно оплатить?',
        a: 'Оплата: наличными, банковским переводом или криптовалютой — способ выбирается прямо в заказе.',
      },
    ],
  },
}
