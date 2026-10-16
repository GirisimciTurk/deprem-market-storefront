import { EXPERT_REGION_LIMIT } from "@lib/expert-config"
import { isValidTrPhone, TR_PHONE_INCOMPLETE_MESSAGE } from "@lib/util/tr-phone"

/**
 * Uzman kartı formlarının (kısa "Uzman ol" formu ve Hesabım → Uzman Kartım)
 * ortak kuralları. Backend aynı kuralları zod ile uygular; burada yalnız
 * kullanıcıya erken ve Türkçe bir hata göstermek için tekrarlanır.
 *
 * "use server" dosyaları yalnız async fonksiyon export edebildiği için saf
 * yardımcılar ayrı modülde durur.
 */

export type ExpertBasics = {
  full_name: string
  phone: string
  city: string
  district: string
  specializations: string[]
}

/** Zorunlu alanlardaki ilk hatayı döndürür; hepsi geçerliyse null. */
export function validateExpertBasics(v: ExpertBasics): string | null {
  if (v.full_name.trim().length < 2) {
    return "Lütfen adınızı ve soyadınızı girin."
  }
  if (!isValidTrPhone(v.phone)) {
    return TR_PHONE_INCOMPLETE_MESSAGE
  }
  if (!v.city.trim() || !v.district.trim()) {
    return "Lütfen ana konumunuzu (il ve ilçe) seçin."
  }
  if (v.specializations.length === 0) {
    return "Lütfen en az bir uzmanlık alanı seçin."
  }
  return null
}

/** Tek adımlı "Uzman ol" (giriş yapmamış ziyaretçi): hesap + kart birlikte açılır. */
export type ExpertSignup = ExpertBasics & {
  email: string
  password: string
}

export const EXPERT_SIGNUP_PASSWORD_MIN = 8

/** Kayıtta e-postanın hesabı çıktığında gösterilir (form Uzman Girişi linkini ekler). */
export const EXPERT_EMAIL_TAKEN_MESSAGE =
  "Bu e-posta ile bir hesabınız var. Uzman Girişi ile giriş yapıp kartınızı açabilirsiniz."

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Tek adımlı formun kuralları, formdaki sırayla: ad, e-posta, şifre, sonra
 * kısa formun kuralları (telefon, konum, uzmanlık). İlk hatayı döndürür.
 * Sunucu eylemi (signupExpert) aynı kuralı yeniden uygular.
 */
export function validateExpertSignup(v: ExpertSignup): string | null {
  const basics = validateExpertBasics(v)
  if (basics && v.full_name.trim().length < 2) return basics
  if (!EMAIL_RE.test(v.email.trim())) {
    return "Lütfen geçerli bir e-posta adresi girin."
  }
  if (v.password.length < EXPERT_SIGNUP_PASSWORD_MIN) {
    return `Şifreniz en az ${EXPERT_SIGNUP_PASSWORD_MIN} karakter olmalı.`
  }
  return basics
}

/**
 * "Ad Soyad"ı müşteri hesabının ad/soyad alanlarına böler: son kelime soyad,
 * gerisi ad. Tek kelimede soyad boş kalır (Medusa ikisini de boş kabul eder).
 */
export function splitFullName(fullName: string): {
  first_name: string
  last_name: string
} {
  const words = fullName.trim().split(/\s+/).filter(Boolean)
  if (words.length < 2) return { first_name: words[0] ?? "", last_name: "" }
  return {
    first_name: words.slice(0, -1).join(" "),
    last_name: words[words.length - 1],
  }
}

export type RegionDraft = { city: string; district: string }

/** Boş bir bölge satırı ekler; sınır (EXPERT_REGION_LIMIT) doluysa listeyi değiştirmez. */
export function addRegionDraft(regions: RegionDraft[]): RegionDraft[] {
  return regions.length < EXPERT_REGION_LIMIT
    ? [...regions, { city: "", district: "" }]
    : regions
}

/** Form satırlarını backend biçimine indirir: ili boş satır atılır, sınır aşılmaz. */
export function cleanRegions(
  regions: RegionDraft[]
): { city: string; district?: string }[] {
  return regions
    .filter((r) => r.city.trim())
    .slice(0, EXPERT_REGION_LIMIT)
    .map((r) => ({
      city: r.city.trim(),
      district: r.district.trim() || undefined,
    }))
}
