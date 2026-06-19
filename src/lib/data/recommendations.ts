"use server"

import { sdk } from "@lib/config"

/**
 * Backend "birlikte alınanlar" önerisi — verilen ürünle aynı siparişlerde sık
 * geçen ürünlerin id'lerini sıralı döndürür. Hata/boş → []; çağıran bölüm gizlenir.
 */
export async function getBoughtTogetherIds(productId: string): Promise<string[]> {
  if (!productId) return []
  try {
    const res = await sdk.client.fetch<{ product_ids: string[] }>(
      `/store/recommendations`,
      {
        method: "GET",
        query: { product_id: productId, limit: 8 },
        // Ürün-bazlı (kullanıcıya özel değil); sipariş geçmişinden türer, yavaş
        // değişir → 30 dk önbellek. Her PDP görüntülemede backend'e gitmez.
        next: { revalidate: 1800 },
      }
    )
    return res?.product_ids ?? []
  } catch {
    return []
  }
}
