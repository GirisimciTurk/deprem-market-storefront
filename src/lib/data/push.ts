"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "./cookies"

/**
 * Web push abonelik/stok-uyarı server action'ları.
 *
 * Müşteri kimliği (_medusa_jwt) yalnızca sunucu tarafında okunabildiğinden bu
 * çağrılar server action olarak yapılır → giriş yapmış kullanıcıda abonelik
 * customer_id'ye bağlanır (sipariş bildirimleri için). Misafirde auth başlığı
 * boş gider, backend allowUnauthenticated ile yine kaydeder.
 */

type SerializedSubscription = {
  endpoint: string
  keys: { p256dh: string; auth: string }
  locale?: string
}

export async function savePushSubscription(
  sub: SerializedSubscription
): Promise<{ success: boolean; error: string | null }> {
  try {
    const headers = { ...(await getAuthHeaders()) }
    await sdk.client.fetch(`/store/push/subscribe`, {
      method: "POST",
      headers,
      body: sub,
    })
    return { success: true, error: null }
  } catch (e: any) {
    return { success: false, error: e?.message || String(e) }
  }
}

export async function removePushSubscription(
  endpoint: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const headers = { ...(await getAuthHeaders()) }
    await sdk.client.fetch(`/store/push/unsubscribe`, {
      method: "POST",
      headers,
      body: { endpoint },
    })
    return { success: true, error: null }
  } catch (e: any) {
    return { success: false, error: e?.message || String(e) }
  }
}

export async function saveStockAlert(input: {
  variant_id: string
  endpoint: string
  product_id?: string
  product_handle?: string
  product_title?: string
}): Promise<{ success: boolean; error: string | null }> {
  try {
    const headers = { ...(await getAuthHeaders()) }
    await sdk.client.fetch(`/store/push/stock-alert`, {
      method: "POST",
      headers,
      body: input,
    })
    return { success: true, error: null }
  } catch (e: any) {
    return { success: false, error: e?.message || String(e) }
  }
}
