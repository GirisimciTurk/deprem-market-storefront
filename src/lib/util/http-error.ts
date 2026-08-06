/**
 * Backend hata sınıflandırması. Girişe bağlı uçlar (favoriler, stok uyarısı)
 * 401 döndüğünde kullanıcıya "giriş yapın" demek gerekir; diğer hatalarda
 * (ağ, 500) bambaşka bir mesaj gerekir. İkisi karışırsa kullanıcı yanlış yere
 * yönlendirilir — bu yüzden ayrım tek yerde tanımlı.
 *
 * Not: "use server" dosyaları yalnız async fonksiyon export edebildiği için bu
 * yardımcı ayrı (saf) bir modülde durur.
 */
export function isUnauthorizedError(e: unknown): boolean {
  // js-sdk 2xx dışında `status` taşıyan FetchError fırlatır.
  const status = (e as { status?: number })?.status
  if (typeof status === "number") return status === 401
  // Status okunamazsa metne düş (proxy/ağ katmanı sarmalamış olabilir).
  return /\b401\b|unauthorized/i.test(String(e))
}
