import { describe, expect, it } from "vitest"
import { freeShippingTarget, pickFreeShippingTarget, type ShippingQuote, type ShippingQuoteSeller } from "./free-shipping"

const seller = (extra: Partial<ShippingQuoteSeller> = {}): ShippingQuoteSeller => ({
  seller_id: "sel_a",
  desi: 2,
  subtotal: 30000,
  raw_fee: 9000,
  fee: 9000,
  free: false,
  free_shipping_threshold: 50000,
  ...extra,
})

const quote = (sellers: ShippingQuoteSeller[]): ShippingQuote => ({
  currency_code: "TRY",
  amount: sellers.reduce((s, x) => s + x.fee, 0),
  free: sellers.every((x) => x.fee === 0),
  sellers,
  shipping_total: 0,
  stale: false,
})

describe("freeShippingTarget", () => {
  it("eşiği olmayan (null) ya da her zaman ücretsiz (0) satıcının hedefi yok", () => {
    expect(freeShippingTarget(seller({ free_shipping_threshold: null }))).toBeNull()
    expect(freeShippingTarget(seller({ free_shipping_threshold: 0, fee: 0, free: true }))).toBeNull()
  })

  it("kalan tutar ve yüzde satıcının ara toplamından hesaplanır (kuruş)", () => {
    expect(freeShippingTarget(seller())).toEqual({
      seller_id: "sel_a",
      target_amount: 50000,
      current_amount: 30000,
      target_reached: false,
      target_remaining: 20000,
      remaining_percentage: 60,
      saving: 9000,
    })
  })

  it("ara toplam eşiğe eşitse hedefe ulaşılmıştır", () => {
    const t = freeShippingTarget(seller({ subtotal: 50000, fee: 0, free: true }))!
    expect(t.target_reached).toBe(true)
    expect(t.target_remaining).toBe(0)
    expect(t.remaining_percentage).toBe(100)
  })
})

describe("pickFreeShippingTarget", () => {
  it("teklif yoksa ya da hiçbir satıcının eşiği yoksa hedef yok", () => {
    expect(pickFreeShippingTarget(null)).toBeNull()
    expect(pickFreeShippingTarget(quote([seller({ free_shipping_threshold: null })]))).toBeNull()
  })

  it("ulaşılmamış hedefler arasında eşiğe en yakın olanı seçer", () => {
    const t = pickFreeShippingTarget(
      quote([
        seller({ seller_id: "sel_a", subtotal: 10000, free_shipping_threshold: 50000 }),
        seller({ seller_id: "sel_b", subtotal: 45000, free_shipping_threshold: 50000 }),
        seller({ seller_id: "sel_c", subtotal: 100000, free_shipping_threshold: 50000, fee: 0, free: true }),
      ])
    )
    expect(t?.seller_id).toBe("sel_b")
    expect(t?.target_remaining).toBe(5000)
  })

  it("hepsi ulaşılmışsa ulaşılmış bir hedef döner", () => {
    const t = pickFreeShippingTarget(quote([seller({ subtotal: 60000, fee: 0, free: true })]))
    expect(t?.target_reached).toBe(true)
  })
})

describe("mağaza adı", () => {
  it("teklifteki mağaza adı ve adresi hedefe taşınır; sahipsiz satırda yoktur", () => {
    const t = freeShippingTarget(seller({ seller_handle: "kucukler", seller_name: "Küçükler Mağazası" }))
    expect(t?.seller_handle).toBe("kucukler")
    expect(t?.seller_name).toBe("Küçükler Mağazası")
    const own = freeShippingTarget(seller({ seller_id: null }))
    expect(own?.seller_handle).toBeUndefined()
    expect(own?.seller_name).toBeUndefined()
  })
})
