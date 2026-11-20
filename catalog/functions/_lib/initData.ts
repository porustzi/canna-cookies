/**
 * Валидация Telegram Mini App initData (HMAC-SHA-256).
 * Спека: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 *   secret_key = HMAC_SHA256(key="WebAppData", data=bot_token)
 *   hash       = HMAC_SHA256(key=secret_key, data=data_check_string)
 */

export type InitDataResult =
  | { ok: true; userId: string; username?: string }
  | { ok: false }

function hex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function safeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export async function verifyInitData(
  initData: string,
  botToken: string,
  maxAgeSec = 604800, // 7 дней
): Promise<InitDataResult> {
  if (!initData || !botToken || initData.length > 8192) return { ok: false }

  const params = new URLSearchParams(initData)
  const hash = params.get('hash') ?? ''
  const authDate = Number(params.get('auth_date'))
  if (!/^[0-9a-f]{64}$/.test(hash)) return { ok: false }
  if (!Number.isFinite(authDate) || authDate <= 0) return { ok: false }
  const now = Math.floor(Date.now() / 1000)
  if (now - authDate > maxAgeSec || authDate - now > 300) return { ok: false }

  const pairs: string[] = []
  for (const [key, value] of params) {
    if (key === 'hash' || key === 'signature') continue
    pairs.push(`${key}=${value}`)
  }
  pairs.sort()
  const dataCheckString = pairs.join('\n')

  try {
    const enc = new TextEncoder()
    const secretKey = await crypto.subtle.sign(
      'HMAC',
      await crypto.subtle.importKey('raw', enc.encode('WebAppData'), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']),
      enc.encode(botToken),
    )
    const expected = hex(
      await crypto.subtle.sign(
        'HMAC',
        await crypto.subtle.importKey('raw', secretKey, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']),
        enc.encode(dataCheckString),
      ),
    )
    if (!safeEqualHex(expected, hash)) return { ok: false }
  } catch {
    return { ok: false }
  }

  const userRaw = params.get('user')
  if (!userRaw) return { ok: false }
  try {
    const user = JSON.parse(userRaw) as { id?: unknown; username?: unknown }
    if (typeof user.id !== 'number' || !Number.isFinite(user.id)) return { ok: false }
    const username = typeof user.username === 'string' && user.username ? user.username : undefined
    return { ok: true, userId: String(user.id), username }
  } catch {
    return { ok: false }
  }
}
