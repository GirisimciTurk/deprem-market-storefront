import React from "react"
import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import SaticiStatusClient from "./satici-status-client"

// LocalizedClientLink yalnız "başvuru yok" (boş durum) dalında kullanılıyor; burada
// dolu başvuru render ediyoruz ama import yan etkisi olmasın diye sade bir <a> ile mock'la.
vi.mock("@modules/common/components/localized-client-link", () => ({
  default: ({ href, children }: any) => <a href={href}>{children}</a>,
}))

const baseApp = {
  companyName: "Test Firma",
  contactName: "Ali Veli",
  email: "test@firma.com",
  phone: "05550000000",
  city: "İstanbul",
  date: "01.07.2026",
}

describe("SaticiStatusClient — durum render", () => {
  it("'suspended' durumunda 'Askıya Alındı' rozeti + açıklaması görünür (regresyon)", () => {
    render(<SaticiStatusClient application={{ ...baseApp, status: "suspended" }} />)
    expect(screen.getByText(/Askıya Alındı/)).toBeInTheDocument()
    expect(screen.getByText(/geçici olarak askıya alınmıştır/i)).toBeInTheDocument()
  })

  it("'pending' → İncelemede", () => {
    render(<SaticiStatusClient application={{ ...baseApp, status: "pending" }} />)
    expect(screen.getByText(/İncelemede/)).toBeInTheDocument()
  })

  it("'approved' → Onaylandı", () => {
    render(<SaticiStatusClient application={{ ...baseApp, status: "approved" }} />)
    expect(screen.getByText(/Onaylandı/)).toBeInTheDocument()
  })

  it("'rejected' → Reddedildi", () => {
    render(<SaticiStatusClient application={{ ...baseApp, status: "rejected" }} />)
    expect(screen.getByText(/Reddedildi/)).toBeInTheDocument()
  })
})
