"use server"

import { StoreCustomer, StoreCustomerUpdate } from "types/store"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import { safeInternalPath } from "@lib/util/safe-redirect"
import { GobitError, gobitData, gobitFetch, gobitResponse } from "@lib/gobit/client"
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
  async (): Promise<StoreCustomer | null> => {
    const headers = await getAuthHeaders()
    if (!headers.cookie) return null

    try {
      const session = await gobitData<{ customer_id: string }>("/store/v1/auth/session", {
        headers,
        cache: "no-store",
      })
      const id = encodeURIComponent(session.customer_id)
      const [c, addresses, labels] = await Promise.all([
        gobitData<GobitCustomer>(`/store/v1/customers/${id}`, { headers, cache: "no-store" }),
        gobitData<GobitAddress[]>(`/store/v1/customers/${id}/addresses`, { headers, cache: "no-store" }).catch(
          () => [] as GobitAddress[]
        ),
        addressLabels(headers),
      ])

      return {
        id: c.id,
        email: c.email,
        first_name: c.first_name,
        last_name: c.last_name,
        phone: c.phone,
        has_account: true,
        addresses: addresses.map((a) => ({ ...a, address_name: labels[a.id] ?? null })),
        created_at: c.created_at,
        updated_at: c.updated_at,
        metadata: {},
      }
    } catch {
      return null
    }
  }

// Adres etiketi ("Ev", "İş"…): gobit adresinde etiket yok, dtm adres
// kimliğine göre tutar (/store/v1/dtm/address-labels).
async function addressLabels(headers: Record<string, string>): Promise<Record<string, string>> {
  return gobitData<Record<string, string>>("/store/v1/dtm/address-labels", { headers, cache: "no-store" }).catch(
    () => ({})
  )
}

/** Adresin etiketini yazar; boş etiket siler. */
async function setAddressLabel(addressId: string, label: string, headers: Record<string, string>) {
  await gobitFetch(`/store/v1/dtm/address-labels/${encodeURIComponent(addressId)}`, {
    method: "PUT",
    headers,
    body: { label: label.trim().slice(0, 40) },
  })
}

/** Oturumdaki müşterinin kimliği ve gobit istek başlıkları. */
async function me(): Promise<{ id: string; headers: Record<string, string> }> {
  const headers = await getAuthHeaders()
  if (!headers.cookie) throw new Error("Giriş yapmanız gerekiyor.")
  const session = await gobitData<{ customer_id: string }>("/store/v1/auth/session", { headers, cache: "no-store" })

  return { id: encodeURIComponent(session.customer_id), headers }
}

const errText = (e: unknown) => (e instanceof Error ? e.message : String(e))

