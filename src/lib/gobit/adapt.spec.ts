import { describe, it, expect } from "vitest"
import { toProduct, type GobitPrice } from "./adapt"

const productWith = (prices: GobitPrice[]) =>
  toProduct({
    id: "prod_1",
    title: "Deprem Çantası",
    handle: "deprem-cantasi",
    variants: [{ id: "var_1", title: "Tek", price_set: { prices } } as never],
  })

describe("toProduct fiyatı", () => {
  it("kampanya yokken taban fiyatı gösterir", () => {
    const price = productWith([{ amount: 10000, currency_code: "try" }]).variants?.[0].calculated_price
    expect(price?.calculated_amount).toBe(10000)
    expect(price?.original_amount).toBe(10000)
    expect(price?.calculated_price?.price_list_type).toBeNull()
  })

  it("kampanya açıkken indirimli fiyatı, tabanı üstü çizili gösterir", () => {
    const price = productWith([
      { amount: 10000, currency_code: "try" },
      { amount: 8000, currency_code: "try", price_list_id: "plist_1", price_list_type: "sale" },
    ]).variants?.[0].calculated_price
    expect(price?.calculated_amount).toBe(8000)
    expect(price?.original_amount).toBe(10000)
    expect(price?.calculated_price?.price_list_type).toBe("sale")
  })

  it("satış dışı fiyat listesini ve toplu alım fiyatını vitrinde göstermez", () => {
    const price = productWith([
      { amount: 10000, currency_code: "try" },
      { amount: 7000, currency_code: "try", price_list_id: "plist_2", price_list_type: "override" },
      { amount: 6000, currency_code: "try", min_quantity: 10 },
    ]).variants?.[0].calculated_price
    expect(price?.calculated_amount).toBe(10000)
  })
})
