import { describe, expect, it } from "vitest"
import { getStageLabel, getStatusSteps } from "./tracking-utils"

const CREATED = "2026-07-01T09:00:00.000Z"

function order(extra: Record<string, unknown> = {}) {
  return {
    created_at: CREATED,
    status: "pending",
    // Bu sistemde çekirdek alan HER ZAMAN not_fulfilled kalır (core fulfillment
    // hiç yaratılmıyor) — testler bu gerçeği yansıtıyor.
    fulfillment_status: "not_fulfilled",
    ...extra,
  }
}

describe("getStatusSteps — satıcı aşamasından türetme", () => {
  it("KÖK HATA REGRESYONU: çekirdek durum not_fulfilled olsa da kargolanan sipariş 3. adımda görünür", () => {
    // Düzeltmeden önce currentStep DAİMA 1'di; "Kargoya Verildi" hiç yanmıyordu.
    const { currentStep, steps } = getStatusSteps(
      order({
        stage: "shipped",
        seller_shipments: [
          {
            seller_order_id: "so_1",
            stage: "shipped",
            preparing_at: "2026-07-01T10:00:00.000Z",
            fulfilled_at: "2026-07-02T12:00:00.000Z",
          },
        ],
      })
    )

    expect(currentStep).toBe(2)
    expect(steps[2].title).toBe("Kargoya Verildi")
    expect(steps[2].active).toBe(true)
    expect(steps[1].completed).toBe(true)
  })

  it("satıcı hiç dokunmadıysa 1. adımda bekler", () => {
    const { currentStep, steps } = getStatusSteps(
      order({
        stage: "received",
        seller_shipments: [
          { seller_order_id: "so_1", stage: "received", preparing_at: null, fulfilled_at: null },
        ],
      })
    )

    expect(currentStep).toBe(0)
    expect(steps[0].completed).toBe(true)
    expect(steps[1].completed).toBe(false)
    expect(steps[2].completed).toBe(false)
  })

  it("'Hazırlanıyor' 2. adımı aktif eder ve tarihini damgadan alır", () => {
    const { currentStep, steps } = getStatusSteps(
      order({
        stage: "preparing",
        seller_shipments: [
          {
            seller_order_id: "so_1",
            stage: "preparing",
            preparing_at: "2026-07-01T10:00:00.000Z",
            fulfilled_at: null,
          },
        ],
      })
    )

    expect(currentStep).toBe(1)
    expect(steps[1].active).toBe(true)
    expect(steps[1].date).toBeTruthy()
    // Kargolanmadığı için 3. adımın tarihi olmamalı.
    expect(steps[2].date).toBeNull()
  })

  it("çok satıcılı siparişte tarih EN GEÇ damgadan alınır", () => {
    const { steps } = getStatusSteps(
      order({
        stage: "shipped",
        seller_shipments: [
          {
            seller_order_id: "so_1",
            stage: "shipped",
            preparing_at: "2026-07-01T10:00:00.000Z",
            fulfilled_at: "2026-07-02T00:00:00.000Z",
          },
          {
            seller_order_id: "so_2",
            stage: "shipped",
            preparing_at: "2026-07-01T11:00:00.000Z",
            fulfilled_at: "2026-07-05T00:00:00.000Z",
          },
        ],
      })
    )

    // Son paket 5 Temmuz'da çıktı → 3. adımın tarihi o.
    expect(steps[2].date).toBe(new Date("2026-07-05T00:00:00.000Z").toLocaleDateString("tr-TR"))
  })

  it("iptal edilen paketin damgası tarihe karışmaz", () => {
    const { steps } = getStatusSteps(
      order({
        stage: "shipped",
        seller_shipments: [
          {
            seller_order_id: "so_1",
            stage: "canceled",
            preparing_at: "2026-07-01T10:00:00.000Z",
            fulfilled_at: "2026-07-20T00:00:00.000Z",
          },
          {
            seller_order_id: "so_2",
            stage: "shipped",
            preparing_at: "2026-07-01T11:00:00.000Z",
            fulfilled_at: "2026-07-03T00:00:00.000Z",
          },
        ],
      })
    )

    expect(steps[2].date).toBe(new Date("2026-07-03T00:00:00.000Z").toLocaleDateString("tr-TR"))
  })

  it("aşama 'canceled' ise iptal dalına girer", () => {
    const { isCanceled, currentStep, steps } = getStatusSteps(
      order({ stage: "canceled", seller_shipments: [] })
    )

    expect(isCanceled).toBe(true)
    expect(currentStep).toBe(-1)
    expect(steps[steps.length - 1].isError).toBe(true)
  })
})

describe("getStatusSteps — yedek (eski) mantık", () => {
  it("stage yoksa çekirdek duruma göre davranır (alt-siparişi olmayan eski sipariş)", () => {
    const { currentStep } = getStatusSteps(order())
    expect(currentStep).toBe(1)
  })

  it("stage yok + çekirdek shipped ise 3. adım", () => {
    const { currentStep } = getStatusSteps(
      order({ fulfillment_status: "shipped", fulfillments: [] })
    )
    expect(currentStep).toBe(2)
  })

  it("stage yok + sipariş iptal ise iptal dalı", () => {
    const { isCanceled } = getStatusSteps(order({ status: "canceled" }))
    expect(isCanceled).toBe(true)
  })
})

describe("getStageLabel", () => {
  it("dört aşamanın etiketi çizelgedeki adlarla birebir aynı", () => {
    expect(getStageLabel("received").text).toBe("Sipariş Alındı")
    expect(getStageLabel("preparing").text).toBe("Hazırlanıyor")
    expect(getStageLabel("shipped").text).toBe("Kargoya Verildi")
    expect(getStageLabel("canceled").text).toBe("İptal Edildi")
  })
})
