"use server"

import { HttpTypes } from "@medusajs/types"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import { safeInternalPath } from "@lib/util/safe-redirect"
import { gobitData, gobitFetch, gobitResponse } from "@lib/gobit/client"
import { cookies as nextCookies } from "next/headers"
import {
  GOBIT_SESSION_COOKIE,
  getAuthHeaders,
  getCacheTag,
  getCartId,
  removeAuthToken,
  removeCartId,
  setAuthToken,
} from "./cookies"

type GobitCustomer = {
  id: string
  email: string
  first_name: string
  last_name: string
  phone: string
  created_at: string
  updated_at: string
}

type GobitAddress = Record<string, unknown> & { id: string }

/** Oturumdaki müşteri: gobit'in /store/v1/auth/session'ı ve müşteri rotaları. */
export const retrieveCustomer =
  async (): Promise<HttpTypes.StoreCustomer | null> => {
    const headers = await getAuthHeaders()
    if (!headers.cookie) return null

    try {
      const session = await gobitData<{ customer_id: string }>("/store/v1/auth/session", {
        headers,
        cache: "no-store",
      })
      const id = encodeURIComponent(session.customer_id)
      const [c, addresses] = await Promise.all([
        gobitData<GobitCustomer>(`/store/v1/customers/${id}`, { headers, cache: "no-store" }),
        gobitData<GobitAddress[]>(`/store/v1/customers/${id}/addresses`, { headers, cache: "no-store" }).catch(
          () => [] as GobitAddress[]
        ),
      ])

      return {
        id: c.id,
        email: c.email,
        first_name: c.first_name,
        last_name: c.last_name,
        phone: c.phone,
        has_account: true,
        addresses,
        orders: [],
        created_at: c.created_at,
        updated_at: c.updated_at,
        metadata: {},
      } as unknown as HttpTypes.StoreCustomer
    } catch {
      return null
    }
  }

/** Oturumdaki müşterinin kimliği ve gobit istek başlıkları. */
async function me(): Promise<{ id: string; headers: Record<string, string> }> {
  const headers = await getAuthHeaders()
  if (!headers.cookie) throw new Error("Giriş yapmanız gerekiyor.")
  const session = await gobitData<{ customer_id: string }>("/store/v1/auth/session", { headers, cache: "no-store" })

  return { id: encodeURIComponent(session.customer_id), headers }
}

const errText = (e: unknown) => (e instanceof Error ? e.message : String(e))

export const updateCustomer = async (body: HttpTypes.StoreUpdateCustomer) => {
  const { id, headers } = await me()
  const b = body as Record<string, any>
  await gobitFetch(`/store/v1/customers/${id}`, {
    method: "PUT",
    headers,
    body: {
      ...(b.first_name !== undefined ? { first_name: b.first_name } : {}),
      ...(b.last_name !== undefined ? { last_name: b.last_name } : {}),
      ...(b.phone !== undefined ? { phone: b.phone } : {}),
      ...(b.metadata !== undefined ? { metadata: b.metadata } : {}),
    },
  })
  revalidateTag(await getCacheTag("customers"))

  return retrieveCustomer()
}

// Kayıt (identity-session): e-posta ve şifre alınır, adrese doğrulama bağlantısı
// gider; hesap bağlantı açılınca kurulur ve kişi oturum açmış olur. Formun ad,
// soyad ve telefonu doğrulamaya kadar bir çerezde bekler (verifyRegistration).
const PENDING_PROFILE = "_gobit_pending_profile"

export async function signup(_currentState: unknown, formData: FormData) {
  const password = formData.get("password") as string
  let phoneVal = ((formData.get("phone") as string) || "").trim().replace(/[\s\(\)\-\.]/g, "")

  if (phoneVal) {
    if (phoneVal.startsWith("0")) {
      phoneVal = "+90" + phoneVal.substring(1)
    } else if (phoneVal.startsWith("90")) {
      phoneVal = "+" + phoneVal
    } else if (!phoneVal.startsWith("+")) {
      phoneVal = "+90" + phoneVal
    }
    if (!/^\+905\d{9}$/.test(phoneVal)) {
      return "Lütfen geçerli bir cep telefonu numarası girin (Örn: 0555 123 45 67)"
    }
  }

  const email = ((formData.get("email") as string) || "").trim()
  try {
    const res = await gobitResponse("/store/v1/auth/register", { method: "POST", body: { email, password } })
    if (res.status === 404) return "Yeni üyelik şu an açık değil."
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      return body?.error?.message || `Kayıt yapılamadı (${res.status}).`
    }
    ;(await nextCookies()).set(
      PENDING_PROFILE,
      JSON.stringify({
        email: email.toLowerCase(),
        first_name: formData.get("first_name") || "",
        last_name: formData.get("last_name") || "",
        phone: phoneVal,
      }),
      { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 2 }
    )
  } catch (error) {
    return errText(error)
  }

  redirect(`/${(formData.get("country_code") as string) || "tr"}/kayit-onay?gonderildi=1`)
}

