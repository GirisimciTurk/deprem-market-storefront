"use server"

import { revalidateTag } from "next/cache"
import { sdk } from "@lib/config"
import type { DocType, ProviderType } from "@lib/expert-config"
import {
  EXPERT_EMAIL_TAKEN_MESSAGE,
  splitFullName,
  validateExpertSignup,
  type ExpertSignup,
} from "@lib/util/expert-card"
import { normalizeTrPhone, toAccountPhone } from "@lib/util/tr-phone"
import {
  getAuthHeaders,
  getCacheTag,
  removeAuthToken,
  setAuthToken,
} from "./cookies"
import { transferCart } from "./customer"

export interface Expert {
  slug: string
  provider_type: ProviderType
  full_name: string
  title: string
  city: string
  district: string
  specializations: string[]
  verified_specializations: string[]
  experience_years: number | null
  imo_member: boolean
  service_areas: string
  service_regions: { city: string; district?: string }[]
  about: string
  photo_url: string
  verified: boolean
  document_count: number
  phone: string
  email: string
  whatsapp: string
  published_at: string | null
}

export interface ExpertListParams {
  type?: string
  city?: string
  district?: string
  specialization?: string
  q?: string
  limit?: number
  offset?: number
}

export interface ExpertListResult {
  experts: Expert[]
  count: number
  offset: number
  limit: number
}

/** Yayınlanmış (doğrulanmış) uzman & uygulayıcı dizini. */
export const listExperts = async (
  params: ExpertListParams = {}
): Promise<ExpertListResult> => {
  const query: Record<string, string | number> = {}
  if (params.type) query.type = params.type
  if (params.city) query.city = params.city
  if (params.district) query.district = params.district
  if (params.specialization) query.specialization = params.specialization
  if (params.q) query.q = params.q
  query.limit = params.limit ?? 24
  query.offset = params.offset ?? 0

  return sdk.client
    .fetch<ExpertListResult>(`/store/experts`, {
      method: "GET",
      query,
      // Dizin sık değişmez; kısa ISR ile tazele (yeni yayınlar ~1 dk içinde görünür).
      next: { revalidate: 60, tags: ["experts"] },
    })
    .catch(() => ({ experts: [], count: 0, offset: 0, limit: 24 }))
}

/** Tek yayınlanmış profil; bulunamazsa null. */
export const getExpert = async (slug: string): Promise<Expert | null> => {
  return sdk.client
    .fetch<{ expert: Expert }>(`/store/experts/${encodeURIComponent(slug)}`, {
      method: "GET",
      next: { revalidate: 60, tags: ["experts"] },
    })
    .then((r) => r.expert)
    .catch(() => null)
}

// ── Giriş yapmış müşterinin kendi uzman kartı (Hesabım → Uzman Kartım) ──────

export type ExpertRegion = { city: string; district?: string }
export type ExpertDocument = { type: DocType; url: string; name?: string }

/** /store/expert-leads/me görünümü: kartın sahibine dönen alanlar. */
export interface MyExpert {
  id: string
  full_name: string
  title: string
  email: string
  phone: string
  city: string
  district: string
  specializations: string[]
  verified_specializations: string[] | null
  experience_years: number | null
  imo_member: boolean
  about: string
  photo_url: string
  whatsapp: string
  show_phone: boolean
  show_email: boolean
  service_regions: ExpertRegion[] | null
  documents: ExpertDocument[] | null
  status: "new" | "contacted" | "approved" | "archived" | string
  is_published: boolean
  published_at: string | null
  slug: string | null
}

/** "Uzman ol" kısa formu: kart bu alanlarla açılır, gerisi karttan düzenlenir. */
export type ExpertCardCreateInput = {
  full_name: string
  title?: string
  phone: string
  city: string
  district: string
  specializations: string[]
}

/** Kart sahibinin düzenleyebildiği alanlar (yayın/durum/slug yalnız admin'de). */
export type ExpertCardUpdateInput = Partial<{
  full_name: string
  title: string
  phone: string
  city: string
  district: string
  specializations: string[]
  experience_years: number | null
  imo_member: boolean
  about: string
  photo_url: string
  whatsapp: string
  show_phone: boolean
  show_email: boolean
  service_regions: ExpertRegion[]
  documents: ExpertDocument[]
}>

export type ExpertCardResult = {
  expert: MyExpert | null
  error: string | null
  status?: number
}

const errorOf = (e: unknown, fallback: string) => ({
  message: e instanceof Error && e.message ? e.message : fallback,
  status: (e as { status?: number })?.status,
})

/**
 * Giriş yapmış müşterinin uzman kartı. Kart yoksa (404) `expert: null, error: null`;
 * giriş yoksa ya da backend'e ulaşılamazsa `error` dolu döner — sayfa "kart yok"
 * ile "okunamadı"yı karıştırmasın.
 */
export async function getMyExpert(): Promise<ExpertCardResult> {
  const headers = { ...(await getAuthHeaders()) }
  if (!("authorization" in headers)) {
    return { expert: null, error: "Giriş yapmalısınız.", status: 401 }
  }
  try {
    const r = await sdk.client.fetch<{ expert: MyExpert }>(
      `/store/expert-leads/me`,
      { method: "GET", headers, cache: "no-store" }
    )
    return { expert: r.expert, error: null }
  } catch (e) {
    const { message, status } = errorOf(e, "Uzman kartı okunamadı.")
    if (status === 404) return { expert: null, error: null, status }
    return { expert: null, error: message, status }
  }
}

