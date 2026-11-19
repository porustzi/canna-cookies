import type { Lang } from './types'

export type Dict = {
  loading: string
  retry: string
  error: string
  close: string
  required: string
  rateLimit: string
  age: {
    badge: string
    title: string
    yes: string
    no: string
    note: string
  }
  district: {
    title: string
    lead: string
    label: string
    pick: string
    address: string
    addressPh: string
    save: string
    change: string
  }
  nav: {
    catalog: string
    cart: string
    faq: string
    feedback: string
  }
  demoNotice: string
  closed: string
  hoursLabel: string
  catalog: {
    all: string
    empty: string
    soldOut: string
    from: string
  }
  product: {
    weight: string
    qty: string
    add: string
    added: string
  }
  cart: {
    title: string
    empty: string
    emptyCta: string
    delivery: string
    total: string
    minOrder: string
    checkout: string
    remove: string
  }
  checkout: {
    title: string
    name: string
    namePh: string
    phone: string
    phonePh: string
    district: string
    address: string
    weight: string
    price: string
    payment: string
    paymentPick: string
    comment: string
    commentPh: string
    submit: string
    sending: string
    privacy: string
    backToCart: string
    changeZone: string
  }
  confirm: {
    title: string
    no: string
    text: string
    again: string
  }
  faq: {
    title: string
    empty: string
  }
  feedback: {
    title: string
    lead: string
    type: string
    question: string
    complaint: string
    name: string
    namePh: string
    phone: string
    phonePh: string
    tg: string
    tgPh: string
    text: string
    textPh: string
    submit: string
    success: string
    successText: string
    privacy: string
    ordered: string
  }
  footer: {
    rights: string
  }
}

const cs: Dict = {
  loading: 'Načítání katalogu…',
  retry: 'Zkusit znovu',
  error: 'Nepodařilo se načíst katalog.',
  close: 'Zavřít',
  required: 'Vyplňte prosím povinná pole.',
  rateLimit: 'Příliš mnoho pokusů — zkuste to za chvíli.',
  age: {
    badge: 'Jen pro dospělé',
    title: 'Je vám 21 let nebo více?',
    yes: 'Ano, je mi 21+',
    no: 'Ne',
    note: 'Opusťte prosím tuto stránku, pokud vám nebylo 21 let.',
  },
  district: {
    title: 'Kam doručujeme?',
    lead: 'Vyberte zónu a napište adresu doručení — ulici a číslo popisné.',
    label: 'Zóna doručení',
    pick: 'Vyberte zónu…',
    address: 'Adresa doručení',
    addressPh: 'Ulice, číslo popisné, město',
    save: 'Uložit a pokračovat',
    change: 'Změnit zónu',
  },
  nav: {
    catalog: 'Katalog',
    cart: 'Košík',
    faq: 'FAQ',
    feedback: 'Kontakt',
  },
  demoNotice: 'Ukázkové položky — reálný katalog doplníme.',
  closed: 'Momentálně máme zavřeno — objednávky vyřídíme při dalším otevření.',
  hoursLabel: 'Otevírací doba',
  catalog: {
    all: 'Vše',
    empty: 'Zatím žádné položky.',
    soldOut: 'Vyprodáno',
    from: 'od',
  },
  product: {
    weight: 'Hmotnost',
    qty: 'Množství',
    add: 'Přidat do košíku',
    added: 'Přidáno ✓',
  },
  cart: {
    title: 'Košík',
    empty: 'Košík je prázdný.',
    emptyCta: 'Zpět do katalogu',
    delivery: 'Doručení',
    total: 'Celkem',
    minOrder: 'Minimální objednávka je {n} Kč.',
    checkout: 'K objednávce',
    remove: 'Odebrat',
  },
  checkout: {
    title: 'Objednávka',
    name: 'Jméno',
    namePh: 'Jak se vám říkat',
    phone: 'Telefon',
    phonePh: '+420 …',
    district: 'Zóna',
    address: 'Adresa',
    weight: 'Hmotnost',
    price: 'Cena',
    payment: 'Platba',
    paymentPick: 'Vyberte způsob platby…',
    comment: 'Poznámka',
    commentPh: 'Vstup, domluva, cokoliv důležitého',
    submit: 'Odeslat objednávku',
    sending: 'Odesílám…',
    privacy: 'Telefon a adresu použijeme pouze k doručení objednávky.',
    backToCart: 'Zpět do košíku',
    changeZone: 'Změnit',
  },
  confirm: {
    title: 'Objednávka přijata',
    no: 'Číslo objednávky',
    text: 'Ozveme se vám co nejdřív a potvrdíme doručení.',
    again: 'Zpět do katalogu',
  },
  faq: {
    title: 'FAQ — nákup a doručení',
    empty: 'FAQ připravujeme.',
  },
  feedback: {
    title: 'Zpětná vazba',
    lead: 'Máte dotaz nebo stížnost? Napište nám — ozveme se.',
    type: 'Typ',
    question: 'Dotaz',
    complaint: 'Stížnost',
    name: 'Jméno',
    namePh: 'Vaše jméno',
    phone: 'Telefon',
    phonePh: '+420 … (volitelné)',
    tg: 'Telegram',
    tgPh: '@username (volitelné)',
    text: 'Zpráva',
    textPh: 'Napište, co se stalo…',
    submit: 'Odeslat',
    success: 'Díky za zprávu!',
    successText: 'Ozveme se vám, jakmile to půjde.',
    privacy: 'Údaje použijeme jen k odpovědi na váš dotaz.',
    ordered: 'Objednávku jste již vytvořili — na dotazy pište kurýrovi nebo nám na Telegram.',
  },
  footer: {
    rights: "DON'T PANIC, IT'S ORGANIC · 21+",
  },
}

