import { useCallback, useEffect, useState } from 'react'
import { api } from './api'
import type { AdminState } from './api'
import { Logo } from '../components/Logo'
import { ContactsEditor } from './ContactsEditor'
import { GalleryManager } from './GalleryManager'
import { ImageManager } from './ImageManager'

type Tab = 'dashboard' | 'contacts' | 'gallery' | 'images'

const TABS: { id: Tab; label: string }[] = [
  { id: 'dashboard', label: 'Дашборд' },
  { id: 'contacts', label: 'Контакты' },
  { id: 'gallery', label: 'Галерея точки' },
  { id: 'images', label: 'Изображения' },
]

export function AdminApp() {
  const [state, setState] = useState<AdminState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('dashboard')
  const [toast, setToast] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const next = await api.state()
      setState(next)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось загрузить состояние.')
    }
  }, [])

  useEffect(() => {
    let alive = true
    api
      .state()
      .then((next) => {
        if (alive) {
          setState(next)
          setError(null)
        }
      })
      .catch((e: unknown) => {
        if (alive) setError(e instanceof Error ? e.message : 'Не удалось загрузить состояние.')
      })
    return () => {
      alive = false
    }
  }, [])

  const notify = useCallback((msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 3200)
  }, [])

  if (error && !state) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-5 px-6 text-center">
        <p className="text-[15px] text-mist">{error}</p>
        <button type="button" onClick={() => void load()} className="cc-btn-ghost">
          Повторить
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-40 border-b border-white/8 bg-ink/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-4">
            <Logo className="text-[16px]" />
            <span className="rounded-full border border-aqua/40 bg-aqua/10 px-3 py-1 font-display text-[10px] uppercase tracking-[0.3em] text-aqua">
              Админ
            </span>
          </div>
          <a href="/admin/logout" className="cc-btn-ghost px-5 py-2.5 text-[11px]">
            Выйти
          </a>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-5 pb-3">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`whitespace-nowrap rounded-full px-4 py-2 font-display text-[11.5px] uppercase tracking-[0.16em] transition ${
                tab === item.id ? 'bg-aqua text-ink' : 'text-mist hover:bg-white/5 hover:text-snow'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-5 pt-8">
        {!state ? (
          <p className="py-20 text-center text-mist">Загрузка…</p>
        ) : tab === 'dashboard' ? (
          <Dashboard state={state} onRefresh={() => void load()} />
        ) : tab === 'contacts' ? (
          <ContactsEditor state={state} onSaved={(msg) => { notify(msg); void load() }} />
        ) : tab === 'gallery' ? (
          <GalleryManager state={state} onRefresh={() => void load()} onNotify={notify} />
        ) : (
          <ImageManager state={state} onRefresh={() => void load()} onNotify={notify} />
        )}
      </main>

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-aqua/40 bg-ink px-5 py-3 text-[13.5px] text-snow shadow-[0_16px_50px_-20px_rgba(0,200,255,0.6)]">
          {toast}
        </div>
      ) : null}
    </div>
  )
}

function Dashboard({ state, onRefresh }: { state: AdminState; onRefresh: () => void }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      <section className="cc-card p-6">
        <span className="cc-eyebrow">Хранилище</span>
        <p className={`mt-4 text-[22px] ${state.kv ? 'text-aqua' : 'text-[#FF9D9D]'}`}>{state.kv ? 'KV подключено' : 'KV недоступно'}</p>
        <p className="mt-2 text-[13.5px] leading-relaxed text-mist">
          {state.kv ? 'Изменения публикуются на сайте сразу после сохранения.' : 'Проверьте binding SITE_CONTENT в проекте Pages.'}
        </p>
        <button type="button" onClick={onRefresh} className="cc-btn-ghost mt-5 px-5 py-2.5 text-[11px]">
          Обновить
        </button>
      </section>

      <section className="cc-card p-6">
        <span className="cc-eyebrow">Галерея точки</span>
        <p className="mt-4 text-[22px] text-snow">{state.gallery.length} фото</p>
        <p className="mt-2 text-[13.5px] leading-relaxed text-mist">Максимум 40. Фото хранятся в KV и отдаются через /api/media.</p>
      </section>

      <section className="cc-card p-6">
        <span className="cc-eyebrow">Сайт</span>
        <ul className="mt-4 space-y-2.5 text-[14.5px]">
          <li>
            <a className="cc-link text-aqua" href="/cs/" target="_blank" rel="noreferrer">
              Открыть /cs/
            </a>
          </li>
          <li>
            <a className="cc-link text-aqua" href="/en/" target="_blank" rel="noreferrer">
              Открыть /en/
            </a>
          </li>
          <li>
            <a className="cc-link text-aqua" href="/ru/" target="_blank" rel="noreferrer">
              Открыть /ru/
            </a>
          </li>
        </ul>
      </section>

      <section className="cc-card p-6 md:col-span-2 lg:col-span-3">
        <span className="cc-eyebrow">Статус</span>
        <p className="mt-4 text-[15px] leading-relaxed text-mist">
          Этап 3 — сайт (CS/EN/RU, гейт 21+) и каталог в Telegram (Mini App) опубликованы. Админка: контакты, галерея и
          изображения редактируются без деплоя. Заказы из каталога пока сохраняются в KV — отправка в Telegram
          подключается следующим шагом.
        </p>
      </section>
    </div>
  )
}
