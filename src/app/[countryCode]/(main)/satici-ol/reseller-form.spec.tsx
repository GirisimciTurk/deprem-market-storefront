import React from "react"
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import ResellerForm from "./reseller-form"

describe("ResellerForm Component (Bayimiz Olun)", () => {
  beforeEach(() => {
    // Component backend'e fetch ile POST ediyor (/store/reseller-applications).
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should render all form fields correctly", () => {
    render(<ResellerForm />)

    expect(
      screen.getByPlaceholderText("Örn: Demir Outdoor Ekipmanları")
    ).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText("Örn: Kadıköy V.D / 1234567890")
    ).toBeInTheDocument()
    expect(screen.getByPlaceholderText("Örn: Hakan Demir")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("Örn: İstanbul")).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText("bayi@example.com")
    ).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText("Örn: 0532 000 0000")
    ).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText(
        "Satmak istediğiniz ürün grupları, markanız ve aylık tahmini satış hacminiz hakkında bilgi verebilirsiniz..."
      )
    ).toBeInTheDocument()

    expect(
      screen.getByRole("button", { name: /Bayilik Başvurusunu Gönder/i })
    ).toBeInTheDocument()
  })

  it("should allow typing into inputs", () => {
    render(<ResellerForm />)

    const companyInput = screen.getByPlaceholderText(
      "Örn: Demir Outdoor Ekipmanları"
    ) as HTMLInputElement
    fireEvent.change(companyInput, { target: { value: "Test Şirketi" } })
    expect(companyInput.value).toBe("Test Şirketi")

    const emailInput = screen.getByPlaceholderText(
      "bayi@example.com"
    ) as HTMLInputElement
    fireEvent.change(emailInput, { target: { value: "test@sirket.com" } })
    expect(emailInput.value).toBe("test@sirket.com")
  })

  it("should POST to the backend and show the success screen on success", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({}) })
    vi.stubGlobal("fetch", fetchMock)

    render(<ResellerForm />)

    fireEvent.change(
      screen.getByPlaceholderText("Örn: Demir Outdoor Ekipmanları"),
      {
        target: { value: "Afet Tedarik A.Ş." },
      }
    )
    fireEvent.change(screen.getByPlaceholderText("Örn: Hakan Demir"), {
      target: { value: "Mehmet Yılmaz" },
    })
    fireEvent.change(screen.getByPlaceholderText("bayi@example.com"), {
      target: { value: "mehmet@afettedarik.com" },
    })
    fireEvent.change(screen.getByPlaceholderText("Örn: 0532 000 0000"), {
      target: { value: "0555 555 5555" },
    })
    fireEvent.change(screen.getByPlaceholderText("Örn: İstanbul"), {
      target: { value: "Hatay" },
    })
    fireEvent.change(
      screen.getByPlaceholderText(
        "Satmak istediğiniz ürün grupları, markanız ve aylık tahmini satış hacminiz hakkında bilgi verebilirsiniz..."
      ),
      {
        target: { value: "Outdoor ve afet ekipmanları satmak istiyoruz." },
      }
    )

    fireEvent.click(
      screen.getByRole("button", { name: /Bayilik Başvurusunu Gönder/i })
    )

    // Loading durumuna geçer
    expect(screen.getByText(/Başvuru Alınıyor.../i)).toBeInTheDocument()

    // fetch çözülünce başarı ekranı render olur (async)
    expect(await screen.findByText("Başvurunuz Alındı!")).toBeInTheDocument()
    expect(
      screen.getByText(/Bayilik başvurunuz başarıyla tarafımıza ulaştı./i)
    ).toBeInTheDocument()

    // Backend'e doğru uçtan ve alanlarla POST edildiğini doğrula. (Bileşen mount'ta
    // ayrıca /store/seller-contracts'i GET eder → çağrılar arasından POST'u bul.)
    const postCall = fetchMock.mock.calls.find((c: any[]) =>
      String(c[0]).includes("/store/reseller-applications")
    )
    expect(postCall).toBeTruthy()
    const [url, options] = postCall as any[]
    expect(String(url)).toContain("/store/reseller-applications")
    expect(options.method).toBe("POST")
    const body = JSON.parse(options.body)
    expect(body.company_name).toBe("Afet Tedarik A.Ş.")
    expect(body.applicant_name).toBe("Mehmet Yılmaz")
    expect(body.email).toBe("mehmet@afettedarik.com")
    expect(body.phone).toBe("0555 555 5555")
    expect(body.city).toBe("Hatay")
    expect(body.message).toBe(
      "Outdoor ve afet ekipmanları satmak istiyoruz."
    )
  })

  it("should show the error screen when the request fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false })
    vi.stubGlobal("fetch", fetchMock)
    // Hata yolundaki console.error testi kirletmesin
    vi.spyOn(console, "error").mockImplementation(() => {})

    render(<ResellerForm />)

    fireEvent.change(
      screen.getByPlaceholderText("Örn: Demir Outdoor Ekipmanları"),
      {
        target: { value: "Afet Tedarik A.Ş." },
      }
    )
    fireEvent.change(screen.getByPlaceholderText("Örn: Hakan Demir"), {
      target: { value: "Mehmet Yılmaz" },
    })
    fireEvent.change(screen.getByPlaceholderText("bayi@example.com"), {
      target: { value: "mehmet@afettedarik.com" },
    })
    fireEvent.change(screen.getByPlaceholderText("Örn: 0532 000 0000"), {
      target: { value: "0555 555 5555" },
    })

    fireEvent.click(
      screen.getByRole("button", { name: /Bayilik Başvurusunu Gönder/i })
    )

    // Başarısız istek sonrası form tekrar görünür olmalı (success ekranına geçmez)
    expect(
      await screen.findByRole("button", {
        name: /Bayilik Başvurusunu Gönder/i,
      })
    ).toBeInTheDocument()
    expect(screen.queryByText("Başvurunuz Alındı!")).not.toBeInTheDocument()
  })
})