const en: Dict = {
  loading: 'Loading catalogue…',
  retry: 'Try again',
  error: 'Failed to load the catalogue.',
  close: 'Close',
  required: 'Please fill in the required fields.',
  rateLimit: 'Too many attempts — please try again shortly.',
  age: {
    badge: 'Adults only',
    title: 'Are you 21 or older?',
    yes: 'Yes, I am 21+',
    no: 'No',
    note: 'Please leave this page if you are under 21.',
  },
  district: {
    title: 'Where do we deliver?',
    lead: 'Pick your zone and enter the delivery address — street and number.',
    label: 'Delivery zone',
    pick: 'Pick a zone…',
    address: 'Delivery address',
    addressPh: 'Street, number, city',
    save: 'Save and continue',
    change: 'Change zone',
  },
  nav: {
    catalog: 'Catalogue',
    cart: 'Cart',
    faq: 'FAQ',
    feedback: 'Contact',
  },
  demoNotice: 'Sample items — the real catalogue is coming.',
  closed: 'We are currently closed — orders placed now are handled at the next opening.',
  hoursLabel: 'Opening hours',
  catalog: {
    all: 'All',
    empty: 'No items yet.',
    soldOut: 'Sold out',
    from: 'from',
  },
  product: {
    weight: 'Weight',
    qty: 'Quantity',
    add: 'Add to cart',
    added: 'Added ✓',
  },
  cart: {
    title: 'Cart',
    empty: 'Your cart is empty.',
    emptyCta: 'Back to catalogue',
    delivery: 'Delivery',
    total: 'Total',
    minOrder: 'Minimum order is {n} Kč.',
    checkout: 'Checkout',
    remove: 'Remove',
  },
  checkout: {
    title: 'Order',
    name: 'Name',
    namePh: 'How should we address you',
    phone: 'Phone',
    phonePh: '+420 …',
    district: 'Zone',
    address: 'Address',
    weight: 'Weight',
    price: 'Price',
    payment: 'Payment',
    paymentPick: 'Pick a payment method…',
    comment: 'Note',
    commentPh: 'Entrance, arrangements, anything important',
    submit: 'Place order',
    sending: 'Sending…',
    privacy: 'We use your phone and address only to deliver the order.',
    backToCart: 'Back to cart',
    changeZone: 'Change',
  },
  confirm: {
    title: 'Order received',
    no: 'Order number',
    text: 'We will contact you shortly to confirm delivery.',
    again: 'Back to catalogue',
  },
  faq: {
    title: 'FAQ — buying & delivery',
    empty: 'FAQ is coming.',
  },
  feedback: {
    title: 'Feedback',
    lead: 'A question or a complaint? Write to us — we will get back to you.',
    type: 'Type',
    question: 'Question',
    complaint: 'Complaint',
    name: 'Name',
    namePh: 'Your name',
    phone: 'Phone',
    phonePh: '+420 … (optional)',
    tg: 'Telegram',
    tgPh: '@username (optional)',
    text: 'Message',
    textPh: 'Tell us what happened…',
    submit: 'Send',
    success: 'Thanks for your message!',
    successText: 'We will get back to you as soon as we can.',
    privacy: 'We only use your details to answer your message.',
    ordered: 'You already placed an order — message your courier or us on Telegram for questions.',
  },
  footer: {
    rights: "DON'T PANIC, IT'S ORGANIC · 21+",
  },
}

