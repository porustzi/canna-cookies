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
