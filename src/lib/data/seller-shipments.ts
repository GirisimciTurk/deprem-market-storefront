"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "./cookies"

export type StoreSellerShipmentItem = {
  title?: string
  quantity?: number
}

export type StoreSellerShipment = {
  seller_order_id: string
  seller_name: string
  seller_handle: string
  /** Türetilmiş aşama — 4 aşamalı takip çizelgesiyle aynı dil (backend/lib/order-stage.ts). */
  stage?: "received" | "preparing" | "shipped" | "canceled"
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

/**
 * Giriş yapmış müşteri için sipariş bazlı satıcı kargo takip bilgilerini getirir.
 * Sipariş sahibi olmayan müşteriye backend yetki vermez.
 */
export async function getSellerShipments(
  orderId: string
): Promise<StoreSellerShipment[]> {
  const headers = { ...(await getAuthHeaders()) }
  return sdk.client
    .fetch<{ shipments: StoreSellerShipment[] }>(`/store/seller-shipments`, {
      method: "GET",
      headers,
      query: { order_id: orderId },
      cache: "no-store",
    })
    .then((r) => r.shipments ?? [])
    .catch(() => [])
}
