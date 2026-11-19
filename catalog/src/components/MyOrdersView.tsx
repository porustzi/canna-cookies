import { useCallback, useEffect, useState } from 'react'
import { useApp } from '../context'
import { confirmReceived, getOrder, openDispute, type OrderInfo } from '../api'
import { addMyOrder, readMyOrders, type MyOrder } from '../storage'

type Entry = { local: MyOrder; info: OrderInfo | null; loading: boolean; error: boolean }

function fmtDate(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getDate())}.${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}`
}

export function MyOrdersView() {
  const { t } = useApp()
  const [entries, setEntries] = useState<Entry[]>(() => readMyOrders().map((local) => ({ local, info: null, loading: true, error: false })))
  const [findId, setFindId] = useState('')
  const [findState, setFindState] = useState<'idle' | 'busy' | 'missing'>('idle')
  const [disputeFor, setDisputeFor] = useState<string | null>(null)
  const [disputeText, setDisputeText] = useState('')
  const [disputeBusy, setDisputeBusy] = useState(false)
  const [disputeDone, setDisputeDone] = useState<Record<string, boolean>>({})
  const [disputeErr, setDisputeErr] = useState<string | null>(null)
  const [receiveBusy, setReceiveBusy] = useState(false)
  const [receiveErr, setReceiveErr] = useState<string | null>(null)

  const loadOne = useCallback(async (id: string) => {
    setEntries((prev) => prev.map((e) => (e.local.id === id ? { ...e, loading: true, error: false } : e)))
    try {
      const info = await getOrder(id)
      setEntries((prev) => prev.map((e) => (e.local.id === id ? { ...e, info, loading: false, error: false } : e)))
    } catch {
      setEntries((prev) => prev.map((e) => (e.local.id === id ? { ...e, loading: false, error: true } : e)))
    }
  }, [])

  useEffect(() => {
    for (const e of entries) void loadOne(e.local.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const findByNumber = async () => {
    const id = findId.trim().toUpperCase()
    if (!id) return
    setFindState('busy')
    try {
      await getOrder(id)
      addMyOrder(id)
      setEntries((prev) => (prev.some((e) => e.local.id === id) ? prev : [{ local: { id, at: Date.now() }, info: null, loading: true, error: false }, ...prev]))
      setFindId('')
      setFindState('idle')
      void loadOne(id)
    } catch {
      setFindState('missing')
    }
  }

  const sendDispute = async (orderId: string) => {
    setDisputeBusy(true)
    setDisputeErr(null)
    try {
      await openDispute(orderId, disputeText.trim())
      setDisputeDone((d) => ({ ...d, [orderId]: true }))
      setDisputeFor(null)
      setDisputeText('')
    } catch (e) {
      const msg = e instanceof Error ? e.message : ''
      setDisputeErr(msg === 'rate-limited' ? t.rateLimit : msg === 'not-found' ? t.orders.notFound : t.orders.disputeErr)
    } finally {
      setDisputeBusy(false)
    }
  }

  const receiveOrder = async (orderId: string) => {
    if (!window.confirm(t.orders.receiveConfirm)) return
    setReceiveBusy(true)
    setReceiveErr(null)
    try {
      await confirmReceived(orderId)
      setEntries((prev) =>
        prev.map((e) => (e.local.id === orderId && e.info ? { ...e, info: { ...e.info, reviewed: true } } : e)),
      )
    } catch (e) {
      const msg = e instanceof Error ? e.message : ''
      setReceiveErr(msg === 'rate-limited' ? t.rateLimit : msg === 'not-assigned' ? t.orders.notFound : t.orders.receiveErr)
    } finally {
      setReceiveBusy(false)
    }
  }

  const statusLabel = (status: string) =>
    status === 'new'
      ? t.orders.sNew
      : status === 'taken'
        ? t.orders.sTaken
        : status === 'done'
          ? t.orders.sDone
          : status

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[clamp(1.4rem,6vw,1.9rem)]">{t.orders.title}</h1>
      <p className="text-[14.5px] leading-relaxed text-mist">{t.orders.lead}</p>

      <div className="cc-card flex flex-col gap-3 p-4 sm:flex-row sm:items-end sm:gap-3">
        <label className="block flex-1">
          <span className="font-display text-[11px] uppercase tracking-[0.2em] text-mist/70">{t.orders.find}</span>
          <input
            value={findId}
            onChange={(e) => {
              setFindId(e.target.value)
              setFindState('idle')
            }}
            placeholder={t.orders.findPh}
            autoCapitalize="characters"
            className="mt-2 w-full rounded-xl border border-white/12 bg-graphite px-4 py-3 text-[15px] uppercase text-snow placeholder:normal-case placeholder:text-mist/40 outline-none focus:border-aqua/60"
          />
        </label>
        <button
          type="button"
          onClick={() => void findByNumber()}
          disabled={findState === 'busy' || !findId.trim()}
          className="cc-btn-ghost px-5 py-3 text-[11.5px] disabled:opacity-40"
        >
          {t.orders.findBtn}
        </button>
      </div>
      {findState === 'missing' && <p className="text-[13.5px] text-[#FFD28F]">{t.orders.notFound}</p>}

      <div className="flex flex-col gap-3">
        {entries.length === 0 && <div className="cc-card p-5 text-[14px] leading-relaxed text-mist">{t.orders.empty}</div>}

        {entries.map((e) => (
          <div key={e.local.id} className="cc-card flex flex-col gap-3 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-display text-[15px] font-semibold tracking-wide text-aqua">{e.local.id}</span>
              {e.info && (
                <span
                  className={`rounded-full border px-3 py-1 font-display text-[10px] uppercase tracking-[0.16em] ${
                    e.info.status === 'done'
                      ? 'border-aqua/50 bg-aqua/10 text-aqua'
                      : e.info.status === 'taken'
                        ? 'border-[#FFD28F]/50 bg-[#FFD28F]/10 text-[#FFD28F]'
                        : 'border-white/15 bg-white/[0.04] text-mist'
                  }`}
                >
                  {statusLabel(e.info.status)}
                </span>
              )}
            </div>

            {e.loading && <p className="text-[13px] text-mist/60">…</p>}
            {e.error && <p className="text-[13px] text-[#FF9D9D]">{t.orders.notFound}</p>}

            {e.info && (
              <>
                <p className="text-[13px] text-mist/70">
                  {fmtDate(e.info.createdAt)}
                  {e.info.district ? ` · ${e.info.district.name}` : ''} · {e.info.grand} Kč
                </p>
                <ul className="flex flex-col gap-1">
                  {e.info.items.slice(0, 5).map((it, idx) => (
                    <li key={idx} className="text-[13.5px] text-mist">
                      {it.name} · {it.weight} ×{it.qty} — {it.price * it.qty} Kč
                    </li>
                  ))}
                </ul>
              </>
            )}

            {e.info && (
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-2">
                  {e.info.assigned && !e.info.reviewed && (
                    <button
                      type="button"
                      onClick={() => void receiveOrder(e.local.id)}
                      disabled={receiveBusy}
                      className="cc-btn-primary px-4 py-2 text-[11px] disabled:opacity-50"
                    >
                      {receiveBusy ? '…' : `⭐ ${t.orders.receive}`}
                    </button>
                  )}
                  {e.info.reviewed && (
                    <span className="inline-flex items-center rounded-full border border-aqua/50 bg-aqua/10 px-4 py-2 font-display text-[11px] uppercase tracking-[0.14em] text-aqua">
                      {t.orders.received}
                    </span>
                  )}
                  {!disputeDone[e.local.id] && disputeFor !== e.local.id && (
                    <button
                      type="button"
                      onClick={() => {
                        setDisputeFor(e.local.id)
                        setDisputeText('')
                        setDisputeErr(null)
                      }}
                      className="cc-btn-ghost px-4 py-2 text-[11px] hover:border-[rgba(255,90,90,0.5)] hover:text-[#FF9D9D]"
                    >
                      ⚔️ {t.orders.dispute}
                    </button>
                  )}
                </div>

                {receiveErr && <p className="text-[13px] text-[#FF9D9D]">{receiveErr}</p>}

                {disputeFor === e.local.id && (
                  <div className="flex flex-col gap-2">
                    <textarea
                      value={disputeText}
                      onChange={(ev) => setDisputeText(ev.target.value)}
                      placeholder={t.orders.disputePh}
                      rows={3}
                      className="w-full resize-none rounded-xl border border-white/12 bg-graphite px-4 py-3 text-[14.5px] leading-relaxed text-snow placeholder:text-mist/40 outline-none focus:border-aqua/60"
                    />
                    {disputeErr && <p className="text-[13px] text-[#FF9D9D]">{disputeErr}</p>}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => void sendDispute(e.local.id)}
                        disabled={disputeBusy || disputeText.trim().length < 5}
                        className="cc-btn-primary px-5 py-2.5 text-[11.5px] disabled:opacity-50"
                      >
                        {disputeBusy ? '…' : t.orders.disputeSend}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDisputeFor(null)}
                        className="cc-btn-ghost px-4 py-2.5 text-[11px]"
                      >
                        {t.close}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {disputeDone[e.local.id] && (
              <div className="rounded-xl border border-aqua/40 bg-aqua/[0.07] p-3">
                <p className="font-display text-[12px] uppercase tracking-[0.16em] text-aqua">✓ {t.orders.disputeOk}</p>
                <p className="mt-1 text-[13px] text-mist">{t.orders.disputeOkText}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
