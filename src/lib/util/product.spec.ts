import { describe, it, expect } from "vitest"
import { isSimpleProduct } from "./product"
import { HttpTypes } from "@medusajs/types"

describe("isSimpleProduct", () => {
  it("should return true for a product with one option and one value", () => {
    const product = {
      options: [{ values: [{ value: "Default" }] }],
    } as unknown as HttpTypes.StoreProduct
    expect(isSimpleProduct(product)).toBe(true)
  })

  it("should return false when there are multiple options", () => {
    const product = {
      options: [
        { values: [{ value: "S" }] },
        { values: [{ value: "Red" }] },
      ],
    } as unknown as HttpTypes.StoreProduct
    expect(isSimpleProduct(product)).toBe(false)
  })

  it("should return false when the single option has multiple values", () => {
    const product = {
      options: [{ values: [{ value: "S" }, { value: "M" }] }],
    } as unknown as HttpTypes.StoreProduct
    expect(isSimpleProduct(product)).toBe(false)
  })

  it("should return false when there are no options", () => {
    const product = { options: [] } as unknown as HttpTypes.StoreProduct
    expect(isSimpleProduct(product)).toBe(false)
  })
})
