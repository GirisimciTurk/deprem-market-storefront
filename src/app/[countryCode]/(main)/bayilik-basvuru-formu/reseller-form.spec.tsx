import React from "react"
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { render, screen, fireEvent, act } from "@testing-library/react"
import ResellerForm from "./reseller-form"

describe("ResellerForm Component", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("should render all form fields correctly", () => {
    render(<ResellerForm />)

    expect(
      screen.getByPlaceholderText("Örn: EKYP Ticaret Ltd.")
    ).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText("Örn: Kadıköy V.D / 1234567890")
    ).toBeInTheDocument()
    expect(screen.getByPlaceholderText("Örn: Hakan Demir")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("Örn: İstanbul")).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText("corporate@example.com")
    ).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText("Örn: 0532 000 0000")
    ).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText(
        "Faaliyet alanınız, hedeflediğiniz ürün grupları veya adetler hakkında bilgi yazabilirsiniz..."
      )
    ).toBeInTheDocument()

    expect(
      screen.getByRole("button", { name: /Bayilik Başvurusunu Gönder/i })
    ).toBeInTheDocument()
  })

  it("should allow typing into inputs", () => {
    render(<ResellerForm />)

    const companyInput = screen.getByPlaceholderText(
      "Örn: EKYP Ticaret Ltd."
    ) as HTMLInputElement
    fireEvent.change(companyInput, { target: { value: "Test Şirketi" } })
    expect(companyInput.value).toBe("Test Şirketi")

    const emailInput = screen.getByPlaceholderText(
      "corporate@example.com"
    ) as HTMLInputElement
    fireEvent.change(emailInput, { target: { value: "test@sirket.com" } })
    expect(emailInput.value).toBe("test@sirket.com")
  })

  it("should save submission to localStorage and show success screen after timeout", async () => {
    render(<ResellerForm />)

    fireEvent.change(screen.getByPlaceholderText("Örn: EKYP Ticaret Ltd."), {
      target: { value: "Afet Tedarik A.Ş." },
    })
    fireEvent.change(screen.getByPlaceholderText("Örn: Hakan Demir"), {
      target: { value: "Mehmet Yılmaz" },
    })
    fireEvent.change(screen.getByPlaceholderText("corporate@example.com"), {
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
        "Faaliyet alanınız, hedeflediğiniz ürün grupları veya adetler hakkında bilgi yazabilirsiniz..."
      ),
      {
        target: { value: "500 adet deprem çantası siparişi vermek istiyoruz." },
      }
    )

    const submitBtn = screen.getByRole("button", {
      name: /Bayilik Başvurusunu Gönder/i,
    })
    fireEvent.click(submitBtn)

    // Verify it transitions to loading state
    expect(screen.getByText(/Başvuru Alınıyor.../i)).toBeInTheDocument()

    // Advance fake timers by 1500ms
    act(() => {
      vi.advanceTimersByTime(1500)
    })

    // Verify success message is rendered
    expect(screen.getByText("Başvurunuz Alındı!")).toBeInTheDocument()
    expect(
      screen.getByText(
        /Bayilik ön başvurunuz başarıyla tarafımıza iletilmiştir./i
      )
    ).toBeInTheDocument()

    // Verify stored item in localStorage
    const saved = localStorage.getItem("reseller-applications")
    expect(saved).toBeDefined()
    const parsed = JSON.parse(saved || "[]")
    expect(parsed.length).toBe(1)
    expect(parsed[0].companyName).toBe("Afet Tedarik A.Ş.")
    expect(parsed[0].contactName).toBe("Mehmet Yılmaz")
    expect(parsed[0].email).toBe("mehmet@afettedarik.com")
    expect(parsed[0].phone).toBe("0555 555 5555")
    expect(parsed[0].city).toBe("Hatay")
    expect(parsed[0].message).toBe(
      "500 adet deprem çantası siparişi vermek istiyoruz."
    )
    expect(parsed[0].status).toBe("pending")
  })
})
