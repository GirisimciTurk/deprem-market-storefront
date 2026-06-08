import React from "react"
import { describe, it, expect, beforeEach, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import BayilikOnayClient from "./bayilik-onay-client"

// Mock LocalizedClientLink to avoid routing complications in unit tests
vi.mock("@modules/common/components/localized-client-link", () => {
  return {
    default: ({
      children,
      href,
    }: {
      children: React.ReactNode
      href: string
    }) => <a href={href}>{children}</a>,
  }
})

describe("BayilikOnayClient Component", () => {
  const mockApplications = [
    {
      id: "reseller-1",
      companyName: "Lojistik A.Ş.",
      taxOfficeNumber: "Mecidiyeköy / 112233",
      contactName: "Ahmet Ak",
      email: "ahmet@lojistik.com",
      phone: "0511 111 1111",
      city: "İstanbul",
      message: "Tedarik desteği talep ediyoruz.",
      date: "06.06.2026 12:00:00",
      status: "pending",
    },
    {
      id: "reseller-2",
      companyName: "Ege Deprem Market",
      taxOfficeNumber: "Bornova / 445566",
      contactName: "Buse Şen",
      email: "buse@egedeprem.com",
      phone: "0522 222 2222",
      city: "İzmir",
      message: "Ege bölgesi bayiliği için başvuruyoruz.",
      date: "06.06.2026 12:15:00",
      status: "approved",
    },
  ]

  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it("should render empty state message if no applications exist in localStorage", () => {
    render(<BayilikOnayClient />)

    expect(
      screen.getByText(
        "Bu grupta aranan kriterlere uygun bayilik başvurusu bulunmamaktadır."
      )
    ).toBeInTheDocument()

    expect(screen.getByText("Bekleyen Başvurular")).toBeInTheDocument()
    expect(screen.getByText("Onaylanan Bayiler")).toBeInTheDocument()
  })

  it("should load applications and display them in their respective status tabs", () => {
    localStorage.setItem(
      "reseller-applications",
      JSON.stringify(mockApplications)
    )
    render(<BayilikOnayClient />)

    // Check counts in dashboard counters
    expect(screen.getByText("Bekleyen Başvurular")).toBeInTheDocument()
    // "1" for pending count
    expect(screen.getAllByText("1").length).toBeGreaterThanOrEqual(1)

    // "Lojistik A.Ş." should be visible since it is pending
    expect(screen.getByText("Lojistik A.Ş.")).toBeInTheDocument()
    expect(screen.getByText("Yetkili: Ahmet Ak")).toBeInTheDocument()
    expect(screen.getByText("ahmet@lojistik.com")).toBeInTheDocument()

    // "Ege Deprem Market" should NOT be visible on pending tab
    expect(screen.queryByText("Ege Deprem Market")).toBeNull()
  })

  it("should switch tabs and show approved applications", () => {
    localStorage.setItem(
      "reseller-applications",
      JSON.stringify(mockApplications)
    )
    render(<BayilikOnayClient />)

    // Click "Onaylananlar (1)" tab
    const approvedTabBtn = screen.getByRole("button", {
      name: /Onaylananlar \(1\)/i,
    })
    fireEvent.click(approvedTabBtn)

    // "Ege Deprem Market" should now be visible
    expect(screen.getByText("Ege Deprem Market")).toBeInTheDocument()
    expect(screen.getByText("Yetkili: Buse Şen")).toBeInTheDocument()

    // "Lojistik A.Ş." should not be visible on approved tab
    expect(screen.queryByText("Lojistik A.Ş.")).toBeNull()
  })

  it("should filter applications based on search query", () => {
    localStorage.setItem(
      "reseller-applications",
      JSON.stringify(mockApplications)
    )
    render(<BayilikOnayClient />)

    const searchInput = screen.getByPlaceholderText(
      "Firma adı, yetkili, şehir veya e-posta ile ara..."
    )

    // Type query that matches nothing in pending
    fireEvent.change(searchInput, { target: { value: "İzmir" } })
    expect(screen.queryByText("Lojistik A.Ş.")).toBeNull()

    // Type query that matches pending company
    fireEvent.change(searchInput, { target: { value: "Lojistik" } })
    expect(screen.getByText("Lojistik A.Ş.")).toBeInTheDocument()
  })

  it("should approve application and update list and status counters", () => {
    localStorage.setItem(
      "reseller-applications",
      JSON.stringify(mockApplications)
    )
    render(<BayilikOnayClient />)

    const approveBtn = screen.getByRole("button", { name: /Başvuruyu Onayla/i })
    fireEvent.click(approveBtn)

    // Verify localStorage has updated
    const saved = JSON.parse(
      localStorage.getItem("reseller-applications") || "[]"
    )
    const app = saved.find((a: any) => a.id === "reseller-1")
    expect(app.status).toBe("approved")

    // The toast message should show
    expect(screen.getByText("Bayilik başvurusu onaylandı!")).toBeInTheDocument()
  })

  it("should reject application and update status counters", () => {
    localStorage.setItem(
      "reseller-applications",
      JSON.stringify(mockApplications)
    )
    render(<BayilikOnayClient />)

    const rejectBtn = screen.getByRole("button", { name: /Başvuruyu Reddet/i })
    fireEvent.click(rejectBtn)

    // Verify localStorage has updated
    const saved = JSON.parse(
      localStorage.getItem("reseller-applications") || "[]"
    )
    const app = saved.find((a: any) => a.id === "reseller-1")
    expect(app.status).toBe("rejected")

    // The toast message should show
    expect(
      screen.getByText("Bayilik başvurusu reddedildi.")
    ).toBeInTheDocument()
  })

  it("should delete application when delete button is clicked and confirmed", () => {
    localStorage.setItem(
      "reseller-applications",
      JSON.stringify(mockApplications)
    )
    render(<BayilikOnayClient />)

    // Mock confirm dialogue to return true
    const confirmMock = vi
      .spyOn(window, "confirm")
      .mockImplementation(() => true)

    const deleteBtn = screen.getByRole("button", { name: /Sil/i })
    fireEvent.click(deleteBtn)

    expect(confirmMock).toHaveBeenCalled()

    // Verify application is deleted from localStorage
    const saved = JSON.parse(
      localStorage.getItem("reseller-applications") || "[]"
    )
    expect(saved.length).toBe(1)
    expect(saved.find((a: any) => a.id === "reseller-1")).toBeUndefined()

    expect(screen.getByText("Başvuru sistemden silindi.")).toBeInTheDocument()
  })
})
