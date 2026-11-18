export type TgUser = {
  id: number
  username?: string
  first_name?: string
  language_code?: string
}

type TgWebApp = {
  ready(): void
  expand(): void
  initDataUnsafe?: { user?: TgUser }
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TgWebApp }
  }
}

export function tg(): TgWebApp | null {
  return window.Telegram?.WebApp ?? null
}

export function tgUser(): TgUser | null {
  return tg()?.initDataUnsafe?.user ?? null
}

export function tgInit(): void {
  const app = tg()
  if (!app) return
  try {
    app.ready()
    app.expand()
  } catch {
    /* not inside Telegram — fine */
  }
}

export function tgLang(): string | null {
  return tgUser()?.language_code ?? null
}
