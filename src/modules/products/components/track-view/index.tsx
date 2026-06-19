"use client"

import { useEffect } from "react"
import { track } from "@lib/util/analytics"

/**
 * Ürün detay sayfasında bir kez `product_view` davranış olayı gönderir.
 * Görsel çıktı yoktur. handle değişince (SPA içi gezinme) yeniden tetiklenir.
 */
export default function TrackView({
  productId,
  handle,
}: {
  productId: string
  handle?: string
}) {
  useEffect(() => {
    if (productId) track("product_view", { product_id: productId })
  }, [productId, handle])
  return null
}