export const updateCustomer = async (body: StoreCustomerUpdate) => {
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

  // depremtek'in girişi: gobit şifresini, yoksa eski sistemden taşınan şifreyi
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
 * Şifre sıfırlama bağlantısı ister (identity-session). Adresin kayıtlı olup
 * olmadığını sızdırmamak için her zaman başarılı döner.
 */
export async function requestPasswordReset(email: string): Promise<{ success: boolean; error: string | null }> {
  await gobitResponse("/store/v1/auth/password-reset", { method: "POST", body: { email } }).catch(() => null)

  return { success: true, error: null }
}

/**
 * Bağlantıdaki jetonla yeni şifreyi belirler (identity-session
 * /password-reset/confirm). gobit kişiyi oturum açmış sayar ve eski oturumları
 * bitirir; yanıtın oturum çerezi vitrinin çerezine yazılır.
 */
export async function resetPassword(
  _email: string,
  password: string,
  token: string
): Promise<{ success: boolean; error: string | null; signedIn?: boolean }> {
  const res = await gobitResponse("/store/v1/auth/password-reset/confirm", {
    method: "POST",
    body: { token, password },
  }).catch(() => null)
  if (res?.ok) {
    const session = res.headers
      .getSetCookie()
      .map((c) => c.split(";")[0])
      .find((c) => c.startsWith(`${GOBIT_SESSION_COOKIE}=`))
    if (!session) return { success: true, error: null, signedIn: false }
    await setAuthToken(session.slice(GOBIT_SESSION_COOKIE.length + 1))
    revalidateTag(await getCacheTag("customers"))
    await transferCart().catch(() => {})

    return { success: true, error: null, signedIn: true }
  }

  if (res?.status === 422) {
    const code = ((await res.json().catch(() => null)) as { error?: { code?: string } } | null)?.error?.code
    if (code === "identity_session_password_reset_invalid")
      return { success: false, error: "Bu şifre kabul edilmedi. Lütfen başka bir şifre deneyin." }
  }
  if (res?.status === 429)
    return { success: false, error: "Çok fazla deneme yapıldı. Lütfen birkaç dakika sonra tekrar deneyin." }

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

// Adres etiketi (address_name) adres yazıldıktan sonra dtm'ye yazılır.
export const addCustomerAddress = async (
  currentState: Record<string, unknown>,
  formData: FormData
): Promise<{ success: boolean; error: string | null }> => {
  const formDefault = formData.get("is_default_shipping") != null
  const label = ((formData.get("address_name") as string) || "").trim()
  try {
    const { id, headers } = await me()
    const created = await gobitData<GobitAddress>(
      `/store/v1/customers/${id}/addresses`,
      {
        method: "POST",
        headers,
        body: {
          ...addressFrom(formData),
          is_default_billing: (currentState.isDefaultBilling as boolean) || formDefault || false,
          is_default_shipping: (currentState.isDefaultShipping as boolean) || formDefault || false,
        },
      }
    )
    if (label && created?.id) {
      // Adres kaydedildi; etiket yazılamazsa adres yine de kalır.
      await setAddressLabel(created.id, label, headers).catch(() => {})
    }
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
    if (formData.has("address_name")) {
      await setAddressLabel(addressId, (formData.get("address_name") as string) || "", headers).catch(() => {})
    }
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

// Google ile giriş (dtm /store/v1/dtm/auth/google): dtm Google'ın yetki
// adresini ve mühürlü bir state verir; state vitrinin çerezinde bekler, Google
// dönüşünde (/{ülke}/account/google-callback) karşılaştırılır ve kod dtm'ye
// verilir. dtm oturum çerezini (gobit_session) girişteki gibi döner. Google
// yapılandırılmamışsa dtm 503 der; düğme o zaman bu mesajı gösterir.
const GOOGLE_STATE_COOKIE = "_gobit_google_state"
const GOOGLE_SESSION_PREFIX = `${GOBIT_SESSION_COOKIE}=`
const GOOGLE_UNAVAILABLE = "Google ile giriş şu an kullanılamıyor. Lütfen e-posta ve şifrenizle giriş yapın."

export async function initiateGoogleLogin(): Promise<{ location?: string; error?: string }> {
  try {
    const r = await gobitData<{ location: string; state: string }>("/store/v1/dtm/auth/google", { method: "POST" })
    ;(await nextCookies()).set(GOOGLE_STATE_COOKIE, r.state, {
      httpOnly: true,
      // Google'dan dönen üst düzey yönlendirmede çerez gönderilsin diye "lax".
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 10,
    })
    return { location: r.location }
  } catch (e) {
    if (e instanceof GobitError && e.status === 503) return { error: GOOGLE_UNAVAILABLE }
    return { error: "Google ile giriş başlatılamadı. Lütfen tekrar deneyin." }
  }
}

export async function validateGoogleCallback(
  query: Record<string, unknown>
): Promise<{ success: boolean; error: string | null }> {
  const jar = await nextCookies()
  const kept = jar.get(GOOGLE_STATE_COOKIE)?.value
  jar.set(GOOGLE_STATE_COOKIE, "", { maxAge: -1, path: "/" })

  if (query.error) {
    return {
      success: false,
      error: query.error === "access_denied" ? "Google ile giriş iptal edildi." : "Google ile giriş yapılamadı.",
    }
  }
  const code = typeof query.code === "string" ? query.code : ""
  const state = typeof query.state === "string" ? query.state : ""
  if (!code || !state) return { success: false, error: "Google'dan dönen bilgiler eksik. Lütfen tekrar deneyin." }
  if (!kept || kept !== state) {
    return {
      success: false,
      error: "Google ile giriş doğrulanamadı (işlemin süresi dolmuş olabilir). Lütfen tekrar deneyin.",
    }
  }

  try {
    const res = await gobitResponse("/store/v1/dtm/auth/google/callback", { method: "POST", body: { code, state } })
    if (res.status === 503) return { success: false, error: GOOGLE_UNAVAILABLE }
    if (res.status === 429)
      return { success: false, error: "Çok fazla deneme yapıldı. Lütfen biraz sonra tekrar deneyin." }
    if (!res.ok) return { success: false, error: "Google ile giriş doğrulanamadı. Lütfen tekrar deneyin." }

    const body = (await res.json().catch(() => null)) as {
      data?: { status?: string; first_name?: string; last_name?: string }
    } | null
    const session = res.headers
      .getSetCookie()
      .map((c) => c.split(";")[0])
      .find((c) => c.startsWith(`${GOOGLE_SESSION_PREFIX}`))
    if (!session) return { success: false, error: "Giriş yapılamadı: oturum açılmadı." }
    await setAuthToken(session.slice(GOOGLE_SESSION_PREFIX.length))

    // Yeni açılan hesaba Google'daki ad ve soyad yazılır.
    const g = body?.data
    if (g?.status === "created" && (g.first_name || g.last_name)) {
      const { id, headers } = await me()
      await gobitFetch(`/store/v1/customers/${id}`, {
        method: "PUT",
        headers,
        body: { first_name: g.first_name || "", last_name: g.last_name || "" },
      }).catch(() => {})
    }
    revalidateTag(await getCacheTag("customers"))
    await transferCart().catch(() => {})

    return { success: true, error: null }
  } catch {
    return { success: false, error: "Google ile giriş yapılamadı." }
  }
}
