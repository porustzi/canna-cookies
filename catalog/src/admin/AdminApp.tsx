import { useCallback, useEffect, useState } from 'react'
import { api, type AdminState } from './api'
import { TabButton } from './ui'
import { FaqEditor } from './FaqEditor'
import { ProductsEditor } from './ProductsEditor'
import { CategoriesEditor } from './CategoriesEditor'
import { ZonesEditor } from './ZonesEditor'
import { SettingsEditor } from './SettingsEditor'
import { OrdersEditor } from './OrdersEditor'
import { CouriersEditor } from './CouriersEditor'
import { FeedbackEditor } from './FeedbackEditor'

type Tab = 'faq' | 'products' | 'categories' | 'zones' | 'settings' | 'orders' | 'couriers' | 'feedback'

const TABS: { id: Tab; label: string }[] = [
  { id: 'orders', label: 'Заказы' },
  { id: 'feedback', label: 'Обращения' },
  { id: 'couriers', label: 'Курьеры' },
  { id: 'products', label: 'Товары' },
  { id: 'categories', label: 'Категории' },
  { id: 'zones', label: 'Зоны' },
  { id: 'settings', label: 'Настройки' },
  { id: 'faq', label: 'FAQ' },
]

export function AdminApp() {
  const [state, setState] = useState<AdminState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('orders')
  const [toast, setToast] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const next = await api.state()
      setState(next)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось загрузить каталог.')
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
        if (alive) setError(e instanceof Error ? e.message : 'Не удалось загрузить каталог.')
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

  const onSaved = (msg: string) => {
    notify(msg)
    void load()
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-40 border-b border-white/8 bg-ink/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-3 sm:gap-4 sm:px-5 sm:py-4">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <img src="/cc.png" alt="" className="h-7 w-7 shrink-0 sm:h-8 sm:w-8" />
            <span className="font-display text-[13px] font-semibold tracking-[0.18em] text-snow sm:text-[15px]">
              COOKIES
            </span>
            <span className="shrink-0 rounded-full border border-aqua/40 bg-aqua/10 px-2 py-0.5 font-display text-[9px] uppercase tracking-[0.24em] text-aqua sm:px-3 sm:py-1 sm:text-[10px] sm:tracking-[0.3em]">
              Админка
            </span>
            {state && !state.kv && (
              <span className="shrink-0 rounded-full border border-[#FF9D9D]/40 bg-[#FF9D9D]/10 px-2 py-0.5 font-display text-[9px] uppercase tracking-[0.2em] text-[#FF9D9D] sm:px-3 sm:py-1 sm:text-[10px]">
                KV!
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="cc-btn-ghost px-3.5 py-2 text-[10px] sm:px-5 sm:py-2.5 sm:text-[11px]"
            >
              <span className="sm:hidden">Каталог ↗</span>
              <span className="hidden sm:inline">Открыть каталог</span>
            </a>
            <a href="/admin/logout" className="cc-btn-ghost px-3.5 py-2 text-[10px] sm:px-5 sm:py-2.5 sm:text-[11px]">
              Выйти
            </a>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-3 pb-3 sm:px-5">
          {TABS.map((item) => (
            <TabButton key={item.id} active={tab === item.id} onClick={() => setTab(item.id)}>
              {item.label}
            </TabButton>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-6 sm:px-5 sm:pt-8">
        {!state ? (
          <p className="py-20 text-center text-mist">Загрузка…</p>
        ) : tab === 'orders' ? (
          <OrdersEditor state={state} onSaved={onSaved} />
        ) : tab === 'feedback' ? (
          <FeedbackEditor state={state} onSaved={onSaved} />
        ) : tab === 'couriers' ? (
          <CouriersEditor state={state} onSaved={onSaved} />
        ) : tab === 'faq' ? (
          <FaqEditor state={state} onSaved={onSaved} />
        ) : tab === 'products' ? (
          <ProductsEditor state={state} onSaved={onSaved} notify={notify} />
        ) : tab === 'categories' ? (
          <CategoriesEditor state={state} onSaved={onSaved} />
        ) : tab === 'zones' ? (
          <ZonesEditor state={state} onSaved={onSaved} />
        ) : (
          <SettingsEditor state={state} onSaved={onSaved} />
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
