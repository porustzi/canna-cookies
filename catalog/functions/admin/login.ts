import { checkPassword, clientIp, json, signCookie, type Env } from '../_lib/auth'
import { loginPage } from '../_lib/loginPage'
import { clearFailures, isRateLimited, recordFailure } from '../_lib/ratelimit'

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context
  if (!env.ADMIN_PASSWORD) return json({ error: 'server-misconfigured' }, 500)

  const ip = clientIp(request)

  if (await isRateLimited(env, 'admin', ip)) {
    return loginPage({
      error: 'Слишком много попыток входа. Подождите 15 минут и попробуйте снова.',
      status: 429,
      retryAfter: 900,
    })
  }

  let password = ''
  try {
    const form = await request.formData()
    password = String(form.get('password') ?? '')
  } catch {
    return loginPage({ error: 'Некорректный запрос.', status: 400 })
  }

  const ok = await checkPassword(password, env)

  if (!ok) {
    await recordFailure(env, 'admin', ip)
    await delay(700)
    return loginPage({ error: 'Неверный пароль.', status: 401 })
  }

  await clearFailures(env, 'admin', ip)
  return new Response(null, {
    status: 303,
    headers: {
      location: '/admin/',
      'set-cookie': await signCookie(env),
      'cache-control': 'no-store',
    },
  })
}

export function onRequestGet(): Response {
  return new Response(null, { status: 303, headers: { location: '/admin/', 'cache-control': 'no-store' } })
}
