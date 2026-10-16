import { describe, expect, it } from "vitest"
import { toCommissionList } from "./paytr-rates"

describe("toCommissionList", () => {
  it("turns PayTR's programs and taksit_N rates into the page's banks, up to the store's maximum", () => {
    const list = toCommissionList({
      status: "success",
      max_inst_non_bus: 6,
      oranlar: { world: { taksit_3: 4.5, taksit_2: 2.75, taksit_9: 12 }, bonus: { taksit_2: "2.5" } },
    })
    expect(list.map((b) => b.CODE)).toEqual(["WORLD", "BONUS"])
    expect(list[0].DATA.map((d) => [d.INSTALLMENT, d.COMMISSION])).toEqual([
      [1, "0"],
      [2, "2.75"],
      [3, "4.5"],
    ])
    expect(list[1].DATA[1]).toMatchObject({ INSTALLMENT: 2, COMMISSION: "2.5" })
  })

  it("reads the documented name too, and leaves a program with no installment out", () => {
    expect(toCommissionList({ rates: { axess: { taksit_2: 3 }, paraf: {} } }).map((b) => b.CODE)).toEqual(["AXESS"])
    expect(toCommissionList({ status: "failed" })).toEqual([])
    expect(toCommissionList(null)).toEqual([])
  })
})
