export type OrderLine = { name: string; weight: string; price: number; qty: number }

export type OrderRecord = {
  id: string
  createdAt?: string
  status: string
  items: OrderLine[]
  district?: { id?: string; name: string; fee: number }
  address: string
  name: string
  phone: string
  payment: string
  comment?: string
  lang?: string
  total: number
  delivery: number
  grand: number
  // курьерский флоу
  takenBy?: string
  reactions?: Record<string, 'take' | 'decline'>
  msgIds?: Record<string, number[]>
  lastReminderAt?: number
  adminAlerted?: boolean
  reviewed?: boolean
  reminders?: number
  tgId?: string
  discount?: number
  promo?: string
}

const LANGS: Record<string, string> = { ru: 'русский', cs: 'чешский', en: 'английский' }

export const ORDER_STATUS_LABEL: Record<string, string> = {
  new: '🆕 Новый',
  taken: '🚴 Взят',
  done: '✅ Выполнен',
  cancelled: '🚫 Отменён',
  confirmed: '✅ Подтверждён',
  declined: '❌ Отклонён',
}

function fmtDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getDate())}.${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}`
}

export type CardOpts = {
  viewerDeclined?: boolean
  takenByName?: string
}

export function formatOrderCard(order: OrderRecord, opts: CardOpts = {}): string {
  const lines: string[] = []
  let header: string
  if (order.status === 'taken') {
    header = `🚴 Заказ взял ${opts.takenByName ?? 'курьер'} · ${order.id}`
  } else if (order.status === 'done') {
    header = `✅ Заказ выполнен · ${order.id}`
  } else if (order.status === 'cancelled') {
    header = `🚫 Заказ отменён · ${order.id}`
  } else if (opts.viewerDeclined) {
    header = `❌ Вы отклонили заказ ${order.id}`
  } else {
    const label = ORDER_STATUS_LABEL[order.status] ?? order.status
    header = `${label} заказ ${order.id}`
  }
  lines.push(header)
  const date = order.createdAt ? fmtDate(order.createdAt) : ''
  if (date) lines.push(date)
  lines.push('')
  lines.push('Позиции:')
  for (const it of order.items.slice(0, 30)) {
    lines.push(`• ${it.name} · ${it.weight} ×${it.qty} — ${it.price * it.qty} Kč`)
  }
  lines.push('')
  const zone = order.district ? `${order.district.name} (+${order.district.fee} Kč)` : '—'
  lines.push(`Зона: ${zone}`)
  lines.push(`Адрес: ${order.address}`)
  lines.push(`Клиент: ${order.name} · ${order.phone}`)
  lines.push(`Сумма: ${order.total} Kč · доставка ${order.delivery} Kč · итого ${order.grand} Kč`)
  if (order.payment) lines.push(`Оплата: ${order.payment}`)
  if (order.comment) lines.push(`Комментарий: ${order.comment}`)
  if (order.lang) lines.push(`Язык клиента: ${LANGS[order.lang] ?? order.lang}`)
  return lines.join('\n')
}

/** Санитизированная копия заказа для клиента: без имени/телефона/адреса. */
export type PublicOrder = {
  id: string
  status: string
  createdAt?: string
  total: number
  delivery: number
  discount: number
  grand: number
  payment?: string
  district?: { name: string; fee: number }
  assigned: boolean
  reviewed: boolean
  reply?: string
  items: { name: string; weight: string; price: number; qty: number }[]
}

export function publicOrder(order: OrderRecord, reply?: string): PublicOrder {
  return {
    id: order.id,
    status: order.status,
    createdAt: order.createdAt,
    total: order.total,
    delivery: order.delivery,
    discount: order.discount ?? 0,
    grand: order.grand,
    payment: order.payment,
    district: order.district ? { name: order.district.name, fee: order.district.fee } : undefined,
    assigned: Boolean(order.takenBy),
    reviewed: Boolean(order.reviewed),
    reply: reply || undefined,
    items: order.items.map((it) => ({ name: it.name, weight: it.weight, price: it.price, qty: it.qty })),
  }
}
