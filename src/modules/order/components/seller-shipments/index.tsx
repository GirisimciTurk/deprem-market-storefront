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

const STATUS_LABELS: Record<string, string> = {
  pending: "Hazırlanıyor",
  not_fulfilled: "Hazırlanıyor",
  fulfilled: "Kargoda",
  shipped: "Kargoda",
  partially_shipped: "Kargoda",
  delivered: "Teslim Edildi",
  canceled: "İptal",
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-gray-100 text-gray-600",
  not_fulfilled: "bg-gray-100 text-gray-600",
  fulfilled: "bg-blue-50 text-blue-600",
  shipped: "bg-blue-50 text-blue-600",
  partially_shipped: "bg-blue-50 text-blue-600",
  delivered: "bg-green-50 text-green-600",
  canceled: "bg-brand-50 text-brand-600",
}

const statusLabel = (status: string) =>
  STATUS_LABELS[status] ?? "Hazırlanıyor"

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

  // Hiç shipment yoksa veya hepsi pending+takipsizse bölümü gizle.
  const hasVisible = shipments.some(
    (s) =>
      !["pending", "not_fulfilled"].includes(s.fulfillment_status) ||
      !!s.tracking_number
  )

  if (!loaded || shipments.length === 0 || !hasVisible) {
    return null
  }

  return (
    <div className="flex flex-col gap-y-4">
      <h2 className="text-xl-semi">Kargo Takibi</h2>
      <div className="flex flex-col gap-y-3">
        {shipments.map((s) => {
          const label = statusLabel(s.fulfillment_status)
          const style =
            STATUS_STYLES[s.fulfillment_status] ?? "bg-gray-100 text-gray-600"
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
