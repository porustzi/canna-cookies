import { isAuthenticated, type Env } from '../_lib/auth'
import { loginPage } from '../_lib/loginPage'

export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context

  if (!(await isAuthenticated(request, env))) {
    if (request.method === 'GET' || request.method === 'HEAD') return loginPage()
    return loginPage({ error: 'Требуется вход в админ-панель.', status: 401 })
  }

  const res = await env.ASSETS.fetch(request)
  const headers = new Headers(res.headers)
  headers.set('x-robots-tag', 'noindex, nofollow')
  headers.set('cache-control', 'no-store')
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers })
}
