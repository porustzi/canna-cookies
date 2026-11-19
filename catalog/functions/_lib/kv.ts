export type KvNamespace = {
  get(key: string): Promise<string | null>
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>
  delete(key: string): Promise<void>
  list(options?: { prefix?: string; limit?: number }): Promise<{ keys: { name: string }[]; list_complete?: boolean }>
}

export type Env = {
  CATALOG?: KvNamespace
  TELEGRAM_FEEDBACK_TOKEN?: string
  TELEGRAM_FEEDBACK_CHAT_ID?: string
  TELEGRAM_WEBHOOK_SECRET?: string
  TELEGRAM_ORDER_TOKEN?: string
  TELEGRAM_ORDER_CHAT_ID?: string
  TELEGRAM_ORDER_WEBHOOK_SECRET?: string
}

export function kv(env: Env): KvNamespace | null {
  return env.CATALOG ?? null
}

export async function readJson<T>(env: Env, key: string, fallback: T): Promise<T> {
  const store = kv(env)
  if (!store) return fallback
  try {
    const raw = await store.get(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export async function putJson(env: Env, key: string, value: unknown, expirationTtl?: number): Promise<void> {
  const store = kv(env)
  if (!store) return
  await store.put(key, JSON.stringify(value), expirationTtl ? { expirationTtl } : undefined)
}

export function json(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...headers,
    },
  })
}

export function clientIp(request: Request): string {
  return request.headers.get('cf-connecting-ip') ?? 'unknown'
}

export async function readBody<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T
  } catch {
    return null
  }
}

export function str(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null
  const v = value.trim()
  if (v.length < 1 || v.length > max) return null
  return v
}

export function int(value: unknown, min: number, max: number): number | null {
  if (typeof value !== 'number' || !Number.isInteger(value)) return null
  if (value < min || value > max) return null
  return value
}
