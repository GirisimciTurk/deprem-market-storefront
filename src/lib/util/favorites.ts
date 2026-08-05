/**
 * ESKİ (localStorage) favori deposu — SALT OKUNUR GÖÇ YARDIMCISI.
 *
 * Favoriler artık müşteri hesabında tutuluyor (backend `wishlist` modülü,
 * `@lib/data/wishlist` + `@lib/context/wishlist-context`). Buradaki fonksiyonlar
 * yalnızca kullanıcıların cihazında kalmış eski kayıtları BİR KEZ hesaba
 * aktarmak için var (bkz. modules/favorites/components/legacy-migration).
 *
 * Yeni favori YAZMAK için burayı kullanmayın; hesaba yazılmayan favori cihaz
 * değişince kaybolur — taşımanın sebebi tam olarak buydu.
 */

export const LEGACY_FAVORITES_KEY = "deprem_market_favorites"

/** Eski kayıtların şekli (ürün anlık görüntüsü tutuluyordu). */
export interface LegacyFavoriteProduct {
  id: string
  title: string
  price: string
  image: string
  handle: string
  description: string
}

/**
 * Cihazda kalmış eski favorilerin ürün id'leri. Bozuk/eksik kayıtlar atlanır;
 * localStorage okunamazsa (gizli mod, kota) boş dizi döner.
 */
export function readLegacyFavoriteIds(): string[] {
  if (typeof window === "undefined") return []
  try {
    const saved = localStorage.getItem(LEGACY_FAVORITES_KEY)
    if (!saved) return []
    const parsed = JSON.parse(saved)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((item) => (item && typeof item === "object" ? item.id : item))
      .filter((id): id is string => typeof id === "string" && id.length > 0)
  } catch {
    return []
  }
}

/** Aktarım BAŞARILI olduktan sonra çağrılır. */
export function clearLegacyFavorites(): void {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(LEGACY_FAVORITES_KEY)
  } catch {
    /* kota/izin — temizlenemezse bir dahaki sefere yeniden denenir */
  }
}
