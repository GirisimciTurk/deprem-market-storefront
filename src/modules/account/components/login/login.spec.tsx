import { describe, expect, it, vi, beforeEach } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"

let search = new URLSearchParams()
vi.mock("next/navigation", () => ({
  useSearchParams: () => search,
  useParams: () => ({ countryCode: "tr" }),
}))
vi.mock("@lib/data/customer", () => ({ login: vi.fn(), initiateGoogleLogin: vi.fn() }))
vi.mock("@modules/checkout/components/error-message", () => ({ default: () => null }))
vi.mock("@modules/checkout/components/submit-button", () => ({
  SubmitButton: ({ children }: { children: React.ReactNode }) => <button type="submit">{children}</button>,
}))
vi.mock("@modules/common/components/localized-client-link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={`/tr${href}`} {...rest}>{children}</a>
  ),
}))

import Login from "./index"

const redirectValue = (container: HTMLElement) =>
  (container.querySelector('input[name="redirect"]') as HTMLInputElement | null)?.value ?? null

describe("Login — müşteri / uzman girişi", () => {
  beforeEach(() => {
    search = new URLSearchParams()
  })

  it("varsayılan müşteri girişidir ve dönüş yolu taşımaz", () => {
    const { container } = render(<Login setCurrentView={() => {}} />)
    expect(screen.getByTestId("login-role-customer").getAttribute("aria-selected")).toBe("true")
    expect(redirectValue(container)).toBeNull()
    expect(screen.getByTestId("register-button")).toBeTruthy()
  })

  it("uzman sekmesi girişten sonra uzman kartına götürür", () => {
    const { container } = render(<Login setCurrentView={() => {}} />)
    fireEvent.click(screen.getByTestId("login-role-expert"))
    expect(screen.getByRole("heading", { name: "Uzman Girişi" })).toBeTruthy()
    expect(redirectValue(container)).toBe("/tr/account/uzman-kartim")
    expect(screen.getByTestId("expert-apply-link").getAttribute("href")).toBe("/tr/uzman-ol")
  })

  it("?rol=uzman uzman sekmesini açar; açık redirect önceliklidir", () => {
    search = new URLSearchParams("rol=uzman&redirect=/tr/uzman-ol")
    const { container } = render(<Login setCurrentView={() => {}} />)
    expect(screen.getByTestId("login-role-expert").getAttribute("aria-selected")).toBe("true")
    expect(redirectValue(container)).toBe("/tr/uzman-ol")
  })
})
