import React from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"

const refresh = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
  useParams: () => ({ countryCode: "tr" }),
}))
vi.mock("@modules/common/components/localized-client-link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))
vi.mock("@lib/data/experts", () => ({ updateMyExpert: vi.fn() }))

import { updateMyExpert, type MyExpert } from "@lib/data/experts"
import ExpertCardEditor from "./expert-card-editor"

const mockUpdate = vi.mocked(updateMyExpert)

const base: MyExpert = {
  id: "exp_1",
  full_name: "Ayşe Yılmaz",
  title: "",
  email: "ayse@example.com",
  phone: "05320000000",
  city: "İstanbul",
  district: "Kadıköy",
  specializations: ["risk_tespit"],
  verified_specializations: [],
  experience_years: null,
  imo_member: false,
  about: "",
  photo_url: "",
  whatsapp: "",
  show_phone: true,
  show_email: false,
  service_regions: [],
  documents: [],
  status: "new",
  is_published: false,
  published_at: null,
  slug: null,
}

const addBtn = () => screen.queryByRole("button", { name: /Bölge Ekle/ })

describe("ExpertCardEditor — Uzman Kartım", () => {
  beforeEach(() => {
    mockUpdate.mockReset()
    refresh.mockReset()
  })
  afterEach(cleanup)

  it("yayında değilken doğrulama bekleniyor der", () => {
    render(<ExpertCardEditor expert={base} />)
    expect(screen.getByText(/Doğrulama bekleniyor/)).toBeInTheDocument()
    expect(screen.getByText(/doğruladıktan sonra yayına alınır/)).toBeInTheDocument()
    expect(screen.queryByText(/Yayında/)).toBeNull()
  })

  it("yayındayken dizindeki karta bağlantı verir, yeni uzmanlık 'inceleniyor'", () => {
    render(
      <ExpertCardEditor
        expert={{
          ...base,
          is_published: true,
          slug: "ayse-yilmaz",
          specializations: ["risk_tespit", "zemin_etut"],
          verified_specializations: ["risk_tespit"],
        }}
      />
    )
    expect(screen.getByText(/✓ Yayında/)).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /dizinde gör/ })).toHaveAttribute(
      "href",
      "/uzmanlar/ayse-yilmaz"
    )
    expect(screen.getByRole("button", { name: /Bina Risk/ })).toHaveTextContent(
      "doğrulandı"
    )
    expect(screen.getByRole("button", { name: /Zemin Etüdü/ })).toHaveTextContent(
      "inceleniyor"
    )
  })

  it("en fazla 3 ek hizmet bölgesi eklenebilir", () => {
    render(<ExpertCardEditor expert={base} />)
    for (let i = 0; i < 3; i++) fireEvent.click(addBtn()!)
    expect(screen.getAllByPlaceholderText("İl (örn. Kocaeli)")).toHaveLength(3)
    expect(addBtn()).toBeNull()
    expect(screen.getByText(/En fazla 3 ek bölge/)).toBeInTheDocument()

    // Birini kaldırınca ekleme yeniden açılır.
    fireEvent.click(screen.getAllByRole("button", { name: "Kaldır" })[0])
    expect(addBtn()).not.toBeNull()
  })

  it("3 bölgesi olan kartta ekleme düğmesi yok", () => {
    render(
      <ExpertCardEditor
        expert={{
          ...base,
          service_regions: [
            { city: "Kocaeli" },
            { city: "Sakarya", district: "Adapazarı" },
            { city: "Bursa" },
          ],
        }}
      />
    )
    expect(addBtn()).toBeNull()
  })

  it("kaydederken yalnız düzenlenebilir alanları gönderir", async () => {
    mockUpdate.mockResolvedValue({ expert: base, error: null })
    render(<ExpertCardEditor expert={base} />)
    fireEvent.click(addBtn()!)
    fireEvent.change(screen.getByPlaceholderText("İl (örn. Kocaeli)"), {
      target: { value: " Kocaeli " },
    })
    fireEvent.click(addBtn()!) // boş satır gönderilmez
    fireEvent.click(screen.getByRole("button", { name: /Değişiklikleri Kaydet/ }))

    await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(1))
    const body = mockUpdate.mock.calls[0][0]
    expect(body.service_regions).toEqual([{ city: "Kocaeli", district: undefined }])
    expect(body.experience_years).toBeNull()
    for (const k of [
      "is_published",
      "status",
      "slug",
      "verified_specializations",
      "email",
      "membership_tier",
    ]) {
      expect(body).not.toHaveProperty(k)
    }
    expect(await screen.findByRole("status")).toHaveTextContent(/kaydedildi/)
    expect(refresh).toHaveBeenCalled()
  })

  it("zorunlu alan boşsa kaydetmez", async () => {
    render(<ExpertCardEditor expert={base} />)
    fireEvent.click(screen.getByRole("button", { name: /Bina Risk/ })) // tek uzmanlığı kaldır
    fireEvent.click(screen.getByRole("button", { name: /Değişiklikleri Kaydet/ }))
    expect(await screen.findByRole("alert")).toHaveTextContent(/uzmanlık/)
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it("backend hatasını gösterir", async () => {
    mockUpdate.mockResolvedValue({ expert: null, error: "Geçersiz veri.", status: 400 })
    render(<ExpertCardEditor expert={base} />)
    fireEvent.click(screen.getByRole("button", { name: /Değişiklikleri Kaydet/ }))
    expect(await screen.findByRole("alert")).toHaveTextContent("Geçersiz veri.")
    expect(refresh).not.toHaveBeenCalled()
  })
})
