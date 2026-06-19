import { sdk } from "@lib/config"

/**
 * İstemci-tarafı davranış izleme (fire-and-forget). Olaylar backend'e
 * `POST /store/track` ile gider (publishable key sdk tarafından eklenir).
 *
 * - `session_id`: ilk ziyarette üretilip localStorage'da saklanan anonim kimlik;
 *   giriş öncesi/sonrası davranışı birleştirir. customer_id'yi backend, giriş
 *   yapmış müşteride auth bağlamından kendisi ekler (istemci göndermez).
 * - `value` minor (kuruş) cinsindendir.
 * - Hata kullanıcıyı ASLA etkilemez (sessiz yutulur).
 */
const SESSION_KEY = "dm_session_id"

export function getSessionId(): string {
  if (typeof window === "undefined") return ""
  try {
    let id = localStorage.getItem(SESSION_KEY)
    if (!id) {
      id =
        (typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID()) ||
        `s_${Date.now()}_${Math.random().toString(36).slice(2)}`
      localStorage.setItem(SESSION_KEY, id)
    }
    return id
  } catch {
    return ""
  }
}

export type TrackEventType =
  | "product_view"
  | "search"
  | "add_to_cart"
  | "remove_from_cart"
  | "checkout_start"

export type TrackPayload = {
  product_id?: string | null
  variant_id?: string | null
  search_query?: string | null
  results_count?: number | null
  value?: number | null
  quantity?: number | null
  currency_code?: string | null
}

export function track(type: TrackEventType, payload: TrackPayload = {}): void {
  if (typeof window === "undefined") return
  const session_id = getSessionId()
  if (!session_id) return
  try {
    // Yanıt beklemiyoruz; ağ/hata sessizce yutulur.
    void sdk.client
      .fetch("/store/track", {
        method: "POST",
        body: { type, session_id, ...payload },
      })
      .catch(() => {})
  } catch {
    /* sessiz */
  }
}
