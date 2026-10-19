"use server"

import { revalidateTag } from "next/cache"
import { GobitError, gobitData } from "@lib/gobit/client"
import { getExpertHeaders } from "./cookies"

// Oturumdaki uzman hesabının kendi kartı (dtm /store/v1/dtm/experts/me…): düzenleme,
// yayın, fotoğraf, gelen talepler ve değerlendirmelere yanıt. Uzman hesabı
// müşteri hesabından ayrıdır (expert-auth.ts); istekler uzman oturumuyla gider.
// Kartı yalnız sahibi görür; herkese açık okuma lib/data/experts.ts'te.

/** Sahibin gördüğü kart: taslak/inceleme durumu ve operatörün gerekçeleri dahil. */
export type MyExpertCard = {
  id: string
  slug: string
  kind: "engineer" | "implementer"
  full_name: string
  title: string
  headline: string
  about: string
  photo_url: string
  city: string
  district: string
  address: string
  service_provinces: string[]
  nationwide: boolean
  specialties: string[]
  experience_years: number | null
  chamber: string
  registry_no: string
  phone: string
  whatsapp: string
  email: string
  website: string
  contact_hidden: boolean
  verified: boolean
  rating_avg: number | null
  rating_count: number
  published: boolean
  /** "pending": operatör inceleyecek; "rejected": gerekçesiyle geri gönderildi. */
  screening?: "" | "pending" | "rejected"
  screening_reason?: string
  hidden?: boolean
  hidden_reason?: string
  updated_at?: string
}

/** PUT her alanı yazar; fotoğraf ayrı uçtan (denetlenerek) gelir. */
export type MyExpertInput = Omit<
  MyExpertCard,
  | "id"
  | "slug"
  | "photo_url"
  | "verified"
  | "rating_avg"
  | "rating_count"
  | "published"
  | "screening"
  | "screening_reason"
  | "hidden"
  | "hidden_reason"
  | "updated_at"
>

export type InboxRequest = {
  id: string
  sender_name: string
  phone: string
  email: string
  city: string
  topic: string
  message: string
  status: "new" | "read" | "closed"
  created_at: string
}

export type OwnReview = {
  id: string
  author_name: string
  rating: number
  body: string
  reply: string
  verified_job: boolean
  status: "published" | "hidden"
  hidden_reason?: string
  created_at: string
}

type Result<T> = { ok: true; data: T } | { ok: false; error: string; unauthorized?: boolean }

const SIGN_IN = "Bu işlem için uzman hesabınızla giriş yapın."

async function headersOrNull() {
  const headers = await getExpertHeaders()
  return headers.cookie ? headers : null
}

// gobit'in İngilizce doğrulama metinlerini kart sahibine Türkçe anlatır.
const FIELD_TR: Record<string, string> = {
  declaration: "beyan onayı",
  city: "il",
  specialty: "en az bir uzmanlık alanı",
  contact: "en az bir iletişim kanalı",
}