/** Doğrulama bağlantısı: hesabı açar, oturumu kurar, formun ad/soyad/telefonunu yazar. */
export async function verifyRegistration(token: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const res = await gobitResponse("/store/v1/auth/register/verify", { method: "POST", body: { token } })
    if (!res.ok) return { success: false, error: "Doğrulama bağlantısı geçersiz ya da süresi dolmuş." }
    const session = res.headers
      .getSetCookie()
      .map((c) => c.split(";")[0])
      .find((c) => c.startsWith(`${GOBIT_SESSION_COOKIE}=`))
    if (!session) return { success: false, error: "Oturum açılamadı." }
    await setAuthToken(session.slice(GOBIT_SESSION_COOKIE.length + 1))

    const jar = await nextCookies()
    const raw = jar.get(PENDING_PROFILE)?.value
    jar.set(PENDING_PROFILE, "", { maxAge: -1 })
    if (raw) {
      const profile = JSON.parse(raw) as { email: string; first_name: string; last_name: string; phone: string }
      const { id, headers } = await me()
      const c = await gobitData<{ email: string }>(`/store/v1/customers/${id}`, { headers, cache: "no-store" })
      if (c.email.toLowerCase() === profile.email) {
        await gobitFetch(`/store/v1/customers/${id}`, {
          method: "PUT",
          headers,
          body: { first_name: profile.first_name, last_name: profile.last_name, phone: profile.phone },
        }).catch(() => {})
      }
    }
    revalidateTag(await getCacheTag("customers"))

    return { success: true, error: null }
  } catch (e) {
    return { success: false, error: errText(e) }
  }
}

export async function login(_currentState: unknown, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  // depremtek'in girişi: gobit şifresini, yoksa göçle gelen Medusa şifresini
  // bir kez kabul edip yükseltir (dtm SignIn). 204 ve oturum çerezi döner.
  try {
    const res = await gobitResponse("/store/v1/dtm/sign-in", {
      method: "POST",
      body: { email, password },
    })
    if (res.status === 401) return "E-posta adresi veya şifre hatalı."
    if (!res.ok) return `Giriş yapılamadı (${res.status}).`
    const session = res.headers
      .getSetCookie()
      .map((c) => c.split(";")[0])
      .find((c) => c.startsWith(`${GOBIT_SESSION_COOKIE}=`))
    if (!session) return "Giriş yapılamadı: oturum açılmadı."
    await setAuthToken(session.slice(GOBIT_SESSION_COOKIE.length + 1))
    const customerCacheTag = await getCacheTag("customers")
    revalidateTag(customerCacheTag)
  } catch (error) {
    return String(error)
  }

  try {
    await transferCart()
  } catch (error) {
    return String(error)
  }

  // Kullanıcı bir yerden yönlendirilerek geldiyse (ör. "favorilere eklemek için
  // giriş yapın" / "stoğa gelince haber ver") oraya geri götür; eskiden hesap
  // panelinde kalıyor ve niyeti kayboluyordu. Yol açık yönlendirmeye karşı
  // doğrulanır. redirect() NEXT_REDIRECT fırlattığı için try/catch DIŞINDA.
  const target = safeInternalPath(formData.get("redirect"))
  if (target) {
    redirect(target)
  }
}

/**
 * Şifre sıfırlama e-postası ister. Medusa `auth.password_reset` event'ini tetikler;
 * backend subscriber müşteriye sıfırlama linkli e-posta gönderir. E-posta sızıntısını
 * önlemek için (kayıtlı olsun olmasın) her zaman başarılı döner.
 */
/**
 * Şifre sıfırlama bağlantısı ister (identity-session). Adresin kayıtlı olup
 * olmadığını sızdırmamak için her zaman başarılı döner.
 */
export async function requestPasswordReset(email: string): Promise<{ success: boolean; error: string | null }> {
  await gobitResponse("/store/v1/auth/password-reset", { method: "POST", body: { email } }).catch(() => null)

  return { success: true, error: null }
}

/** Bağlantıdaki jetonla yeni şifreyi belirler. */
export async function resetPassword(
  _email: string,
  password: string,
  token: string
): Promise<{ success: boolean; error: string | null }> {
  const res = await gobitResponse("/store/v1/auth/password-reset/confirm", {
    method: "POST",
    body: { token, password },
  }).catch(() => null)
  if (res?.ok) return { success: true, error: null }

  return {
    success: false,
    error:
      res && (res.status === 401 || res.status === 404 || res.status === 422)
        ? "Sıfırlama bağlantısı geçersiz veya süresi dolmuş. Lütfen yeni bir bağlantı isteyin."
        : "Şifre sıfırlanamadı.",
  }
}

