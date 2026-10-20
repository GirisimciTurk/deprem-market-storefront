import { describe, expect, it } from "vitest"
import { render } from "@testing-library/react"
import ProductJsonLd from "./index"

// Vitrin tutarları kuruş taşır (calculated_amount); schema.org'un fiyatı ise ana
// birimle (TL) yazılır. Kuruş olduğu gibi yazılınca Google 2.790 TL'lik kaskı
// 279.000 TL görüyordu.
function offer(variants: Record<string, unknown>[]) {
  const { container } = render(
    <ProductJsonLd
      product={{ id: "prod_1", title: "Koruyucu Kask", variants } as any}
      url="https://depremtek.market/tr/products/koruyucu-kask"
    />
  )
  const script = container.querySelector('script[type="application/ld+json"]')
  return JSON.parse(script!.innerHTML).offers
}

describe("ürün JSON-LD'si", () => {
  it("en ucuz varyantın kuruş tutarını TL olarak yazar", () => {
    const o = offer([
      { calculated_price: { calculated_amount: 394900, currency_code: "try" }, inventory_quantity: 2, manage_inventory: true },
      { calculated_price: { calculated_amount: 279000, currency_code: "try" }, inventory_quantity: 0, manage_inventory: true },
    ])
    expect(o.price).toBe("2790.00")
    expect(o.priceCurrency).toBe("TRY")
    expect(o.availability).toBe("https://schema.org/InStock")
  })

  it("kuruşlu tutarın kuruşunu korur", () => {
    expect(offer([{ calculated_price: { calculated_amount: 24413, currency_code: "try" } }]).price).toBe("244.13")
  })

  it("stoğu olmayan ürünü tükenmiş yazar", () => {
    const o = offer([
      { calculated_price: { calculated_amount: 279000, currency_code: "try" }, inventory_quantity: 0, manage_inventory: true },
    ])
    expect(o.availability).toBe("https://schema.org/OutOfStock")
  })
})
