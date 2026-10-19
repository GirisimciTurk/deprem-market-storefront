import { beforeEach, describe, expect, it, vi } from "vitest"

const jar: { expert?: string } = {}

vi.mock("next/navigation", () => ({
  redirect: vi.fn((to: string) => {
    throw Object.assign(new Error("NEXT_REDIRECT"), { to })
  }),
}))
vi.mock("./cookies", () => ({
  EXPERT_SESSION_COOKIE: "dtm_expert_session",
  getExpertHeaders: vi.fn(async () => (jar.expert ? { cookie: `dtm_expert_session=${jar.expert}` } : {})),
  setExpertToken: vi.fn(async (t: string) => {
    jar.expert = t
  }),
  removeExpertToken: vi.fn(async () => {
    delete jar.expert
  }),
}))
vi.mock("@lib/gobit/client", () => ({
  GobitError: class GobitError extends Error {
    constructor(public status: number) {
      super(String(status))
    }
  },
  gobitData: vi.fn(),
  gobitResponse: vi.fn(),
}))

import { gobitResponse } from "@lib/gobit/client"
import {
  changeExpertPassword,
  expertSignIn,
  expertSignUp,
  resetExpertPassword,
} from "./expert-auth"

const respond = vi.mocked(gobitResponse)

/** gobit yanıtı: durum, gövde ve (varsa) uzman oturum çerezi. */
function res(status: number, body: unknown = null, session?: string) {
  const headers = new Headers()
  if (session) headers.append("set-cookie", `dtm_expert_session=${session}; Path=/; HttpOnly`)
  return new Response(body === null ? null : JSON.stringify(body), { status, headers })
}

function form(fields: Record<string, string>) {
  const f = new FormData()
  for (const [k, v] of Object.entries(fields)) f.set(k, v)
  return f
}

async function redirected(p: Promise<unknown>) {
  const e = await p.then(
    () => null,
    (err: { to?: string }) => err
  )
  return e?.to
}

beforeEach(() => {
  delete jar.expert
  respond.mockReset()
})

describe("uzman girişi", () => {
  it("oturum çerezini uzman çerezine yazar ve panele gider", async () => {
    respond.mockResolvedValue(res(200, { data: { id: "xac_1" } }, "s1"))
    const to = await redirected(expertSignIn(null, form({ email: "a@b.test", password: "password1", country_code: "tr" })))
    expect(to).toBe("/tr/uzman/panel")
    expect(jar.expert).toBe("s1")
    expect(respond).toHaveBeenCalledWith("/store/v1/dtm/expert-auth/sign-in", {
      method: "POST",
      body: { email: "a@b.test", password: "password1" },
    })
  })

  it("yanlış şifrede Türkçe uyarı döner, çerez yazmaz", async () => {
    respond.mockResolvedValue(res(401, { error: { code: "depremtek_forbidden" } }))
    await expect(expertSignIn(null, form({ email: "a@b.test", password: "x" }))).resolves.toBe(
      "E-posta adresi veya şifre hatalı."
    )
    expect(jar.expert).toBeUndefined()
  })
})

describe("uzman hesabı açma", () => {
  const fields = { email: "a@b.test", password: "password1", password_repeat: "password1", consent: "on" }

  it("şifreler eşleşmezse ve onay yoksa gobit'e gitmez", async () => {
    await expect(expertSignUp(null, form({ ...fields, password_repeat: "başka" }))).resolves.toBe("Şifreler eşleşmiyor.")
    await expect(expertSignUp(null, form({ ...fields, consent: "" }))).resolves.toMatch(/aydınlatma/)
    expect(respond).not.toHaveBeenCalled()
  })

  it("adresin uzman hesabı varsa girişe yönlendiren uyarı döner", async () => {
    respond.mockResolvedValue(res(409, { error: { code: "depremtek_conflict" } }))
    await expect(expertSignUp(null, form(fields))).resolves.toMatch(/uzman hesabı zaten var/)
  })

  it("açılan hesabın oturumuyla panele gider", async () => {
    respond.mockResolvedValue(res(201, { data: { id: "xac_2" } }, "s2"))
    expect(await redirected(expertSignUp(null, form({ ...fields, country_code: "tr" })))).toBe("/tr/uzman/panel")
    expect(jar.expert).toBe("s2")
  })
})

describe("uzman şifresi", () => {
  it("kullanılmış bağlantıyı Türkçe anlatır", async () => {
    respond.mockResolvedValue(res(422, { error: { code: "depremtek_link_not_usable" } }))
    await expect(resetExpertPassword("t", "password1")).resolves.toEqual({
      success: false,
      error: "Bağlantı geçersiz veya süresi dolmuş. Lütfen yeni bir bağlantı isteyin.",
    })
  })

  it("sıfırlama yeni oturumu yazar", async () => {
    respond.mockResolvedValue(res(204, null, "s3"))
    await expect(resetExpertPassword("t", "password1")).resolves.toEqual({ success: true, error: null })
    expect(jar.expert).toBe("s3")
  })

  it("değiştirmede yanlış mevcut şifreyi oturum düşmesinden ayırır", async () => {
    jar.expert = "s4"
    const change = form({ current_password: "x", new_password: "password2", new_password_repeat: "password2" })
    respond.mockResolvedValue(res(401, { error: { message: "the current password is wrong" } }))
    await expect(changeExpertPassword(null, change)).resolves.toEqual({ success: false, error: "Mevcut şifre hatalı." })
    respond.mockResolvedValue(res(401, { error: { message: "sign in to your expert account first" } }))
    const out = await changeExpertPassword(null, change)
    expect(out.error).toMatch(/Oturumunuzun süresi dolmuş/)
    respond.mockResolvedValue(res(204, null, "s5"))
    await expect(changeExpertPassword(null, change)).resolves.toEqual({ success: true, error: null })
    expect(jar.expert).toBe("s5")
  })
})
