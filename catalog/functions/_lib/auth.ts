import type { Env as KvEnv } from './kv'

export interface Env extends KvEnv {
  ADMIN_PASSWORD: string
  ASSETS: { fetch(req: Request): Promise<Response> }
}

const COOKIE = 'cc_admin'
const WEEK = 60 * 60 * 24 * 7

function hex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function hmacKey(password: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', new TextEncoder().encode(password), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify'])
}

export async function signCookie(env: Env): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + WEEK
  const key = await hmacKey(env.ADMIN_PASSWORD)
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`cc-admin:${exp}`))
  return `${COOKIE}=v1.${exp}.${hex(sig)}; Path=/; Max-Age=${WEEK}; HttpOnly; Secure; SameSite=Strict`
}

export async function clearCookie(): Promise<string> {
  return `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`
}

export async function isAuthenticated(request: Request, env: Env): Promise<boolean> {
  const header = request.headers.get('cookie') ?? ''
  const raw = header
    .split(';')
    .map((s) => s.trim())
    .find((s) => s.startsWith(`${COOKIE}=`))
  if (!raw) return false
  const value = raw.slice(COOKIE.length + 1)
  const parts = value.split('.')
  if (parts.length !== 3 || parts[0] !== 'v1') return false
  const exp = Number(parts[1])
  if (!Number.isFinite(exp) || exp * 1000 < Date.now()) return false
  const sigHex = parts[2]
  if (!/^[0-9a-f]{64}$/.test(sigHex)) return false
  const key = await hmacKey(env.ADMIN_PASSWORD)
  const data = new TextEncoder().encode(`cc-admin:${exp}`)
  const sig = new Uint8Array(sigHex.match(/.{2}/g)!.map((b) => parseInt(b, 16)))
  return crypto.subtle.verify('HMAC', key, sig, data)
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return hex(digest)
}

export async function checkPassword(input: string, env: Env): Promise<boolean> {
  const [a, b] = await Promise.all([sha256Hex(input), sha256Hex(env.ADMIN_PASSWORD)])
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export function clientIp(request: Request): string {
  return request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
}

export function json(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers },
  })
}
