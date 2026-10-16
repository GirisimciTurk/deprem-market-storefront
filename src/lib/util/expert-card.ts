import { EXPERT_REGION_LIMIT } from "@lib/expert-config"

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
  if (v.phone.trim().length < 10) {
    return "Lütfen geçerli bir telefon numarası girin (en az 10 hane)."
  }
  if (!v.city.trim() || !v.district.trim()) {
    return "Lütfen ana konumunuzu (il ve ilçe) girin."
  }
  if (v.specializations.length === 0) {
    return "Lütfen en az bir uzmanlık alanı seçin."
  }
  return null
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
