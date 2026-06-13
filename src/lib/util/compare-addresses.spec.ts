import { describe, it, expect } from "vitest"
import compareAddresses from "./compare-addresses"

describe("compareAddresses", () => {
  const base = {
    first_name: "Ali",
    last_name: "Veli",
    address_1: "Atatürk Cd. No:1",
    company: "Acme",
    postal_code: "34000",
    city: "İstanbul",
    country_code: "tr",
    province: "İstanbul",
    phone: "+905551112233",
  }

  it("should return true for two identical addresses", () => {
    expect(compareAddresses({ ...base }, { ...base })).toBe(true)
  })

  it("should ignore non-compared fields (e.g. id, metadata)", () => {
    expect(
      compareAddresses(
        { ...base, id: "addr_1", metadata: { a: 1 } },
        { ...base, id: "addr_2", metadata: { a: 2 } }
      )
    ).toBe(true)
  })

  it("should return false when a compared field differs", () => {
    expect(
      compareAddresses({ ...base }, { ...base, city: "Ankara" })
    ).toBe(false)
  })

  it("should detect a difference in the phone field", () => {
    expect(
      compareAddresses({ ...base }, { ...base, phone: "+905559998877" })
    ).toBe(false)
  })

  it("should treat a missing compared field as different from a present one", () => {
    const without = { ...base } as Record<string, unknown>
    delete without.company
    expect(compareAddresses(base, without)).toBe(false)
  })
})