const ru: Dict = {
  loading: 'Загрузка каталога…',
  retry: 'Попробовать снова',
  error: 'Не удалось загрузить каталог.',
  close: 'Закрыть',
  required: 'Заполните обязательные поля.',
  rateLimit: 'Слишком много попыток — попробуйте позже.',
  age: {
    badge: 'Только для взрослых',
    title: 'Вам исполнилось 21 год?',
    yes: 'Да, мне 21+',
    no: 'Нет',
    note: 'Пожалуйста, покиньте страницу, если вам нет 21.',
  },
  district: {
    title: 'Куда доставляем?',
    lead: 'Выберите зону и укажите адрес доставки — улицу и дом.',
    label: 'Зона доставки',
    pick: 'Выберите зону…',
    address: 'Адрес доставки',
    addressPh: 'Улица, дом, город',
    save: 'Сохранить и продолжить',
    change: 'Сменить зону',
  },
  nav: {
    catalog: 'Каталог',
    cart: 'Корзина',
    faq: 'FAQ',
    feedback: 'Контакт',
  },
  demoNotice: 'Демо-позиции — реальный каталог добавим позже.',
  closed: 'Сейчас закрыто — заказы обработаем при следующем открытии.',
  hoursLabel: 'Часы работы',
  catalog: {
    all: 'Все',
    empty: 'Пока нет товаров.',
    soldOut: 'Нет в наличии',
    from: 'от',
  },
  product: {
    weight: 'Вес',
    qty: 'Кол-во',
    add: 'В корзину',
    added: 'Добавлено ✓',
  },
  cart: {
    title: 'Корзина',
    empty: 'Корзина пуста.',
    emptyCta: 'В каталог',
    delivery: 'Доставка',
    total: 'Итого',
    minOrder: 'Минимальный заказ — {n} Kč.',
    checkout: 'К заказу',
    remove: 'Убрать',
  },
  checkout: {
    title: 'Заказ',
    name: 'Имя',
    namePh: 'Как к вам обращаться',
    phone: 'Телефон',
    phonePh: '+420 …',
    district: 'Зона',
    address: 'Адрес',
    weight: 'Вес',
    price: 'Цена',
    payment: 'Оплата',
    paymentPick: 'Выберите способ оплаты…',
    comment: 'Комментарий',
    commentPh: 'Подъезд, договорённости, всё важное',
    submit: 'Отправить заказ',
    sending: 'Отправка…',
    privacy: 'Телефон и адрес используем только для доставки заказа.',
    backToCart: 'В корзину',
    changeZone: 'Сменить',
  },
  confirm: {
    title: 'Заказ принят',
    no: 'Номер заказа',
    text: 'Мы свяжемся с вами в ближайшее время и подтвердим доставку.',
    again: 'В каталог',
  },
  faq: {
    title: 'FAQ — покупка и доставка',
    empty: 'FAQ скоро появится.',
  },
  feedback: {
    title: 'Обратная связь',
    lead: 'Вопрос или жалоба? Напишите нам — ответим.',
    type: 'Тип',
    question: 'Вопрос',
    complaint: 'Жалоба',
    name: 'Имя',
    namePh: 'Ваше имя',
    phone: 'Телефон',
    phonePh: '+420 … (необязательно)',
    tg: 'Telegram',
    tgPh: '@username (необязательно)',
    text: 'Сообщение',
    textPh: 'Напишите, что произошло…',
    submit: 'Отправить',
    success: 'Спасибо за сообщение!',
    successText: 'Ответим, как только сможем.',
    privacy: 'Данные используем только для ответа на ваше сообщение.',
    ordered: 'Вы уже делали заказ — по вопросам пишите курьеру или нам в Telegram.',
  },
  footer: {
    rights: "DON'T PANIC, IT'S ORGANIC · 21+",
  },
}

export const DICTS: Record<Lang, Dict> = { cs, en, ru }

export function parseLang(raw: string | null | undefined): Lang | null {
  const v = (raw ?? '').slice(0, 2).toLowerCase()
  return v === 'cs' || v === 'en' || v === 'ru' ? v : null
}
