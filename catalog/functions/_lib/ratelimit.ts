import type { Env } from './kv'

const WINDOW_SEC = 900
const MAX_FAILS = 5
const KEY_PREFIX = 'rl:'

type Rec = { fails: number; exp: number }

const memory = new Map<string, Rec>()

function memKey(bucket: string, ip: string): string {
  return `${KEY_PREFIX}${bucket}:${ip}`
}

function memRead(bucket: string, ip: string): Rec | null {
  const rec = memory.get(memKey(bucket, ip))
  if (!rec) return null
  if (rec.exp * 1000 < Date.now()) {
    memory.delete(memKey(bucket, ip))
    return null
  }
  return rec
}

function memWrite(bucket: string, ip: string, fails: number): void {
  memory.set(memKey(bucket, ip), { fails, exp: Math.floor(Date.now() / 1000) + WINDOW_SEC })
  if (memory.size > 5000) {
    const now = Date.now()
    for (const [k, v] of memory) if (v.exp * 1000 < now) memory.delete(k)
  }
}

async function kvRead(env: Env, bucket: string, ip: string): Promise<Rec | null> {
  const store = env.CATALOG
  if (!store) return null
  const raw = await store.get(memKey(bucket, ip))
  if (!raw) return null
  try {
    const rec = JSON.parse(raw) as Rec
    if (rec.exp * 1000 < Date.now()) return null
    return rec
  } catch {
    return null
  }
}

async function kvWrite(env: Env, bucket: string, ip: string, fails: number): Promise<void> {
  const store = env.CATALOG
  if (!store) return
  await store.put(
    memKey(bucket, ip),
    JSON.stringify({ fails, exp: Math.floor(Date.now() / 1000) + WINDOW_SEC } satisfies Rec),
    { expirationTtl: WINDOW_SEC },
  )
}

export async function isRateLimited(env: Env, bucket: string, ip: string): Promise<boolean> {
  const local = memRead(bucket, ip)
  if (local && local.fails >= MAX_FAILS) return true
  try {
    const remote = await kvRead(env, bucket, ip)
    if (remote && remote.fails >= MAX_FAILS) return true
  } catch {
    /* KV unavailable — memory only */
  }
  return false
}

export async function recordFailure(env: Env, bucket: string, ip: string): Promise<void> {
  const local = memRead(bucket, ip)
  const next = (local?.fails ?? 0) + 1
  memWrite(bucket, ip, next)
  try {
    await kvWrite(env, bucket, ip, next)
  } catch {
    /* KV unavailable — memory only */
  }
}

export async function clearFailures(env: Env, bucket: string, ip: string): Promise<void> {
  memory.delete(memKey(bucket, ip))
  try {
    await env.CATALOG?.delete(memKey(bucket, ip))
  } catch {
    /* KV unavailable */
  }
}

// ---------- Success cooldown: не чаще N секунд между успешными заявками ----------

const COOL_PREFIX = 'cool:'
const coolMemory = new Map<string, number>() // key -> exp (epoch sec)

function coolKey(bucket: string, ip: string): string {
  return `${COOL_PREFIX}${bucket}:${ip}`
}

function coolMemRead(bucket: string, ip: string): number {
  const exp = coolMemory.get(coolKey(bucket, ip))
  if (!exp) return 0
  if (exp * 1000 < Date.now()) {
    coolMemory.delete(coolKey(bucket, ip))
    return 0
  }
  return exp
}

/** Сколько секунд осталось до конца кулдауна (0 — кулдауна нет). */
export async function cooldownRemaining(env: Env, bucket: string, ip: string): Promise<number> {
  let exp = coolMemRead(bucket, ip)
  if (!exp) {
    try {
      const store = env.CATALOG
      const raw = store ? await store.get(coolKey(bucket, ip)) : null
      if (raw) {
        const parsed = Number(JSON.parse(raw))
        if (Number.isFinite(parsed) && parsed * 1000 > Date.now()) {
          exp = parsed
          coolMemory.set(coolKey(bucket, ip), parsed)
        }
      }
    } catch {
      /* KV unavailable — memory only */
    }
  }
  if (!exp) return 0
  return Math.max(1, Math.ceil(exp - Date.now() / 1000))
}

export async function markCooldown(env: Env, bucket: string, ip: string, seconds: number): Promise<void> {
  const exp = Math.floor(Date.now() / 1000) + seconds
  coolMemory.set(coolKey(bucket, ip), exp)
  if (coolMemory.size > 5000) {
    const now = Date.now()
    for (const [k, v] of coolMemory) if (v * 1000 < now) coolMemory.delete(k)
  }
  try {
    await env.CATALOG?.put(coolKey(bucket, ip), JSON.stringify(exp), { expirationTtl: seconds })
  } catch {
    /* KV unavailable — memory only */
  }
}
