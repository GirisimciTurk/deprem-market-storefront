import { describe, expect, it } from "vitest"
import { parseOrderReference, parseTransferFragment, transferErrorMessage } from "./order-transfer"

describe("parseTransferFragment", () => {
  it("reads the token from the mail link's fragment", () => {
    expect(parseTransferFragment("#token=abc123")).toEqual({ token: "abc123", displayId: null })
    expect(parseTransferFragment("token=abc123")).toEqual({ token: "abc123", displayId: null })
  })

  it("reads an optional display number", () => {
    expect(parseTransferFragment("#token=abc&display_id=1042")).toEqual({ token: "abc", displayId: "1042" })
    expect(parseTransferFragment("#display_id=%231042&token=abc")).toEqual({ token: "abc", displayId: "1042" })
    expect(parseTransferFragment("#token=abc&display_id=x1")).toEqual({ token: "abc", displayId: null })
  })

  it("decodes an encoded token", () => {
    expect(parseTransferFragment("#token=a%2Bb%3D")?.token).toBe("a+b=")
  })

  it("answers null without a token", () => {
    expect(parseTransferFragment("")).toBeNull()
    expect(parseTransferFragment(null)).toBeNull()
    expect(parseTransferFragment(undefined)).toBeNull()
    expect(parseTransferFragment("#")).toBeNull()
    expect(parseTransferFragment("#token=")).toBeNull()
    expect(parseTransferFragment("#token=%20%20")).toBeNull()
    expect(parseTransferFragment("#display_id=12")).toBeNull()
  })
})

describe("parseOrderReference", () => {
  it("reads an order number", () => {
    expect(parseOrderReference("#1234")).toEqual({ kind: "number", displayId: 1234 })
    expect(parseOrderReference(" 1234 ")).toEqual({ kind: "number", displayId: 1234 })
    expect(parseOrderReference("# 7")).toEqual({ kind: "number", displayId: 7 })
  })

  it("reads an order id", () => {
    expect(parseOrderReference("ord_01HABC")).toEqual({ kind: "id", id: "ord_01HABC" })
  })

  it("refuses empty or odd input", () => {
    expect(parseOrderReference("")).toBeNull()
    expect(parseOrderReference(null)).toBeNull()
    expect(parseOrderReference("0")).toBeNull()
    expect(parseOrderReference("ord/../x")).toBeNull()
    expect(parseOrderReference("99999999999999999999")).toBeNull()
  })
})

describe("transferErrorMessage", () => {
  it("maps gobit's refusal codes to Turkish", () => {
    expect(transferErrorMessage("order_transfer_pending", 409)).toMatch(/bekleyen bir devir talebi/)
    expect(transferErrorMessage("order_transfer_expired", 409)).toMatch(/süresi/)
    expect(transferErrorMessage("order_not_found", 404)).toBe(
      "Bu siparişi sipariş e-postanızdaki bağlantıdan açıp oradan aktarın."
    )
    expect(transferErrorMessage("order_transfer_mail_failed", 503)).toMatch(/geri alındı/)
  })

  it("falls back on the status, then on the given text", () => {
    expect(transferErrorMessage("", 401)).toMatch(/giriş yapmanız/)
    expect(transferErrorMessage(undefined, 429)).toMatch(/Çok fazla deneme/)
    expect(transferErrorMessage("something_else", 500, "olmadı")).toBe("olmadı")
  })
})
