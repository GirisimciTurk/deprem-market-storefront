import React from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"

const push = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useParams: () => ({ countryCode: "tr" }),
}))

// Sunucu eylemi (server action) — formun konusu gönderdiği gövde ve sonrası.
vi.mock("@lib/data/experts", () => ({ createExpertCard: vi.fn() }))

import { createExpertCard } from "@lib/data/experts"
import ExpertForm from "./expert-form"

const mockCreate = vi.mocked(createExpertCard)

function fill() {
  fireEvent.change(screen.getByLabelText(/^İl\s*\*$/), {
    target: { value: "İstanbul" },
  })
  fireEvent.change(screen.getByLabelText(/^İlçe/), {
    target: { value: "Kadıköy" },
  })
  fireEvent.click(screen.getByRole("button", { name: /Bina Risk/ }))
}

describe("ExpertForm — kısa 'Uzman ol' formu", () => {
  beforeEach(() => {
    push.mockReset()
    mockCreate.mockReset()
  })
  afterEach(cleanup)

  it("yalnız kısa alanları gösterir, ad ve telefon müşteriden dolar", () => {
    const { container } = render(
      <ExpertForm initial={{ full_name: "Ayşe Yılmaz", phone: "05320000000" }} />
    )
    expect((screen.getByLabelText(/Ad Soyad/) as HTMLInputElement).value).toBe(
      "Ayşe Yılmaz"
    )
    expect((screen.getByLabelText(/Telefon/) as HTMLInputElement).value).toBe(
      "05320000000"
    )
    expect(screen.getByLabelText(/Unvan/)).toBeInTheDocument()
    // Uzun formdan kalanlar (e-posta, bölge, belge, bütçe anketi) artık burada değil:
    // beş metin alanı + uzmanlık düğmeleri.
    expect(screen.queryByLabelText(/E-Posta/i)).toBeNull()
    expect(container.querySelectorAll("input")).toHaveLength(5)
    expect(container.querySelector("input[type=file]")).toBeNull()
    expect(container.querySelector("select")).toBeNull()
    expect(container.querySelector("textarea")).toBeNull()
  })

  it("eksik alanla göndermez ve hatayı gösterir", async () => {
    render(<ExpertForm initial={{ full_name: "Ayşe Yılmaz", phone: "0532" }} />)
    fill()
    fireEvent.click(screen.getByRole("button", { name: /Uzman Kartımı Aç/ }))
    expect(await screen.findByRole("alert")).toHaveTextContent(/telefon/i)
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it("uzmanlık seçilmeden göndermez", async () => {
    render(
      <ExpertForm initial={{ full_name: "Ayşe Yılmaz", phone: "05320000000" }} />
    )
    fireEvent.change(screen.getByLabelText(/^İl\s*\*$/), {
      target: { value: "İstanbul" },
    })
    fireEvent.change(screen.getByLabelText(/^İlçe/), {
      target: { value: "Kadıköy" },
    })
    fireEvent.click(screen.getByRole("button", { name: /Uzman Kartımı Aç/ }))
    expect(await screen.findByRole("alert")).toHaveTextContent(/uzmanlık/)
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it("kartı açar ve Uzman Kartım'a götürür (e-posta gövdede yok)", async () => {
    mockCreate.mockResolvedValue({ expert: { id: "x" } as never, error: null })
    render(
      <ExpertForm initial={{ full_name: " Ayşe Yılmaz ", phone: "05320000000" }} />
    )
    fill()
    fireEvent.click(screen.getByRole("button", { name: /Uzman Kartımı Aç/ }))
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith("/tr/account/uzman-kartim")
    )
    expect(mockCreate).toHaveBeenCalledWith({
      full_name: "Ayşe Yılmaz",
      title: undefined,
      phone: "05320000000",
      city: "İstanbul",
      district: "Kadıköy",
      specializations: ["risk_tespit"],
    })
  })

  it("zaten kartı varsa (409) kartına götürür", async () => {
    mockCreate.mockResolvedValue({
      expert: null,
      error: "Zaten bir uzman kartınız var.",
      status: 409,
    })
    render(
      <ExpertForm initial={{ full_name: "Ayşe Yılmaz", phone: "05320000000" }} />
    )
    fill()
    fireEvent.click(screen.getByRole("button", { name: /Uzman Kartımı Aç/ }))
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith("/tr/account/uzman-kartim")
    )
  })

  it("backend hatasını gösterir, yönlendirmez", async () => {
    mockCreate.mockResolvedValue({
      expert: null,
      error: "Geçersiz veri.",
      status: 400,
    })
    render(
      <ExpertForm initial={{ full_name: "Ayşe Yılmaz", phone: "05320000000" }} />
    )
    fill()
    fireEvent.click(screen.getByRole("button", { name: /Uzman Kartımı Aç/ }))
    expect(await screen.findByRole("alert")).toHaveTextContent("Geçersiz veri.")
    expect(push).not.toHaveBeenCalled()
  })
})
