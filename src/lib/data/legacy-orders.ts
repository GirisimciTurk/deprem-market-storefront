"use server"

import { gobitData } from "@lib/gobit/client"
import { getAuthHeaders } from "./cookies"

// Eski sistemden (Medusa) gelen siparişler: taşıma onları gobit'in sipariş
// motoruna değil, salt okunur bir arşive yazdı (dtm /store/v1/dtm/legacy-orders).
// Tutarlar kuruş.

export type LegacyOrderItem = {
  title: string
  variant_title?: string
  thumbnail?: string
  quantity: number
  unit_price: number
  total: number
}

export type LegacyOrder = {
  id: string
  display_id: number
  status: string
  currency: string
  items: LegacyOrderItem[]
  shipping_address: { first_name?: string; last_name?: string; address_1?: string; city?: string } | null
  shipping: { name: string; amount: number }[]
  totals: Record<string, unknown>
  invoices: { type: string; status: string; invoice_number?: string; draft_number: string; grand_total: number }[]
  canceled_at: string | null
  created_at: string
  sellers: {
    id: string
    seller_name: string
    fulfillment_status: "pending" | "fulfilled" | "canceled"
    carrier: string
    tracking_number: string
    tracking_url: string
    fulfilled_at: string | null
  }[]
}

/** Oturumdaki müşterinin arşivlenmiş siparişleri; oturum yoksa ya da okunamazsa boş. */
export async function listLegacyOrders(): Promise<LegacyOrder[]> {
  const headers = await getAuthHeaders()
  if (!headers.cookie) return []
  return gobitData<LegacyOrder[]>("/store/v1/dtm/legacy-orders", { headers, cache: "no-store" }).catch(() => [])
}
