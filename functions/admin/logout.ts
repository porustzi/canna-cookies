import { clearCookie } from '../_lib/auth'

export async function onRequestPost(): Promise<Response> {
  return new Response(null, {
    status: 303,
    headers: { location: '/', 'set-cookie': await clearCookie(), 'cache-control': 'no-store' },
  })
}

export async function onRequestGet(): Promise<Response> {
  return onRequestPost()
}
