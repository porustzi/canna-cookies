import { useApp } from '../context'

export function BottomNav() {
  const { t, go, route, cartCount } = useApp()

  const items = [
    { id: 'catalog', label: t.nav.catalog },
    { id: 'cart', label: t.nav.cart, badge: cartCount },
    { id: 'faq', label: t.nav.faq },
    { id: 'feedback', label: t.nav.feedback },
  ]

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[max(12px,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto flex items-center gap-0.5 rounded-full border border-white/12 bg-graphite/95 px-1.5 py-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.55)] backdrop-blur-md">
        {items.map((item) => {
          const active = route === item.id || (item.id === 'catalog' && route === 'order')
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => go(item.id)}
              className={`relative rounded-full px-3.5 py-2 font-display text-[10.5px] uppercase tracking-[0.14em] transition-colors ${
                active ? 'bg-aqua text-ink' : 'text-mist hover:text-snow'
              }`}
            >
              {item.label}
              {(item.badge ?? 0) > 0 ? (
                <span className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#FFD28F] px-1 font-display text-[9px] font-bold text-ink">
                  {item.badge}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
