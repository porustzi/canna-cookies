const WINDOW_SEC = 900
const MAX_FAILS = 5
const KEY_PREFIX = 'rl:login:'

type Rec = { fails: number; exp: number }

const memory = new Map<string, Rec>()

function memKey(ip: string): string {
  return `${KEY_PREFIX}${ip}`
}

function memRead(ip: string): Rec | null {
  const rec = memory.get(memKey(ip))
  if (!rec) return null
  if (rec.exp * 1000 < Date.now()) {
    memory.delete(memKey(ip))
    return null
  }
  return rec
}

function memWrite(ip: string, fails: number): void {
  memory.set(memKey(ip), { fails, exp: Math.floor(Date.now() / 1000) + WINDOW_SEC })
  if (memory.size > 5000) {
    const now = Date.now()
    for (const [k, v] of memory) if (v.exp * 1000 < now) memory.delete(k)
  }
}

async function kvRead(env: { SITE_CONTENT?: { get(k: string, t?: string): Promise<unknown> } }, ip: string): Promise<Rec | null> {
  const kv = env.SITE_CONTENT
  if (!kv) return null
  const raw = (await kv.get(memKey(ip))) as string | null
  if (!raw) return null
  try {
    const rec = JSON.parse(raw) as Rec
    if (rec.exp * 1000 < Date.now()) return null
    return rec
  } catch {
    return null
  }
}

async function kvWrite(env: { SITE_CONTENT?: { put(k: string, v: string, o?: { expirationTtl?: number }): Promise<void> } }, ip: string, fails: number): Promise<void> {
  const kv = env.SITE_CONTENT
  if (!kv) return
  await kv.put(memKey(ip), JSON.stringify({ fails, exp: Math.floor(Date.now() / 1000) + WINDOW_SEC } satisfies Rec), { expirationTtl: WINDOW_SEC })
}

export async function isRateLimited(env: { SITE_CONTENT?: { get(k: string, t?: string): Promise<unknown> } }, ip: string): Promise<boolean> {
  const local = memRead(ip)
  if (local && local.fails >= MAX_FAILS) return true
  try {
    const remote = await kvRead(env, ip)
    if (remote && remote.fails >= MAX_FAILS) return true
  } catch {
    /* KV unavailable — memory only */
  }
  return false
}

export async function recordFailure(env: { SITE_CONTENT?: { put(k: string, v: string, o?: { expirationTtl?: number }): Promise<void> } }, ip: string): Promise<void> {
  const local = memRead(ip)
  const next = (local?.fails ?? 0) + 1
  memWrite(ip, next)
  try {
    await kvWrite(env, ip, next)
  } catch {
    /* KV unavailable — memory only */
  }
}

export async function clearFailures(env: { SITE_CONTENT?: { delete(k: string): Promise<void> } }, ip: string): Promise<void> {
  memory.delete(memKey(ip))
  try {
    await env.SITE_CONTENT?.delete(memKey(ip))
  } catch {
    /* KV unavailable */
  }
}

export function retryAfterSeconds(env: { SITE_CONTENT?: unknown }, ip: string): number {
  const rec = memRead(ip)
  if (rec) return Math.max(1, rec.exp - Math.floor(Date.now() / 1000))
  void env
  void ip
  return WINDOW_SEC
}
