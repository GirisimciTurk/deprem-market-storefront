/**
 * Hizmet sağlayıcı (inşaat mühendisi + uygulayıcı/yüklenici) ön-kayıt formu yapılandırması.
 * Backend src/lib/expert-config.ts ile EŞ TUTULMALI (anahtarlar birebir aynı).
 *
 *  - engineer    = İnşaat Mühendisi (beyin): tespit / proje / danışmanlık
 *  - implementer = Uygulayıcı / Yüklenici (eller): inşaat & güçlendirme fiziki uygulama
 */

export type ProviderType = "engineer" | "implementer"

export type ExpertSpecialization = { key: string; label: string }

export const ENGINEER_SPECIALIZATIONS: ExpertSpecialization[] = [
  { key: "risk_tespit", label: "Bina Risk & Hasar Tespiti" },
  { key: "guclendirme", label: "Güçlendirme Projesi (Retrofit Tasarım)" },
  { key: "statik_proje", label: "Statik / Betonarme Proje" },
  { key: "zemin_etut", label: "Zemin Etüdü & Geoteknik" },
  { key: "yapi_denetim", label: "Yapı Denetimi" },
  { key: "kentsel_donusum", label: "Kentsel Dönüşüm Danışmanlığı" },
  { key: "performans_analizi", label: "Deprem Performans Analizi" },
]

export const IMPLEMENTER_SPECIALIZATIONS: ExpertSpecialization[] = [
  { key: "guclendirme_uygulama", label: "Güçlendirme Uygulaması (Retrofit)" },
  { key: "karbon_fiber", label: "Karbon Fiber / FRP Güçlendirme" },
  { key: "celik_guclendirme", label: "Çelik Güçlendirme" },
  { key: "temel_perde", label: "Temel & Perde / Mantolama Uygulaması" },
  { key: "insaat_yapim", label: "İnşaat / Kaba Yapım" },
  { key: "zemin_iyilestirme", label: "Zemin İyileştirme Uygulaması" },
  { key: "yikim_hafriyat", label: "Yıkım & Hafriyat" },
  { key: "tadilat_onarim", label: "Tadilat & Onarım" },
]

export const EXPERT_SPECIALIZATIONS = ENGINEER_SPECIALIZATIONS

export function specializationsFor(type: ProviderType): ExpertSpecialization[] {
  return type === "implementer"
    ? IMPLEMENTER_SPECIALIZATIONS
    : ENGINEER_SPECIALIZATIONS
}

const ALL_SPECIALIZATIONS = [
  ...ENGINEER_SPECIALIZATIONS,
  ...IMPLEMENTER_SPECIALIZATIONS,
]

export function specializationLabel(key: string): string {
  return ALL_SPECIALIZATIONS.find((s) => s.key === key)?.label ?? key
}

export const PROVIDER_LABELS: Record<ProviderType, string> = {
  engineer: "İnşaat Mühendisi",
  implementer: "Uygulayıcı / Yüklenici",
}

export function providerLabel(type: ProviderType | string): string {
  return PROVIDER_LABELS[type as ProviderType] ?? "İnşaat Mühendisi"
}

export type ExpertBudgetTier = { key: string; label: string }

export const EXPERT_BUDGET_TIERS: ExpertBudgetTier[] = [
  { key: "unsure", label: "Henüz emin değilim" },
  { key: "0_250", label: "Aylık 0 – 250 ₺" },
  { key: "250_500", label: "Aylık 250 – 500 ₺" },
  { key: "500_1000", label: "Aylık 500 – 1.000 ₺" },
  { key: "1000_plus", label: "Aylık 1.000 ₺ +" },
]
