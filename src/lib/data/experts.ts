import { gobitData } from "@lib/gobit/client"
import type { ProviderType } from "@lib/expert-config"

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

// dtm'nin uzman kartları (/store/v1/dtm/experts): yayımlanmış ve gizlenmemiş
// kartlar. İletişimini gizleyen uzmanın telefonu ve e-postası gelmez.
export type DtmExpert = {
  slug?: string
  kind: string
  full_name: string
  title: string
  headline: string
  about: string
  photo_url: string
  city: string
  district: string
  service_provinces: string[]
  nationwide: boolean
  specialties: string[]
  experience_years: number | null
  chamber: string
  phone: string
  whatsapp: string
  email: string
  contact_hidden: boolean
  verified: boolean
  rating_avg: number | null
  rating_count: number
  updated_at?: string
}

export const toExpert = (e: DtmExpert): Expert =>
  ({
    slug: e.slug ?? "",
    provider_type: e.kind as ProviderType,
    full_name: e.full_name,
    title: e.title || e.headline,
    city: e.city,
    district: e.district,
    specializations: e.specialties ?? [],
    verified_specializations: e.verified ? e.specialties ?? [] : [],
    experience_years: e.experience_years,
    imo_member: /İMO|IMO/i.test(e.chamber || ""),
    service_areas: e.nationwide ? "Tüm Türkiye" : (e.service_provinces ?? []).join(", "),
    service_regions: (e.service_provinces ?? []).map((city) => ({ city })),
    about: e.about,
    photo_url: e.photo_url,
    verified: e.verified,
    document_count: 0,
    phone: e.contact_hidden ? "" : e.phone,
    email: e.contact_hidden ? "" : e.email,
    whatsapp: e.contact_hidden ? "" : e.whatsapp,
    published_at: e.updated_at ?? null,
    rating_avg: e.rating_avg,
    rating_count: e.rating_count,
  }) as Expert

/** Yayınlanmış uzman & uygulayıcı dizini. */
export const listExperts = async (params: ExpertListParams = {}): Promise<ExpertListResult> => {
  const limit = params.limit ?? 24
  const offset = params.offset ?? 0

  return gobitData<{ items: DtmExpert[]; total: number }>("/store/v1/dtm/experts", {
    query: {
      kind: params.type,
      city: params.city,
      district: params.district,
      specialty: params.specialization,
      q: params.q,
      limit,
      offset,
    },
    next: { revalidate: 60, tags: ["experts"] },
  })
    .then((p) => ({ experts: p.items.map(toExpert), count: p.total, offset, limit }))
    .catch(() => ({ experts: [], count: 0, offset, limit }))
}

/** Tek yayınlanmış kart; bulunamazsa null. */
export const getExpert = async (slug: string): Promise<Expert | null> => {
  return gobitData<DtmExpert>(`/store/v1/dtm/experts/${encodeURIComponent(slug)}`, {
    next: { revalidate: 60, tags: ["experts"] },
  })
    .then(toExpert)
    .catch(() => null)
}

