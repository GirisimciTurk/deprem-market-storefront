import { convertToLocale } from "@lib/util/money"
import type { LegacyOrder } from "@lib/data/legacy-orders"

const SHIPMENT: Record<string, string> = { pending: "Hazırlanıyor", fulfilled: "Kargoya verildi", canceled: "İptal edildi" }

const date = (iso: string) =>
  new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })

/** Eski sistemden gelen siparişler: salt okunur arşiv, işlem yapılmaz. */
const LegacyOrders = ({ orders }: { orders: LegacyOrder[] }) => {
  if (!orders.length) return null

  return (
    <section className="mt-10" data-testid="legacy-orders">
      <h2 className="text-large-semi">Önceki Sistemden Siparişler</h2>
      <p className="text-small-regular text-ui-fg-subtle mt-1 mb-6">
        Yeni sisteme geçmeden önce verdiğiniz siparişler. Bu kayıtlar arşivdir; iade ve değişiklik
        talepleriniz için bizimle iletişime geçin.
      </p>
      <div className="flex flex-col gap-y-6">
        {orders.map((o) => {
          const money = (amount: number) => convertToLocale({ amount, currency_code: o.currency })
          const items = o.items.reduce((sum, it) => sum + it.total, 0)
          const shipping = o.shipping.reduce((sum, s) => sum + s.amount, 0)
          // Medusa'nın sipariş özeti (vergi ve indirim dahil); yoksa satırlar + kargo.
          const summary = Number(o.totals?.current_order_total ?? o.totals?.original_order_total)
          const total = Number.isFinite(summary) && summary > 0 ? summary : items + shipping
          return (
            <div key={o.id} className="rounded-xl border border-ui-border-base p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-semibold">Sipariş #{o.display_id}</span>
                <span className="text-small-regular text-ui-fg-subtle">{date(o.created_at)}</span>
              </div>
              {o.canceled_at && <p className="text-small-regular text-rose-600 mt-1">İptal edildi</p>}
              <ul className="mt-3 flex flex-col gap-y-1 text-small-regular">
                {o.items.map((it, i) => (
                  <li key={i} className="flex justify-between gap-4">
                    <span>
                      {it.title}
                      {it.variant_title && it.variant_title !== it.title ? ` · ${it.variant_title}` : ""} × {it.quantity}
                    </span>
                    <span>{money(it.total)}</span>
                  </li>
                ))}
                {shipping > 0 && (
                  <li className="flex justify-between gap-4 text-ui-fg-subtle">
                    <span>Kargo</span>
                    <span>{money(shipping)}</span>
                  </li>
                )}
                <li className="flex justify-between gap-4 font-semibold border-t border-ui-border-base pt-1 mt-1">
                  <span>Toplam</span>
                  <span>{money(total)}</span>
                </li>
              </ul>
              {o.sellers.map((s) => (
                <p key={s.id} className="text-small-regular text-ui-fg-subtle mt-2">
                  {s.seller_name}: {SHIPMENT[s.fulfillment_status] ?? s.fulfillment_status}
                  {s.tracking_number &&
                    (s.tracking_url ? (
                      <>
                        {" · "}
                        <a href={s.tracking_url} target="_blank" rel="noopener noreferrer" className="underline">
                          {s.carrier ? `${s.carrier.toUpperCase()} ` : ""}
                          {s.tracking_number}
                        </a>
                      </>
                    ) : (
                      ` · ${s.carrier ? `${s.carrier.toUpperCase()} ` : ""}${s.tracking_number}`
                    ))}
                </p>
              ))}
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default LegacyOrders