export async function updateCustomerPassword(
  _currentState: Record<string, unknown>,
  formData: FormData
): Promise<{ success: boolean; error: string | null }> {
  const oldPassword = (formData.get("old_password") as string) || ""
  const newPassword = (formData.get("new_password") as string) || ""
  const confirm = (formData.get("confirm_password") as string) || ""

  if (!oldPassword || !newPassword) {
    return { success: false, error: "Lütfen tüm alanları doldurun." }
  }
  if (newPassword.length < 8) {
    return { success: false, error: "Yeni şifre en az 8 karakter olmalıdır." }
  }
  if (newPassword !== confirm) {
    return { success: false, error: "Yeni şifreler eşleşmiyor." }
  }

  try {
    const res = await gobitResponse("/store/v1/auth/password", {
      method: "POST",
      headers: await getAuthHeaders(),
      body: { current_password: oldPassword, new_password: newPassword },
    })
    if (res.ok) return { success: true, error: null }
    if (res.status === 401 || res.status === 403) return { success: false, error: "Mevcut şifreniz hatalı." }
    const body = await res.json().catch(() => null)

    return { success: false, error: body?.error?.message || "Şifre güncellenemedi." }
  } catch (error) {
    return { success: false, error: errText(error) }
  }
}

export async function signout(countryCode: string) {
  try {
    await gobitResponse("/store/v1/auth/sign-out", { method: "POST", headers: await getAuthHeaders() })
  } catch {
    // yoksay — asıl çıkış aşağıdaki çerez silme ile olur
  }

  await removeAuthToken()

  const customerCacheTag = await getCacheTag("customers")
  revalidateTag(customerCacheTag)

  await removeCartId()

  const cartCacheTag = await getCacheTag("carts")
  revalidateTag(cartCacheTag)

  redirect(`/${countryCode}/account`)
}

/** Girişte sepeti müşteriye bağlar (gobit sepetinin müşterisi). */
export async function transferCart() {
  const cartId = await getCartId()
  if (!cartId) return

  const { id, headers } = await me()
  await gobitFetch(`/store/v1/carts/${cartId}`, {
    method: "POST",
    headers,
    body: { customer_id: decodeURIComponent(id) },
  }).catch(() => {})
  revalidateTag(await getCacheTag("carts"))
}

const addressFrom = (formData: FormData) => ({
  first_name: (formData.get("first_name") as string) || "",
  last_name: (formData.get("last_name") as string) || "",
  company: (formData.get("company") as string) || "",
  address_1: (formData.get("address_1") as string) || "",
  address_2: (formData.get("address_2") as string) || "",
  city: (formData.get("city") as string) || "",
  postal_code: (formData.get("postal_code") as string) || "",
  province: (formData.get("province") as string) || "",
  country_code: ((formData.get("country_code") as string) || "tr").toLowerCase(),
  phone: (formData.get("phone") as string) || "",
})

// Adres etiketi (address_name) gobit'te yok.
export const addCustomerAddress = async (
  currentState: Record<string, unknown>,
  formData: FormData
): Promise<{ success: boolean; error: string | null }> => {
  const formDefault = formData.get("is_default_shipping") != null
  try {
    const { id, headers } = await me()
    await gobitFetch(`/store/v1/customers/${id}/addresses`, {
      method: "POST",
      headers,
      body: {
        ...addressFrom(formData),
        is_default_billing: (currentState.isDefaultBilling as boolean) || formDefault || false,
        is_default_shipping: (currentState.isDefaultShipping as boolean) || formDefault || false,
      },
    })
    revalidateTag(await getCacheTag("customers"))
    return { success: true, error: null }
  } catch (e) {
    return { success: false, error: errText(e) }
  }
}

export const deleteCustomerAddress = async (addressId: string): Promise<void> => {
  const { id, headers } = await me()
  await gobitFetch(`/store/v1/customers/${id}/addresses/${encodeURIComponent(addressId)}`, {
    method: "DELETE",
    headers,
  }).catch(() => {})
  revalidateTag(await getCacheTag("customers"))
}

export const updateCustomerAddress = async (
  currentState: Record<string, unknown>,
  formData: FormData
): Promise<{ success: boolean; error: string | null }> => {
  const addressId = (currentState.addressId as string) || (formData.get("addressId") as string)
  if (!addressId) return { success: false, error: "Address ID is required" }

  try {
    const { id, headers } = await me()
    const path = `/store/v1/customers/${id}/addresses/${encodeURIComponent(addressId)}`
    await gobitFetch(path, { method: "PUT", headers, body: addressFrom(formData) })
    if (formData.get("is_default_shipping") != null) {
      await gobitFetch(`${path}/default-shipping`, { method: "POST", headers })
      await gobitFetch(`${path}/default-billing`, { method: "POST", headers })
    }
    revalidateTag(await getCacheTag("customers"))
    return { success: true, error: null }
  } catch (e) {
    return { success: false, error: errText(e) }
  }
}

// Google ile giriş gobit'te yok (identity-session şifre ve passkey sunar); göç
// aracı da Medusa'nın Google girişlerini taşımadı. Düğme bu mesajı gösterir.
export async function initiateGoogleLogin(): Promise<{ location: string }> {
  throw new Error("Google ile giriş şu an kullanılamıyor. Lütfen e-posta ve şifrenizle giriş yapın.")
}

export async function validateGoogleCallback(
  _query: Record<string, unknown>
): Promise<{ success: boolean; error: string | null }> {
  return { success: false, error: "Google ile giriş şu an kullanılamıyor." }
}
