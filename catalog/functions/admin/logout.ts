import { clearCookie } from '../_lib/auth'

export async function onRequest(): Promise<Response> {
  return new Response(null, {
    status: 303,
    headers: {
      location: '/admin/',
      'set-cookie': await clearCookie(),
      'cache-control': 'no-store',
    },
  })
}
