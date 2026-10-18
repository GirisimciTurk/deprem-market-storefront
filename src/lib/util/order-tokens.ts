// gobit'in sipariş jetonları (X-Order-Token, gobit ADR 0439) vitrinde tek bir
// çerezde, siparişe göre tutulur (en çok son 10 sipariş). Saf işlevler: hem
// sunucu tarafı (data/cookies.ts) hem middleware (Edge) kullanır.

export const ORDER_TOKENS_COOKIE = "_gobit_order_tokens"
export const ORDER_TOKENS_MAX_AGE = 60 * 60 * 24 * 30
const KEEP = 10

/** Çerezin değeri → {sipariş: jeton}; bozuk ya da boş değer boş eşleme verir. */
export function parseOrderTokens(raw: string | undefined | null): Record<string, string> {
  if (!raw) return {}
  try {
    const v = JSON.parse(raw)
    if (!v || typeof v !== "object" || Array.isArray(v)) return {}
    return Object.fromEntries(
      Object.entries(v).filter((e): e is [string, string] => typeof e[1] === "string" && !!e[1])
    )
  } catch {
    return {}
  }
}

/** Siparişin jetonunu ekler (varsa yeniler, en sona alır) ve son 10'u tutar. */
export function withOrderToken(raw: string | undefined | null, orderId: string, token: string): string {
  const kept = Object.entries(parseOrderTokens(raw)).filter(([id]) => id !== orderId)

  return JSON.stringify(Object.fromEntries([...kept.slice(-(KEEP - 1)), [orderId, token]]))
}

/**
 * E-postadaki sipariş bağlantısı: /{ülke}/order/{id}/confirmed?token=…
 * Sipariş kimliğini döner; yol bu değilse null.
 */
export function confirmedOrderId(pathname: string): string | null {
  const m = pathname.match(/^\/[^/]+\/order\/([^/]+)\/confirmed\/?$/)
  if (!m) return null
  try {
    return decodeURIComponent(m[1])
  } catch {
    return null
  }
}
