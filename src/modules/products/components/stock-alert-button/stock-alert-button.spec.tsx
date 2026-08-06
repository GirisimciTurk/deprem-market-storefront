import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"

// LocalizedClientLink ülke kodunu route param'ından, LoginHint dönüş yolunu
// pathname/searchParams'tan okur.
vi.mock("next/navigation", () => ({
  useParams: () => ({ countryCode: "tr" }),
  usePathname: () => "/tr/products/deprem-cantasi",
  useSearchParams: () => new URLSearchParams(""),
}))

// Metinler next-intl mesajlarından geliyor; test konusu METİN değil DAVRANIŞ,
// bu yüzden çeviri anahtarı döndüren sahte bir fonksiyona indiriliyor.
vi.mock("next-intl", () => {
  const make = (ns: string) => {
    const t = (key: string) => `${ns}.${key}`
    // t.rich: bağlantıyı gerçek elemanla değiştirip cümleyi kurar.
    t.rich = (key: string, tags: Record<string, (c: string) => unknown>) => [
      `${ns}.${key}:`,
      tags.link?.("giriş yapın"),
    ]
    return t
  }
  return { useTranslations: (ns: string) => make(ns), useLocale: () => "tr" }
})

vi.mock("@lib/util/push", () => ({
  requestStockAlert: vi.fn(),
  isPushSupported: vi.fn(() => true),
}))

import { requestStockAlert, isPushSupported } from "@lib/util/push"
import { CustomerSessionProvider } from "@lib/context/customer-session-context"
import StockAlertButton from "./index"

const mockRequest = vi.mocked(requestStockAlert)
const mockSupported = vi.mocked(isPushSupported)

function setup(isLoggedIn: boolean, compact = false, variantId = "variant_1") {
  return render(
    <CustomerSessionProvider isLoggedIn={isLoggedIn}>
      <StockAlertButton variantId={variantId} productId="prod_1" compact={compact} />
    </CustomerSessionProvider>
  )
}

const OK = { ok: true, denied: false, unauthorized: false, failed: false }
const YETKISIZ = { ok: false, denied: false, unauthorized: true, failed: false }
const IZIN_YOK = { ok: false, denied: true, unauthorized: false, failed: false }
const SUNUCU_HATASI = { ok: false, denied: false, unauthorized: false, failed: true }

const tikla = () => fireEvent.click(screen.getByTestId("stock-alert-button"))

