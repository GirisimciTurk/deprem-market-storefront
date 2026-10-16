"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  DOC_TYPE_LABELS,
  ENGINEER_SPECIALIZATIONS,
  EXPERT_REGION_LIMIT,
  requiredDocLabels,
  type DocType,
} from "@lib/expert-config"
import {
  updateMyExpert,
  type ExpertDocument,
  type MyExpert,
} from "@lib/data/experts"
import {
  addRegionDraft,
  cleanRegions,
  validateExpertBasics,
  type RegionDraft,
} from "@lib/util/expert-card"
import {
  EXPERT_PHOTO_MIME,
  EXPERT_UPLOAD_MAX_FILES,
  uploadExpertFiles,
} from "@lib/util/expert-upload"
import { toReachableImageUrl } from "@lib/util/image-url"
import {
  formatTrPhone,
  normalizeTrPhone,
  trPhoneProblem,
} from "@lib/util/tr-phone"
import PhoneInput from "@modules/common/components/phone-input"
import CityDistrictSelect from "@modules/common/components/city-district-select"
import ExpertTitleSelect from "@modules/experts/components/title-select"

const inputCls =
  "w-full border border-ui-border-base rounded-lg px-4 py-2 bg-ui-bg-base text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
const labelCls =
  "block text-xs font-bold text-ui-fg-base uppercase tracking-wider mb-1"
const sectionCls =
  "border border-ui-border-base rounded-2xl bg-ui-bg-subtle p-5 sm:p-6 space-y-4"

/**
 * Hesabım → Uzman Kartım düzenleyicisi. Kart sahibi yalnız kendi alanlarını
 * değiştirir; yayın, durum ve uzmanlık doğrulaması ekibimizdedir. Yayındaki
 * kartın değişikliği doğrudan yayına geçer; yeni eklenen uzmanlık doğrulanana
 * kadar "inceleniyor" görünür ve dizin filtresinde kullanılmaz.
 */
