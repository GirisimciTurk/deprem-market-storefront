// Ürün yorumu: dtm'nin yorum kaydı (/store/v1/dtm/products/{id}/reviews ve
// /store/v1/dtm/product-reviews/mine) → vitrinin StoreReview'ı. Saf eşleme.

export type StoreReviewStatus = "pending" | "approved" | "rejected"

/** Yorumun bir fotoğrafı: yazar kimliğiyle tek tek silebilir. */
export type ReviewPhoto = { id: string; url: string }

export type StoreReview = {
  id: string
  product_id: string
  product_handle: string
  product_title: string
  customer_name: string
  rating: number
  comment: string
  status?: StoreReviewStatus
  images: string[] | null
  /** Yayındaki fotoğraflar, kimlikleriyle (images ile aynı sıra). */
  photos: ReviewPhoto[]
  /** Operatör onayı bekleyen fotoğraflar; yalnız yazarın kendi listesinde dolu. */
  pending_photos: ReviewPhoto[]
  // "Satın Almış Müşteri" rozeti: gobit siparişten doğrular (yalnız giriş yapmış olmak değil).
  verified_purchase?: boolean
  created_at: string
}

export type DtmProductReview = {
  id: string
  product_id: string
  product_handle?: string
  product_title?: string
  rating: number
  title?: string
  body: string
  author_name: string
  /** gobit'in durumu; yalnız yazarın kendi listesinde gelir. */
  status?: string
  verified_purchase: boolean
  images?: string[] | null
  photos?: ReviewPhoto[] | null
  /** Yazarın kendi listesi: operatör onayı bekleyen fotoğraflar. */
  pending_photos?: ReviewPhoto[] | null
  created_at: string
}

/** gobit'in submitted|approved|rejected durumu; durum yoksa (herkese açık liste) onaylıdır. */
export function reviewStatus(status: string | undefined): StoreReviewStatus {
  if (status === undefined || status === "" || status === "approved") return "approved"
  if (status === "rejected") return "rejected"

  return "pending"
}

export function toStoreReview(r: DtmProductReview, productHandle = ""): StoreReview {
  const title = (r.title ?? "").trim()
  const images = (r.images ?? []).filter(Boolean)

  return {
    id: r.id,
    product_id: r.product_id,
    product_handle: r.product_handle || productHandle,
    product_title: r.product_title || "",
    customer_name: r.author_name,
    rating: r.rating,
    comment: title ? `${title}\n\n${r.body}` : r.body,
    status: reviewStatus(r.status),
    images: images.length ? images : null,
    photos: (r.photos ?? []).filter((p) => p?.id && p.url),
    pending_photos: (r.pending_photos ?? []).filter((p) => p?.id && p.url),
    verified_purchase: r.verified_purchase,
    created_at: r.created_at,
  }
}

/** Bir yoruma eklenebilecek en çok fotoğraf (dtm 7.'yi 409 ile reddeder). */
export const MAX_REVIEW_PHOTOS = 6
