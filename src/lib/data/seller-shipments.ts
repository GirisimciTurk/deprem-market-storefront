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
  fulfillment_status: string
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
