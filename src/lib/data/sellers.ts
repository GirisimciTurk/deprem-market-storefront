"use server"

import { revalidateTag } from "next/cache"
import { gobitData, gobitResponse } from "@lib/gobit/client"
import { getAuthHeaders, getCacheOptions } from "./cookies"

export type StoreSeller = {
  id: string
  handle: string
  name: string
  logo?: string | null
  description?: string | null
  is_house: boolean
  rating_avg?: number | null
  rating_count?: number | null
  trusted?: boolean
  follower_count?: number
}

export type StoreSellerResponse = {
  seller: StoreSeller
  product_ids: string[]
  count: number
}

export type FeaturedSeller = {
  id: string
  handle: string
  name: string
  logo?: string | null
  description?: string | null
  is_featured: boolean
  rating_avg?: number | null
  rating_count?: number | null
  trusted?: boolean
  follower_count?: number
}

// dtm'nin vitrin dizini (/store/v1/dtm/sellers): ad, tanıtım, puan (bir
// ondalık), yorum sayısı, Güvenilir Mağaza rozeti, takipçi sayısı.
type DirectoryEntry = {
  handle: string
  name: string
  description: string
  featured: boolean
  rating_avg: number | null
  review_count: number
  trusted: boolean
  follower_count: number
}

const toSeller = (e: DirectoryEntry): FeaturedSeller => ({
  id: e.handle,
  handle: e.handle,
  name: e.name,
  logo: null,
  description: e.description,
  is_featured: e.featured,
  rating_avg: e.rating_avg,
  rating_count: e.review_count,
  trusted: e.trusted,
  follower_count: e.follower_count,
})

async function sellersNext(revalidate: number) {
  const cacheOpts = await getCacheOptions("sellers")

  return { ...cacheOpts, tags: [...("tags" in cacheOpts ? cacheOpts.tags : []), "sellers"], revalidate }
}

/** Öne çıkan (featured) aktif mağazalar. */
export const listFeaturedSellers = async (): Promise<FeaturedSeller[]> => {
  return (await listSellers()).filter((s) => s.is_featured)
}

/** Tüm aktif mağazalar (/satici). */
export const listSellers = async (): Promise<FeaturedSeller[]> => {
  const next = await sellersNext(60)

  return gobitData<DirectoryEntry[]>(`/store/v1/dtm/sellers`, { query: { limit: 100 }, next })
    .then((rs) => rs.map(toSeller))
    .catch(() => [])
}

export const getSellerByHandle = async (handle: string): Promise<StoreSellerResponse | null> => {
  const next = await sellersNext(30)
  try {
    const [entry, page] = await Promise.all([
      gobitData<DirectoryEntry>(`/store/v1/dtm/sellers/${encodeURIComponent(handle)}`, { next }),
      gobitData<{ product_ids: string[]; count: number }>(
        `/store/v1/dtm/sellers/${encodeURIComponent(handle)}/products`,
        { query: { limit: 100 }, next }
      ),
    ])

    return { seller: { ...toSeller(entry), is_house: false }, product_ids: page.product_ids, count: page.count }
  } catch {
    return null
  }
}

/** Oturumdaki müşterinin takip ettiği mağazaların handle'ları; oturum yoksa null. */
export const followedSellerHandles = async (): Promise<string[] | null> => {
  const headers = await getAuthHeaders()
  if (!headers.cookie) return null

  return gobitData<DirectoryEntry[]>("/store/v1/dtm/followed-sellers", { headers, cache: "no-store" })
    .then((rs) => rs.map((r) => r.handle))
    .catch(() => null)
}

async function follow(handle: string, method: "PUT" | "DELETE"): Promise<boolean> {
  const headers = await getAuthHeaders()
  if (!headers.cookie) return false
  const res = await gobitResponse(`/store/v1/dtm/sellers/${encodeURIComponent(handle)}/follow`, { method, headers })
  // Mağaza sayfasının takipçi sayısı önbellekten okunur: takip onu eskitir.
  if (res.ok) revalidateTag("sellers")

  return res.ok
}

export const followSeller = async (handle: string) => follow(handle, "PUT")
export const unfollowSeller = async (handle: string) => follow(handle, "DELETE")

export type SellerPoint = {
  id: string
  name: string
  kinds: ("sales" | "showroom" | "installation")[]
  address: string
  district: string
  city: string
  phone: string
  hours: string
  latitude?: number
  longitude?: number
  is_primary: boolean
}

/** Mağazanın yayımlanmış fiziksel noktaları (satış, teşhir, uygulama). */
export const getSellerPoints = async (handle: string): Promise<SellerPoint[]> => {
  return gobitData<SellerPoint[]>(`/store/v1/dtm/sellers/${encodeURIComponent(handle)}/locations`, {
    next: await sellersNext(60),
  }).catch(() => [])
}

/** Mağazanın anlaşmalı uzmanları (uygulayıcıları). */
export const getSellerExperts = async (handle: string) => {
  const { toExpert } = await import("./experts")
  type Raw = Parameters<typeof toExpert>[0]

  return gobitData<Raw[]>(`/store/v1/dtm/sellers/${encodeURIComponent(handle)}/experts`, {
    next: await sellersNext(60),
  })
    .then((rs) => rs.map(toExpert))
    .catch(() => [])
}
