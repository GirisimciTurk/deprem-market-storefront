"use server"

import { SALES_CHANNEL_ID, gobitData } from "@lib/gobit/client"

/**
 * "Birlikte alınanlar": gobit'in ilgili ürünleri
 * (/store/v1/sales-channels/{id}/products/{id}/related). Hata/boş → []; çağıran
 * bölüm gizlenir.
 */
export async function getBoughtTogetherIds(productId: string): Promise<string[]> {
  if (!productId) return []

  return gobitData<{ id: string }[]>(
    `/store/v1/sales-channels/${SALES_CHANNEL_ID}/products/${encodeURIComponent(productId)}/related`,
    { next: { revalidate: 1800 } }
  )
    .then((ps) => ps.slice(0, 8).map((p) => p.id))
    .catch(() => [])
}
