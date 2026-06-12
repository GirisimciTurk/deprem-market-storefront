// Desteklenen diller. Yeni bir dil eklemek için: buraya kodu ekle + messages/<kod>.json
// dosyasını oluştur. Başka hiçbir yeri değiştirmeye gerek yok.
export const SUPPORTED_LOCALES = ["tr", "en"] as const
export type AppLocale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: AppLocale = "tr"

export const LOCALE_COOKIE = "NEXT_LOCALE"

// Dil seçicide gösterilen ad + bayrak için ülke kodu.
export const LOCALE_META: Record<AppLocale, { label: string; flag: string }> = {
  tr: { label: "Türkçe", flag: "TR" },
  en: { label: "English", flag: "GB" },
}

export function isSupportedLocale(value: unknown): value is AppLocale {
  return typeof value === "string" && (SUPPORTED_LOCALES as readonly string[]).includes(value)
}
