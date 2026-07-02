/**
 * Sabit "vitrin" kategorileri — backend SHOWCASE_CATEGORIES ile AYNI key'ler
 * (deprem-market-backend/src/lib/showcase-categories.ts; repo ayrı olduğu için burada
 * ayrıca tanımlı). Ürün `metadata.showcase` dizisinde saklanır. Ana sayfa vitrin
 * bölümleri + /store `?showcase=<key>` filtresi bu listeyi kullanır.
 */
export const SHOWCASE_CATEGORIES = [
  { key: "bestsellers", label: "En Çok Satanlar", emoji: "🔥" },
  { key: "new-arrivals", label: "Yeni Ürünler", emoji: "✨" },
  { key: "deals", label: "Fırsat Ürünleri", emoji: "🏷️" },
  { key: "bundles", label: "Set ve Paket İndirimleri", emoji: "📦" },
  { key: "campaigns", label: "Özel Kampanyalar", emoji: "🎯" },
  { key: "seasonal", label: "Sezonluk ve Limited Ürünler", emoji: "🌟" },
] as const

export const SHOWCASE_KEYS: string[] = SHOWCASE_CATEGORIES.map((c) => c.key)

/** Geçerli bir vitrin key'i mi? (searchParam doğrulama) */
export const isShowcaseKey = (key?: string | null): boolean =>
  !!key && SHOWCASE_KEYS.includes(key)

/** Key → görünen ad (başlık için). */
export const showcaseLabel = (key?: string): string | undefined =>
  SHOWCASE_CATEGORIES.find((c) => c.key === key)?.label
