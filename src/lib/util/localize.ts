import { getUserLocale } from "@i18n/locale"
import { DEFAULT_LOCALE } from "@i18n/config"

/**
 * Aktif görüntüleme dilini güvenli okur. listProducts/blog gibi veri fonksiyonları
 * normal sayfa render'ında (request scope) çağrılır → cookie okunur. AMA aynı
 * fonksiyonlar sitemap.ts / generateStaticParams / build sırasında da çağrılabilir;
 * orada cookies() erişilemez ve hata fırlatır → güvenli şekilde varsayılan (tr)
 * dile düşeriz (overlay yapılmaz).
 */
export async function getLocaleSafe(): Promise<string> {
  try {
    return await getUserLocale()
  } catch {
    return DEFAULT_LOCALE
  }
}

/** Çeviri haritasından (locale → alanlar) aktif locale için alanları döndürür. */
export function pickTranslation<T extends Record<string, any>>(
  translations: Record<string, T> | null | undefined,
  locale: string
): Partial<T> | null {
  if (!translations || locale === DEFAULT_LOCALE) return null
  return translations[locale] ?? null
}
