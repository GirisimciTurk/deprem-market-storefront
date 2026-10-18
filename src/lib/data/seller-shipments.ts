"use server"

import { gobitData } from "@lib/gobit/client"
import { getAuthHeaders, getOrderHeaders } from "./cookies"

export type StoreSellerShipmentItem = {
  title?: string
  quantity?: number
}

export type StoreSellerShipment = {
  seller_order_id: string
  seller_name: string
  seller_handle: string
  /** Türetilmiş aşama — 4 aşamalı takip çizelgesiyle aynı dil (backend/lib/order-stage.ts). */
  stage?: "received" | "preparing" | "shipped" | "delivered" | "canceled"
  stage_label?: string
  /** Ham enum. Backend `stage` göndermezse buradan türetiliyor (geriye dönük uyum). */
  fulfillment_status: string
  preparing_at?: string | null
  fulfilled_at?: string | null
  carrier?: string | null
  tracking_number?: string | null
  tracking_url?: string | null
  items?: StoreSellerShipmentItem[]
}

// dtm'nin sipariş takibi (/store/v1/dtm/orders/{id}/shipments): siparişi
// okuyabilene (oturum ya da siparişin jetonu) her satıcının aşaması ve kargosu.
type DtmTracking = {
  order_id: string
  stage: StoreOrderStage["stage"]
  stage_label: string
  seller_shipments: {
    seller_name: string
    seller_handle: string
    stage: StoreOrderStage["stage"]
    stage_label: string
    carrier: string
    tracking_number: string
    tracking_url: string
    item_count: number
  }[]
}

async function tracking(orderId: string): Promise<DtmTracking | null> {
  return gobitData<DtmTracking>(`/store/v1/dtm/orders/${encodeURIComponent(orderId)}/shipments`, {
    headers: await getOrderHeaders(orderId),
    cache: "no-store",
  }).catch(() => null)
}

export async function getSellerShipments(orderId: string): Promise<StoreSellerShipment[]> {
  const t = await tracking(orderId)

  return (t?.seller_shipments ?? []).map((s, i) => ({
    seller_order_id: `${orderId}-${i}`,
    seller_name: s.seller_name,
    seller_handle: s.seller_handle,
    stage: s.stage,
    stage_label: s.stage_label,
    fulfillment_status: s.stage,
    carrier: s.carrier || null,
    tracking_number: s.tracking_number || null,
    tracking_url: s.tracking_url || null,
    items: [{ quantity: s.item_count }],
  }))
}

export type StoreOrderStage = {
  order_id: string
  stage: "received" | "preparing" | "shipped" | "delivered" | "canceled"
  stage_label: string
}

/**
 * Siparişlerin özet aşaması; okunamayan sipariş listede yer almaz. Giriş yapmış
 * müşteri için dtm'nin toplu okuması (/store/v1/dtm/order-stages, istek başına
 * en çok 50 sipariş); oturum yoksa ya da toplu okuma olmazsa her sipariş kendi
 * takibinden (jetonuyla) okunur.
 */
export async function getOrderStages(orderIds: string[]): Promise<Record<string, StoreOrderStage>> {
  const ids = Array.from(new Set(orderIds.filter(Boolean)))
  if (!ids.length) return {}

  const headers = await getAuthHeaders()
  if (headers.cookie) {
    try {
      const pages = await Promise.all(
        Array.from({ length: Math.ceil(ids.length / 50) }, (_, i) =>
          gobitData<StoreOrderStage[]>("/store/v1/dtm/order-stages", {
            query: { order_ids: ids.slice(i * 50, i * 50 + 50).join(",") },
            headers,
            cache: "no-store",
          })
        )
      )
      return Object.fromEntries(pages.flat().map((s) => [s.order_id, s]))
    } catch {
      // Aşağıdaki sipariş başına okumaya düşer.
    }
  }

  const all = await Promise.all(ids.map(tracking))

  return Object.fromEntries(
    all.filter(Boolean).map((t) => [t!.order_id, { order_id: t!.order_id, stage: t!.stage, stage_label: t!.stage_label }])
  )
}
