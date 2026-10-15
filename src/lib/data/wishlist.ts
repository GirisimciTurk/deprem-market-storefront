"use server"

import { GobitError, SALES_CHANNEL_ID, gobitData, gobitFetch } from "@lib/gobit/client"
import { getAuthHeaders } from "./cookies"

/**
 * Favoriler (wishlist) — MÜŞTERİ HESABINA bağlıdır, backend'de `wishlist` modülünde
 * durur. Eskiden tarayıcının localStorage'ındaydı; cihaz değişince kayboluyordu.
 *
 * Backend giriş yoksa 401 döner. Burada bunu fırlatmak yerine `unauthorized: true`
 * olarak dışa veriyoruz: kalp butonu bu bayrağı "Favorilere eklemek için giriş
 * yapın" baloncuğuna çevirir, kullanıcı sayfadan atılmaz.
 *
 * Her mutasyon güncel TAM listeyi döndürür → istemci tek kaynaktan senkron kalır,
 * ayrıca bir GET gerekmez.
 */

export type WishlistResult = {
  productIds: string[]
  /** Giriş yapılmamış → istemci giriş baloncuğunu göstermeli. */
  unauthorized: boolean
  /** 401 dışındaki hatalar (ağ, 500...). İstemci kullanıcıya bildirir. */
  error: string | null
}

const ok = (productIds: string[]): WishlistResult => ({
  productIds,
  unauthorized: false,
  error: null,
})

const unauthorized = (): WishlistResult => ({
  productIds: [],
  unauthorized: true,
  error: null,
})

// gobit'in istek listesi VARYANT kimliğiyle tutulur (/store/v1/customers/{id}/wishlist);
// vitrin ürün kimliğiyle çalışır. Eklemede ürünün ilk varyantı yazılır; okumada
// varyantların ürünleri bulunur; silmede ürünün listedeki bütün varyantları
// silinir.

class Unauthorized extends Error {}

async function who(): Promise<{ id: string; headers: Record<string, string> }> {
  const headers = await getAuthHeaders()
  if (!headers.cookie) throw new Unauthorized()
  const session = await gobitData<{ customer_id: string }>("/store/v1/auth/session", { headers, cache: "no-store" }).catch(
    () => {
      throw new Unauthorized()
    }
  )

  return { id: encodeURIComponent(session.customer_id), headers }
}

const channelProducts = `/store/v1/sales-channels/${SALES_CHANNEL_ID}/products`

type Saved = { variant_id: string; created_at: string }

async function saved(c: { id: string; headers: Record<string, string> }): Promise<Saved[]> {
  return gobitData<Saved[]>(`/store/v1/customers/${c.id}/wishlist`, { headers: c.headers, cache: "no-store" })
}

/** Saklı varyantların ürün kimlikleri, en yeni önce, her ürün bir kez. */
async function productIdsOf(items: Saved[]): Promise<string[]> {
  if (!items.length) return []
  const sorted = [...items].sort((a, b) => b.created_at.localeCompare(a.created_at))
  const page = await gobitFetch<{ data: { id: string; variants?: { id: string }[] }[] }>(channelProducts, {
    query: { variant_id: sorted.slice(0, 100).map((i) => i.variant_id), limit: 100 },
    cache: "no-store",
  })
  const owner = new Map<string, string>()
  page.data.forEach((p) => (p.variants ?? []).forEach((v) => owner.set(v.id, p.id)))

  return Array.from(new Set(sorted.map((i) => owner.get(i.variant_id)).filter(Boolean) as string[]))
}

async function variantsOf(productId: string): Promise<string[]> {
  const p = await gobitData<{ variants?: { id: string }[] }>(`${channelProducts}/${encodeURIComponent(productId)}`, {
    cache: "no-store",
  })

  return (p.variants ?? []).map((v) => v.id)
}

async function run(fn: (c: { id: string; headers: Record<string, string> }) => Promise<void>): Promise<WishlistResult> {
  try {
    const c = await who()
    await fn(c)

    return ok(await productIdsOf(await saved(c)))
  } catch (e) {
    if (e instanceof Unauthorized || (e instanceof GobitError && e.status === 401)) return unauthorized()
    return { productIds: [], unauthorized: false, error: e instanceof Error ? e.message : String(e) }
  }
}

/** Giriş yapmış müşterinin favori ürün id'leri (en yeni önce). */
export async function listWishlist(): Promise<WishlistResult> {
  return run(async () => {})
}

export async function addToWishlist(productId: string): Promise<WishlistResult> {
  return run(async (c) => {
    const [first] = await variantsOf(productId)
    if (!first) throw new Error("Ürünün varyantı yok.")
    await gobitFetch(`/store/v1/customers/${c.id}/wishlist/${encodeURIComponent(first)}`, { method: "PUT", headers: c.headers })
  })
}

export async function removeFromWishlist(productId: string): Promise<WishlistResult> {
  return run(async (c) => {
    const mine = new Set((await saved(c)).map((i) => i.variant_id))
    for (const v of await variantsOf(productId)) {
      if (mine.has(v)) {
        await gobitFetch(`/store/v1/customers/${c.id}/wishlist/${encodeURIComponent(v)}`, {
          method: "DELETE",
          headers: c.headers,
        })
      }
    }
  })
}

/**
 * Cihazdaki eski localStorage favorilerini hesaba aktarır (giriş anında bir kez).
 * Hesapta zaten olanlar atlanır, hiçbir şey silinmez.
 */
export async function mergeWishlist(productIds: string[]): Promise<WishlistResult & { mergedCount: number }> {
  let merged = 0
  const result = await run(async (c) => {
    const have = new Set(await productIdsOf(await saved(c)))
    for (const id of productIds) {
      if (have.has(id)) continue
      const [first] = await variantsOf(id).catch(() => [] as string[])
      if (!first) continue
      await gobitFetch(`/store/v1/customers/${c.id}/wishlist/${encodeURIComponent(first)}`, { method: "PUT", headers: c.headers })
      merged++
    }
  })

  return { ...result, mergedCount: merged }
}
