/**
 * Fiyat aralığı filtresi yardımcıları.
 *
 * BİRİM UYUMU: Kullanıcı fiyat aralığını TL (major) girer; ürün varyantının
 * `calculated_price.calculated_amount` değeri ise kuruş (minor) cinsindendir.
 * Karşılaştırma öncesi kullanıcı girdisi ×100 ile kuruşa çevrilir (aksi halde
 * 100 kat uyumsuzluk olur: 500 TL girildiğinde 15000 kuruşluk ürün elenirdi).
 */

type PriceVariant = { calculated_price?: { calculated_amount?: number | null } | null }
type PriceProduct = { variants?: PriceVariant[] | null }

/** TL string girdisini kuruş sınırlarına çevirir; geçersiz/boş → null (sınır yok). */
export function priceBoundsToKurus(
  minPrice?: string | null,
  maxPrice?: string | null
): { min: number | null; max: number | null } {
  const minTl = minPrice ? parseFloat(minPrice) : NaN
  const maxTl = maxPrice ? parseFloat(maxPrice) : NaN
  return {
    min: Number.isFinite(minTl) ? Math.round(minTl * 100) : null,
    max: Number.isFinite(maxTl) ? Math.round(maxTl * 100) : null,
  }
}

/** Ürünün en düşük varyant fiyatı (kuruş). Varyant yoksa 0. */
export function productMinAmount(product: PriceProduct): number {
  const vs = product?.variants
  if (!vs || vs.length === 0) return 0
  return Math.min(...vs.map((v) => v?.calculated_price?.calculated_amount || 0))
}

/**
 * Ürün, verilen TL fiyat aralığına giriyor mu? İki sınır da yoksa (geçersiz/boş)
 * her ürün geçer. Karşılaştırma kuruş cinsinden yapılır.
 */
export function matchesPriceRange(
  product: PriceProduct,
  minPrice?: string | null,
  maxPrice?: string | null
): boolean {
  const { min, max } = priceBoundsToKurus(minPrice, maxPrice)
  if (min === null && max === null) return true
  const amount = productMinAmount(product)
  if (min !== null && amount < min) return false
  if (max !== null && amount > max) return false
  return true
}
