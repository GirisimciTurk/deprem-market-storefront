"use server"

import { SALES_CHANNEL_ID, gobitData } from "@lib/gobit/client"

const LIMIT = 8

/**
 * "Birlikte alınanlar": dtm'nin /store/v1/dtm/recommendations okuması (aynı
 * siparişlerde geçen ürünler, sipariş sayısına göre). Liste boşsa operatörün
 * elle bağladığı ilgili ürünlere (/products/{id}/related) düşer. Hata/boş → [];
 * çağıran bölüm gizlenir.
 */
export async function getBoughtTogetherIds(productId: string): Promise<string[]> {
  if (!productId) return []

  const bought = await gobitData<{ product_ids: string[] }>("/store/v1/dtm/recommendations", {
    query: { product_id: productId, limit: LIMIT },
    next: { revalidate: 1800 },
  })
    .then((r) => (r.product_ids ?? []).filter((id) => id !== productId))
    .catch(() => [] as string[])
  if (bought.length) return bought.slice(0, LIMIT)

  return gobitData<{ id: string }[]>(
    `/store/v1/sales-channels/${SALES_CHANNEL_ID}/products/${encodeURIComponent(productId)}/related`,
    { next: { revalidate: 1800 } }
  )
    .then((ps) => ps.slice(0, LIMIT).map((p) => p.id))
    .catch(() => [])
}
