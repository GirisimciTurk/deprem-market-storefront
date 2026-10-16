import { describe, it, expect } from "vitest"
import { customerStatusOf } from "./status"

describe("customerStatusOf", () => {
  it.each([
    ["talep", "Talebiniz alındı"],
    ["kesif_planlandi", "Görüşme aşamasında"],
    ["kesif_yapildi", "Görüşme aşamasında"],
    ["teklif_gonderildi", "Görüşme aşamasında"],
    ["onaylandi", "Görüşme aşamasında"],
    ["tedarik", "Uygulama aşamasında"],
    ["teslim_edildi", "Uygulama aşamasında"],
    ["montaj_planlandi", "Uygulama aşamasında"],
    ["montaj_yapildi", "Uygulama aşamasında"],
    ["tamamlandi", "Tamamlandı"],
    ["reddedildi", "İptal edildi"],
    ["iptal", "İptal edildi"],
  ])("%s → %s", (status, label) => {
    expect(customerStatusOf(status).label).toBe(label)
  })

  it("yalnız iptal durumları iptal sayılır", () => {
    expect(customerStatusOf("reddedildi").canceled).toBe(true)
    expect(customerStatusOf("iptal").canceled).toBe(true)
    expect(customerStatusOf("tamamlandi").canceled).toBe(false)
  })

  it("bilinmeyen durum iç adı göstermez", () => {
    expect(customerStatusOf("yeni_bir_durum").label).toBe("Talebiniz alındı")
    expect(customerStatusOf(undefined).label).toBe("Talebiniz alındı")
  })
})