export default function ExpertCardEditor({ expert }: { expert: MyExpert }) {
  const router = useRouter()
  const [form, setForm] = useState({
    full_name: expert.full_name,
    title: expert.title,
    phone: formatTrPhone(expert.phone),
    city: expert.city,
    district: expert.district,
    experience_years:
      expert.experience_years != null ? String(expert.experience_years) : "",
    about: expert.about,
    whatsapp: formatTrPhone(expert.whatsapp),
  })
  const [specs, setSpecs] = useState<string[]>(expert.specializations ?? [])
  const [imoMember, setImoMember] = useState(expert.imo_member)
  const [showPhone, setShowPhone] = useState(expert.show_phone)
  const [showEmail, setShowEmail] = useState(expert.show_email)
  const [photoUrl, setPhotoUrl] = useState(expert.photo_url)
  const [regions, setRegions] = useState<RegionDraft[]>(
    (expert.service_regions ?? []).map((r) => ({
      city: r.city,
      district: r.district ?? "",
    }))
  )
  const [documents, setDocuments] = useState<ExpertDocument[]>(
    expert.documents ?? []
  )
  const [uploading, setUploading] = useState<"photo" | "doc" | null>(null)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(
    null
  )

  const verified = new Set(
    expert.is_published ? expert.verified_specializations ?? [] : []
  )

  const toggleSpec = (key: string) =>
    setSpecs((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  const updateRegion = (i: number, next: RegionDraft) =>
    setRegions((r) => r.map((x, idx) => (idx === i ? next : x)))

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    setUploading("photo")
    setNotice(null)
    try {
      const [url] = await uploadExpertFiles([file], EXPERT_PHOTO_MIME)
      if (url) setPhotoUrl(url)
    } catch (err) {
      setNotice({
        ok: false,
        text: err instanceof Error ? err.message : "Fotoğraf yüklenemedi.",
      })
    } finally {
      setUploading(null)
    }
  }

  const handleDocs = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ""
    if (!files.length) return
    if (documents.length + files.length > EXPERT_UPLOAD_MAX_FILES) {
      setNotice({
        ok: false,
        text: `En fazla ${EXPERT_UPLOAD_MAX_FILES} belge yükleyebilirsiniz.`,
      })
      return
    }
    setUploading("doc")
    setNotice(null)
    try {
      const urls = await uploadExpertFiles(files)
      setDocuments((prev) => [
        ...prev,
        ...urls.map((url, i) => ({
          type: "diger" as DocType,
          url,
          name: files[i]?.name || "Belge",
        })),
      ])
    } catch (err) {
      setNotice({
        ok: false,
        text: err instanceof Error ? err.message : "Belge yüklenemedi.",
      })
    } finally {
      setUploading(null)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const invalid = validateExpertBasics({ ...form, specializations: specs })
    if (invalid) {
      setNotice({ ok: false, text: invalid })
      return
    }
    const whatsappProblem = trPhoneProblem(form.whatsapp)
    if (whatsappProblem) {
      setNotice({ ok: false, text: `WhatsApp: ${whatsappProblem}` })
      return
    }
    setSaving(true)
    setNotice(null)
    const res = await updateMyExpert({
      full_name: form.full_name.trim(),
      title: form.title.trim(),
      phone: normalizeTrPhone(form.phone),
      city: form.city.trim(),
      district: form.district.trim(),
      specializations: specs,
      experience_years: form.experience_years
        ? Number(form.experience_years)
        : null,
      imo_member: imoMember,
      about: form.about,
      photo_url: photoUrl,
      whatsapp: normalizeTrPhone(form.whatsapp),
      show_phone: showPhone,
      show_email: showEmail,
      service_regions: cleanRegions(regions),
      documents,
    })
    setSaving(false)
    if (res.expert) {
      setNotice({
        ok: true,
        text: res.expert.is_published
          ? "Değişiklikler kaydedildi ve yayına alındı."
          : "Değişiklikler kaydedildi.",
      })
      router.refresh()
    } else {
      setNotice({
        ok: false,
        text: res.error || "Değişiklikler kaydedilemedi.",
      })
    }
  }

  const busy = saving || uploading !== null
  const photo = toReachableImageUrl(photoUrl)
  const required = requiredDocLabels(specs)

  return (
    <div className="space-y-6">
      {/* Durum */}
      {expert.is_published ? (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="inline-block bg-white text-green-700 border border-green-200 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
              ✓ Yayında
            </span>
            <p className="text-sm text-green-800 mt-2">
              Kartınız doğrulandı ve uzman dizininde yayında. Yaptığınız
              değişiklikler kaydettiğiniz anda yayına yansır.
            </p>
          </div>
          {expert.slug && (
            <LocalizedClientLink
              href={`/uzmanlar/${expert.slug}`}
              className="shrink-0 text-sm font-bold text-green-800 underline underline-offset-2"
            >
              Kartımı dizinde gör →
            </LocalizedClientLink>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <span className="inline-block bg-white text-amber-700 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
            ⌛ Doğrulama bekleniyor
          </span>
          <p className="text-sm text-amber-800 mt-2">
            {expert.status === "archived"
              ? "Kartınız şu an yayında değil. Sorularınız için bizimle iletişime geçebilirsiniz."
              : "Kartınız ekibimiz doğruladıktan sonra yayına alınır. Bu sürede kartınızı düzenleyebilir, doğrulama belgelerinizi ekleyebilirsiniz."}
          </p>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6" noValidate>
        {/* Temel bilgiler */}
        <div className={sectionCls}>
          <h2 className="text-sm font-bold text-ui-fg-base">Temel Bilgiler</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="card-full-name" className={labelCls}>
                Ad Soyad <span className="text-brand-500">*</span>
              </label>
              <input
                id="card-full-name"
                type="text"
                disabled={busy}
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="card-title" className={labelCls}>
                Unvan
              </label>
              <ExpertTitleSelect
                id="card-title"
                disabled={busy}
                value={form.title}
                onChange={(title) => setForm({ ...form, title })}
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="card-phone" className={labelCls}>
                Telefon <span className="text-brand-500">*</span>
              </label>
              <PhoneInput
                id="card-phone"
                disabled={busy}
                value={form.phone}
                onChange={(phone) => setForm({ ...form, phone })}
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="card-email" className={labelCls}>
                E-Posta
              </label>
              <input
                id="card-email"
                type="email"
                disabled
                value={expert.email}
                className={`${inputCls} text-ui-fg-muted`}
              />
              <p className="text-2xs text-ui-fg-muted mt-1">
                Hesabınızın e-postası kullanılır.
              </p>
            </div>
            <CityDistrictSelect
              city={form.city}
              district={form.district}
              onChange={({ city, district }) =>
                setForm({ ...form, city, district })
              }
              disabled={busy}
              className={inputCls}
              labelClassName={labelCls}
              cityLabel={
                <>
                  Ana İl <span className="text-brand-500">*</span>
                </>
              }
              districtLabel={
                <>
                  İlçe <span className="text-brand-500">*</span>
                </>
              }
              cityProps={{ id: "card-city" }}
              districtProps={{ id: "card-district" }}
            />
            <div>
              <label htmlFor="card-experience" className={labelCls}>
                Deneyim (yıl)
              </label>
              <input
                id="card-experience"
                type="number"
                min={0}
                max={70}
                disabled={busy}
                value={form.experience_years}
                onChange={(e) =>
                  setForm({ ...form, experience_years: e.target.value })
                }
                placeholder="Örn: 10"
                className={inputCls}
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer sm:pt-6">
              <input
                type="checkbox"
                checked={imoMember}
                disabled={busy}
                onChange={(e) => setImoMember(e.target.checked)}
                className="h-4 w-4 accent-brand-600"
              />
              <span className="text-sm text-ui-fg-base">
                İnşaat Mühendisleri Odası (İMO) üyesiyim.
              </span>
            </label>
          </div>
        </div>

        {/* Fotoğraf + hakkında */}
        <div className={sectionCls}>
          <h2 className="text-sm font-bold text-ui-fg-base">Profil</h2>
          <div className="flex items-center gap-4">
            <div className="shrink-0 w-20 h-20 rounded-xl bg-ui-bg-base border border-ui-border-base overflow-hidden flex items-center justify-center">
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photo}
                  alt="Profil fotoğrafı"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-extrabold text-ui-fg-muted">
                  {(form.full_name || "?").charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-semibold text-brand-600 hover:text-brand-700">
                <span className="inline-block border border-brand-200 bg-brand-50 rounded-lg px-3 py-1.5">
                  {uploading === "photo"
                    ? "Yükleniyor..."
                    : photoUrl
                      ? "Fotoğrafı Değiştir"
                      : "+ Fotoğraf Yükle"}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  hidden
                  disabled={busy}
                  onChange={handlePhoto}
                  data-testid="photo-input"
                />
              </label>
              {photoUrl && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setPhotoUrl("")}
                  className="text-left text-xs font-semibold text-ui-fg-muted hover:text-brand-600"
                >
                  Fotoğrafı kaldır
                </button>
              )}
              <p className="text-2xs text-ui-fg-muted">
                JPEG, PNG veya WebP; en fazla 10 MB.
              </p>
            </div>
          </div>
          <div>
            <label htmlFor="card-about" className={labelCls}>
              Kısa Tanıtım (Hakkında)
            </label>
            <textarea
              id="card-about"
              rows={4}
              disabled={busy}
              value={form.about}
              onChange={(e) => setForm({ ...form, about: e.target.value })}
              placeholder="Deneyiminizi, öne çıkan projelerinizi, çalışma tarzınızı kısaca anlatın."
              className={`${inputCls} resize-none`}
              maxLength={2000}
            />
          </div>
        </div>

        {/* Uzmanlık alanları */}
        <div className={sectionCls}>
          <div>
            <h2 className="text-sm font-bold text-ui-fg-base">
              Uzmanlık Alanları <span className="text-brand-500">*</span>
            </h2>
            <p className="text-xs text-ui-fg-muted mt-1">
              Her uzmanlık belge ile ayrı doğrulanır. Yeni eklediğiniz alanlar
              doğrulanana kadar kartınızda &quot;inceleniyor&quot; olarak görünür
              ve dizin filtrelerinde kullanılmaz.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {ENGINEER_SPECIALIZATIONS.map((s) => {
              const active = specs.includes(s.key)
              return (
                <button
                  type="button"
                  key={s.key}
                  disabled={busy}
                  onClick={() => toggleSpec(s.key)}
                  aria-pressed={active}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                    active
                      ? "bg-brand-600 text-white border-brand-600"
                      : "bg-ui-bg-base text-ui-fg-subtle border-ui-border-base hover:border-brand-400"
                  }`}
                >
                  {active ? "✓ " : ""}
                  {s.label}
                  {active && expert.is_published && (
                    <span className="ml-1 font-normal opacity-80">
                      {verified.has(s.key) ? "· doğrulandı" : "· inceleniyor"}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* İletişim */}
        <div className={sectionCls}>
          <h2 className="text-sm font-bold text-ui-fg-base">
            İletişim Tercihleri
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="card-whatsapp" className={labelCls}>
                WhatsApp (opsiyonel)
              </label>
              <PhoneInput
                id="card-whatsapp"
                disabled={busy}
                value={form.whatsapp}
                onChange={(whatsapp) => setForm({ ...form, whatsapp })}
                className={inputCls}
              />
            </div>
            <div className="flex flex-col justify-center gap-1.5 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-ui-fg-base">
                <input
                  type="checkbox"
                  checked={showPhone}
                  disabled={busy}
                  onChange={(e) => setShowPhone(e.target.checked)}
                  className="h-4 w-4 accent-brand-600"
                />
                Telefonum kartımda görünsün
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-ui-fg-base">
                <input
                  type="checkbox"
                  checked={showEmail}
                  disabled={busy}
                  onChange={(e) => setShowEmail(e.target.checked)}
                  className="h-4 w-4 accent-brand-600"
                />
                E-postam kartımda görünsün
              </label>
            </div>
          </div>
        </div>

        {/* Ek hizmet bölgeleri */}
        <div className={sectionCls}>
          <div>
            <h2 className="text-sm font-bold text-ui-fg-base">
              Ek Hizmet Bölgeleri
            </h2>
            <p className="text-xs text-ui-fg-muted mt-1">
              Ana konumunuz dışında hizmet verdiğiniz il/ilçeler (opsiyonel, en
              fazla {EXPERT_REGION_LIMIT}).
            </p>
          </div>
          <div className="space-y-2">
            {regions.map((r, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center"
              >
                <CityDistrictSelect
                  city={r.city}
                  district={r.district}
                  onChange={(next) => updateRegion(i, next)}
                  districtOptional
                  disabled={busy}
                  className={inputCls}
                  cityProps={{ "aria-label": `${i + 1}. bölge ili` }}
                  districtProps={{ "aria-label": `${i + 1}. bölge ilçesi` }}
                />
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    setRegions((rs) => rs.filter((_, idx) => idx !== i))
                  }
                  className="text-ui-fg-muted hover:text-brand-600 text-sm font-semibold px-2"
                >
                  Kaldır
                </button>
              </div>
            ))}
            {regions.length < EXPERT_REGION_LIMIT ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => setRegions(addRegionDraft)}
                className="text-sm font-semibold text-brand-600 hover:text-brand-700"
              >
                + Bölge Ekle
              </button>
            ) : (
              <p className="text-xs text-ui-fg-muted">
                En fazla {EXPERT_REGION_LIMIT} ek bölge ekleyebilirsiniz.
              </p>
            )}
          </div>
        </div>

        {/* Belgeler */}
        <div className={sectionCls}>
          <div>
            <h2 className="text-sm font-bold text-ui-fg-base">
              Doğrulama Belgeleri
            </h2>
            <p className="text-xs text-ui-fg-muted mt-1">
              Diploma, oda (İMO) kaydı veya lisanslarınızı yükleyin. Belgeler
              yalnız ekibimizce incelenir, kartınızda{" "}
              <strong>paylaşılmaz</strong>. Görsel veya PDF, en fazla{" "}
              {EXPERT_UPLOAD_MAX_FILES} dosya.
            </p>
          </div>
          {required.length > 0 && (
            <div className="text-xs rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">
              Seçtiğiniz uzmanlıklar için <strong>gerekli belgeler</strong>:{" "}
              {required.join(" · ")}.
            </div>
          )}
          {documents.length > 0 && (
            <ul className="space-y-1.5">
              {documents.map((doc, idx) => (
                <li
                  key={`${doc.url}-${idx}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-ui-bg-base border border-ui-border-base rounded-lg px-3 py-2 text-xs"
                >
                  <span className="truncate text-ui-fg-subtle">
                    📄 {doc.name || "Belge"}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      disabled={busy}
                      value={doc.type}
                      aria-label="Belge türü"
                      onChange={(e) =>
                        setDocuments((prev) =>
                          prev.map((d, i) =>
                            i === idx
                              ? { ...d, type: e.target.value as DocType }
                              : d
                          )
                        )
                      }
                      className="border border-ui-border-base rounded-md px-2 py-1 bg-ui-bg-base text-xs"
                    >
                      {(Object.keys(DOC_TYPE_LABELS) as DocType[]).map((t) => (
                        <option key={t} value={t}>
                          {DOC_TYPE_LABELS[t]}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        setDocuments((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="text-ui-fg-muted hover:text-brand-600 font-semibold"
                    >
                      Kaldır
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {documents.length < EXPERT_UPLOAD_MAX_FILES && (
            <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-semibold text-brand-600 hover:text-brand-700">
              <span className="inline-block border border-brand-200 bg-brand-50 rounded-lg px-3 py-1.5">
                {uploading === "doc" ? "Yükleniyor..." : "+ Belge Yükle"}
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                multiple
                hidden
                disabled={busy}
                onChange={handleDocs}
              />
            </label>
          )}
        </div>

        {notice && (
          <p
            role={notice.ok ? "status" : "alert"}
            className={`text-sm text-center ${
              notice.ok ? "text-green-700" : "text-brand-600"
            }`}
          >
            {notice.text}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg text-sm transition-colors shadow-sm"
        >
          {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
        </button>
      </form>
    </div>
  )
}
