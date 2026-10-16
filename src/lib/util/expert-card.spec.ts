import { describe, expect, it } from "vitest"
import { EXPERT_REGION_LIMIT } from "@lib/expert-config"
import {
  addRegionDraft,
  cleanRegions,
  splitFullName,
  validateExpertBasics,
  validateExpertSignup,
} from "./expert-card"

const valid = {
  full_name: "Ayşe Yılmaz",
  phone: "0532 000 0000",
  city: "İstanbul",
  district: "Kadıköy",
  specializations: ["risk_tespit"],
}

describe("validateExpertBasics", () => {
  it("geçerli temel bilgiler için null döner", () => {
    expect(validateExpertBasics(valid)).toBeNull()
    expect(
      validateExpertBasics({ ...valid, phone: "+90 532 000 00 00" })
    ).toBeNull()
  })

  it("her zorunlu alanın kendi hatası var", () => {
    expect(validateExpertBasics({ ...valid, full_name: " A " })).toMatch(/ad/i)
    expect(validateExpertBasics({ ...valid, phone: "0532 000" })).toMatch(
      /telefon/i
    )
    expect(validateExpertBasics({ ...valid, phone: "0832 000 0000" })).toMatch(
      /telefon/i
    )
    expect(validateExpertBasics({ ...valid, city: "  " })).toMatch(/il ve ilçe/)
    expect(validateExpertBasics({ ...valid, district: "" })).toMatch(
      /il ve ilçe/
    )
    expect(validateExpertBasics({ ...valid, specializations: [] })).toMatch(
      /uzmanlık/
    )
  })
})

describe("hizmet bölgesi sınırı", () => {
  it("sınır herkes için 3", () => {
    expect(EXPERT_REGION_LIMIT).toBe(3)
  })

  it("addRegionDraft sınırda listeyi değiştirmez", () => {
    let r = addRegionDraft([])
    r = addRegionDraft(r)
    r = addRegionDraft(r)
    expect(r).toHaveLength(3)
    const full = r
    expect(addRegionDraft(full)).toBe(full)
  })

  it("cleanRegions ili boş satırı atar, ilçeyi kırpar, sınırı aşmaz", () => {
    expect(
      cleanRegions([
        { city: " Kocaeli ", district: " İzmit " },
        { city: "  ", district: "Gebze" },
        { city: "Sakarya", district: "" },
        { city: "Bursa", district: "" },
        { city: "Yalova", district: "" },
      ])
    ).toEqual([
      { city: "Kocaeli", district: "İzmit" },
      { city: "Sakarya", district: undefined },
      { city: "Bursa", district: undefined },
    ])
  })
})

describe("validateExpertSignup", () => {
  const signup = { ...valid, email: "ayse@example.com", password: "12345678" }

  it("geçerli kayıt için null döner", () => {
    expect(validateExpertSignup(signup)).toBeNull()
  })

  it("hataları formdaki sırayla verir: ad, e-posta, şifre, sonra kısa form", () => {
    expect(
      validateExpertSignup({ ...signup, full_name: "", email: "", password: "" })
    ).toMatch(/ad/i)
    expect(validateExpertSignup({ ...signup, email: "ayse@", password: "" })).toMatch(
      /e-posta/
    )
    expect(validateExpertSignup({ ...signup, password: "1234567" })).toMatch(
      /en az 8 karakter/
    )
    expect(validateExpertSignup({ ...signup, phone: "0532" })).toMatch(/telefon/i)
    expect(validateExpertSignup({ ...signup, specializations: [] })).toMatch(
      /uzmanlık/
    )
  })
})

describe("splitFullName", () => {
  it("son kelime soyad, gerisi ad", () => {
    expect(splitFullName("  Ayşe  Nur Yılmaz ")).toEqual({
      first_name: "Ayşe Nur",
      last_name: "Yılmaz",
    })
    expect(splitFullName("Ayşe Yılmaz")).toEqual({
      first_name: "Ayşe",
      last_name: "Yılmaz",
    })
  })

  it("tek kelimede soyad boş", () => {
    expect(splitFullName(" Ayşe ")).toEqual({ first_name: "Ayşe", last_name: "" })
  })
})
