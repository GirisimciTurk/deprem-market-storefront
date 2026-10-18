import { describe, it, expect } from "vitest"
import { fulfillmentStatusOf, paymentStatusOf, toShippingAddress } from "./order"

describe("gobit siparişinin vitrin parçaları", () => {
  it("gönderim durumu dtm aşamasından; iptal önce gelir", () => {
    expect(fulfillmentStatusOf("received")).toBe("not_fulfilled")
    expect(fulfillmentStatusOf("preparing")).toBe("not_fulfilled")
    expect(fulfillmentStatusOf("shipped")).toBe("shipped")
    expect(fulfillmentStatusOf("delivered")).toBe("delivered")
    expect(fulfillmentStatusOf("canceled")).toBe("canceled")
    expect(fulfillmentStatusOf("shipped", "2026-10-18T00:00:00Z")).toBe("canceled")
    expect(fulfillmentStatusOf(undefined)).toBe("not_fulfilled")
  })

  it("ödeme durumu siparişin özetinden", () => {
    expect(paymentStatusOf({ paid_total: 47990, refunded_total: 0, outstanding: 0 })).toBe("captured")
    expect(paymentStatusOf({ paid_total: 0, refunded_total: 0, outstanding: 47990 })).toBe("not_paid")
    expect(paymentStatusOf({ paid_total: 10000, refunded_total: 0, outstanding: 37990 })).toBe("partially_captured")
    expect(paymentStatusOf({ paid_total: 47990, refunded_total: 10000, outstanding: 0 })).toBe("partially_refunded")
    expect(paymentStatusOf({ paid_total: 47990, refunded_total: 47990, outstanding: 0 })).toBe("refunded")
    expect(paymentStatusOf(undefined)).toBe("captured")
  })

  it("dtm'nin teslimat adresini vitrin adresine çevirir", () => {
    expect(
      toShippingAddress({
        first_name: "Deniz",
        last_name: "Alıcı",
        address_1: "Atatürk Cad. 1",
        address_2: "",
        city: "İzmir",
        province: "Konak",
        postal_code: "35000",
        country_code: "TR",
        phone: "05550000000",
      })
    ).toEqual({
      first_name: "Deniz",
      last_name: "Alıcı",
      company: null,
      address_1: "Atatürk Cad. 1",
      address_2: null,
      city: "İzmir",
      province: "Konak",
      postal_code: "35000",
      country_code: "tr",
      phone: "05550000000",
    })
  })

  it("adres yoksa ya da boşsa null", () => {
    expect(toShippingAddress(undefined)).toBeNull()
    expect(toShippingAddress(null)).toBeNull()
    expect(toShippingAddress({ first_name: "", city: "" })).toBeNull()
  })
})
