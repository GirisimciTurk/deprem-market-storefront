import { describe, it, expect } from "vitest"
import { sortProducts } from "./sort-products"
import { HttpTypes } from "@medusajs/types"

describe("sortProducts utility", () => {
  const mockProducts = [
    {
      id: "prod_1",
      title: "Product 1",
      created_at: "2026-06-01T00:00:00Z",
      variants: [
        { calculated_price: { calculated_amount: 150 } },
        { calculated_price: { calculated_amount: 100 } },
      ],
    },
    {
      id: "prod_2",
      title: "Product 2",
      created_at: "2026-06-03T00:00:00Z",
      variants: [
        { calculated_price: { calculated_amount: 300 } },
      ],
    },
    {
      id: "prod_3",
      title: "Product 3",
      created_at: "2026-06-02T00:00:00Z",
      variants: [
        { calculated_price: { calculated_amount: 50 } },
        { calculated_price: { calculated_amount: 75 } },
      ],
    },
  ] as unknown as HttpTypes.StoreProduct[]

  it("should sort products by price ascending (price_asc)", () => {
    // Min prices: prod_1 = 100, prod_2 = 300, prod_3 = 50
    // Expected order: prod_3 (50), prod_1 (100), prod_2 (300)
    const result = sortProducts([...mockProducts], "price_asc")
    expect(result[0].id).toBe("prod_3")
    expect(result[1].id).toBe("prod_1")
    expect(result[2].id).toBe("prod_2")
  })

  it("should sort products by price descending (price_desc)", () => {
    // Expected order: prod_2 (300), prod_1 (100), prod_3 (50)
    const result = sortProducts([...mockProducts], "price_desc")
    expect(result[0].id).toBe("prod_2")
    expect(result[1].id).toBe("prod_1")
    expect(result[2].id).toBe("prod_3")
  })

  it("should sort products by creation date descending (created_at)", () => {
    // Dates: prod_1 = June 1, prod_2 = June 3, prod_3 = June 2
    // Expected order (newest first): prod_2, prod_3, prod_1
    const result = sortProducts([...mockProducts], "created_at")
    expect(result[0].id).toBe("prod_2")
    expect(result[1].id).toBe("prod_3")
    expect(result[2].id).toBe("prod_1")
  })

  it("should handle products with empty variants or missing prices", () => {
    const productsWithEmpty = [
      {
        id: "prod_empty",
        title: "Empty Product",
        variants: [],
      },
      {
        id: "prod_normal",
        title: "Normal Product",
        variants: [{ calculated_price: { calculated_amount: 100 } }],
      },
    ] as unknown as HttpTypes.StoreProduct[]

    const result = sortProducts(productsWithEmpty, "price_asc")
    // Empty product minPrice is Infinity, so it should be at the end
    expect(result[0].id).toBe("prod_normal")
    expect(result[1].id).toBe("prod_empty")
  })
})
