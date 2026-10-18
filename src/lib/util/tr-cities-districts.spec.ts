import { describe, it, expect } from "vitest"
import { TR_CITIES_DISTRICTS, findCity } from "./tr-cities-districts"

describe("TR_CITIES_DISTRICTS data integrity", () => {
  it("should be defined as an object", () => {
    expect(TR_CITIES_DISTRICTS).toBeDefined()
    expect(typeof TR_CITIES_DISTRICTS).toBe("object")
  })

  it("should contain major cities", () => {
    expect(TR_CITIES_DISTRICTS).toHaveProperty("İstanbul")
    expect(TR_CITIES_DISTRICTS).toHaveProperty("Ankara")
    expect(TR_CITIES_DISTRICTS).toHaveProperty("İzmir")
    expect(TR_CITIES_DISTRICTS).toHaveProperty("Kahramanmaraş")
    expect(TR_CITIES_DISTRICTS).toHaveProperty("Hatay")
  })

  it("should map each city to an array of districts", () => {
    const cities = Object.keys(TR_CITIES_DISTRICTS)
    cities.forEach((city) => {
      const districts = TR_CITIES_DISTRICTS[city]
      expect(Array.isArray(districts)).toBe(true)
      expect(districts.length).toBeGreaterThan(0)
    })
  })

  it("should verify specific districts for key cities", () => {
    expect(TR_CITIES_DISTRICTS["İstanbul"]).toContain("Kadıköy")
    expect(TR_CITIES_DISTRICTS["Ankara"]).toContain("Çankaya")
    expect(TR_CITIES_DISTRICTS["Kahramanmaraş"]).toContain("Pazarcık")
  })
})

describe("findCity", () => {
  it("eski bağlantılardaki küçük harf ve boşluklu yazımı listedeki ile eşler", () => {
    expect(findCity("istanbul")).toBe("İstanbul")
    expect(findCity("  IĞDIR ")).toBe("Iğdır")
    expect(findCity("izmir")).toBe("İzmir")
  })

  it("listede olmayanı ve boşu tanımaz", () => {
    expect(findCity("Kadıköy")).toBeUndefined()
    expect(findCity("")).toBeUndefined()
    expect(findCity(undefined)).toBeUndefined()
  })
})
