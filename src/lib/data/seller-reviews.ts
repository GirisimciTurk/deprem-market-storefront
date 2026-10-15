"use server"

import { gobitData, gobitFetch } from "@lib/gobit/client"
import { getAuthHeaders } from "./cookies"

export type StoreSellerReview = {
  id: string
  rating: number
  comment: string
  customer_name: string
  created_at: string
}

export type StoreSellerReviewsResponse = {
  reviews: StoreSellerReview[]
  rating_avg: number
  rating_count: number
}

// dtm'nin mağaza yorumları (/store/v1/dtm/sellers/{handle}/reviews). Bir yorum
// siparişe bağlıdır: siparişin numarası ve e-postasıyla yazılır.

/** Public — approved reviews for a seller (for the seller store page). */
export async function getSellerReviews(sellerHandle: string): Promise<StoreSellerReviewsResponse> {
  const h = encodeURIComponent(sellerHandle)
  try {
    const [reviews, entry] = await Promise.all([
      gobitData<{ id: string; author_name: string; rating: number; body: string; created_at: string }[]>(
        `/store/v1/dtm/sellers/${h}/reviews`,
        { cache: "no-store" }
      ),
      gobitData<{ rating_avg: number | null; review_count: number }>(`/store/v1/dtm/sellers/${h}`, { cache: "no-store" }),
    ])

    return {
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.body,
        customer_name: r.author_name,
        created_at: r.created_at,
      })),
      rating_avg: entry.rating_avg ?? 0,
      rating_count: entry.review_count,
    }
  } catch {
    return { reviews: [], rating_avg: 0, rating_count: 0 }
  }
}

/** Mağaza yorumu: siparişin numarası ve e-postasıyla (dtm yorumu siparişe bağlar). */
export async function submitSellerReview(input: {
  seller_handle: string
  rating: number
  comment: string
  name: string
  order_id?: string
  email?: string
}): Promise<{ success: boolean; error: string | null }> {
  if (!input.order_id || !input.email) {
    return { success: false, error: "Mağaza değerlendirmesi, o mağazadan verdiğiniz siparişin sayfasından yapılır." }
  }
  try {
    await gobitFetch(`/store/v1/dtm/sellers/${encodeURIComponent(input.seller_handle)}/reviews`, {
      method: "POST",
      headers: await getAuthHeaders(),
      body: {
        order_id: input.order_id,
        author_email: input.email,
        author_name: input.name,
        rating: input.rating,
        body: input.comment,
      },
    })
    return { success: true, error: null }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) }
  }
}
