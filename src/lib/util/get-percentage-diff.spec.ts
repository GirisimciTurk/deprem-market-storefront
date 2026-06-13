import { describe, it, expect } from "vitest"
import { getPercentageDiff } from "./get-percentage-diff"

describe("getPercentageDiff", () => {
  it("should compute a simple discount percentage", () => {
    // 100 -> 80 is a 20% decrease
    expect(getPercentageDiff(100, 80)).toBe("20")
  })

  it("should round to the nearest whole percent", () => {
    // (150 - 120) / 150 * 100 = 20
    expect(getPercentageDiff(150, 120)).toBe("20")
    // (100 - 67) / 100 * 100 = 33 -> 33
    expect(getPercentageDiff(100, 67)).toBe("33")
    // (100 - 66) / 100 * 100 = 34 -> 34
    expect(getPercentageDiff(100, 66)).toBe("34")
  })

  it("should return 0 when there is no discount", () => {
    expect(getPercentageDiff(100, 100)).toBe("0")
  })

  it("should return a negative percentage when calculated price is higher", () => {
    // (100 - 120) / 100 * 100 = -20
    expect(getPercentageDiff(100, 120)).toBe("-20")
  })

  it("should produce a full 100% diff when calculated price is zero", () => {
    expect(getPercentageDiff(100, 0)).toBe("100")
  })
})
