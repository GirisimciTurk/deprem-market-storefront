import { describe, it, expect } from "vitest"
import { isEmpty, isObject, isArray } from "./isEmpty"

describe("isEmpty", () => {
  it("should treat null and undefined as empty", () => {
    expect(isEmpty(null)).toBe(true)
    expect(isEmpty(undefined)).toBe(true)
  })

  it("should treat an empty object/array/string as empty", () => {
    expect(isEmpty({})).toBe(true)
    expect(isEmpty([])).toBe(true)
    expect(isEmpty("")).toBe(true)
    expect(isEmpty("   ")).toBe(true) // whitespace only
  })

  it("should treat populated values as non-empty", () => {
    expect(isEmpty({ a: 1 })).toBe(false)
    expect(isEmpty([1])).toBe(false)
    expect(isEmpty("x")).toBe(false)
    expect(isEmpty("  x  ")).toBe(false)
  })

  it("should treat numbers (including 0) as non-empty", () => {
    // Numbers are neither object/array/string-empty cases, so not empty
    expect(isEmpty(0)).toBe(false)
    expect(isEmpty(42)).toBe(false)
  })

  it("should treat booleans as non-empty", () => {
    expect(isEmpty(false)).toBe(false)
    expect(isEmpty(true)).toBe(false)
  })
})

describe("isObject", () => {
  it("should detect plain objects and arrays as objects", () => {
    expect(isObject({})).toBe(true)
    expect(isObject([])).toBe(true)
  })

  it("should reject primitives", () => {
    expect(isObject("x")).toBe(false)
    expect(isObject(5)).toBe(false)
    expect(isObject(null)).toBe(false)
  })
})

describe("isArray", () => {
  it("should detect arrays only", () => {
    expect(isArray([])).toBe(true)
    expect(isArray([1, 2])).toBe(true)
    expect(isArray({})).toBe(false)
    expect(isArray("abc")).toBe(false)
  })
})
