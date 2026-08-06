"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "./cookies"
import { isUnauthorizedError } from "@lib/util/http-error"

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

function toResult(e: unknown): WishlistResult {
  if (isUnauthorizedError(e)) return unauthorized()
  return { productIds: [], unauthorized: false, error: String(e) }
}

async function headers() {
  return { ...(await getAuthHeaders()) }
}

/** Giriş yapmış müşterinin favori ürün id'leri (en yeni önce). */
export async function listWishlist(): Promise<WishlistResult> {
  try {
    const res = await sdk.client.fetch<{ product_ids: string[] }>(
      "/store/wishlist",
      { method: "GET", headers: await headers(), cache: "no-store" }
    )
    return ok(res.product_ids ?? [])
  } catch (e) {
    return toResult(e)
  }
}

export async function addToWishlist(productId: string): Promise<WishlistResult> {
  try {
    const res = await sdk.client.fetch<{ product_ids: string[] }>(
      "/store/wishlist",
      {
        method: "POST",
        headers: await headers(),
        body: { product_id: productId },
      }
    )
    return ok(res.product_ids ?? [])
  } catch (e) {
    return toResult(e)
  }
}

export async function removeFromWishlist(
  productId: string
): Promise<WishlistResult> {
  try {
    const res = await sdk.client.fetch<{ product_ids: string[] }>(
      "/store/wishlist",
      {
        method: "DELETE",
        headers: await headers(),
        query: { product_id: productId },
      }
    )
    return ok(res.product_ids ?? [])
  } catch (e) {
    return toResult(e)
  }
}

/**
 * Cihazdaki eski localStorage favorilerini hesaba aktarır (giriş anında bir kez).
 * Hesapta zaten olanlar atlanır, hiçbir şey silinmez.
 */
export async function mergeWishlist(
  productIds: string[]
): Promise<WishlistResult & { mergedCount: number }> {
  if (productIds.length === 0) {
    const current = await listWishlist()
    return { ...current, mergedCount: 0 }
  }
  try {
    const res = await sdk.client.fetch<{
      product_ids: string[]
      merged_count: number
    }>("/store/wishlist/merge", {
      method: "POST",
      headers: await headers(),
      body: { product_ids: productIds },
    })
    return { ...ok(res.product_ids ?? []), mergedCount: res.merged_count ?? 0 }
  } catch (e) {
    return { ...toResult(e), mergedCount: 0 }
  }
}
