const PATTERNS: RegExp[] = [
  /тест/i,
  /\btest/i,
  /123/,
  /(.)\1{3,}/i,
  /qwerty|asdfgh|zxcvbn|poiuy|uiop/i,
  /хуй|пизд|blyad/i,
  /lorem|ipsum/i,
]

/**
 * Мусорные заявки: «тест», «123», клавиатурный шум и т.п.
 * Поля склеиваются — фильтруем имя, комментарий, текст обращения
 * (телефон и адрес не участвуют: в них цифры легальны).
 */
export function isGarbage(...parts: (string | undefined | null)[]): boolean {
  const s = parts.filter(Boolean).join(' ').toLowerCase()
  if (!s) return false
  return PATTERNS.some((re) => re.test(s))
}
