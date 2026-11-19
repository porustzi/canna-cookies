import type { Lang } from './types'

export type Dict = {
  loading: string
  retry: string
  error: string
  close: string
  required: string
  rateLimit: string
  tgRequired: string
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
    orders: string
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
    freeFrom: string
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
    promo: string
    promoPh: string
    promoBad: string
    tg: string
    tgPh: string
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
  orders: {
    title: string
    lead: string
    empty: string
    find: string
    findPh: string
    findBtn: string
    notFound: string
    sNew: string
    sTaken: string
    sDone: string
    dispute: string
    disputePh: string
    disputeSend: string
    disputeOk: string
    disputeOkText: string
    disputeErr: string
    receive: string
    receiveConfirm: string
    received: string
    receiveErr: string
    cancel: string
    cancelConfirm: string
    cancelErr: string
    cancelTooLate: string
    sCancelled: string
    replyTitle: string
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
    contactsTitle: string
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
  tgRequired: 'Vyplňte Telegram username (@).',
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
    orders: 'Objednávky',
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
    freeFrom: 'Doprava zdarma od {n} Kč.',
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
    promo: 'Slevový kód',
    promoPh: 'Zadejte kód',
    promoBad: 'Kód neplatí.',
    tg: 'Telegram',
    tgPh: '@username (povinné)',
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
  orders: {
    title: 'Moje objednávky',
    lead: 'Objednávky z tohoto zařízení a hledání podle čísla.',
    empty: 'Zatím žádné objednávky. Najděte podle čísla nebo vytvořte objednávku.',
    find: 'Najít podle čísla',
    findPh: 'CC-…',
    findBtn: 'Najít',
    notFound: 'Objednávka nenalezena.',
    sNew: 'přijata',
    sTaken: 'převzal kurýr',
    sDone: 'dokončena',
    dispute: 'Otevřít spor',
    disputePh: 'Popište problém…',
    disputeSend: 'Odeslat do podpory',
    disputeOk: 'Spor odeslán do podpory',
    disputeOkText: 'Odpovíme v botu podpory.',
    disputeErr: 'Spor se nepodařilo odeslat.',
    receive: 'Objednávku jsem dostal',
    receiveConfirm: 'Potvrdit převzetí objednávky?',
    received: '✓ Objednávka převzata',
    receiveErr: 'Potvrzení se nepodařilo odeslat.',
    cancel: 'Zrušit objednávku',
    cancelConfirm: 'Opravdu zrušit objednávku?',
    cancelErr: 'Objednávku se nepodařilo zrušit.',
    cancelTooLate: 'Už ji nelze zrušit — kurýr ji převzal.',
    sCancelled: 'zrušena',
    replyTitle: 'Odpověď podpory',
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
    tgPh: '@username (povinné)',
    text: 'Zpráva',
    textPh: 'Napište, co se stalo…',
    submit: 'Odeslat',
    success: 'Díky za zprávu!',
    successText: 'Ozveme se vám, jakmile to půjde.',
    privacy: 'Údaje použijeme jen k odpovědi na váš dotaz.',
    ordered: 'Objednávku jste již vytvořili — na dotazy pište kurýrovi nebo nám na Telegram.',
    contactsTitle: 'Spojte se s námi',
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
  tgRequired: 'Enter your Telegram username (@).',
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
    orders: 'Orders',
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
    freeFrom: 'Free delivery from {n} Kč.',
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
    promo: 'Promo code',
    promoPh: 'Enter code',
    promoBad: 'Invalid code.',
    tg: 'Telegram',
    tgPh: '@username (required)',
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
  orders: {
    title: 'My orders',
    lead: 'Orders from this device and lookup by number.',
    empty: 'No orders yet. Look one up by number or place an order.',
    find: 'Find by number',
    findPh: 'CC-…',
    findBtn: 'Find',
    notFound: 'Order not found.',
    sNew: 'received',
    sTaken: 'courier assigned',
    sDone: 'completed',
    dispute: 'Open dispute',
    disputePh: 'Describe the problem…',
    disputeSend: 'Send to support',
    disputeOk: 'Dispute sent to support',
    disputeOkText: 'We will reply in the support bot.',
    disputeErr: 'Failed to send the dispute.',
    receive: 'I received the order',
    receiveConfirm: 'Confirm that you received the order?',
    received: '✓ Order received',
    receiveErr: 'Failed to send the confirmation.',
    cancel: 'Cancel order',
    cancelConfirm: 'Really cancel this order?',
    cancelErr: 'Failed to cancel the order.',
    cancelTooLate: 'Too late — the courier already took it.',
    sCancelled: 'cancelled',
    replyTitle: 'Support reply',
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
    tgPh: '@username (required)',
    text: 'Message',
    textPh: 'Tell us what happened…',
    submit: 'Send',
    success: 'Thanks for your message!',
    successText: 'We will get back to you as soon as we can.',
    privacy: 'We only use your details to answer your message.',
    ordered: 'You already placed an order — message your courier or us on Telegram for questions.',
    contactsTitle: 'Contact us',
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
  tgRequired: 'Укажите Telegram-username (@).',
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
    orders: 'Заказы',
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
    freeFrom: 'Бесплатная доставка от {n} Kč.',
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
    promo: 'Промокод',
    promoPh: 'Введите код',
    promoBad: 'Код не сработал.',
    tg: 'Telegram',
    tgPh: '@username (обязательно)',
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
  orders: {
    title: 'Мои заказы',
    lead: 'Заказы с этого устройства и поиск по номеру.',
    empty: 'Заказов пока нет. Найдите по номеру или оформите заказ.',
    find: 'Найти по номеру',
    findPh: 'CC-…',
    findBtn: 'Найти',
    notFound: 'Заказ не найден.',
    sNew: 'принят',
    sTaken: 'взят курьером',
    sDone: 'выполнен',
    dispute: 'Открыть спор',
    disputePh: 'Опишите проблему…',
    disputeSend: 'Отправить в поддержку',
    disputeOk: 'Спор отправлен в поддержку',
    disputeOkText: 'Мы ответим в боте поддержки.',
    disputeErr: 'Не удалось отправить спор.',
    receive: 'Получил заказ',
    receiveConfirm: 'Подтвердить, что заказ получен?',
    received: '✓ Заказ получен',
    receiveErr: 'Не удалось отправить подтверждение.',
    cancel: 'Отменить заказ',
    cancelConfirm: 'Отменить этот заказ?',
    cancelErr: 'Не удалось отменить заказ.',
    cancelTooLate: 'Уже поздно — курьер взял заказ.',
    sCancelled: 'отменён',
    replyTitle: 'Ответ поддержки',
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
    tgPh: '@username (обязательно)',
    text: 'Сообщение',
    textPh: 'Напишите, что произошло…',
    submit: 'Отправить',
    success: 'Спасибо за сообщение!',
    successText: 'Ответим, как только сможем.',
    privacy: 'Данные используем только для ответа на ваше сообщение.',
    ordered: 'Вы уже делали заказ — по вопросам пишите курьеру или нам в Telegram.',
    contactsTitle: 'Связаться с нами',
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
