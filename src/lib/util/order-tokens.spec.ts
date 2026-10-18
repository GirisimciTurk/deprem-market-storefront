import { describe, expect, it } from "vitest"
import { confirmedOrderId, parseOrderTokens, withOrderToken } from "./order-tokens"

describe("order tokens cookie", () => {
  it("adds, replaces and keeps the newest ten", () => {
    let raw: string | undefined
    for (let i = 0; i < 12; i++) raw = withOrderToken(raw, `ord_${i}`, `t${i}`)
    const all = parseOrderTokens(raw)
    expect(Object.keys(all)).toHaveLength(10)
    expect(all.ord_0).toBeUndefined()
    expect(all.ord_11).toBe("t11")

    const again = parseOrderTokens(withOrderToken(raw, "ord_5", "new"))
    expect(again.ord_5).toBe("new")
    expect(Object.keys(again)).toHaveLength(10)
    expect(Object.keys(again).at(-1)).toBe("ord_5")
  })

  it("ignores a broken cookie", () => {
    expect(parseOrderTokens("{oops")).toEqual({})
    expect(parseOrderTokens("[1,2]")).toEqual({})
    expect(parseOrderTokens('{"a":1,"b":"x"}')).toEqual({ b: "x" })
  })

  it("reads the order id of the mail's link", () => {
    expect(confirmedOrderId("/tr/order/ord_01ABC/confirmed")).toBe("ord_01ABC")
    expect(confirmedOrderId("/tr/order/ord_01ABC/confirmed/")).toBe("ord_01ABC")
    expect(confirmedOrderId("/tr/order/ord_01ABC/transfer/x")).toBeNull()
    expect(confirmedOrderId("/tr/account")).toBeNull()
  })
})
