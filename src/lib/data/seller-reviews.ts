"use server"

import { sdk } from "@lib/config"
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

/** Public — approved reviews for a seller (for the seller store page). */
export async function getSellerReviews(
  sellerHandle: string
): Promise<StoreSellerReviewsResponse> {
  return sdk.client
    .fetch<StoreSellerReviewsResponse>(`/store/seller-reviews`, {
      method: "GET",
      query: { seller_handle: sellerHandle },
      cache: "no-store",
    })
    .then((r) => ({
      reviews: r.reviews ?? [],
      rating_avg: r.rating_avg ?? 0,
      rating_count: r.rating_count ?? 0,
    }))
    .catch(() => ({ reviews: [], rating_avg: 0, rating_count: 0 }))
}

/** Submit a seller review. Attaches the logged-in customer when present. Status: pending. */
export async function submitSellerReview(input: {
  seller_handle: string
  rating: number
  comment: string
  name: string
}): Promise<{ success: boolean; error: string | null }> {
  const headers = { ...(await getAuthHeaders()) }
  try {
    await sdk.client.fetch(`/store/seller-reviews`, {
      method: "POST",
      headers,
      body: input,
    })
    return { success: true, error: null }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}
