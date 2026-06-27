"use server"

import { sdk } from "@lib/config"
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
}

/** Öne çıkan (featured) aktif bayiler — mağazada öne çıkma vitrini (PDF Slayt 4). */
export const listFeaturedSellers = async (): Promise<FeaturedSeller[]> => {
  const cacheOpts = await getCacheOptions("sellers")
  const next = {
    ...cacheOpts,
    tags: [...("tags" in cacheOpts ? cacheOpts.tags : []), "sellers"],
    revalidate: 60,
  }
  return await sdk.client
    .fetch<{ sellers: FeaturedSeller[] }>(`/store/sellers`, {
      query: { featured: "1" },
      next,
    })
    .then((r) => r.sellers || [])
    .catch(() => [])
}

export const getSellerByHandle = async (
  handle: string
): Promise<StoreSellerResponse | null> => {
  // Mağaza bilgisi/logo + ürün listesi güncellemeleri yansısın: ISR (≤30sn) + statik
  // "sellers" tag (backend güncellemesinde revalidateTag ile anında tazelenir).
  const cacheOpts = await getCacheOptions("sellers")
  const next = {
    ...cacheOpts,
    tags: [...("tags" in cacheOpts ? cacheOpts.tags : []), "sellers"],
    revalidate: 30,
  }

  return await sdk.client
    .fetch<StoreSellerResponse>(`/store/sellers/${handle}`, {
      next,
    })
    .catch(() => null)
}
