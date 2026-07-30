"use client"

import { useEffect, useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  getSellerShipments,
  type StoreSellerShipment,
} from "@lib/data/seller-shipments"
import CarrierLogo from "@modules/common/components/carrier-logo"

type Props = {
  orderId: string
}

// Aşama etiketleri backend'den `stage_label` olarak GELİYOR; buradaki tablo
// yalnızca stil eşlemesi ve `stage` göndermeyen eski backend için yedek.
// 4 aşamanın adları takip çizelgesiyle birebir aynı olmalı — eskiden burada
// "Kargoda" yazıyordu, çizelgede "Kargoya Verildi"; iki ekran farklı konuşuyordu.
const STAGE_LABELS: Record<string, string> = {
  received: "Sipariş Alındı",
  preparing: "Hazırlanıyor",
  shipped: "Kargoya Verildi",
  canceled: "İptal",
}

const STAGE_STYLES: Record<string, string> = {
  received: "bg-gray-100 text-gray-600",
  preparing: "bg-amber-50 text-amber-700",
  shipped: "bg-green-50 text-green-600",
  canceled: "bg-brand-50 text-brand-600",
}

/** Backend `stage` göndermiyorsa ham enum'dan aşamaya düş (geriye dönük uyum). */
const stageOf = (s: StoreSellerShipment): string => {
  if (s.stage) return s.stage
  if (s.fulfillment_status === "canceled") return "canceled"
  if (s.fulfillment_status === "fulfilled") return "shipped"
  return s.preparing_at ? "preparing" : "received"
}

const SellerShipments = ({ orderId }: Props) => {
  const [shipments, setShipments] = useState<StoreSellerShipment[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let active = true
    ;(async () => {
      const res = await getSellerShipments(orderId)
      if (!active) return
      setShipments(res)
      setLoaded(true)
    })()
    return () => {
      active = false
    }
  }, [orderId])

  // "Sipariş Alındı"da olan ve takip numarası da olmayan paketler gösterilecek
  // bir şey taşımaz → bölümü gizle. Ama "Hazırlanıyor" ARTIK gösterilir:
  // satıcının bastığı gerçek bir aşama, müşterinin görmesi gereken bilgi.
  const hasVisible = shipments.some(
    (s) => stageOf(s) !== "received" || !!s.tracking_number
  )

  if (!loaded || shipments.length === 0 || !hasVisible) {
    return null
  }

  return (
    <div className="flex flex-col gap-y-4">
      <h2 className="text-xl-semi">Kargo Takibi</h2>
      <div className="flex flex-col gap-y-3">
        {shipments.map((s) => {
          const stage = stageOf(s)
          const label = s.stage_label ?? STAGE_LABELS[stage] ?? "Hazırlanıyor"
          const style = STAGE_STYLES[stage] ?? "bg-gray-100 text-gray-600"
          return (
            <div
              key={s.seller_order_id}
              className="border border-gray-200 rounded-xl p-4 bg-white"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-x-2">
                  {s.seller_handle ? (
                    <LocalizedClientLink
                      href={`/satici/${s.seller_handle}`}
                      className="font-bold text-gray-900 hover:text-orange-600 transition-colors"
                    >
                      {s.seller_name}
                    </LocalizedClientLink>
                  ) : (
                    <span className="font-bold text-gray-900">
                      {s.seller_name}
                    </span>
                  )}
                  {s.carrier && <CarrierLogo code={s.carrier} height={16} withLabel />}
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${style}`}
                >
                  {label}
                </span>
              </div>

              {s.items && s.items.length > 0 && (
                <ul className="mt-2 text-sm text-gray-500 list-disc list-inside">
                  {s.items.map((it, idx) => (
                    <li key={idx}>
                      {it.title}
                      {it.quantity ? ` × ${it.quantity}` : ""}
                    </li>
                  ))}
                </ul>
              )}

              {s.tracking_number && (
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                  <span className="text-gray-500">
                    Takip No:{" "}
                    <span className="font-semibold text-gray-800">
                      {s.tracking_number}
                    </span>
                  </span>
                  {s.tracking_url && (
                    <a
                      href={s.tracking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-orange-600 hover:text-orange-500 transition-colors"
                    >
                      Kargom Nerede? →
                    </a>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default SellerShipments
