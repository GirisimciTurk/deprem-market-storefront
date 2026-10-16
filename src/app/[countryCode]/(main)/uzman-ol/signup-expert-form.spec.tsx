import React from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react"

const push = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useParams: () => ({ countryCode: "tr" }),
}))

// Sunucu eylemleri — formun konusu gönderdiği gövde ve sonrası.
vi.mock("@lib/data/experts", () => ({
  signupExpert: vi.fn(),
  createExpertCard: vi.fn(),
}))
vi.mock("@modules/common/components/localized-client-link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string
    children: React.ReactNode
  }) => (
    <a href={`/tr${href}`} {...rest}>
      {children}
    </a>
  ),
}))

import { createExpertCard, signupExpert } from "@lib/data/experts"
import { EXPERT_EMAIL_TAKEN_MESSAGE } from "@lib/util/expert-card"
import SignupExpertForm from "./signup-expert-form"

const mockSignup = vi.mocked(signupExpert)
const mockCreate = vi.mocked(createExpertCard)

const LOGIN_HREF =
  "/tr/account?rol=uzman&redirect=%2Ftr%2Fuzman-ol%23kart-ac"
const SUBMIT = { name: "Hesabımı ve Uzman Kartımı Aç" }

const field = {
  name: () => screen.getByLabelText(/^Ad Soyad/) as HTMLInputElement,
  email: () => screen.getByLabelText(/^E-posta/) as HTMLInputElement,
  password: () => screen.getByLabelText(/^Şifre\s*\*$/) as HTMLInputElement,
  phone: () => screen.getByLabelText(/^Telefon/) as HTMLInputElement,
}

function fill(over: Partial<Record<keyof typeof field, string>> = {}) {
  const v = {
    name: " Ayşe Nur Yılmaz ",
    email: " ayse@example.com ",
    password: "gizli-sifre",
    phone: "0532 000 00 00",
    ...over,
  }
  fireEvent.change(field.name(), { target: { value: v.name } })
  fireEvent.change(field.email(), { target: { value: v.email } })
  fireEvent.change(field.password(), { target: { value: v.password } })
  fireEvent.change(field.phone(), { target: { value: v.phone } })
  fireEvent.change(screen.getByLabelText(/^İl\s*\*$/), {
    target: { value: "İstanbul" },
  })
  fireEvent.change(screen.getByLabelText(/^İlçe/), {
    target: { value: "Kadıköy" },
  })
}
const pickSpec = () =>
  fireEvent.click(screen.getByRole("button", { name: /Bina Risk/ }))
const submit = () => fireEvent.click(screen.getByRole("button", SUBMIT))

