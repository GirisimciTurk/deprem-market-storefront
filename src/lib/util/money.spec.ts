import { describe, it, expect } from "vitest"
import { convertToLocale } from "./money"

describe("convertToLocale", () => {
  describe("TRY (Turkish Lira) — kuruş/100 conversion", () => {
    it("should convert whole-lira amount (no kuruş) without decimals", () => {
      // 15000 kuruş => 150 TL, no fractional part
      expect(convertToLocale({ amount: 15000, currency_code: "try" })).toBe(
        "150 TL"
      )
    })

    it("should show two decimals when there are kuruş", () => {
      // 15050 kuruş => 150,50 TL
      expect(convertToLocale({ amount: 15050, currency_code: "try" })).toBe(
        "150,50 TL"
      )
    })

    it("should use Turkish thousands separator (.)", () => {
      // 1234567 kuruş => 12.345,67 TL
      expect(convertToLocale({ amount: 1234567, currency_code: "try" })).toBe(
        "12.345,67 TL"
      )
    })

    it("should handle zero amount", () => {
      expect(convertToLocale({ amount: 0, currency_code: "try" })).toBe("0 TL")
    })

    it("should be case-insensitive for the currency code", () => {
      expect(convertToLocale({ amount: 15000, currency_code: "TRY" })).toBe(
        "150 TL"
      )
    })

    it("should handle a single kuruş (rounds to two decimals)", () => {
      // 1 kuruş => 0,01 TL
      expect(convertToLocale({ amount: 1, currency_code: "try" })).toBe(
        "0,01 TL"
      )
    })

    it("should honor explicit minimum/maximum fraction digits", () => {
      // Force decimals even on a whole amount
      expect(
        convertToLocale({
          amount: 15000,
          currency_code: "try",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      ).toBe("150,00 TL")
    })

    it("should handle very large amounts", () => {
      // 100000000000 kuruş => 1.000.000.000 TL
      expect(
        convertToLocale({ amount: 100000000000, currency_code: "try" })
      ).toBe("1.000.000.000 TL")
    })
  })

  describe("zero-decimal currencies (e.g. JPY)", () => {
    it("should not divide by 100 for JPY", () => {
      // 1500 yen => ¥1.500 (Intl uses locale tr-TR by default)
      const result = convertToLocale({ amount: 1500, currency_code: "jpy" })
      expect(result).toContain("1.500")
      // No fractional part for zero-decimal currency
      expect(result).not.toContain(",00")
    })
  })

  describe("three-decimal currencies (e.g. KWD)", () => {
    it("should divide by 1000 for KWD", () => {
      // 1500 fils => 1.5 KWD
      const result = convertToLocale({ amount: 1500, currency_code: "kwd" })
      // 1500 / 1000 = 1.5
      expect(result).toContain("1,5")
    })
  })

  describe("standard currencies (USD)", () => {
    it("should divide by 100 and format with currency symbol", () => {
      // 15000 cents => $150.00 formatted in tr-TR locale
      const result = convertToLocale({ amount: 15000, currency_code: "usd" })
      expect(result).toContain("150")
      // tr-TR currency format includes the code or symbol
      expect(result).toMatch(/\$|USD/)
    })

    it("should respect explicit locale override", () => {
      const result = convertToLocale({
        amount: 15000,
        currency_code: "usd",
        locale: "en-US",
      })
      expect(result).toBe("$150.00")
    })
  })

  describe("missing / empty currency code", () => {
    it("should return the raw amount as string when currency_code is empty", () => {
      expect(convertToLocale({ amount: 15000, currency_code: "" })).toBe(
        "15000"
      )
    })

    it("should return the raw amount as string when currency_code is whitespace", () => {
      expect(convertToLocale({ amount: 42, currency_code: "   " })).toBe("42")
    })
  })
})
