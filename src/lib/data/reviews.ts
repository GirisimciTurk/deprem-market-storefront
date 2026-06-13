"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "./cookies"

export type StoreReview = {
  id: string
  product_id: string
  product_handle: string
  product_title: string
  customer_id: string | null
  customer_name: string
  rating: number
  comment: string
  status: "pending" | "approved" | "spam"
  images: string[] | null
  created_at: string
}

/** Public — approved reviews for a product (for the product page). */
export async function listProductReviews(
  productHandle: string
): Promise<StoreReview[]> {
  return sdk.client
    .fetch<{ reviews: StoreReview[] }>(`/store/reviews`, {
      method: "GET",
      query: { product_handle: productHandle },
      cache: "no-store",
    })
    .then((r) => r.reviews ?? [])
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
  const headers = { ...(await getAuthHeaders()) }
  try {
    await sdk.client.fetch(`/store/reviews`, {
      method: "POST",
      headers,
      body: input,
    })
    return { success: true, error: null }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

/**
 * Yorum fotoğraflarını backend'e yükler (base64) → R2'ye kaydedilir, public URL'ler döner.
 * İstemci (client component) dosyaları okuyup yeniden boyutlandırarak base64 verir.
 */
export async function uploadReviewImages(
  files: { filename: string; mime_type: string; data: string }[]
): Promise<{ urls: string[]; error: string | null }> {
  if (!files || files.length === 0) return { urls: [], error: null }
  try {
    const res = await sdk.client.fetch<{ urls: string[] }>(`/store/review-uploads`, {
      method: "POST",
      body: { files },
    })
    return { urls: res.urls ?? [], error: null }
  } catch (e) {
    return { urls: [], error: String(e) }
  }
}

/** The logged-in customer's own reviews (any status) for the account page. */
export async function listMyReviews(): Promise<StoreReview[]> {
  const headers = { ...(await getAuthHeaders()) }
  return sdk.client
    .fetch<{ reviews: StoreReview[] }>(`/store/reviews/me`, {
      method: "GET",
      headers,
      cache: "no-store",
    })
    .then((r) => r.reviews ?? [])
    .catch(() => [])
}
