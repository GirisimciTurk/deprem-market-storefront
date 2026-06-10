"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "./cookies"

export type StoreReturnReason = {
  id: string
  label: string
  value: string
  description?: string
}

export type ReturnRequestItem = {
  id: string // sipariş kalemi (line item) id
  quantity: number
  reason_id?: string | null
}

/**
 * İade sebeplerini getirir (public). Müşteri iade formunda sebep seçimi için.
 */
export const listReturnReasons = async (): Promise<StoreReturnReason[]> => {
  return sdk.client
    .fetch<{ return_reasons: StoreReturnReason[] }>(`/store/return-reasons`, {
      method: "GET",
      query: { fields: "id,value,label,description" },
      cache: "no-store",
    })
    .then(({ return_reasons }) => return_reasons ?? [])
    .catch(() => [])
}

/**
 * Giriş yapmış müşteri için iade talebi oluşturur (custom /store/return-requests ucu).
 * Başarıda iade kaydı "requested" olur ve müşteriye onay e-postası gider.
 */
export const createReturnRequest = async (
  orderId: string,
  items: ReturnRequestItem[],
  note?: string
): Promise<{ success: boolean; error: string | null }> => {
  const headers = await getAuthHeaders()

  return sdk.client
    .fetch(`/store/return-requests`, {
      method: "POST",
      headers,
      body: { order_id: orderId, items, note },
    })
    .then(() => ({ success: true, error: null }))
    .catch((err: any) => ({
      success: false,
      error: err?.message || "İade talebi oluşturulamadı.",
    }))
}
