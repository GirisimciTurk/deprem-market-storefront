"use server"

import { revalidateTag } from "next/cache"
import { GobitError, gobitData, gobitFetch } from "@lib/gobit/client"
import { getAuthHeaders } from "./cookies"
import type { ExpertReview } from "./experts"

/** Uzmana iletişim talebi (dtm): giriş gerekir. */
export async function sendExpertRequest(
  slug: string,
  input: { name: string; phone: string; email?: string; city?: string; topic?: string; message?: string }
): Promise<{ success: boolean; error: string | null }> {
  const headers = await getAuthHeaders()
  if (!headers.cookie) return { success: false, error: "Uzmana talep göndermek için giriş yapın." }
  try {
    await gobitFetch(`/store/v1/dtm/experts/${encodeURIComponent(slug)}/requests`, {
      method: "POST",
      headers,
      body: {
        sender_name: input.name,
        phone: input.phone,
        email: input.email ?? "",
        city: input.city ?? "",
        topic: input.topic ?? "",
        message: input.message ?? "",
      },
    })
    return { success: true, error: null }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) }
  }
}

/** Uzmana değerlendirme (dtm): giriş gerekir; her hesap bir uzmana bir kez yazar. */
export async function writeExpertReview(
  slug: string,
  input: { author_name: string; rating: number; body: string; declaration: boolean; job_id?: string }
): Promise<{ success: boolean; error: string | null; unauthorized?: boolean }> {
  const headers = await getAuthHeaders()
  if (!headers.cookie) {
    return { success: false, error: "Değerlendirme yazmak için giriş yapın.", unauthorized: true }
  }
  try {
    await gobitFetch(`/store/v1/dtm/experts/${encodeURIComponent(slug)}/reviews`, {
      method: "POST",
      headers,
      body: {
        author_name: input.author_name,
        rating: input.rating,
        body: input.body,
        declaration: input.declaration,
        job_id: input.job_id ?? "",
      },
    })
    // Kart puanı ve yorum listesi "experts" etiketiyle önbellekte.
    revalidateTag("experts")
    return { success: true, error: null }
  } catch (e) {
    return { success: false, ...reviewError(e) }
  }
}

/** Hesabın bu uzmana yazdığı değerlendirme; yoksa (ya da giriş yoksa) null. */
export async function getMyExpertReview(slug: string): Promise<ExpertReview | null> {
  const headers = await getAuthHeaders()
  if (!headers.cookie) return null
  return gobitData<ExpertReview>(`/store/v1/dtm/experts/${encodeURIComponent(slug)}/reviews/mine`, {
    headers,
    cache: "no-store",
  }).catch((e) => {
    if (e instanceof GobitError && (e.status === 404 || e.status === 401)) return null
    throw e
  })
}

// gobit'in İngilizce hata metinlerini ziyaretçiye Türkçe anlatır.
function reviewError(e: unknown): { error: string; unauthorized?: boolean } {
  if (!(e instanceof GobitError)) return { error: "Değerlendirme gönderilemedi. Lütfen tekrar deneyin." }
  if (e.status === 401) return { error: "Oturumunuzun süresi dolmuş; lütfen tekrar giriş yapın.", unauthorized: true }
  if (e.status === 409) return { error: "Bu uzmanı daha önce değerlendirdiniz." }
  if (e.status === 404) return { error: "Bu profil artık yayında değil." }
  if (e.status === 429) return { error: "Çok fazla deneme yapıldı; biraz sonra tekrar deneyin." }
  if (/own card/.test(e.message)) return { error: "Kendi profilinizi değerlendiremezsiniz." }
  if (/not a job this expert/.test(e.message)) return { error: "Bu iş numarası bu uzmanın tamamladığı bir işe ait değil." }
  if (e.status === 403) return { error: "Bu iş numarası hesabınızdan açılmış bir talebe ait değil." }
  return { error: "Değerlendirme gönderilemedi. Lütfen bilgileri kontrol edip tekrar deneyin." }
}
