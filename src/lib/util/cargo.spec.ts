import { describe, it, expect } from "vitest"
import { resolveCarrier, getCarrierName, getTrackingUrl } from "./cargo"

describe("cargo utilities", () => {
  describe("resolveCarrier", () => {
    it("should resolve the carrier from a provider id prefix", () => {
      expect(resolveCarrier("aras_kargo").name).toBe("Aras Kargo")
      expect(resolveCarrier("yurtici_xyz").name).toBe("Yurtiçi Kargo")
      expect(resolveCarrier("mng_123").name).toBe("MNG Kargo")
      expect(resolveCarrier("ptt_abc").name).toBe("PTT Kargo")
    })

    it("should fall back to the default carrier (Aras) for unknown prefixes", () => {
      expect(resolveCarrier("unknown_provider").name).toBe("Aras Kargo")
    })

    it("should fall back to the default carrier for null/undefined", () => {
      expect(resolveCarrier(null).name).toBe("Aras Kargo")
      expect(resolveCarrier(undefined).name).toBe("Aras Kargo")
      expect(resolveCarrier().name).toBe("Aras Kargo")
    })

    it("should match a bare prefix with no underscore suffix", () => {
      expect(resolveCarrier("mng").name).toBe("MNG Kargo")
    })
  })

  describe("getCarrierName", () => {
    it("should return the human-readable carrier name", () => {
      expect(getCarrierName("yurtici_x")).toBe("Yurtiçi Kargo")
    })

    it("should default to Aras Kargo when no provider id is given", () => {
      expect(getCarrierName()).toBe("Aras Kargo")
    })
  })

  describe("getTrackingUrl", () => {
    it("should substitute {code} into the template", () => {
      expect(getTrackingUrl("ABC123", "aras_kargo")).toBe(
        "https://kargotakip.araskargo.com.tr/?gonderitakipno=ABC123"
      )
    })

    it("should use the correct template per carrier", () => {
      expect(getTrackingUrl("999", "ptt_x")).toBe(
        "https://gonderitakip.ptt.gov.tr/Track/Verify?q=999"
      )
      expect(getTrackingUrl("777", "mng_x")).toBe(
        "https://service.mngkargo.com.tr/iframe/iframe.aspx?KODNO=777"
      )
    })

    it("should URL-encode the tracking code", () => {
      // A code with characters that require encoding
      expect(getTrackingUrl("A B/C", "aras_kargo")).toBe(
        "https://kargotakip.araskargo.com.tr/?gonderitakipno=A%20B%2FC"
      )
    })

    it("should trim surrounding whitespace from the tracking number", () => {
      expect(getTrackingUrl("  XYZ  ", "aras_kargo")).toBe(
        "https://kargotakip.araskargo.com.tr/?gonderitakipno=XYZ"
      )
    })

    it("should return null for an empty or whitespace-only tracking number", () => {
      expect(getTrackingUrl("", "aras_kargo")).toBeNull()
      expect(getTrackingUrl("   ", "aras_kargo")).toBeNull()
    })

    it("should use the default carrier template when provider id is missing", () => {
      expect(getTrackingUrl("CODE1")).toBe(
        "https://kargotakip.araskargo.com.tr/?gonderitakipno=CODE1"
      )
    })
  })
})
