"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"

import { getAuthHeaders, getCacheOptions } from "./cookies"

export const retrieveVariant = async (
  variant_id: string
): Promise<HttpTypes.StoreProductVariant | null> => {
  const authHeaders = await getAuthHeaders()

  if (!authHeaders) return null

  const headers = {
    ...authHeaders,
  }

  // Varyant resim/bilgi güncellemeleri yansısın: ISR (≤30sn) + statik "products"
  // tag (backend güncellemesinde revalidateTag ile anında tazelenir).
  const cacheOpts = await getCacheOptions("variants")
  const next = {
    ...cacheOpts,
    tags: [...("tags" in cacheOpts ? cacheOpts.tags : []), "products"],
    revalidate: 30,
  }

  return await sdk.client
    .fetch<{ variant: HttpTypes.StoreProductVariant }>(
      `/store/product-variants/${variant_id}`,
      {
        method: "GET",
        query: {
          fields: "*images",
        },
        headers,
        next,
      }
    )
    .then(({ variant }) => variant)
    .catch(() => null)
}