describe("SignupExpertForm — giriş yapmamış ziyaretçiye tek adımlı 'Uzman ol'", () => {
  beforeEach(() => {
    push.mockReset()
    mockSignup.mockReset()
    mockCreate.mockReset()
  })
  afterEach(cleanup)

  it("hesap alanlarını, onay cümlesini ve Uzman Girişi linkini gösterir; unvan yok", () => {
    render(<SignupExpertForm />)
    expect(field.email().type).toBe("email")
    expect(field.password().type).toBe("password")
    expect(field.phone().type).toBe("tel")
    expect(screen.queryByLabelText(/Unvan/)).toBeNull()
    expect(
      screen.getByRole("link", { name: "Uzman Girişi" }).getAttribute("href")
    ).toBe(LOGIN_HREF)
    expect(
      screen.getByRole("link", { name: /Gizlilik ve Güvenlik Sözleşmesini/ })
    ).toHaveAttribute("href", "/tr/gizlilik-ve-guvenlik")
    expect(
      screen.getByRole("link", { name: /Çerez Politikasını/ })
    ).toHaveAttribute("href", "/tr/cerez-politikasi")
    expect(screen.getByText(/kabul etmiş olursunuz/)).toBeInTheDocument()
  })

  it("şifre göster/gizle düğmesi alanın türünü değiştirir", () => {
    render(<SignupExpertForm />)
    fireEvent.click(screen.getByRole("button", { name: "Şifreyi göster" }))
    expect(field.password().type).toBe("text")
    fireEvent.click(screen.getByRole("button", { name: "Şifreyi gizle" }))
    expect(field.password().type).toBe("password")
  })

  it.each([
    ["boş ad", { name: " " }, /adınızı/],
    ["geçersiz e-posta", { email: "ayse@" }, /e-posta/],
    ["kısa şifre", { password: "1234567" }, /en az 8 karakter/],
    ["eksik telefon", { phone: "0532 000" }, /telefon numarasını eksiksiz/i],
  ])("%s ile göndermez ve hatayı gösterir", async (_, over, message) => {
    render(<SignupExpertForm />)
    fill(over)
    pickSpec()
    submit()
    expect(await screen.findByRole("alert")).toHaveTextContent(message)
    expect(mockSignup).not.toHaveBeenCalled()
  })

  it("uzmanlık seçilmeden göndermez", async () => {
    render(<SignupExpertForm />)
    fill()
    submit()
    expect(await screen.findByRole("alert")).toHaveTextContent(/uzmanlık/)
    expect(mockSignup).not.toHaveBeenCalled()
  })

  it("hesabı ve kartı açar, Uzman Kartım'a götürür", async () => {
    mockSignup.mockResolvedValue({ ok: true })
    render(<SignupExpertForm />)
    fill()
    pickSpec()
    submit()
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith("/tr/account/uzman-kartim")
    )
    expect(mockSignup).toHaveBeenCalledWith({
      full_name: "Ayşe Nur Yılmaz",
      email: "ayse@example.com",
      password: "gizli-sifre",
      phone: "0 532 000 00 00",
      city: "İstanbul",
      district: "Kadıköy",
      specializations: ["risk_tespit"],
    })
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it("e-postanın hesabı varsa iletiyi ve Uzman Girişi linkini gösterir", async () => {
    mockSignup.mockResolvedValue({
      ok: false,
      code: "email_taken",
      error: EXPERT_EMAIL_TAKEN_MESSAGE,
    })
    render(<SignupExpertForm />)
    fill()
    pickSpec()
    submit()
    const alert = await screen.findByRole("alert")
    expect(alert).toHaveTextContent(EXPERT_EMAIL_TAKEN_MESSAGE)
    expect(
      within(alert).getByRole("link", { name: "Uzman Girişi" })
    ).toHaveAttribute("href", LOGIN_HREF)
    expect(push).not.toHaveBeenCalled()
  })

  it("hesap açılamazsa iletiyi gösterir, giriş linki eklemez, yönlendirmez", async () => {
    mockSignup.mockResolvedValue({
      ok: false,
      code: "account_failed",
      error: "Hesabınız oluşturulamadı. Lütfen tekrar deneyin.",
    })
    render(<SignupExpertForm />)
    fill()
    pickSpec()
    submit()
    const alert = await screen.findByRole("alert")
    expect(alert).toHaveTextContent(/oluşturulamadı/)
    expect(within(alert).queryByRole("link")).toBeNull()
    expect(push).not.toHaveBeenCalled()
    // Yeniden denenebilir: form hâlâ hesap formu.
    expect(screen.getByRole("button", SUBMIT)).not.toBeDisabled()
  })

  it("hesap açılıp kart açılamazsa yazılanları koruyup yalnız kartı yeniden dener", async () => {
    mockSignup.mockResolvedValue({
      ok: false,
      code: "card_failed",
      error: "Hesabınız açıldı ve giriş yaptınız, ancak uzman kartınız açılamadı.",
    })
    mockCreate.mockResolvedValue({ expert: { id: "x" } as never, error: null })
    render(<SignupExpertForm />)
    fill()
    pickSpec()
    submit()
    expect(await screen.findByRole("alert")).toHaveTextContent(/hesabınız açıldı/i)
    // Oturum açık: e-posta/şifre ve onay cümlesi gider, yazılanlar kalır.
    expect(screen.queryByLabelText(/^E-posta/)).toBeNull()
    expect(screen.queryByLabelText(/^Şifre\s*\*$/)).toBeNull()
    expect(screen.queryByText(/kabul etmiş olursunuz/)).toBeNull()
    expect(field.name().value).toBe(" Ayşe Nur Yılmaz ")
    expect(field.phone().value).toBe("0 532 000 00 00")

    fireEvent.click(screen.getByRole("button", { name: "Uzman Kartımı Aç" }))
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith("/tr/account/uzman-kartim")
    )
    expect(mockSignup).toHaveBeenCalledTimes(1)
    expect(mockCreate).toHaveBeenCalledWith({
      full_name: "Ayşe Nur Yılmaz",
      phone: "05320000000",
      city: "İstanbul",
      district: "Kadıköy",
      specializations: ["risk_tespit"],
    })
  })

  it("yeniden denemede kart zaten varsa (409) kartına götürür", async () => {
    mockSignup.mockResolvedValue({
      ok: false,
      code: "card_failed",
      error: "kart açılamadı",
    })
    mockCreate.mockResolvedValue({
      expert: null,
      error: "Zaten bir uzman kartınız var.",
      status: 409,
    })
    render(<SignupExpertForm />)
    fill()
    pickSpec()
    submit()
    await screen.findByRole("alert")
    fireEvent.click(screen.getByRole("button", { name: "Uzman Kartımı Aç" }))
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith("/tr/account/uzman-kartim")
    )
  })
})
