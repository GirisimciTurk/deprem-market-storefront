import { sdk } from "@lib/config"
import type { ProviderType } from "@lib/expert-config"

export interface Expert {
  slug: string
  provider_type: ProviderType
  full_name: string
  title: string
  city: string
  district: string
  specializations: string[]
  experience_years: number | null
  imo_member: boolean
  service_areas: string
  about: string
  photo_url: string
  verified: boolean
  document_count: number
  membership_tier: "none" | "basic" | "premium"
  featured: boolean
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
