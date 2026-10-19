import "server-only"
import { cookies as nextCookies } from "next/headers"
import {
  ORDER_TOKENS_COOKIE,
  ORDER_TOKENS_MAX_AGE,
  parseOrderTokens,
  withOrderToken,
} from "@lib/util/order-tokens"

// gobit oturumu: identity-session'ın imzalı çerezi (gobit_session). Vitrin onu
// kendi alanında _gobit_session olarak tutar ve sunucu tarafı gobit isteklerine
// Cookie başlığıyla iletir.
export const GOBIT_SESSION_COOKIE = "gobit_session"

export const getAuthHeaders = async (): Promise<Record<string, string>> => {
  try {
    const cookies = await nextCookies()
    const token = cookies.get("_gobit_session")?.value

    if (!token) {
      return {}
    }

    return { cookie: `${GOBIT_SESSION_COOKIE}=${token}` }
  } catch {
    return {}
  }
}

export const getCacheTag = async (tag: string): Promise<string> => {
  try {
    const cookies = await nextCookies()
    const cacheId = cookies.get("_dt_cache_id")?.value

    if (!cacheId) {
      return ""
    }

    return `${tag}-${cacheId}`
  } catch {
    return ""
  }
}

export const getCacheOptions = async (
  tag: string
): Promise<{ tags: string[] } | Record<string, never>> => {
  if (typeof window !== "undefined") {
    return {}
  }

  const cacheTag = await getCacheTag(tag)

  if (!cacheTag) {
    return {}
  }

  return { tags: [`${cacheTag}`] }
}

// NOT: Cookie YAZMA (set) yalnız Server Action / Route Handler içinde mümkün; render
// sırasında çağrılırsa Next.js fırlatır. Bu fonksiyonlar bazen render yolundan da
// (ör. retrieveCart'ın catch'i → removeCartId) tetiklenebildiği için yazma best-effort
// yapılır: render bağlamında çökmek yerine sessizce atlanır (server action'da normal çalışır).
export const setAuthToken = async (token: string) => {
  try {
    const cookies = await nextCookies()
    cookies.set("_gobit_session", token, {
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: true,
      // "lax": ödeme sağlayıcısından (PayTR) geri dönen top-level yönlendirmede
      // cookie'nin gönderilmesi gerekir; "strict" bu durumda cookie'yi düşürüp
      // oturumu/sepeti kaybettiriyor (checkout not-found). Lax CSRF için yeterli.
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })
  } catch {
    /* render bağlamında cookie yazılamaz — best-effort */
  }
}

export const removeAuthToken = async () => {
  try {
    const cookies = await nextCookies()
    cookies.set("_gobit_session", "", { maxAge: -1 })
  } catch {
    /* render bağlamında cookie yazılamaz — best-effort */
  }
}

// Uzman oturumu: dtm'nin uzman hesabı çerezi (dtm_expert_session), müşteri
// oturumundan ayrı. Vitrin onu _dtm_expert_session olarak tutar; aynı kişi hem
// müşteri hem uzman olarak oturum açık tutabilir, biri ötekini etkilemez.
export const EXPERT_SESSION_COOKIE = "dtm_expert_session"
const EXPERT_COOKIE = "_dtm_expert_session"

export const getExpertHeaders = async (): Promise<Record<string, string>> => {
  try {
    const token = (await nextCookies()).get(EXPERT_COOKIE)?.value
    return token ? { cookie: `${EXPERT_SESSION_COOKIE}=${token}` } : {}
  } catch {
    return {}
  }
}

export const setExpertToken = async (token: string) => {
  try {
    ;(await nextCookies()).set(EXPERT_COOKIE, token, {
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })
  } catch {
    /* render bağlamında cookie yazılamaz — best-effort */
  }
}

export const removeExpertToken = async () => {
  try {
    ;(await nextCookies()).set(EXPERT_COOKIE, "", { maxAge: -1 })
  } catch {
    /* render bağlamında cookie yazılamaz — best-effort */
  }
}

export const getCartId = async () => {
  const cookies = await nextCookies()
  return cookies.get("_dt_cart_id")?.value
}

export const setCartId = async (cartId: string) => {
  try {
    const cookies = await nextCookies()
    cookies.set("_dt_cart_id", cartId, {
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: true,
      // "lax": ödeme sağlayıcısı dönüşünde (cross-site → /checkout) sepet cookie'sinin
      // gönderilmesi şart; "strict" cookie'yi düşürüp "Sayfa Bulunamadı" hatasına yol açıyordu.
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })
  } catch {
    /* render bağlamında cookie yazılamaz — best-effort */
  }
}

export const removeCartId = async () => {
  try {
    const cookies = await nextCookies()
    cookies.set("_dt_cart_id", "", { maxAge: -1 })
  } catch {
    /* render bağlamında cookie yazılamaz — best-effort (retrieveCart catch'i buradan geçer) */
  }
}

// gobit'in sipariş jetonu (X-Order-Token, gobit ADR 0439): misafir alışverişte
// sipariş sayfası onunla açılır. Tamamlamanın verdiği jetonlar, siparişe göre,
// bu çerezde tutulur (en çok son 10 sipariş). E-postadaki sipariş bağlantısının
// jetonunu (?token=) middleware aynı çereze yazar.
async function orderTokens(): Promise<Record<string, string>> {
  try {
    return parseOrderTokens((await nextCookies()).get(ORDER_TOKENS_COOKIE)?.value)
  } catch {
    return {}
  }
}

/** Bu tarayıcının jetonunu sakladığı siparişler (eskiden yeniye). */
export const savedOrderIds = async (): Promise<string[]> => Object.keys(await orderTokens())

export const rememberOrderToken = async (orderId: string, token: string) => {
  try {
    const cookies = await nextCookies()
    cookies.set(ORDER_TOKENS_COOKIE, withOrderToken(cookies.get(ORDER_TOKENS_COOKIE)?.value, orderId, token), {
      maxAge: ORDER_TOKENS_MAX_AGE,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })
  } catch {
    /* render bağlamında cookie yazılamaz — best-effort */
  }
}

/**
 * Siparişi okumak için başlıklar: oturum çerezi ve varsa siparişin jetonu
 * (verilen, yoksa çerezdeki).
 */
export const getOrderHeaders = async (orderId: string, given?: string): Promise<Record<string, string>> => {
  const token = given || (await orderTokens())[orderId]

  return { ...(await getAuthHeaders()), ...(token ? { "X-Order-Token": token } : {}) }
}
