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
}

export type StoreSellerResponse = {
  seller: StoreSeller
  product_ids: string[]
  count: number
}

export const getSellerByHandle = async (
  handle: string
): Promise<StoreSellerResponse | null> => {
  const next = {
    ...(await getCacheOptions("sellers")),
  }

  return await sdk.client
    .fetch<StoreSellerResponse>(`/store/sellers/${handle}`, {
      next,
      cache: "force-cache",
    })
    .catch(() => null)
}
