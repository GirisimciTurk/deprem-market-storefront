"use server"

import { gobitData } from "@lib/gobit/client"
import { getCacheOptions } from "./cookies"

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
