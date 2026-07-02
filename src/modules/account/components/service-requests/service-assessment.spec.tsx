import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"

// Backend çağrısı + router mock'lanır; testin ilgilendiği tek şey submitSurvey doğrulaması.
const setServiceAssessment = vi.fn()
vi.mock("@lib/data/service-requests", () => ({
  setServiceAssessment: (...args: any[]) => setServiceAssessment(...args),
}))
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

import ServiceAssessment from "./service-assessment"

// "talep" (editable) + assessment_mode pending → yöntem seçim ekranı çıkar.
const req: any = { id: "sr_1", status: "talep", assessment_mode: undefined }

const openSurveyPanel = () => {
  fireEvent.click(screen.getByRole("button", { name: /Yerinde Keşif İste/i }))
}

describe("ServiceAssessment — keşif (survey) formu doğrulaması (regresyon)", () => {
  beforeEach(() => {
    setServiceAssessment.mockReset()
    setServiceAssessment.mockResolvedValue({ success: true })
  })

  it("boş il/ilçe/adres ile gönderim → hata gösterir, backend ÇAĞRILMAZ", async () => {
    render(<ServiceAssessment req={req} />)
    openSurveyPanel()
    fireEvent.click(screen.getByRole("button", { name: /Keşif İste/i }))
    expect(await screen.findByText(/il, ilçe ve adres/i)).toBeInTheDocument()
    expect(setServiceAssessment).not.toHaveBeenCalled()
  })

  it("adres dolu ama tarih yok → hata gösterir, backend ÇAĞRILMAZ", async () => {
    render(<ServiceAssessment req={req} />)
    openSurveyPanel()
    fireEvent.change(screen.getByPlaceholderText("İl"), { target: { value: "İzmir" } })
    fireEvent.change(screen.getByPlaceholderText("İlçe"), { target: { value: "Bornova" } })
    fireEvent.change(screen.getByPlaceholderText(/Açık adres/i), {
      target: { value: "Test Mah. 1. Sk. No:5" },
    })
    fireEvent.click(screen.getByRole("button", { name: /Keşif İste/i }))
    expect(await screen.findByText(/en az bir.*tarih/i)).toBeInTheDocument()
    expect(setServiceAssessment).not.toHaveBeenCalled()
  })

  it("il+ilçe+adres+tarih dolu → backend doğru payload ile çağrılır", async () => {
    const { container } = render(<ServiceAssessment req={req} />)
    openSurveyPanel()
    fireEvent.change(screen.getByPlaceholderText("İl"), { target: { value: "İzmir" } })
    fireEvent.change(screen.getByPlaceholderText("İlçe"), { target: { value: "Bornova" } })
    fireEvent.change(screen.getByPlaceholderText(/Açık adres/i), {
      target: { value: "Test Mah. 1. Sk. No:5" },
    })
    const dateInput = container.querySelector('input[type="date"]') as HTMLInputElement
    fireEvent.change(dateInput, { target: { value: "2026-07-10" } })

    fireEvent.click(screen.getByRole("button", { name: /Keşif İste/i }))

    await waitFor(() => expect(setServiceAssessment).toHaveBeenCalledTimes(1))
    const [, payload] = setServiceAssessment.mock.calls[0]
    expect(payload.assessment_mode).toBe("survey")
    expect(payload.city).toBe("İzmir")
    expect(payload.district).toBe("Bornova")
    expect(payload.preferred_dates).toHaveLength(1)
  })
})
