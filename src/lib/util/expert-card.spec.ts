import { describe, expect, it } from "vitest"
import { EXPERT_REGION_LIMIT } from "@lib/expert-config"
import {
  addRegionDraft,
  cleanRegions,
  validateExpertBasics,
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
  })

  it("her zorunlu alanın kendi hatası var", () => {
    expect(validateExpertBasics({ ...valid, full_name: " A " })).toMatch(/ad/i)
    expect(validateExpertBasics({ ...valid, phone: "0532 000" })).toMatch(
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
