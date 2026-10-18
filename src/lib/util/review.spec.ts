import { describe, expect, it } from "vitest"
import { reviewStatus, toStoreReview, type DtmProductReview } from "./review"

const raw = (extra: Partial<DtmProductReview> = {}): DtmProductReview => ({
  id: "rev_1",
  product_id: "prod_1",
  rating: 4,
  title: "",
  body: "Sağlam çanta.",
  author_name: "Ayşe K.",
  verified_purchase: true,
  images: [],
  created_at: "2026-10-01T10:00:00Z",
  ...extra,
})

describe("reviewStatus", () => {
  it("gobit durumlarını vitrin durumlarına çevirir", () => {
    expect(reviewStatus("submitted")).toBe("pending")
    expect(reviewStatus("approved")).toBe("approved")
    expect(reviewStatus("rejected")).toBe("rejected")
  })

  it("durumsuz kayıt (herkese açık liste) onaylıdır", () => {
    expect(reviewStatus(undefined)).toBe("approved")
  })
})

describe("toStoreReview", () => {
  it("herkese açık listede ürün adresi çağırandan gelir, fotoğrafsız yorumun images'ı null", () => {
    const r = toStoreReview(raw(), "deprem-cantasi")
    expect(r.product_handle).toBe("deprem-cantasi")
    expect(r.customer_name).toBe("Ayşe K.")
    expect(r.comment).toBe("Sağlam çanta.")
    expect(r.images).toBeNull()
    expect(r.status).toBe("approved")
    expect(r.verified_purchase).toBe(true)
  })

  it("başlık varsa yorumun önüne eklenir; fotoğraflar korunur", () => {
    const r = toStoreReview(raw({ title: "Memnunum", images: ["https://f/1.jpg", "https://f/2.jpg"] }))
    expect(r.comment).toBe("Memnunum\n\nSağlam çanta.")
    expect(r.images).toEqual(["https://f/1.jpg", "https://f/2.jpg"])
  })

  it("yazarın kendi listesindeki ürün adı, adresi ve durumu kullanılır", () => {
    const r = toStoreReview(
      raw({ status: "submitted", product_handle: "su-matarasi", product_title: "Su Matarası" }),
      "baska"
    )
    expect(r.product_handle).toBe("su-matarasi")
    expect(r.product_title).toBe("Su Matarası")
    expect(r.status).toBe("pending")
  })

  it("fotoğraflar kimlikleriyle taşınır; bekleyenler ayrı, yoksa boş liste", () => {
    const r = toStoreReview(
      raw({
        images: ["/files/a.webp"],
        photos: [{ id: "prvp_1", url: "/files/a.webp" }],
        pending_photos: [{ id: "prvp_2", url: "/files/b.webp" }],
      })
    )
    expect(r.photos).toEqual([{ id: "prvp_1", url: "/files/a.webp" }])
    expect(r.pending_photos).toEqual([{ id: "prvp_2", url: "/files/b.webp" }])
    expect(toStoreReview(raw()).photos).toEqual([])
    expect(toStoreReview(raw()).pending_photos).toEqual([])
  })
})
