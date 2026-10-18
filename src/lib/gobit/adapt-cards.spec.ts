import { describe, it, expect } from "vitest"
import { toMyResellerApplication, toProduct, withCardRating, type GobitApplication, type ProductCard } from "./adapt"

const product = { id: "prod_1", title: "Deprem Çantası", handle: "deprem-cantasi", metadata: { showcase: ["x"] } }
const seller = { handle: "dm", name: "Deprem Market", rating_avg: 4, review_count: 3, trusted: true, follower_count: 1 }

describe("withCardRating", () => {
  it("puanı ve yorum sayısını metadata'ya yazar, mevcut alanları korur", () => {
    const card: ProductCard = { product_id: "prod_1", seller, rating: 4.5, review_count: 2 }
    const p = toProduct(withCardRating(product, card), null, card.seller)
    expect(p.metadata).toEqual({ showcase: ["x"], rating: 4.5, review_count: 2 })
    expect((p as any).seller.handle).toBe("dm")
    expect(product.metadata).toEqual({ showcase: ["x"] })
  })

  it("puan yoksa (null) ürüne dokunmaz", () => {
    const card: ProductCard = { product_id: "prod_1", seller: null, rating: null, review_count: 0 }
    expect(withCardRating(product, card)).toBe(product)
    expect(withCardRating(product, undefined)).toBe(product)
  })

  it("metadata'sı olmayan ürüne de yazar", () => {
    const bare = { id: "prod_2", title: "Fener", handle: "fener" }
    const card: ProductCard = { product_id: "prod_2", seller: null, rating: 3, review_count: 1 }
    expect(withCardRating(bare, card).metadata).toEqual({ rating: 3, review_count: 1 })
  })
})

describe("toMyResellerApplication", () => {
  const base: GobitApplication = {
    id: "app_1",
    kind: "reseller",
    company_name: "Acme Ltd",
    contact_name: "Ayşe Yılmaz",
    contact_email: "ayse@example.com",
    contact_phone: "05551112233",
    tax_id: "1234567890",
    tax_office: "Kadıköy",
    city: "İstanbul",
    note: "Merhaba",
    status: "pending",
    created_at: "2026-10-01T09:00:00Z",
  }

  it("alanları vitrinin biçimine çevirir", () => {
    expect(toMyResellerApplication(base)).toEqual({
      companyName: "Acme Ltd",
      contactName: "Ayşe Yılmaz",
      taxOfficeNumber: "Kadıköy / 1234567890",
      email: "ayse@example.com",
      phone: "05551112233",
      city: "İstanbul",
      message: "Merhaba",
      date: new Date("2026-10-01T09:00:00Z").toLocaleDateString("tr-TR"),
      status: "pending",
      applicationType: "bayi",
    })
  })

  it("company → firma, reseller → bayi", () => {
    expect(toMyResellerApplication({ ...base, kind: "company" }).applicationType).toBe("firma")
    expect(toMyResellerApplication({ ...base, kind: "reseller" }).applicationType).toBe("bayi")
  })

  it("bilinen durumları korur, bilinmeyeni beklemede sayar", () => {
    for (const s of ["approved", "rejected", "suspended"] as const) {
      expect(toMyResellerApplication({ ...base, status: s }).status).toBe(s)
    }
    expect(toMyResellerApplication({ ...base, status: "weird" }).status).toBe("pending")
  })

  it("boş vergi bilgisi ve not alanı gösterilmez", () => {
    const a = toMyResellerApplication({ ...base, tax_id: "", tax_office: "", note: "", city: undefined })
    expect(a.taxOfficeNumber).toBeUndefined()
    expect(a.message).toBeUndefined()
    expect(a.city).toBe("")
  })
})
