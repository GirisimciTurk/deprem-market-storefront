"use server"

import { HttpTypes } from "@medusajs/types"
import { SALES_CHANNEL_ID, gobitFetch } from "@lib/gobit/client"
import { GobitProduct, toProduct } from "@lib/gobit/adapt"

/** Varyant, ürünüyle birlikte: gobit listesi varyant kimliğiyle süzer. */
export const retrieveVariant = async (variant_id: string): Promise<HttpTypes.StoreProductVariant | null> => {
  return gobitFetch<{ data: GobitProduct[] }>(`/store/v1/sales-channels/${SALES_CHANNEL_ID}/products`, {
    query: { variant_id: [variant_id], limit: 1 },
    next: { revalidate: 30, tags: ["products"] },
  })
    .then(({ data }) => {
      const product = data[0] ? toProduct(data[0]) : null
      const variant = (product?.variants ?? []).find((v) => v.id === variant_id)

      return variant ? ({ ...variant, product, images: product?.images ?? [] } as any) : null
    })
    .catch(() => null)
}
