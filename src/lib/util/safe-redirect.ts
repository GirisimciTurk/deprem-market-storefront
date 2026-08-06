/**
 * Giriş sonrası dönülecek yolun doğrulaması.
 *
 * Değer kullanıcı tarafından kontrol edilen bir query parametresinden gelir;
 * doğrudan `redirect()`e verilmesi AÇIK YÖNLENDİRME (open redirect) olur —
 * saldırgan `?redirect=//kotu.site` ile kullanıcıyı giriş sonrası dışarı
 * taşıyabilir. Bu yüzden yalnız site içi mutlak yollar kabul edilir.
 *
 * "use server" dosyaları yalnız async fonksiyon export edebildiği için saf
 * yardımcı ayrı modülde durur.
 */
export function safeInternalPath(value: unknown): string | null {
  const raw = typeof value === "string" ? value.trim() : ""
  if (!raw.startsWith("/")) return null
  // "//host" ve "/\host" tarayıcıda protokol-göreli mutlak URL sayılır.
  if (raw.startsWith("//") || raw.startsWith("/\\")) return null
  // Kontrol karakteri / satır sonu içeren değerleri baştan ele.
  if (/[\u0000-\u001f\u007f]/.test(raw)) return null
  return raw
}

/**
 * Google ile giriş sırasında dönüş yolunun saklandığı sessionStorage anahtarı.
 * OAuth akışı siteden çıkıp geri döndüğü için form alanı/URL ile taşınamıyor.
 */
export const GOOGLE_RETURN_KEY = "_dm_login_return"
