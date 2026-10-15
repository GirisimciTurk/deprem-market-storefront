import "server-only"
import { cookies as nextCookies } from "next/headers"

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
    const cacheId = cookies.get("_medusa_cache_id")?.value

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

export const getCartId = async () => {
  const cookies = await nextCookies()
  return cookies.get("_medusa_cart_id")?.value
}

export const setCartId = async (cartId: string) => {
  try {
    const cookies = await nextCookies()
    cookies.set("_medusa_cart_id", cartId, {
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
    cookies.set("_medusa_cart_id", "", { maxAge: -1 })
  } catch {
    /* render bağlamında cookie yazılamaz — best-effort (retrieveCart catch'i buradan geçer) */
  }
}
