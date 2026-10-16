import { beforeEach, describe, expect, it, vi } from "vitest"

// signupExpert'in adımlarını sırasıyla kaydeden sahte SDK, çerez ve önbellek.
const log: string[] = []
let jwt = ""

vi.mock("@lib/config", () => ({
  sdk: {
    auth: { register: vi.fn(), login: vi.fn() },
    store: { customer: { create: vi.fn() } },
    client: { fetch: vi.fn() },
  },
}))
vi.mock("./cookies", () => ({
  getAuthHeaders: vi.fn(async () =>
    jwt ? { authorization: `Bearer ${jwt}` } : {}
  ),
  getCacheTag: vi.fn(async (tag: string) => `${tag}-cache`),
  setAuthToken: vi.fn(async (t: string) => {
    log.push(`setAuthToken:${t}`)
    jwt = t
  }),
  removeAuthToken: vi.fn(async () => {
    log.push("removeAuthToken")
    jwt = ""
  }),
}))
vi.mock("./customer", () => ({
  transferCart: vi.fn(async () => {
    log.push("transferCart")
  }),
}))
vi.mock("next/cache", () => ({
  revalidateTag: vi.fn((tag: string) => log.push(`revalidateTag:${tag}`)),
}))

import { sdk } from "@lib/config"
import { transferCart } from "./customer"
import { signupExpert } from "./experts"

const register = vi.mocked(sdk.auth.register)
const login = vi.mocked(sdk.auth.login)
const createCustomer = vi.mocked(sdk.store.customer.create)
const fetch = vi.mocked(sdk.client.fetch)

/** js-sdk FetchError biçimi: ileti + HTTP durumu. */
const fetchError = (message: string, status: number) =>
  Object.assign(new Error(message), { status })

const input = {
  full_name: " Ayşe Nur Yılmaz ",
  email: " ayse@example.com ",
  password: "gizli-sifre",
  phone: "0 532 000 00 00",
  city: "İstanbul",
  district: "Kadıköy",
  specializations: ["risk_tespit"],
}

describe("signupExpert — tek adımda hesap + uzman kartı", () => {
  beforeEach(() => {
    log.length = 0
    jwt = ""
    vi.clearAllMocks()
    register.mockImplementation(async () => {
      log.push("register")
      return "reg-token"
    })
    createCustomer.mockImplementation(async () => {
      log.push("customer.create")
      return { customer: { id: "cus_1" } } as never
    })
    login.mockImplementation(async () => {
      log.push("login")
      return "login-token"
    })
    fetch.mockImplementation(async (path) => {
      log.push(`fetch:${String(path)}`)
      return { expert: { id: "exp_1" } }
    })
  })

  it("signup'ın adımlarını sırayla atar, kartı giriş jetonuyla açar", async () => {
    await expect(signupExpert(input)).resolves.toEqual({ ok: true })
    expect(log).toEqual([
      "register",
      "setAuthToken:reg-token",
      "customer.create",
      "login",
      "setAuthToken:login-token",
      "revalidateTag:customers-cache",
      "transferCart",
      "fetch:/store/expert-leads",
    ])
    expect(register).toHaveBeenCalledWith("customer", "emailpass", {
      email: "ayse@example.com",
      password: "gizli-sifre",
    })
    // Son kelime soyad; hesap telefonu signup'taki gibi "+905…".
    expect(createCustomer).toHaveBeenCalledWith(
      {
        email: "ayse@example.com",
        first_name: "Ayşe Nur",
        last_name: "Yılmaz",
        phone: "+905320000000",
      },
      {},
      { authorization: "Bearer reg-token" }
    )
    expect(login).toHaveBeenCalledWith("customer", "emailpass", {
      email: "ayse@example.com",
      password: "gizli-sifre",
    })
    // Kart, diğer uzman formları gibi "05…" telefonla ve giriş jetonuyla.
    expect(fetch).toHaveBeenCalledWith("/store/expert-leads", {
      method: "POST",
      headers: { authorization: "Bearer login-token" },
      body: {
        full_name: "Ayşe Nur Yılmaz",
        phone: "05320000000",
        city: "İstanbul",
        district: "Kadıköy",
        specializations: ["risk_tespit"],
      },
    })
  })

  it("tek kelimelik adda soyad boş, sabit hat hesaba yazılmaz ama kartta kalır", async () => {
    await signupExpert({ ...input, full_name: "Ayşe", phone: "0212 123 45 67" })
    expect(createCustomer.mock.calls[0][0]).toEqual({
      email: "ayse@example.com",
      first_name: "Ayşe",
      last_name: "",
    })
    expect(
      (fetch.mock.calls[0][1] as { body: { phone: string } }).body.phone
    ).toBe("02121234567")
  })

  it.each([
    ["kısa şifre", { password: "1234567" }],
    ["geçersiz e-posta", { email: "ayse" }],
    ["uzmanlık yok", { specializations: [] }],
    ["eksik telefon", { phone: "0532" }],
  ])("geçersiz girdide (%s) hiçbir şey çağırmaz", async (_, over) => {
    const res = await signupExpert({ ...input, ...over })
    expect(res).toMatchObject({ ok: false, code: "invalid" })
    expect(log).toEqual([])
  })

  it("e-postanın hesabı varsa (Medusa 401 'Identity with email already exists') email_taken döner", async () => {
    register.mockRejectedValue(
      fetchError("Identity with email already exists", 401)
    )
    const res = await signupExpert(input)
    expect(res).toEqual({
      ok: false,
      code: "email_taken",
      error:
        "Bu e-posta ile bir hesabınız var. Uzman Girişi ile giriş yapıp kartınızı açabilirsiniz.",
    })
    expect(log).toEqual([])
  })

  it("başka bir kayıt hatası account_failed olur", async () => {
    register.mockRejectedValue(fetchError("Too many requests", 429))
    expect(await signupExpert(input)).toMatchObject({
      ok: false,
      code: "account_failed",
    })
    expect(createCustomer).not.toHaveBeenCalled()
  })

  it("müşteri açılamazsa kayıt jetonunu siler, kart denemez", async () => {
    createCustomer.mockRejectedValue(fetchError("boom", 500))
    expect(await signupExpert(input)).toMatchObject({
      ok: false,
      code: "account_failed",
    })
    expect(log).toEqual(["register", "setAuthToken:reg-token", "removeAuthToken"])
    expect(fetch).not.toHaveBeenCalled()
  })

  it("sepet aktarılamasa da kart açılır", async () => {
    vi.mocked(transferCart).mockRejectedValueOnce(new Error("cart"))
    await expect(signupExpert(input)).resolves.toEqual({ ok: true })
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it("kart zaten varsa (409) başarı sayılır", async () => {
    fetch.mockRejectedValue(fetchError("Zaten bir uzman kartınız var.", 409))
    await expect(signupExpert(input)).resolves.toEqual({ ok: true })
  })

  it("kart açılamazsa oturum açık kalır ve card_failed backend iletisini taşır", async () => {
    fetch.mockRejectedValue(fetchError("Geçersiz başvuru.", 400))
    const res = await signupExpert(input)
    expect(res).toMatchObject({ ok: false, code: "card_failed" })
    expect(res.ok === false && res.error).toMatch(/Geçersiz başvuru\./)
    expect(log).not.toContain("removeAuthToken")
    expect(jwt).toBe("login-token")
  })
})
