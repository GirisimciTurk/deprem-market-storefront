import { describe, it, expect } from "vitest"
import { resolveCarrier, getCarrierName, getTrackingUrl } from "./cargo"

const YURTICI_TRACK = "https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code="

describe("cargo utilities", () => {
  describe("resolveCarrier", () => {
    it("should resolve the carrier from a provider id prefix", () => {
      expect(resolveCarrier("yurtici_kargo").name).toBe("Yurtiçi Kargo")
      expect(resolveCarrier("mng_123").name).toBe("MNG Kargo")
      expect(resolveCarrier("ptt_abc").name).toBe("PTT Kargo")
    })

    it("should fall back to the default carrier (Yurtiçi) for unknown prefixes", () => {
      expect(resolveCarrier("unknown_provider").name).toBe("Yurtiçi Kargo")
    })

    it("should fall back to the default carrier for null/undefined", () => {
      expect(resolveCarrier(null).name).toBe("Yurtiçi Kargo")
      expect(resolveCarrier(undefined).name).toBe("Yurtiçi Kargo")
      expect(resolveCarrier().name).toBe("Yurtiçi Kargo")
    })

    it("should match a bare prefix with no underscore suffix", () => {
      expect(resolveCarrier("mng").name).toBe("MNG Kargo")
    })
  })

  describe("getCarrierName", () => {
    it("should return the human-readable carrier name", () => {
      expect(getCarrierName("yurtici_x")).toBe("Yurtiçi Kargo")
    })

    it("should default to Yurtiçi Kargo when no provider id is given", () => {
      expect(getCarrierName()).toBe("Yurtiçi Kargo")
    })
  })

  describe("getTrackingUrl", () => {
    it("should substitute {code} into the template", () => {
      expect(getTrackingUrl("ABC123", "yurtici_kargo")).toBe(`${YURTICI_TRACK}ABC123`)
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
      expect(getTrackingUrl("A B/C", "yurtici_kargo")).toBe(`${YURTICI_TRACK}A%20B%2FC`)
    })

    it("should trim surrounding whitespace from the tracking number", () => {
      expect(getTrackingUrl("  XYZ  ", "yurtici_kargo")).toBe(`${YURTICI_TRACK}XYZ`)
    })

    it("should return null for an empty or whitespace-only tracking number", () => {
      expect(getTrackingUrl("", "yurtici_kargo")).toBeNull()
      expect(getTrackingUrl("   ", "yurtici_kargo")).toBeNull()
    })

    it("should use the default carrier template when provider id is missing", () => {
      expect(getTrackingUrl("CODE1")).toBe(`${YURTICI_TRACK}CODE1`)
    })
  })
})
