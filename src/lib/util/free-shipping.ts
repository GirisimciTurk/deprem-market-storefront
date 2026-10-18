// dtm'nin kargo teklifi (/store/v1/dtm/shipping-quote) ve ondan türetilen
// "ücretsiz kargoya X kaldı" hedefi. Saf: sunucu ve istemci aynı hesabı kullanır.

export type ShippingQuoteSeller = {
  /** Sahipsiz satırlar için null (ev satıcısı yoksa). */
  seller_id: string | null
  /** Mağazanın adresi ve adı; sahipsiz satırda gelmez. */
  seller_handle?: string
  seller_name?: string
  desi: number
  /** O satıcının satırlarının unit_price × adet toplamı (kuruş). */
  subtotal: number
  raw_fee: number
  fee: number
  free: boolean
  /** Kuruş; 0 her zaman ücretsiz, null hiç ücretsiz değil. */
  free_shipping_threshold: number | null
}

export type ShippingQuote = {
  currency_code: string
  /** Sepetin şimdiki hâliyle kargo bedeli (kuruş). */
  amount: number
  free: boolean
  sellers: ShippingQuoteSeller[]
  /** Seçili teslimatın şu an aldığı bedel (seçim yoksa 0). */
  shipping_total: number
  /** Teslimat seçili ve bedeli teklife uymuyor. */
  stale: boolean
}

export type FreeShippingTarget = {
  seller_id: string | null
  /** Mağaza sayfasına bağlantı için (/satici/{handle}); sahipsiz satırda yok. */
  seller_handle?: string
  seller_name?: string
  /** Eşik (kuruş). */
  target_amount: number
  /** Satıcının sepetteki tutarı (kuruş). */
  current_amount: number
  target_reached: boolean
  /** Eşiğe kalan (kuruş); ulaşıldıysa 0. */
  target_remaining: number
  /** İlerleme yüzdesi, 0–100. */
  remaining_percentage: number
  /** Eşiğe ulaşınca kalkacak kargo bedeli (kuruş). */
  saving: number
}

/** Bir satıcı grubunun ücretsiz kargo hedefi; eşiği yoksa (null ya da 0) yok. */
export function freeShippingTarget(s: ShippingQuoteSeller): FreeShippingTarget | null {
  const threshold = s.free_shipping_threshold
  if (threshold === null || threshold === undefined || threshold <= 0) return null
  const reached = s.subtotal >= threshold

  return {
    seller_id: s.seller_id,
    seller_handle: s.seller_handle || undefined,
    seller_name: s.seller_name || undefined,
    target_amount: threshold,
    current_amount: s.subtotal,
    target_reached: reached,
    target_remaining: reached ? 0 : threshold - s.subtotal,
    remaining_percentage: Math.min(100, Math.max(0, (s.subtotal / threshold) * 100)),
    saving: reached ? 0 : s.raw_fee,
  }
}

/**
 * Gösterilecek tek hedef: eşiğe henüz ulaşmamış, kargo ödenen satıcılar
 * arasında eşiğe en yakın olanı. Hepsi ulaşmışsa (ve en az birinin eşiği
 * varsa) ulaşılmış bir hedef döner; hiç eşik yoksa null.
 */
export function pickFreeShippingTarget(quote: ShippingQuote | null | undefined): FreeShippingTarget | null {
  if (!quote) return null
  const targets = quote.sellers.map(freeShippingTarget).filter((t): t is FreeShippingTarget => t !== null)
  if (!targets.length) return null
  const open = targets.filter((t) => !t.target_reached && t.saving > 0)
  if (open.length) return open.reduce((a, b) => (b.target_remaining < a.target_remaining ? b : a))

  return targets.find((t) => t.target_reached) ?? null
}
