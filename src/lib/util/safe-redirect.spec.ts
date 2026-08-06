import { describe, expect, it } from "vitest"
import { safeInternalPath } from "./safe-redirect"

describe("safeInternalPath — açık yönlendirme koruması", () => {
  it("site içi yolu kabul eder", () => {
    expect(safeInternalPath("/tr/products/deprem-cantasi")).toBe(
      "/tr/products/deprem-cantasi"
    )
    expect(safeInternalPath("/tr/store?showcase=deals")).toBe(
      "/tr/store?showcase=deals"
    )
  })

  it("protokol-göreli mutlak URL'i reddeder", () => {
    // Tarayıcı "//kotu.site" adresini dış siteye gider olarak yorumlar.
    expect(safeInternalPath("//kotu.site")).toBeNull()
    expect(safeInternalPath("//kotu.site/tr/account")).toBeNull()
    expect(safeInternalPath("/\\kotu.site")).toBeNull()
  })

  it("mutlak URL ve şema içeren değerleri reddeder", () => {
    expect(safeInternalPath("https://kotu.site")).toBeNull()
    expect(safeInternalPath("javascript:alert(1)")).toBeNull()
    expect(safeInternalPath("tr/store")).toBeNull()
  })

  it("kontrol karakteri içeren değeri reddeder", () => {
    // Kaçış dizisiyle yazılıyor: ham kontrol baytı kaynakta durursa git dosyayı
    // ikili (binary) sayar ve testin ne denediği okunmaz olur.
    expect(safeInternalPath("/tr/store\nSet-Cookie: x=1")).toBeNull()
    expect(safeInternalPath("/tr/\u0000store")).toBeNull()
    expect(safeInternalPath("/tr/store\u007f")).toBeNull()
  })

  it("yol olmayan girdilerde null döner", () => {
    expect(safeInternalPath(undefined)).toBeNull()
    expect(safeInternalPath(null)).toBeNull()
    expect(safeInternalPath("")).toBeNull()
    expect(safeInternalPath("   ")).toBeNull()
    expect(safeInternalPath(42)).toBeNull()
  })
})
