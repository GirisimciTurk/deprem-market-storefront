"use server"

import { redirect } from "next/navigation"
import { EXPERT_PASSWORD_MIN } from "@lib/expert-config"
import { GobitError, gobitData, gobitResponse } from "@lib/gobit/client"
import { safeInternalPath } from "@lib/util/safe-redirect"
import {
  MARKETER_SESSION_COOKIE,
  getMarketerHeaders,
  removeMarketerToken,
  setMarketerToken,
} from "./cookies"

// Pazarlamacı hesabı (dtm /store/v1/dtm/marketer-auth/…, marketer/statement):
// pazaryerine satıcı getiren iş ortağı. Hesabı yönetim açar; pazarlamacı
// e-postadaki bağlantıyla şifresini belirler (kayıt yok). Oturum, müşteri ve
// uzman oturumlarından ayrı kendi çerezinde (cookies.ts) durur.

export type Marketer = {
  id: string
  email: string
  name: string
  ref_code: string
  rate_bps: number
  link_months: number
  active: boolean
}

export type MarketerStatement = {
  settled: number
  pending: number
  paid: number
  balance: number
  months: { month: string; orders: number; commission: number; earned: number; settled: number }[]
  sellers: {
    seller_id: string
    name: string
    handle: string
    source: "application" | "operator"
    rate_bps: number | null
    linked_at: string
    expires_at: string
    orders: number
    earned: number
  }[]
  payments: { id: string; amount: number; note: string; created_at: string }[]
}

const AUTH = "/store/v1/dtm/marketer-auth"
const PASSWORD_MIN = EXPERT_PASSWORD_MIN

function panelOf(countryCode: unknown) {
  return `/${(typeof countryCode === "string" && countryCode) || "tr"}/pazarlamaci`
}

/** Yanıtın pazarlamacı oturum çerezini vitrinin çerezine yazar. */
async function keepSession(res: Response): Promise<boolean> {
  const session = res.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .find((c) => c.startsWith(`${MARKETER_SESSION_COOKIE}=`))
  const value = session?.slice(MARKETER_SESSION_COOKIE.length + 1)
  if (!value) return false
  await setMarketerToken(value)
  return true
}

function tooMany(res: Response) {
  const wait = Number(res.headers.get("Retry-After"))
  return Number.isFinite(wait) && wait > 0
    ? `Çok fazla deneme yapıldı. Lütfen ${wait} saniye sonra tekrar deneyin.`
    : "Çok fazla deneme yapıldı. Lütfen biraz sonra tekrar deneyin."
}

/** Oturumdaki pazarlamacının hesabı ve hak ediş dökümü; oturum yoksa null. */
export async function retrieveMarketerStatement(): Promise<{ marketer: Marketer; statement: MarketerStatement } | null> {
  const headers = await getMarketerHeaders()
  if (!headers.cookie) return null
  return gobitData<{ marketer: Marketer; statement: MarketerStatement }>("/store/v1/dtm/marketer/statement", {
    headers,
    cache: "no-store",
  }).catch((e) => {
    if (e instanceof GobitError && e.status === 401) return null
    throw e
  })
}

export async function marketerSignIn(_state: unknown, formData: FormData): Promise<string | null> {
  const email = String(formData.get("email") ?? "")
  const password = String(formData.get("password") ?? "")
  try {
    const res = await gobitResponse(`${AUTH}/sign-in`, { method: "POST", body: { email, password } })
    if (res.status === 401) return "E-posta adresi veya şifre hatalı."
    if (res.status === 429) return tooMany(res)
    if (!res.ok || !(await keepSession(res))) return "Giriş yapılamadı. Lütfen tekrar deneyin."
  } catch {
    return "Giriş yapılamadı. Lütfen tekrar deneyin."
  }
  redirect(safeInternalPath(formData.get("redirect")) ?? panelOf(formData.get("country_code")))
}

export async function marketerSignOut(countryCode: string) {
  const headers = await getMarketerHeaders()
  await gobitResponse(`${AUTH}/sign-out`, { method: "POST", headers }).catch(() => null)
  await removeMarketerToken()
  redirect(`/${countryCode || "tr"}/pazarlamaci/giris`)
}

/** Şifre bağlantısı ister; adresin hesabı olup olmadığını söylemez. */
export async function requestMarketerPasswordReset(email: string): Promise<{ success: boolean; error: string | null }> {
  const res = await gobitResponse(`${AUTH}/password-reset`, { method: "POST", body: { email } }).catch(() => null)
  if (res?.status === 429) return { success: false, error: tooMany(res) }
  return { success: true, error: null }
}

/** Davet ya da sıfırlama bağlantısının jetonuyla şifreyi yazar; kişi pazarlamacı hesabına girmiş olur. */
export async function setMarketerPassword(
  token: string,
  password: string
): Promise<{ success: boolean; error: string | null }> {
  if (password.length < PASSWORD_MIN) return { success: false, error: `Şifre en az ${PASSWORD_MIN} karakter olmalı.` }
  const res = await gobitResponse(`${AUTH}/password`, { method: "POST", body: { token, password } }).catch(() => null)
  if (!res) return { success: false, error: "Şifre kaydedilemedi. Lütfen tekrar deneyin." }
  if (res.status === 429) return { success: false, error: tooMany(res) }
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: { code?: string } } | null
    if (body?.error?.code === "depremtek_link_not_usable")
      return { success: false, error: "Bağlantı geçersiz veya süresi dolmuş. Lütfen yeni bir bağlantı isteyin." }
    return { success: false, error: `Şifre en az ${PASSWORD_MIN} karakter olmalı.` }
  }
  await keepSession(res)
  return { success: true, error: null }
}
