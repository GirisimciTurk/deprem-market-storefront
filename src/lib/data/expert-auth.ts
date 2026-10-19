"use server"

import { redirect } from "next/navigation"
import { EXPERT_PASSWORD_MIN } from "@lib/expert-config"
import { GobitError, gobitData, gobitResponse } from "@lib/gobit/client"
import { safeInternalPath } from "@lib/util/safe-redirect"
import {
  EXPERT_SESSION_COOKIE,
  getExpertHeaders,
  removeExpertToken,
  setExpertToken,
} from "./cookies"

// Uzman hesabı (dtm /store/v1/dtm/expert-auth/…): müşteri hesabından ayrı kayıt,
// giriş, çıkış ve şifre. Aynı e-posta hem müşteri hem uzman hesabı olabilir;
// uzman oturumu kendi çerezinde (cookies.ts) durur.

export type ExpertAccount = { id: string; email: string; created_at: string }

const AUTH = "/store/v1/dtm/expert-auth"

function panelOf(countryCode: unknown) {
  return `/${(typeof countryCode === "string" && countryCode) || "tr"}/uzman/panel`
}

/** Yanıtın uzman oturum çerezini vitrinin çerezine yazar. */
async function keepSession(res: Response): Promise<boolean> {
  const session = res.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .find((c) => c.startsWith(`${EXPERT_SESSION_COOKIE}=`))
  const value = session?.slice(EXPERT_SESSION_COOKIE.length + 1)
  if (!value) return false
  await setExpertToken(value)
  return true
}

async function errorOf(res: Response): Promise<{ code: string; message: string }> {
  const body = (await res.json().catch(() => null)) as { error?: { code?: string; message?: string } } | null
  return { code: body?.error?.code ?? "", message: body?.error?.message ?? "" }
}

function tooMany(res: Response) {
  const wait = Number(res.headers.get("Retry-After"))
  return Number.isFinite(wait) && wait > 0
    ? `Çok fazla deneme yapıldı. Lütfen ${wait} saniye sonra tekrar deneyin.`
    : "Çok fazla deneme yapıldı. Lütfen biraz sonra tekrar deneyin."
}

function invalid(message: string) {
  if (/email is not an address/.test(message)) return "Geçerli bir e-posta adresi girin."
  if (/a password is/.test(message)) return `Şifre en az ${EXPERT_PASSWORD_MIN} karakter olmalı.`
  return "Bilgileri kontrol edip tekrar deneyin."
}

/** Oturumdaki uzman hesabı; oturum yoksa null. */
export async function retrieveExpertAccount(): Promise<ExpertAccount | null> {
  const headers = await getExpertHeaders()
  if (!headers.cookie) return null
  return gobitData<ExpertAccount>(`${AUTH}/session`, { headers, cache: "no-store" }).catch((e) => {
    if (e instanceof GobitError && e.status === 401) return null
    throw e
  })
}

export async function expertSignIn(_state: unknown, formData: FormData): Promise<string | null> {
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

export async function expertSignUp(_state: unknown, formData: FormData): Promise<string | null> {
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")
  if (password.length < EXPERT_PASSWORD_MIN) return `Şifre en az ${EXPERT_PASSWORD_MIN} karakter olmalı.`
  if (password !== String(formData.get("password_repeat") ?? "")) return "Şifreler eşleşmiyor."
  if (formData.get("consent") !== "on") return "Devam etmek için aydınlatma metnini onaylayın."
  try {
    const res = await gobitResponse(`${AUTH}/register`, { method: "POST", body: { email, password } })
    if (res.status === 409)
      return "Bu e-posta ile bir uzman hesabı zaten var. Giriş yapın ya da şifrenizi sıfırlayın."
    if (res.status === 422) return invalid((await errorOf(res)).message)
    if (res.status === 429) return tooMany(res)
    if (!res.ok || !(await keepSession(res))) return "Hesap açılamadı. Lütfen tekrar deneyin."
  } catch {
    return "Hesap açılamadı. Lütfen tekrar deneyin."
  }
  redirect(panelOf(formData.get("country_code")))
}

export async function expertSignOut(countryCode: string) {
  const headers = await getExpertHeaders()
  await gobitResponse(`${AUTH}/sign-out`, { method: "POST", headers }).catch(() => null)
  await removeExpertToken()
  redirect(`/${countryCode || "tr"}/uzman/giris`)
}

/** Şifre sıfırlama bağlantısı ister; adresin hesabı olup olmadığını söylemez. */
export async function requestExpertPasswordReset(email: string): Promise<{ success: boolean; error: string | null }> {
  const res = await gobitResponse(`${AUTH}/password-reset`, { method: "POST", body: { email } }).catch(() => null)
  if (res?.status === 429) return { success: false, error: tooMany(res) }
  return { success: true, error: null }
}

/** Bağlantının jetonuyla yeni şifreyi yazar; kişi uzman hesabına girmiş olur. */
export async function resetExpertPassword(
  token: string,
  password: string
): Promise<{ success: boolean; error: string | null }> {
  if (password.length < EXPERT_PASSWORD_MIN)
    return { success: false, error: `Şifre en az ${EXPERT_PASSWORD_MIN} karakter olmalı.` }
  const res = await gobitResponse(`${AUTH}/password-reset/confirm`, {
    method: "POST",
    body: { token, password },
  }).catch(() => null)
  if (!res) return { success: false, error: "Şifre değiştirilemedi. Lütfen tekrar deneyin." }
  if (res.status === 429) return { success: false, error: tooMany(res) }
  if (!res.ok) {
    const { code, message } = await errorOf(res)
    if (code === "depremtek_link_not_usable")
      return { success: false, error: "Bağlantı geçersiz veya süresi dolmuş. Lütfen yeni bir bağlantı isteyin." }
    return { success: false, error: invalid(message) }
  }
  await keepSession(res)
  return { success: true, error: null }
}

export async function changeExpertPassword(
  _state: unknown,
  formData: FormData
): Promise<{ success: boolean; error: string | null }> {
  const current = String(formData.get("current_password") ?? "")
  const next = String(formData.get("new_password") ?? "")
  if (next.length < EXPERT_PASSWORD_MIN)
    return { success: false, error: `Yeni şifre en az ${EXPERT_PASSWORD_MIN} karakter olmalı.` }
  if (next !== String(formData.get("new_password_repeat") ?? "")) return { success: false, error: "Şifreler eşleşmiyor." }
  const headers = await getExpertHeaders()
  if (!headers.cookie) return { success: false, error: "Oturumunuzun süresi dolmuş; lütfen tekrar giriş yapın." }
  const res = await gobitResponse(`${AUTH}/password`, {
    method: "POST",
    headers,
    body: { current_password: current, new_password: next },
  }).catch(() => null)
  if (!res) return { success: false, error: "Şifre değiştirilemedi. Lütfen tekrar deneyin." }
  if (res.status === 401) {
    const { message } = await errorOf(res)
    return {
      success: false,
      error: /current password/.test(message)
        ? "Mevcut şifre hatalı."
        : "Oturumunuzun süresi dolmuş; lütfen tekrar giriş yapın.",
    }
  }
  if (res.status === 429) return { success: false, error: tooMany(res) }
  if (!res.ok) return { success: false, error: invalid((await errorOf(res)).message) }
  // Diğer oturumlar kapanır; bu tarayıcınınki yenilenen çerezle sürer.
  await keepSession(res)
  return { success: true, error: null }
}
