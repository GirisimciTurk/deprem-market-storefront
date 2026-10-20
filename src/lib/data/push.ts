"use server"

import { gobitData, gobitFetch, GobitError } from "@lib/gobit/client"
import { getAuthHeaders } from "./cookies"

// Tarayıcı bildirimleri gobit'in web-push eklentisiyle (/store/v1/webpush/*):
// cihaz, oturum varsa oturumdaki müşteriye bağlanır (eklenti müşteriyi
// kanıttan okur). Stok uyarısı web-push'ta değil, gobit'in istek listesindedir.

type SerializedSubscription = {
  endpoint: string
  keys: { p256dh: string; auth: string }
  locale?: string
}

/**
 * gobit'in VAPID genel anahtarı (/store/v1/webpush/vapid-key). Vitrinde
 * yapılandırılmaz: gobit'teki anahtar değişince vitrin eski anahtarla abone
 * yapmaya devam etmesin. Web-push kurulu değilse (anahtar yok) null.
 */
export async function getVapidPublicKey(): Promise<string | null> {
  return gobitData<{ public_key: string }>("/store/v1/webpush/vapid-key", { next: { revalidate: 300 } })
    .then((k) => k.public_key || null)
    .catch(() => null)
}

async function sessionCustomer(headers: Record<string, string>): Promise<string | undefined> {
  if (!headers.cookie) return undefined

  return gobitData<{ customer_id: string }>("/store/v1/auth/session", { headers, cache: "no-store" })
    .then((s) => s.customer_id)
    .catch(() => undefined)
}

export async function savePushSubscription(
  sub: SerializedSubscription
): Promise<{ success: boolean; error: string | null }> {
  try {
    const headers = await getAuthHeaders()
    const customer = await sessionCustomer(headers)
    await gobitFetch("/store/v1/webpush/subscribe", {
      method: "POST",
      headers,
      body: { endpoint: sub.endpoint, keys: sub.keys, ...(customer ? { customer_id: customer } : {}) },
    })
    return { success: true, error: null }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) }
  }
}

export async function removePushSubscription(endpoint: string): Promise<{ success: boolean; error: string | null }> {
  try {
    await gobitFetch("/store/v1/webpush/unsubscribe", {
      method: "POST",
      headers: await getAuthHeaders(),
      body: { endpoint },
    })
    return { success: true, error: null }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) }
  }
}

/** "Gelince haber ver": ürünü istek listesine koyup stok uyarısını açar (giriş gerekir). */
export async function saveStockAlert(input: {
  variant_id: string
  endpoint?: string
  product_id?: string
  product_handle?: string
  product_title?: string
}): Promise<{ success: boolean; error: string | null; unauthorized: boolean }> {
  const headers = await getAuthHeaders()
  const customer = await sessionCustomer(headers)
  if (!customer) return { success: false, error: null, unauthorized: true }
  const base = `/store/v1/customers/${encodeURIComponent(customer)}/wishlist/${encodeURIComponent(input.variant_id)}`
  try {
    await gobitFetch(base, { method: "PUT", headers })
    await gobitFetch(`${base}/stock-alert`, { method: "PUT", headers })
    return { success: true, error: null, unauthorized: false }
  } catch (e) {
    if (e instanceof GobitError && e.status === 401) return { success: false, error: null, unauthorized: true }
    return { success: false, error: e instanceof Error ? e.message : String(e), unauthorized: false }
  }
}

/** Çıkışta cihazı müşteriden ayırır; abonelik kalır. */
export async function unbindPushSubscription(endpoint: string): Promise<{ success: boolean }> {
  try {
    await gobitFetch("/store/v1/webpush/unbind", {
      method: "POST",
      headers: await getAuthHeaders(),
      body: { endpoint },
    })
    return { success: true }
  } catch {
    return { success: false }
  }
}
