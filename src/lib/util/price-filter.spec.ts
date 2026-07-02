import { describe, it, expect } from "vitest"
import {
  matchesPriceRange,
  priceBoundsToKurus,
  productMinAmount,
} from "./price-filter"

// Regresyon: kullanıcı TL girer, ürün fiyatı kuruş → sınır ×100 kuruşa çevrilmeli.
// Bug öncesi 500 TL "max" girildiğinde 150 TL (15000 kuruş) ürün eleniyordu.

const productAt = (kurus: number) => ({
  variants: [{ calculated_price: { calculated_amount: kurus } }],
})

describe("priceBoundsToKurus", () => {
  it("TL string'i kuruşa çevirir (×100)", () => {
    expect(priceBoundsToKurus("500", "1000")).toEqual({ min: 50000, max: 100000 })
  })
  it("ondalık TL'yi yuvarlar", () => {
    expect(priceBoundsToKurus("19.99", undefined)).toEqual({ min: 1999, max: null })
  })
  it("boş/geçersiz girdi → null (sınır yok)", () => {
    expect(priceBoundsToKurus(undefined, undefined)).toEqual({ min: null, max: null })
    expect(priceBoundsToKurus("abc", "")).toEqual({ min: null, max: null })
  })
})

describe("productMinAmount", () => {
  it("en düşük varyant fiyatını (kuruş) döner", () => {
    expect(
      productMinAmount({
        variants: [
          { calculated_price: { calculated_amount: 30000 } },
          { calculated_price: { calculated_amount: 12000 } },
        ],
      })
    ).toBe(12000)
  })
  it("varyant yoksa 0", () => {
    expect(productMinAmount({ variants: [] })).toBe(0)
    expect(productMinAmount({})).toBe(0)
  })
})

describe("matchesPriceRange (TL girdi ↔ kuruş fiyat)", () => {
  it("150 TL'lik ürün, max=500 TL filtresini GEÇER (bug: eleniyordu)", () => {
    // 150 TL = 15000 kuruş; max 500 TL = 50000 kuruş → 15000 <= 50000 → geçer
    expect(matchesPriceRange(productAt(15000), undefined, "500")).toBe(true)
  })
  it("600 TL'lik ürün, max=500 TL ile elenir", () => {
    expect(matchesPriceRange(productAt(60000), undefined, "500")).toBe(false)
  })
  it("50 TL'lik ürün, min=100 TL ile elenir (bug: min hiç çalışmıyordu)", () => {
    // 50 TL = 5000 kuruş; min 100 TL = 10000 kuruş → 5000 < 10000 → elenir
    expect(matchesPriceRange(productAt(5000), "100", undefined)).toBe(false)
  })
  it("200 TL'lik ürün, 100–300 TL aralığını geçer", () => {
    expect(matchesPriceRange(productAt(20000), "100", "300")).toBe(true)
  })
  it("sınır yoksa her ürün geçer", () => {
    expect(matchesPriceRange(productAt(99999), undefined, undefined)).toBe(true)
    expect(matchesPriceRange(productAt(1), "abc", "")).toBe(true)
  })
})
