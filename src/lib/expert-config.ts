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

/**
 * Uzman kartının "Unvan" seçenekleri. Backend unvanı serbest metin olarak
 * saklar; liste yalnız formdaki seçimdir. "Diğer" seçilince serbest metin
 * girilir ve o metin gönderilir.
 */
export const EXPERT_TITLES: readonly string[] = [
  "İnşaat Mühendisi",
  "İnşaat Yüksek Mühendisi",
  "Dr. İnşaat Mühendisi",
  "Doç. Dr.",
  "Prof. Dr.",
  "Jeoloji Mühendisi",
  "Jeofizik Mühendisi",
  "Mimar",
]
export const EXPERT_TITLE_OTHER = "Diğer"

export const PROVIDER_LABELS: Record<ProviderType, string> = {
  engineer: "İnşaat Mühendisi",
  implementer: "Uygulayıcı / Yüklenici",
}

export function providerLabel(type: ProviderType | string): string {
  return PROVIDER_LABELS[type as ProviderType] ?? "İnşaat Mühendisi"
}

/**
 * Ana konum dışında eklenebilecek hizmet bölgesi sayısı — her uzman için aynı.
 * Backend src/lib/expert-config.ts EXPERT_REGION_LIMIT ile EŞ TUTULMALI.
 */
export const EXPERT_REGION_LIMIT = 3

/**
 * Belge–uzmanlık eşleşmesi (Slayt 11): hangi uzmanlık hangi belgeyi zorunlu kılar.
 * Backend src/lib/expert-config.ts ile EŞ TUTULMALI.
 */
export type DocType = "diploma" | "oda" | "yetki" | "lisans" | "diger"
export const DOC_TYPE_LABELS: Record<DocType, string> = {
  diploma: "Diploma",
  oda: "Oda Kaydı (İMO)",
  yetki: "Yetki Belgesi / Vergi Mükellefiyeti",
  lisans: "Lisans / Ruhsat",
  diger: "Diğer Belge",
}

export const SPEC_REQUIRED_DOCS: Record<string, DocType[]> = {
  risk_tespit: ["diploma", "oda"],
  guclendirme: ["diploma", "oda"],
  statik_proje: ["diploma", "oda"],
  zemin_etut: ["diploma", "oda"],
  yapi_denetim: ["diploma", "oda", "lisans"],
  kentsel_donusum: ["diploma", "oda"],
  performans_analizi: ["diploma", "oda"],
  guclendirme_uygulama: ["yetki"],
  karbon_fiber: ["yetki"],
  celik_guclendirme: ["yetki"],
  temel_perde: ["yetki"],
  insaat_yapim: ["yetki", "lisans"],
  zemin_iyilestirme: ["yetki"],
  yikim_hafriyat: ["yetki", "lisans"],
  tadilat_onarim: ["yetki"],
}

export function requiredDocsForSpecs(keys: string[]): DocType[] {
  const set = new Set<DocType>()
  for (const k of keys) (SPEC_REQUIRED_DOCS[k] || []).forEach((d) => set.add(d))
  return Array.from(set)
}
export function requiredDocLabels(keys: string[]): string[] {
  return requiredDocsForSpecs(keys).map((d) => DOC_TYPE_LABELS[d])
}
