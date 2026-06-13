import { describe, it, expect } from "vitest"
import { getPricesForVariant, getProductPrice } from "./get-product-price"
import { HttpTypes } from "@medusajs/types"

const makeVariant = (
  calculated: number,
  original: number,
  priceListType = "default",
  currency = "try"
) =>
  ({
    id: "var_1",
    calculated_price: {
      calculated_amount: calculated,
      original_amount: original,
      currency_code: currency,
      calculated_price: { price_list_type: priceListType },
    },
  } as any)

describe("getPricesForVariant", () => {
  it("should return null when the variant has no calculated price", () => {
    expect(getPricesForVariant({} as any)).toBeNull()
    expect(
      getPricesForVariant({ calculated_price: { calculated_amount: 0 } } as any)
    ).toBeNull()
  })

  it("should format calculated and original prices and compute the diff", () => {
    // 12000 kuruş = 120 TL, 15000 kuruş = 150 TL, diff = 20%
    const result = getPricesForVariant(makeVariant(12000, 15000, "sale"))
    expect(result).not.toBeNull()
    expect(result!.calculated_price_number).toBe(12000)
    expect(result!.original_price_number).toBe(15000)
    expect(result!.calculated_price).toBe("120 TL")
    expect(result!.original_price).toBe("150 TL")
    expect(result!.currency_code).toBe("try")
    expect(result!.price_type).toBe("sale")
    expect(result!.percentage_diff).toBe("20")
  })
})

describe("getProductPrice", () => {
  it("should throw when no product is provided", () => {
    expect(() => getProductPrice({ product: null as any })).toThrow(
      "No product provided"
    )
  })

  it("should pick the cheapest variant for cheapestPrice", () => {
    const product = {
      id: "prod_1",
      variants: [
        makeVariant(30000, 30000),
        makeVariant(10000, 10000),
        makeVariant(20000, 20000),
      ],
    } as unknown as HttpTypes.StoreProduct

    const { cheapestPrice } = getProductPrice({ product })
    expect(cheapestPrice).not.toBeNull()
    expect(cheapestPrice!.calculated_price_number).toBe(10000)
    expect(cheapestPrice!.calculated_price).toBe("100 TL")
  })

  it("should resolve variantPrice by variant id", () => {
    const product = {
      id: "prod_1",
      variants: [
        { ...makeVariant(10000, 10000), id: "v_a" },
        { ...makeVariant(25000, 25000), id: "v_b" },
      ],
    } as unknown as HttpTypes.StoreProduct

    const { variantPrice } = getProductPrice({ product, variantId: "v_b" })
    expect(variantPrice).not.toBeNull()
    expect(variantPrice!.calculated_price_number).toBe(25000)
  })

  it("should return null variantPrice for an unknown variant id", () => {
    const product = {
      id: "prod_1",
      variants: [{ ...makeVariant(10000, 10000), id: "v_a" }],
    } as unknown as HttpTypes.StoreProduct

    const { variantPrice } = getProductPrice({ product, variantId: "missing" })
    expect(variantPrice).toBeNull()
  })

  it("should return null cheapestPrice when there are no variants", () => {
    const product = {
      id: "prod_1",
      variants: [],
    } as unknown as HttpTypes.StoreProduct
    expect(getProductPrice({ product }).cheapestPrice).toBeNull()
  })
})
