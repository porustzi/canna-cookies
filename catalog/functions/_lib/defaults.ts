export type Weight = { label: string; price: number }

export type Product = {
  id: string
  name: string
  desc: string
  category: string
  weights: Weight[]
  available: boolean
}

export type Category = { id: string; name: string }

export type District = { id: string; name: string; fee: number; eta: string }

export type Settings = {
  payment: string[]
  minOrder: number
  hours: string
  closed: boolean
  banner: string
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

export const DEFAULT_CATALOG: DefaultCatalog = {
  categories: [
    { id: 'flowers', name: 'Květy' },
    { id: 'oils', name: 'Oleje' },
    { id: 'edibles', name: 'Dobroty' },
  ],
  products: [
    {
      id: 'p1',
      name: 'Ukázkový produkt 1',
      desc: 'Demo položka — reálný katalog doplníme přes administraci.',
      category: 'flowers',
      weights: [
        { label: '1 g', price: 150 },
        { label: '3.5 g', price: 450 },
      ],
      available: true,
    },
    {
      id: 'p2',
      name: 'Ukázkový produkt 2',
      desc: 'Demo položka — reálný katalog doplníme přes administraci.',
      category: 'flowers',
      weights: [
        { label: '3.5 g', price: 480 },
        { label: '7 g', price: 900 },
      ],
      available: true,
    },
    {
      id: 'p3',
      name: 'Ukázkový produkt 3',
      desc: 'Demo položka — skladem momentálně není.',
      category: 'flowers',
      weights: [{ label: '1 g', price: 160 }],
      available: false,
    },
    {
      id: 'p4',
      name: 'Ukázkový produkt 4',
      desc: 'Demo položka — reálný katalog doplníme přes administraci.',
      category: 'oils',
      weights: [
        { label: '5 ml', price: 550 },
        { label: '10 ml', price: 990 },
      ],
      available: true,
    },
    {
      id: 'p5',
      name: 'Ukázkový produkt 5',
      desc: 'Demo položka — reálný katalog doplníme přes administraci.',
      category: 'oils',
      weights: [{ label: '10 ml', price: 1050 }],
      available: true,
    },
    {
      id: 'p6',
      name: 'Ukázkový produkt 6',
      desc: 'Demo položka — reálný katalog doplníme přes administraci.',
      category: 'edibles',
      weights: [
        { label: '1 ks', price: 120 },
        { label: '3 ks', price: 330 },
      ],
      available: true,
    },
  ],
  districts: [
    { id: 'zona-a', name: 'Zóna A', fee: 0, eta: 'do 60 min' },
    { id: 'zona-b', name: 'Zóna B', fee: 50, eta: 'do 90 min' },
    { id: 'zona-c', name: 'Zóna C', fee: 80, eta: 'do 120 min' },
    { id: 'mimo', name: 'Mimo zónu', fee: 150, eta: 'dohodou' },
  ],
  settings: {
    payment: ['Hotově', 'Bankovní převod', 'Krypto'],
    minOrder: 300,
    hours: 'Po–So 10:00–20:00',
    closed: false,
    banner: '',
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
