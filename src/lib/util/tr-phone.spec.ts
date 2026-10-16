import { describe, expect, it } from "vitest"
import {
  formatTrPhone,
  isTrMobilePhone,
  isValidTrPhone,
  normalizeTrPhone,
  toAccountPhone,
  toE164TrPhone,
  trPhoneProblem,
} from "./tr-phone"

describe("normalizeTrPhone", () => {
  it("her biçimi kanonik 05xxxxxxxxx'e indirir", () => {
    for (const v of [
      "05321234567",
      "0532 123 45 67",
      "0 532 123 45 67",
      "(0532) 123-45-67",
      "5321234567",
      "+90 532 123 45 67",
      "+905321234567",
      "905321234567",
      "00905321234567",
      "0.532.123.45.67",
    ]) {
      expect(normalizeTrPhone(v)).toBe("05321234567")
    }
  })

  it("boş girdi boş kalır, eksik numara eksik kalır, fazlası kesilir", () => {
    expect(normalizeTrPhone("")).toBe("")
    expect(normalizeTrPhone(null)).toBe("")
    expect(normalizeTrPhone("abc")).toBe("")
    expect(normalizeTrPhone("0")).toBe("0")
    expect(normalizeTrPhone("5")).toBe("05")
    expect(normalizeTrPhone("00532")).toBe("0532")
    expect(normalizeTrPhone("053212345678999")).toBe("05321234567")
  })
})

describe("formatTrPhone", () => {
  it("yazdıkça 0 5xx xxx xx xx biçimine girer", () => {
    expect(formatTrPhone("0")).toBe("0")
    expect(formatTrPhone("05")).toBe("0 5")
    expect(formatTrPhone("0532")).toBe("0 532")
    expect(formatTrPhone("05321")).toBe("0 532 1")
    expect(formatTrPhone("0532123")).toBe("0 532 123")
    expect(formatTrPhone("053212345")).toBe("0 532 123 45")
    expect(formatTrPhone("05321234567")).toBe("0 532 123 45 67")
    expect(formatTrPhone("+905321234567")).toBe("0 532 123 45 67")
  })

  it("harf ve işaretleri atar", () => {
    expect(formatTrPhone("0532abc12")).toBe("0 532 12")
  })

  it("biçimli değeri yeniden biçimlemek değiştirmez", () => {
    expect(formatTrPhone(formatTrPhone("02121234567"))).toBe("0 212 123 45 67")
  })
})

describe("geçerlilik", () => {
  it("11 hane, 0 ile başlar; cep ve sabit hat geçerli", () => {
    expect(isValidTrPhone("0532 123 45 67")).toBe(true)
    expect(isValidTrPhone("0212 123 45 67")).toBe(true)
    expect(isValidTrPhone("0312 123 45 67")).toBe(true)
    expect(isValidTrPhone("0462 123 45 67")).toBe(true)
    expect(isValidTrPhone("0532 123 45 6")).toBe(false)
    expect(isValidTrPhone("0832 123 45 67")).toBe(false)
    expect(isValidTrPhone("0132 123 45 67")).toBe(false)
    expect(isValidTrPhone("")).toBe(false)
  })

  it("cep kontrolü sabit hattı reddeder", () => {
    expect(isTrMobilePhone("0532 123 45 67")).toBe(true)
    expect(isTrMobilePhone("0212 123 45 67")).toBe(false)
  })

  it("E.164'e çevirir, geçersizde boş döner", () => {
    expect(toE164TrPhone("0 532 123 45 67")).toBe("+905321234567")
    expect(toE164TrPhone("0532")).toBe("")
  })

  it("boş alan için ileti yok, eksik için Türkçe ileti var", () => {
    expect(trPhoneProblem("")).toBe("")
    expect(trPhoneProblem("0532 123 45 67")).toBe("")
    expect(trPhoneProblem("0532 12")).toMatch(/eksiksiz/)
    expect(trPhoneProblem("0212 123 45 67", { mobileOnly: true })).toMatch(
      /cep telefonu/
    )
  })
})

describe("toAccountPhone (hesap telefonu, signup kuralı)", () => {
  it("boş girdi boş dize", () => {
    expect(toAccountPhone("")).toBe("")
    expect(toAccountPhone("  ")).toBe("")
    expect(toAccountPhone(null)).toBe("")
  })

  it("cep numarasını her biçimden +905… yapar", () => {
    expect(toAccountPhone("0 532 123 45 67")).toBe("+905321234567")
    expect(toAccountPhone("(0532) 123-45.67")).toBe("+905321234567")
    expect(toAccountPhone("905321234567")).toBe("+905321234567")
    expect(toAccountPhone("5321234567")).toBe("+905321234567")
    expect(toAccountPhone("+90 532 123 45 67")).toBe("+905321234567")
  })

  it("sabit hat, eksik ya da fazla numara null", () => {
    expect(toAccountPhone("0212 123 45 67")).toBeNull()
    expect(toAccountPhone("0532 123")).toBeNull()
    expect(toAccountPhone("0532 123 45 678")).toBeNull()
  })
})
