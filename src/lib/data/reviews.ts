"use server"

import { revalidatePath } from "next/cache"
import { GobitError, gobitFetch } from "@lib/gobit/client"
import { productIdOf } from "@lib/gobit/product-id"
import { toStoreReview, type DtmProductReview, type StoreReview } from "@lib/util/review"
import { getAuthHeaders } from "./cookies"

export type { StoreReview } from "@lib/util/review"

// Ürün yorumları dtm üzerinden: herkese açık liste onaylı yorumları
// fotoğraflarıyla verir; giriş yapmış müşterinin yazdığı yorum ona bağlanır,
// fotoğrafı yalnız o ekler ve "Yorumlarım"da yalnız o görür. Misafir yorumu
// doğrudan gobit'e gider (fotoğrafsız, listede görünmez). Yorumlar onay bekler.

type Page = { items: DtmProductReview[]; total: number }

/** Public — approved reviews for a product (for the product page). */
export async function listProductReviews(productHandle: string): Promise<StoreReview[]> {
  const id = await productIdOf(productHandle)
  if (!id) return []

  return gobitFetch<{ data: Page }>(`/store/v1/dtm/products/${encodeURIComponent(id)}/reviews`, {
    query: { limit: 100 },
    cache: "no-store",
  })
    .then((r) => (r.data?.items ?? []).map((x) => toStoreReview(x, productHandle)))
    .catch(() => [])
}

export type SubmitReviewResult = {
  success: boolean
  error: string | null
  /** Giriş yapmış müşterinin yorumu: fotoğraflar bu kimliğe eklenir. */
  review_id: string | null
}

/** Yorum gönderir; giriş varsa müşteriye bağlanır (fotoğraf eklenebilir). Durum: onay bekliyor. */
export async function submitReview(input: {
  product_handle: string
  rating: number
  comment: string
  name: string
}): Promise<SubmitReviewResult> {
  const id = await productIdOf(input.product_handle)
  if (!id) return { success: false, error: "Ürün bulunamadı.", review_id: null }
  const body = { rating: input.rating, body: input.comment, author_name: input.name }
  const headers = await getAuthHeaders()

  try {
    if (headers.cookie) {
      try {
        const r = await gobitFetch<{ data: DtmProductReview }>(
          `/store/v1/dtm/products/${encodeURIComponent(id)}/reviews`,
          { method: "POST", headers, body }
        )
        return { success: true, error: null, review_id: r.data?.id ?? null }
      } catch (e) {
        // Oturum düşmüşse yorum misafir yorumu olarak gider.
        if (!(e instanceof GobitError && e.status === 401)) throw e
      }
    }
    await gobitFetch(`/store/v1/products/${encodeURIComponent(id)}/reviews`, { method: "POST", body })
    return { success: true, error: null, review_id: null }
  } catch (e) {
    if (e instanceof GobitError && e.status === 404) return { success: false, error: "Ürün bulunamadı.", review_id: null }
    if (e instanceof GobitError && e.status === 422)
      return { success: false, error: "Lütfen puanı, adınızı ve yorumunuzu kontrol edin.", review_id: null }
    if (e instanceof GobitError && e.status === 429)
      return { success: false, error: "Çok fazla deneme yapıldı. Lütfen biraz sonra tekrar deneyin.", review_id: null }
    return { success: false, error: "Değerlendirmeniz gönderilemedi. Lütfen daha sonra tekrar deneyin.", review_id: null }
  }
}

/**
 * Yorumun yazarı olarak bir fotoğraf ekler (en çok 6, ≤5 MB, JPEG/PNG/WebP).
 * Görsel tarayıcıda küçültülüp base64 gelir; dtm'ye çok parçalı gönderilir.
 */
export async function uploadReviewPhoto(
  reviewId: string,
  photo: { filename: string; mime_type: string; data: string }
): Promise<{ url: string | null; error: string | null }> {
  const headers = await getAuthHeaders()
  if (!headers.cookie) return { url: null, error: "Fotoğraf eklemek için giriş yapın." }
  if (!reviewId || !photo?.data) return { url: null, error: "Fotoğraf eklenemedi." }

  const bytes = new Uint8Array(Buffer.from(photo.data, "base64"))
  const form = new FormData()
  form.append("file", new Blob([bytes], { type: photo.mime_type || "image/jpeg" }), photo.filename || "foto.jpg")
  try {
    const r = await gobitFetch<{ data: { url: string } }>(
      `/store/v1/dtm/product-reviews/${encodeURIComponent(reviewId)}/photos`,
      { method: "POST", headers, form }
    )
    return { url: r.data?.url ?? null, error: null }
  } catch (e) {
    if (e instanceof GobitError && e.status === 409)
      return { url: null, error: "Bu yoruma daha fazla fotoğraf eklenemiyor (en çok 6; reddedilen yoruma eklenemez)." }
    if (e instanceof GobitError && e.status === 422)
      return { url: null, error: "Fotoğraf JPEG, PNG ya da WebP olmalı ve 5 MB'ı geçmemeli." }
    if (e instanceof GobitError && e.status === 404) return { url: null, error: "Yorum bulunamadı." }
    return { url: null, error: "Fotoğraf yüklenemedi." }
  }
}

/** Yorumun yazarı olarak bir fotoğrafını (yayında ya da onay bekleyen) siler. */
export async function deleteReviewPhoto(
  reviewId: string,
  photoId: string
): Promise<{ error: string | null }> {
  const headers = await getAuthHeaders()
  if (!headers.cookie) return { error: "Fotoğraf silmek için giriş yapın." }
  if (!reviewId || !photoId) return { error: "Fotoğraf bulunamadı." }

  try {
    await gobitFetch(
      `/store/v1/dtm/product-reviews/${encodeURIComponent(reviewId)}/photos/${encodeURIComponent(photoId)}`,
      { method: "DELETE", headers }
    )
  } catch (e) {
    if (e instanceof GobitError && e.status === 404) return { error: "Fotoğraf bulunamadı." }
    return { error: "Fotoğraf silinemedi." }
  }
  // "Yorumlarım" ve ürün sayfasındaki yorum fotoğrafları yeniden okunur.
  revalidatePath("/[countryCode]/account/yorumlarim", "page")
  revalidatePath("/[countryCode]/products/[handle]", "page")
  return { error: null }
}

/** Giriş yapmış müşterinin kendi yorumları (onay durumu ve ürünüyle), yeniden eskiye. */
export async function listMyReviews(): Promise<StoreReview[]> {
  const headers = await getAuthHeaders()
  if (!headers.cookie) return []

  return gobitFetch<{ data: Page }>("/store/v1/dtm/product-reviews/mine", {
    query: { limit: 50 },
    headers,
    cache: "no-store",
  })
    .then((r) => (r.data?.items ?? []).map((x) => toStoreReview(x)))
    .catch(() => [])
}