/** "Uzman ol": giriş yapmış müşteriye kart açar (yayın admin doğrulamasıyla). */
export async function createExpertCard(
  input: ExpertCardCreateInput
): Promise<ExpertCardResult> {
  const headers = { ...(await getAuthHeaders()) }
  if (!("authorization" in headers)) {
    return { expert: null, error: "Giriş yapmalısınız.", status: 401 }
  }
  try {
    const r = await sdk.client.fetch<{ expert: MyExpert }>(
      `/store/expert-leads`,
      { method: "POST", headers, body: input }
    )
    return { expert: r.expert, error: null }
  } catch (e) {
    const { message, status } = errorOf(e, "Uzman kartı açılamadı.")
    return { expert: null, error: message, status }
  }
}

/**
 * Kart sahibinin düzenlemesi. Yayındaki kartın değişikliği doğrudan yayına
 * geçer; dizinin ISR önbelleği ("experts" etiketi) bu yüzden hemen tazelenir.
 */
export async function updateMyExpert(
  input: ExpertCardUpdateInput
): Promise<ExpertCardResult> {
  const headers = { ...(await getAuthHeaders()) }
  if (!("authorization" in headers)) {
    return { expert: null, error: "Giriş yapmalısınız.", status: 401 }
  }
  try {
    const r = await sdk.client.fetch<{ expert: MyExpert }>(
      `/store/expert-leads/me`,
      { method: "POST", headers, body: input }
    )
    if (r.expert?.is_published) revalidateTag("experts")
    return { expert: r.expert, error: null }
  } catch (e) {
    const { message, status } = errorOf(e, "Değişiklikler kaydedilemedi.")
    return { expert: null, error: message, status }
  }
}

// ── Tek adımlı "Uzman ol": giriş yapmamış ziyaretçiye hesap + kart ──────────

export type ExpertSignupInput = ExpertSignup

export type ExpertSignupResult =
  | { ok: true }
  | {
      ok: false
      /**
       * invalid: alanlar geçersiz; email_taken: bu e-postanın hesabı var (Uzman
       * Girişi); account_failed: hesap açılamadı, oturum yok; card_failed: hesap
       * açıldı ve oturum açık, yalnız kart açılamadı (yeniden denenebilir).
       */
      code: "invalid" | "email_taken" | "account_failed" | "card_failed"
      error: string
    }

/**
 * Medusa'nın emailpass sağlayıcısı, sahibi olan bir kimlikle kayıt denemesini
 * 401 "Identity with email already exists" ile reddeder (sahipsiz kimlik
 * yeniden kaydı kabul eder, o yüzden bu ileti gerçekten "hesap var" demektir).
 */
const isEmailTaken = (e: unknown) =>
  e instanceof Error && /identity with email already exists/i.test(e.message)

/**
 * "Uzman ol" formunun giriş yapmamış hâli: müşteri hesabını açar, oturumu
 * kurar (signup ile aynı adımlar: register → müşteri → login → önbellek →
 * sepet aktarımı) ve ardından uzman kartını açar. Kartı zaten varsa (409)
 * başarı sayılır; istemci Uzman Kartım'a gider.
 */
export async function signupExpert(
  input: ExpertSignupInput
): Promise<ExpertSignupResult> {
  const invalid = validateExpertSignup(input)
  if (invalid) return { ok: false, code: "invalid", error: invalid }

  const email = input.email.trim()
  const password = input.password
  const fullName = input.full_name.trim()

  let token: unknown
  try {
    token = await sdk.auth.register("customer", "emailpass", {
      email,
      password,
    })
  } catch (e) {
    if (isEmailTaken(e)) {
      return { ok: false, code: "email_taken", error: EXPERT_EMAIL_TAKEN_MESSAGE }
    }
    return {
      ok: false,
      code: "account_failed",
      error: "Hesabınız oluşturulamadı. Lütfen tekrar deneyin.",
    }
  }

  try {
    await setAuthToken(token as string)
    const headers = { ...(await getAuthHeaders()) }
    // Hesap telefonu yalnız cep numarasıysa saklanır ("+905…"); sabit hat
    // yalnız kartta kalır.
    const accountPhone = toAccountPhone(input.phone)
    await sdk.store.customer.create(
      {
        email,
        ...splitFullName(fullName),
        ...(accountPhone ? { phone: accountPhone } : {}),
      },
      {},
      headers
    )
    const loginToken = await sdk.auth.login("customer", "emailpass", {
      email,
      password,
    })
    await setAuthToken(loginToken as string)
  } catch {
    // Kayıt jetonu bir müşteriye bağlı değil; yarım oturum bırakma.
    await removeAuthToken()
    return {
      ok: false,
      code: "account_failed",
      error: "Hesabınız oluşturulamadı. Lütfen tekrar deneyin.",
    }
  }

  const customerCacheTag = await getCacheTag("customers")
  revalidateTag(customerCacheTag)
  try {
    await transferCart()
  } catch {
    // Sepet aktarılamadı diye açılmış hesabın kartı engellenmez.
  }

  const card = await createExpertCard({
    full_name: fullName,
    phone: normalizeTrPhone(input.phone),
    city: input.city.trim(),
    district: input.district.trim(),
    specializations: input.specializations,
  })
  if (card.expert || card.status === 409) return { ok: true }
  return {
    ok: false,
    code: "card_failed",
    error: `Hesabınız açıldı ve giriş yaptınız, ancak uzman kartınız açılamadı${
      card.error ? ` (${card.error})` : ""
    }. Bilgileriniz duruyor; "Uzman Kartımı Aç" düğmesine tekrar basın.`,
  }
}
