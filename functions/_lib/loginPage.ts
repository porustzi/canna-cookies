export function loginPage(opts: { error?: string; status?: number; retryAfter?: number } = {}): Response {
  const { error, status = error ? 401 : 200, retryAfter } = opts
  const errorBox = error
    ? `<div class="err" role="alert">${error}</div>`
    : ''
  const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<meta name="theme-color" content="#080A0C" />
<title>CANNA COOKIES — Вход</title>
<link rel="icon" type="image/png" href="/favicon.png" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    min-height: 100vh; display: grid; place-items: center; padding: 24px;
    background: #080A0C;
    background-image: radial-gradient(ellipse 70% 50% at 50% 0%, rgba(0,200,255,0.10), transparent 60%);
    color: #E9EEF2; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  }
  .card {
    width: 100%; max-width: 400px; padding: 40px 36px 32px; border-radius: 24px;
    background: rgba(14,18,22,0.9); border: 1px solid rgba(255,255,255,0.08);
    box-shadow: 0 30px 80px -40px rgba(0,200,255,0.35);
  }
  .logo { display: block; width: 56px; height: 56px; margin: 0 auto 18px; }
  h1 { font-size: 15px; font-weight: 600; letter-spacing: 0.24em; text-align: center; text-transform: uppercase; }
  .sub { margin-top: 8px; font-size: 11px; letter-spacing: 0.3em; text-align: center; text-transform: uppercase; color: #00C8FF; }
  form { margin-top: 30px; display: flex; flex-direction: column; gap: 14px; }
  label { font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #7E8A94; }
  input[type=password] {
    width: 100%; margin-top: 8px; padding: 14px 18px; border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.14); background: rgba(255,255,255,0.04);
    color: #fff; font-size: 15px; letter-spacing: 0.08em; outline: none;
  }
  input[type=password]:focus { border-color: rgba(0,200,255,0.6); box-shadow: 0 0 0 3px rgba(0,200,255,0.15); }
  button {
    margin-top: 8px; padding: 15px 30px; border: 0; border-radius: 999px; cursor: pointer;
    background: linear-gradient(135deg, #00C8FF, #59E6FF); color: #04121A;
    font-size: 13px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.45), 0 12px 30px -12px rgba(0,200,255,0.7);
  }
  button:hover { filter: brightness(1.08); }
  .err {
    margin-top: 18px; padding: 12px 16px; border-radius: 14px; font-size: 13.5px; line-height: 1.45;
    color: #FF9D9D; background: rgba(255,60,60,0.08); border: 1px solid rgba(255,90,90,0.35);
  }
  .foot { margin-top: 26px; text-align: center; font-size: 10px; letter-spacing: 0.26em; text-transform: uppercase; color: #55606A; }
</style>
</head>
<body>
  <main class="card">
    <img class="logo" src="/favicon.png" alt="" width="56" height="56" />
    <h1>CANNA COOKIES</h1>
    <p class="sub">Админ-панель</p>
    <form method="post" action="/admin/login">
      <label>Пароль
        <input type="password" name="password" autocomplete="current-password" autofocus required />
      </label>
      <button type="submit">Войти</button>
    </form>
    ${errorBox}
    <p class="foot">21+ · DON'T PANIC, IT'S ORGANIC</p>
  </main>
</body>
</html>`
  const headers: Record<string, string> = {
    'content-type': 'text/html; charset=utf-8',
    'cache-control': 'no-store',
    'x-robots-tag': 'noindex, nofollow',
  }
  if (retryAfter) headers['retry-after'] = String(retryAfter)
  return new Response(html, { status, headers })
}
