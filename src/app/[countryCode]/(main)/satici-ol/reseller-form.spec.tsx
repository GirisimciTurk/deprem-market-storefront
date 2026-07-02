import React from "react"
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import ResellerForm from "./reseller-form"

// Zorunlu alanları doldurur (sade form: alt alta alanlar, ülke kodlu telefon).
function fillRequiredFields() {
  fireEvent.change(
    screen.getByPlaceholderText("Örn: Demir Outdoor Ekipmanları"),
    { target: { value: "Afet Tedarik A.Ş." } }
  )
  fireEvent.change(screen.getByPlaceholderText("Örn: Hakan Demir"), {
    target: { value: "Mehmet Yılmaz" },
  })
  fireEvent.change(screen.getByPlaceholderText("bayi@example.com"), {
    target: { value: "mehmet@afettedarik.com" },
  })
  fireEvent.change(screen.getByPlaceholderText("Örn: 532 000 00 00"), {
    target: { value: "555 555 5555" },
  })
  fireEvent.change(
    screen.getByPlaceholderText(
      "Örn: Cumhuriyet Mah. Deprem Cad. No:1 Kadıköy / İstanbul"
    ),
    { target: { value: "Antakya Merkez, Hatay" } }
  )
  fireEvent.change(
    screen.getByPlaceholderText(
      "Örn: Karbon fiber güçlendirme, kurulum, keşif hizmeti; çalışma bölgeniz"
    ),
    { target: { value: "Outdoor ve afet ekipmanları kurulum hizmeti." } }
  )
}

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
    expect(screen.getByPlaceholderText("Örn: Hakan Demir")).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText("Örn: 532 000 00 00")
    ).toBeInTheDocument()
    expect(screen.getByLabelText("Ülke kodu")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("bayi@example.com")).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText(
        "Örn: Cumhuriyet Mah. Deprem Cad. No:1 Kadıköy / İstanbul"
      )
    ).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText(
        "Örn: Karbon fiber güçlendirme, kurulum, keşif hizmeti; çalışma bölgeniz"
      )
    ).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText("Örn: www.firma.com (opsiyonel)")
    ).toBeInTheDocument()

    expect(screen.getByRole("button", { name: /Gönder/i })).toBeInTheDocument()
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
    fillRequiredFields()
    fireEvent.change(
      screen.getByPlaceholderText("Örn: www.firma.com (opsiyonel)"),
      { target: { value: "www.afettedarik.com" } }
    )

    fireEvent.click(screen.getByRole("button", { name: /Gönder/i }))

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
    // Telefon, seçili ülke koduyla birlikte gönderilir (varsayılan +90).
    expect(body.phone).toBe("+90 555 555 5555")
    // Adres / hizmet / web sitesi message içinde etiketli satırlar olarak gider.
    expect(body.message).toBe(
      "Adres: Antakya Merkez, Hatay\n" +
        "Satış / Hizmet: Outdoor ve afet ekipmanları kurulum hizmeti.\n" +
        "Web sitesi: www.afettedarik.com"
    )
  })

  it("should show the error screen when the request fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false })
    vi.stubGlobal("fetch", fetchMock)
    // Hata yolundaki console.error testi kirletmesin
    vi.spyOn(console, "error").mockImplementation(() => {})

    render(<ResellerForm />)
    fillRequiredFields()

    fireEvent.click(screen.getByRole("button", { name: /Gönder/i }))

    // Başarısız istek sonrası form tekrar görünür olmalı (success ekranına geçmez)
    expect(
      await screen.findByRole("button", { name: /Gönder/i })
    ).toBeInTheDocument()
    expect(screen.queryByText("Başvurunuz Alındı!")).not.toBeInTheDocument()
  })
})
