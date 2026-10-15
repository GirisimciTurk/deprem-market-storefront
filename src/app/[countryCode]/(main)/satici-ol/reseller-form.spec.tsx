import React from "react"
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import ResellerForm from "./reseller-form"

// Form, başvuruyu ve sözleşmeleri sunucu eylemleriyle (dtm) yapar.
const submitApplication = vi.fn()
vi.mock("@lib/data/reseller", () => ({
  listSellerContracts: () => Promise.resolve([]),
  submitApplication: (...args: unknown[]) => submitApplication(...args),
}))

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
  fireEvent.change(screen.getByPlaceholderText("10 haneli VKN ya da 11 haneli TCKN"), {
    target: { value: "10000000146" },
  })
}

describe("ResellerForm Component (Bayimiz Olun)", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    submitApplication.mockReset()
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

  it("should send the application and show the success screen on success", async () => {
    submitApplication.mockResolvedValue({ success: true, error: null })

    render(<ResellerForm />)
    fillRequiredFields()
    fireEvent.change(
      screen.getByPlaceholderText("Örn: www.firma.com (opsiyonel)"),
      { target: { value: "www.afettedarik.com" } }
    )

    fireEvent.click(screen.getByRole("button", { name: /Gönder/i }))

    expect(screen.getByText(/Başvuru Alınıyor.../i)).toBeInTheDocument()
    expect(await screen.findByText("Başvurunuz Alındı!")).toBeInTheDocument()
    expect(
      screen.getByText(/Bayilik başvurunuz başarıyla tarafımıza ulaştı./i)
    ).toBeInTheDocument()

    expect(submitApplication).toHaveBeenCalledTimes(1)
    const input = submitApplication.mock.calls[0][0]
    expect(input.kind).toBe("reseller")
    expect(input.companyName).toBe("Afet Tedarik A.Ş.")
    expect(input.contactName).toBe("Mehmet Yılmaz")
    expect(input.email).toBe("mehmet@afettedarik.com")
    // Telefon, seçili ülke koduyla birlikte gönderilir (varsayılan +90).
    expect(input.phone).toBe("+90 555 555 5555")
    expect(input.taxId).toBe("10000000146")
    // Adres / hizmet / web sitesi not içinde etiketli satırlar olarak gider.
    expect(input.note).toBe(
      "Adres: Antakya Merkez, Hatay\n" +
        "Satış / Hizmet: Outdoor ve afet ekipmanları kurulum hizmeti.\n" +
        "Web sitesi: www.afettedarik.com"
    )
  })

  it("should show the error screen when the request fails", async () => {
    submitApplication.mockResolvedValue({ success: false, error: "Vergi numarası ya da TC kimlik numarası geçerli değil." })
    vi.spyOn(console, "error").mockImplementation(() => {})

    render(<ResellerForm />)
    fillRequiredFields()

    fireEvent.click(screen.getByRole("button", { name: /Gönder/i }))

    expect(
      await screen.findByText("Vergi numarası ya da TC kimlik numarası geçerli değil.")
    ).toBeInTheDocument()
    expect(screen.queryByText("Başvurunuz Alındı!")).not.toBeInTheDocument()
  })
})
