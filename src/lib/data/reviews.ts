"use server"

import { gobitData, gobitFetch } from "@lib/gobit/client"
import { productIdOf } from "@lib/gobit/product-id"
import { getAuthHeaders } from "./cookies"

export type StoreReview = {
  id: string
  product_id: string
  product_handle: string
  product_title: string
  customer_id?: string | null
  customer_name: string
  rating: number
  comment: string
  status?: "pending" | "approved" | "spam"
  images: string[] | null
  // "Satın Almış Müşteri" rozeti: müşteri bu ürünü gerçekten satın aldıysa true.
  // (Yalnız giriş yapmış olmak değil — backend siparişten doğrular.)
  verified_purchase?: boolean
  created_at: string
}

type GobitReview = {
  id: string
  product_id: string
  rating: number
  title: string
  body: string
  author_name: string
  verified_purchase: boolean
  created_at: string
}

// gobit'in ürün yorumları (/store/v1/products/{product_id}/reviews): yalnız
// onaylı yorumlar okunur; yazılan yorum onay bekler. Fotoğraf ve "yorumlarım"
// listesi gobit'te yok.

/** Public — approved reviews for a product (for the product page). */
export async function listProductReviews(productHandle: string): Promise<StoreReview[]> {
  const id = await productIdOf(productHandle)
  if (!id) return []

  return gobitData<GobitReview[]>(`/store/v1/products/${encodeURIComponent(id)}/reviews`, {
    query: { limit: 50 },
    cache: "no-store",
  })
    .then((rs) =>
      rs.map((r) => ({
        id: r.id,
        product_id: r.product_id,
        product_handle: productHandle,
        product_title: "",
        customer_name: r.author_name,
        rating: r.rating,
        comment: r.title ? `${r.title}\n\n${r.body}` : r.body,
        status: "approved" as const,
        images: null,
        verified_purchase: r.verified_purchase,
        created_at: r.created_at,
      }))
    )
    .catch(() => [])
}

/** Submit a review. Attaches the logged-in customer when present. Status: pending. */
export async function submitReview(input: {
  product_handle: string
  rating: number
  comment: string
  name: string
  images?: string[]
}): Promise<{ success: boolean; error: string | null }> {
  const id = await productIdOf(input.product_handle)
  if (!id) return { success: false, error: "Ürün bulunamadı." }
  try {
    await gobitFetch(`/store/v1/products/${encodeURIComponent(id)}/reviews`, {
      method: "POST",
      headers: await getAuthHeaders(),
      body: { rating: input.rating, body: input.comment, author_name: input.name },
    })
    return { success: true, error: null }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) }
  }
}

/** Yorum fotoğrafı yüklemesi gobit'te yok. */
export async function uploadReviewImages(
  files: { filename: string; mime_type: string; data: string }[]
): Promise<{ urls: string[]; error: string | null }> {
  if (!files || files.length === 0) return { urls: [], error: null }
  return { urls: [], error: "Yorumlara fotoğraf eklenemiyor." }
}

/** Müşterinin kendi yorumları gobit'te listelenmiyor. */
export async function listMyReviews(): Promise<StoreReview[]> {
  return []
}