function tr(e: unknown): { error: string; unauthorized?: boolean } {
  if (!(e instanceof GobitError)) return { error: "İşlem tamamlanamadı. Lütfen tekrar deneyin." }
  const m = e.message
  if (e.status === 401) return { error: "Oturumunuzun süresi dolmuş; lütfen tekrar giriş yapın.", unauthorized: true }
  if (e.status === 409) return { error: "Kartınız başka bir sekmede değişmiş; sayfayı yenileyip tekrar deneyin." }
  if (e.status === 429) return { error: "Çok fazla deneme yapıldı; biraz sonra tekrar deneyin." }
  const needs = m.match(/publishing needs: (.+)$/)
  if (needs) {
    const list = needs[1].split(/,\s*/).map((k) => FIELD_TR[k] ?? k)
    return { error: `Yayınlamak için eksik: ${list.join(", ")}.` }
  }
  const photo = m.match(/the photo was not accepted: (.+)$/)
  if (photo) return { error: `Fotoğraf kabul edilmedi: ${photo[1]}` }
  if (/JPEG, PNG or WebP/.test(m)) return { error: "Fotoğraf JPG, PNG veya WEBP olmalı." }
  if (/3 MB/.test(m)) return { error: "Fotoğraf en fazla 3 MB olabilir." }
  if (/could not be checked/.test(m)) return { error: "Fotoğraf şu an kontrol edilemedi; biraz sonra tekrar deneyin." }
  if (/not one of Türkiye's 81 provinces/.test(m)) return { error: "İl, Türkiye'nin 81 ilinden biri olmalı." }
  if (/email is not an address/.test(m)) return { error: "E-posta adresi geçersiz." }
  if (/website is not a web address/.test(m)) return { error: "Web sitesi https:// ile başlayan geçerli bir adres olmalı." }
  if (/longer than (\d+) characters/.test(m)) {
    const [, col, n] = m.match(/(\w+) is longer than (\d+)/) ?? []
    return { error: `${col ?? "Bir alan"} en fazla ${n} karakter olabilir.` }
  }
  if (/a card needs a name/.test(m)) return { error: "Ad soyad zorunlu." }
  if (/experience_years/.test(m)) return { error: "Deneyim 0–70 yıl arasında olmalı." }
  if (/no expert card/.test(m)) return { error: "Henüz bir uzman kartınız yok." }
  return { error: "İşlem tamamlanamadı. Lütfen bilgileri kontrol edip tekrar deneyin." }
}

async function run<T>(fn: (headers: Record<string, string>) => Promise<T>): Promise<Result<T>> {
  const headers = await headersOrNull()
  if (!headers) return { ok: false, error: SIGN_IN, unauthorized: true }
  try {
    return { ok: true, data: await fn(headers) }
  } catch (e) {
    return { ok: false, ...tr(e) }
  }
}

/** Kendi kartım; hiç yoksa null. */
export async function getMyExpert(): Promise<MyExpertCard | null> {
  const headers = await headersOrNull()
  if (!headers) return null
  return gobitData<MyExpertCard>("/store/v1/dtm/experts/me", { headers, cache: "no-store" }).catch(
    (e) => {
      // Kart yok (404) ya da uzman oturumu düşmüş (401): sayfa girişi ister.
      if (e instanceof GobitError && (e.status === 404 || e.status === 401)) return null
      throw e
    }
  )
}

export async function saveMyExpert(input: MyExpertInput): Promise<Result<MyExpertCard>> {
  return run(async (headers) => {
    const out = await gobitData<MyExpertCard>("/store/v1/dtm/experts/me", {
      method: "PUT",
      headers,
      body: { ...input, photo_url: "" },
    })
    revalidateTag("experts")
    return out
  })
}

export async function publishMyExpert(published: boolean, declaration: boolean): Promise<Result<MyExpertCard>> {
  return run(async (headers) => {
    const out = await gobitData<MyExpertCard>("/store/v1/dtm/experts/me/publish", {
      method: "POST",
      headers,
      body: { published, declaration },
    })
    revalidateTag("experts")
    return out
  })
}

/** FormData'nın "file" alanındaki fotoğrafı yükler (gobit denetleyip kabul eder). */
export async function uploadMyExpertPhoto(form: FormData): Promise<Result<MyExpertCard>> {
  const file = form.get("file")
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Bir fotoğraf seçin." }
  if (file.size > 3 * 1024 * 1024) return { ok: false, error: "Fotoğraf en fazla 3 MB olabilir." }
  const body = new FormData()
  body.set("file", file, file.name)
  return run(async (headers) => {
    const out = await gobitData<MyExpertCard>("/store/v1/dtm/experts/me/photo", { method: "POST", headers, form: body })
    revalidateTag("experts")
    return out
  })
}

export async function removeMyExpertPhoto(): Promise<Result<MyExpertCard>> {
  return run(async (headers) => {
    const out = await gobitData<MyExpertCard>("/store/v1/dtm/experts/me/photo", { method: "DELETE", headers })
    revalidateTag("experts")
    return out
  })
}

export async function listMyExpertReviews(): Promise<OwnReview[]> {
  const headers = await headersOrNull()
  if (!headers) return []
  return gobitData<{ items: OwnReview[] }>("/store/v1/dtm/experts/me/reviews", {
    headers,
    query: { limit: 50 },
    cache: "no-store",
  })
    .then((p) => p.items ?? [])
    .catch(() => [])
}

/** Yoruma yanıt yazar; boş metin yanıtı kaldırır. */
export async function replyToExpertReview(id: string, reply: string): Promise<Result<OwnReview>> {
  return run(async (headers) => {
    const out = await gobitData<OwnReview>(`/store/v1/dtm/expert-reviews/${encodeURIComponent(id)}/reply`, {
      method: "POST",
      headers,
      body: { reply },
    })
    revalidateTag("experts")
    return out
  })
}

export async function getExpertInbox(): Promise<{ items: InboxRequest[]; new: number }> {
  const headers = await headersOrNull()
  if (!headers) return { items: [], new: 0 }
  return gobitData<{ items: InboxRequest[]; new: number }>("/store/v1/dtm/expert-inbox", {
    headers,
    query: { limit: 50 },
    cache: "no-store",
  })
    .then((p) => ({ items: p.items ?? [], new: p.new ?? 0 }))
    .catch(() => ({ items: [], new: 0 }))
}

export async function moveInboxRequest(id: string, status: "read" | "closed"): Promise<Result<InboxRequest>> {
  return run((headers) =>
    gobitData<InboxRequest>(`/store/v1/dtm/expert-inbox/${encodeURIComponent(id)}/status`, {
      method: "POST",
      headers,
      body: { status },
    })
  )
}
