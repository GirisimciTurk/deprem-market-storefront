import type { StoreAddress } from "types/store"

// gobit siparişinin vitrin tiplerine çevrilen parçaları (saf, sunucusuz:
// lib/data/orders.ts kullanır, order.spec.ts sınar).
//
// gobit'in vitrin siparişi (/store/v1/orders/{id}) adres, müşteri kimliği ve
// gönderim durumu taşımaz (gobit ADR 0193, 0439). Gönderim aşaması ve teslimat
// adresi dtm'nin siparişi okuyabilene verdiği takipten
// (/store/v1/dtm/orders/{id}/shipments), ödeme durumu siparişin özetinden
// (summary) okunur.

export type GobitOrderSummary = {
  paid_total?: number
  refunded_total?: number
  outstanding?: number
}

/** dtm'nin sipariş aşaması (dtm stage.go). */
export type DtmOrderStage = "received" | "preparing" | "shipped" | "delivered" | "canceled"

/** dtm'nin teslimat adresi: il city'de, ilçe province'ta. */
export type DtmShippingAddress = {
  first_name?: string
  last_name?: string
  company?: string
  address_1?: string
  address_2?: string
  city?: string
  province?: string
  postal_code?: string
  country_code?: string
  phone?: string
}

/** dtm'nin siparişi okuyabilene verdiği takip. */
export type DtmOrderTracking = {
  order_id: string
  stage?: DtmOrderStage | ""
  stage_label?: string
  shipping_address?: DtmShippingAddress | null
}

/** Siparişin gönderim durumu (vitrinin dili): dtm aşamasından; iptal önce gelir. */
export function fulfillmentStatusOf(stage: DtmOrderStage | "" | undefined, canceledAt?: string | null): string {
  if (canceledAt || stage === "canceled") return "canceled"
  if (stage === "shipped") return "shipped"
  if (stage === "delivered") return "delivered"

  return "not_fulfilled"
}

/**
 * Siparişin ödeme durumu, özetinden. Özet yoksa "captured": depremtek'te
 * sipariş ancak PayTR ödemesi alındıktan sonra oluşur.
 */
export function paymentStatusOf(summary?: GobitOrderSummary | null): string {
  if (!summary) return "captured"
  const paid = summary.paid_total ?? 0
  const refunded = summary.refunded_total ?? 0
  const outstanding = summary.outstanding ?? 0
  if (refunded > 0) return refunded >= paid ? "refunded" : "partially_refunded"
  if (outstanding > 0) return paid > 0 ? "partially_captured" : "not_paid"

  return "captured"
}

/** dtm'nin teslimat adresi → vitrin adresi; boş adres null. */
export function toShippingAddress(a?: DtmShippingAddress | null): StoreAddress | null {
  if (!a) return null
  const out: StoreAddress = {
    first_name: a.first_name || null,
    last_name: a.last_name || null,
    company: a.company || null,
    address_1: a.address_1 || null,
    address_2: a.address_2 || null,
    city: a.city || null,
    province: a.province || null,
    postal_code: a.postal_code || null,
    country_code: a.country_code ? a.country_code.toLowerCase() : null,
    phone: a.phone || null,
  }

  return Object.values(out).some(Boolean) ? out : null
}
