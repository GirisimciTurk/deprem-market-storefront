"use client"

import { useEffect, useState } from "react"
import { mergeWishlist } from "@lib/data/wishlist"
import { useWishlist } from "@lib/context/wishlist-context"
import {
  LEGACY_FAVORITES_KEY,
  readLegacyFavoriteIds,
  clearLegacyFavorites,
} from "@lib/util/favorites"

/**
 * Favoriler localStorage'dan müşteri hesabına taşındığında, kullanıcıların
 * cihazlarında eski kayıtlar kaldı. Bu bileşen giriş yapmış kullanıcıda BİR KEZ
 * çalışır: eski listeyi hesaba aktarır, sonra localStorage'ı temizler.
 *
 * Yalnız main layout'ta ve `customer` varken render edilir. Aktarım başarısız
 * olursa localStorage TEMİZLENMEZ — bir sonraki sayfada yeniden denenir, veri
 * kaybolmaz.
 *
 * Kullanıcı kaç favorisinin taşındığını görsün diye kısa bir bilgi şeridi gösterir;
 * taşınacak bir şey yoksa hiçbir şey render edilmez (sessiz no-op).
 */
export default function WishlistLegacyMigration() {
  const { setProductIds } = useWishlist()
  const [mergedCount, setMergedCount] = useState<number | null>(null)

  useEffect(() => {
    // Aynı sekmede iki kez koşmasın (React strict mode / yeniden render).
    let cancelled = false

    const run = async () => {
      const legacyIds = readLegacyFavoriteIds()
      if (legacyIds.length === 0) return

      const res = await mergeWishlist(legacyIds)
      if (cancelled) return

      if (res.unauthorized || res.error) {
        // Aktarım olmadı → localStorage'a dokunma, sonra tekrar denenir.
        return
      }

      setProductIds(res.productIds)
      clearLegacyFavorites()
      if (res.mergedCount > 0) {
        setMergedCount(res.mergedCount)
      }
    }

    run()
    return () => {
      cancelled = true
    }
    // Bir kez: bağımlılık listesi bilerek boş. setProductIds context'ten sabit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Bilgi şeridi birkaç saniye sonra kaybolsun.
  useEffect(() => {
    if (mergedCount === null) return
    const t = setTimeout(() => setMergedCount(null), 6000)
    return () => clearTimeout(t)
  }, [mergedCount])

  if (mergedCount === null) return null

  return (
    <div
      role="status"
      data-testid="wishlist-migration-toast"
      data-legacy-key={LEGACY_FAVORITES_KEY}
      className="fixed bottom-4 left-1/2 z-[80] -translate-x-1/2 rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-xl"
    >
      <span className="font-semibold text-brand-700">{mergedCount}</span> favori
      ürününüz hesabınıza aktarıldı.
    </div>
  )
}
