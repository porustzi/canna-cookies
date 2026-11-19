const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

/**
 * Проверяет, открыто ли сейчас по почасовому расписанию (Europe/Prague).
 * null — расписание не настроено (работает только ручной тумблер «закрыт»).
 */
export function isOpenBySchedule(schedule: Record<string, string> | undefined): boolean | null {
  if (!schedule || !DAYS.some((d) => schedule[d])) return null

  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Prague',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const parts = fmt.formatToParts(new Date())
  const wd = (parts.find((p) => p.type === 'weekday')?.value ?? '').slice(0, 3).toLowerCase()
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? '0')
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? '0')

  const range = schedule[wd]
  if (!range) return true // день не задан — открыт
  const m = /^(\d{2}):(\d{2})-(\d{2}):(\d{2})$/.exec(range)
  if (!m) return true

  const now = hour * 60 + minute
  const from = Number(m[1]) * 60 + Number(m[2])
  const to = Number(m[3]) * 60 + Number(m[4])
  if (from <= to) return now >= from && now < to
  return now >= from || now < to // ночной интервал
}