describe("StockAlertButton — giriş zorunluluğu", () => {
  beforeEach(() => {
    mockRequest.mockReset()
    mockSupported.mockReset().mockReturnValue(true)
  })
  afterEach(cleanup)

  it("giriş yoksa sunucuya GİTMEZ ve bildirim izni İSTEMEZ", () => {
    setup(false)
    tikla()
    expect(mockRequest).not.toHaveBeenCalled()
    // isPushSupported push API'sine dokunmanın ilk adımı; ona da hiç gidilmemeli.
    expect(mockSupported).not.toHaveBeenCalled()
  })

  it("giriş yoksa giriş uyarısı ve /tr/account bağlantısı gösterir", () => {
    setup(false)
    tikla()
    expect(screen.getByTestId("stock-alert-login-hint")).toBeTruthy()
    // Giriş sonrası kullanıcı baktığı ürüne geri dönmeli.
    expect(screen.getByText("loginGate.cta").closest("a")).toHaveAttribute(
      "href",
      "/tr/account?redirect=%2Ftr%2Fproducts%2Fdeprem-cantasi"
    )
  })

  it("dar kartta (compact) uyarı tek satır + satır içi bağlantı olur", () => {
    setup(false, true)
    tikla()
    const kutu = screen.getByTestId("stock-alert-login-hint")
    expect(kutu.textContent).toContain("loginGate.stockAlertInline")
    expect(screen.getByText("giriş yapın").closest("a")).toHaveAttribute(
      "href",
      "/tr/account?redirect=%2Ftr%2Fproducts%2Fdeprem-cantasi"
    )
  })

  it("giriş varsa kayıt akışı normal çalışır", async () => {
    mockRequest.mockResolvedValue(OK)
    setup(true)
    tikla()
    await waitFor(() =>
      expect(screen.getByText("stockAlert.done")).toBeTruthy()
    )
    expect(mockRequest).toHaveBeenCalledWith(
      // locale DE gönderilmeli: abonelik kaydına yazılmazsa backend bildirimi
      // kullanıcının dilinde kuramaz (eskiden hep undefined gidiyordu).
      expect.objectContaining({
        variant_id: "variant_1",
        product_id: "prod_1",
        locale: "tr",
      })
    )
  })

  it("oturum arada düşerse (401) izin reddi değil giriş uyarısı gösterir", async () => {
    mockRequest.mockResolvedValue(YETKISIZ)
    setup(true)
    tikla()
    await waitFor(() =>
      expect(screen.getByTestId("stock-alert-login-hint")).toBeTruthy()
    )
    expect(screen.queryByText("stockAlert.denied")).toBeNull()
  })

  it("bildirim izni reddedilirse izin mesajını gösterir", async () => {
    mockRequest.mockResolvedValue(IZIN_YOK)
    setup(true)
    tikla()
    await waitFor(() =>
      expect(screen.getByText("stockAlert.denied")).toBeTruthy()
    )
    expect(screen.queryByTestId("stock-alert-login-hint")).toBeNull()
  })

  it("tarayıcı push desteklemiyorsa giriş varken uyarır", () => {
    mockSupported.mockReturnValue(false)
    setup(true)
    tikla()
    expect(screen.getByText("stockAlert.unsupported")).toBeTruthy()
    expect(mockRequest).not.toHaveBeenCalled()
  })
})

describe("StockAlertButton — hata yolları ve varyant değişimi", () => {
  beforeEach(() => {
    mockRequest.mockReset()
    mockSupported.mockReset().mockReturnValue(true)
  })
  afterEach(cleanup)

  it("sunucu/ağ hatasını 'izin verilmedi' diye göstermez", async () => {
    mockRequest.mockResolvedValue(SUNUCU_HATASI)
    setup(true)
    tikla()
    await waitFor(() =>
      expect(screen.getByText("stockAlert.failed")).toBeTruthy()
    )
    expect(screen.queryByText("stockAlert.denied")).toBeNull()
  })

  it("istek fırlatırsa buton 'Loading...' halinde KİLİTLENMEZ", async () => {
    mockRequest.mockRejectedValue(new Error("service worker kaydı başarısız"))
    setup(true)
    tikla()
    await waitFor(() =>
      expect(screen.getByText("stockAlert.failed")).toBeTruthy()
    )
    // Buton yeniden tıklanabilir olmalı (isLoading → disabled kalmamalı).
    expect(screen.getByTestId("stock-alert-button")).not.toBeDisabled()
  })

  it("varyant değişince önceki varyantın onayı yapışmaz", async () => {
    mockRequest.mockResolvedValue(OK)
    const { rerender } = setup(true, false, "variant_A")
    tikla()
    await waitFor(() =>
      expect(screen.getByText("stockAlert.done")).toBeTruthy()
    )

    rerender(
      <CustomerSessionProvider isLoggedIn={true}>
        <StockAlertButton variantId="variant_B" productId="prod_1" />
      </CustomerSessionProvider>
    )
    // B varyantı için kayıt YOK → onay kutusu değil, tekrar buton görünmeli.
    expect(screen.queryByText("stockAlert.done")).toBeNull()
    expect(screen.getByTestId("stock-alert-button")).toBeTruthy()
  })

  it("canlı bölge içerikten önce DOM'da durur (ekran okuyucu duyurabilsin)", () => {
    setup(true)
    expect(document.querySelector('[role="status"][aria-live="polite"]')).toBeTruthy()
  })
})
