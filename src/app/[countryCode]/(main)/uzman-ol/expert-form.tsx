"use client"

import { useState } from "react"
import {
  EXPERT_BUDGET_TIERS,
  specializationsFor,
  requiredDocLabels,
  type ProviderType,
} from "@lib/expert-config"

const inputCls =
  "w-full border border-ui-border-base rounded-lg px-4 py-2 bg-ui-bg-base text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
const labelCls =
  "block text-xs font-bold text-ui-fg-base uppercase tracking-wider mb-1"

export default function ExpertForm({
  providerType = "engineer",
}: {
  providerType?: ProviderType
}) {
  const SPECIALIZATIONS = specializationsFor(providerType)
  const isImplementer = providerType === "implementer"
  const [form, setForm] = useState({
    full_name: "",
    title: "",
    email: "",
    phone: "",
    city: "",
    district: "",
    service_areas: "",
    experience_years: "",
    budget_tier: "",
    message: "",
    about: "",
    whatsapp: "",
  })
  const [specs, setSpecs] = useState<string[]>([])
  const [imoMember, setImoMember] = useState(false)
  const [showPhone, setShowPhone] = useState(true)
  const [showEmail, setShowEmail] = useState(false)
  const [documents, setDocuments] = useState<
    { type: string; url: string; name: string }[]
  >([])
  const [uploadingDoc, setUploadingDoc] = useState(false)
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  )
  const [errorMsg, setErrorMsg] = useState("")

  const backendUrl =
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

  // Belge yükleme: dosyaları base64'e çevirip /store/expert-uploads'a gönderir.
  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    if (documents.length + files.length > 5) {
      alert("En fazla 5 belge yükleyebilirsiniz.")
      e.target.value = ""
      return
    }
    setUploadingDoc(true)
    try {
      const payload = await Promise.all(
        Array.from(files).map(
          (file) =>
            new Promise<{ filename: string; mime_type: string; data: string }>(
              (resolve, reject) => {
                const reader = new FileReader()
                reader.onload = () => {
                  const result = String(reader.result)
                  resolve({
                    filename: file.name,
                    mime_type: file.type,
                    data: result.split(",")[1] || "",
                  })
                }
                reader.onerror = reject
                reader.readAsDataURL(file)
              }
            )
        )
      )
      const res = await fetch(`${backendUrl}/store/expert-uploads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": publishableKey,
        },
        body: JSON.stringify({ files: payload }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message || "Belge yüklenemedi.")
      }
      const { urls } = (await res.json()) as { urls: string[] }
      setDocuments((prev) => [
        ...prev,
        ...urls.map((url, i) => ({
          type: "diger",
          url,
          name: files[i]?.name || "Belge",
        })),
      ])
    } catch (err) {
      alert(err instanceof Error ? err.message : "Belge yüklenemedi.")
    } finally {
      setUploadingDoc(false)
      e.target.value = ""
    }
  }

  const toggleSpec = (key: string) =>
    setSpecs((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.full_name || !form.email || !form.phone) {
      alert("Lütfen ad soyad, e-posta ve telefon alanlarını doldurun.")
      return
    }
    if (specs.length === 0) {
      alert("Lütfen en az bir uzmanlık alanı seçin.")
      return
    }

    setStatus("loading")
    setErrorMsg("")
    try {
      const res = await fetch(`${backendUrl}/store/expert-leads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": publishableKey,
        },
        body: JSON.stringify({
          provider_type: providerType,
          full_name: form.full_name,
          title: form.title,
          email: form.email,
          phone: form.phone,
          city: form.city,
          district: form.district,
          service_areas: form.service_areas,
          specializations: specs,
          experience_years: form.experience_years
            ? Number(form.experience_years)
            : undefined,
          imo_member: imoMember,
          budget_tier: form.budget_tier || undefined,
          message: form.message,
          about: form.about || undefined,
          whatsapp: form.whatsapp || undefined,
          show_phone: showPhone,
          show_email: showEmail,
          documents: documents.length
            ? documents.map((d) => ({ type: d.type, url: d.url, name: d.name }))
            : undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message || "Başvuru gönderilemedi.")
      }

      setStatus("success")
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Başvuru gönderilemedi.")
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 text-3xl animate-bounce">
          ✓
        </div>
        <h3 className="text-lg font-bold text-ui-fg-base mb-2">
          Ön Kaydınız Alındı!
        </h3>
        <p className="text-sm text-ui-fg-subtle max-w-sm">
          İlginiz için teşekkürler. Ekibimiz başvurunuzu değerlendirip belge
          doğrulaması ve sonraki adımlar için sizinle iletişime geçecek. Onay
          e-postanızı kontrol etmeyi unutmayın.
        </p>
        <button
          onClick={() => {
            setForm({
              full_name: "",
              title: "",
              email: "",
              phone: "",
              city: "",
              district: "",
              service_areas: "",
              experience_years: "",
              budget_tier: "",
              message: "",
              about: "",
              whatsapp: "",
            })
            setSpecs([])
            setImoMember(false)
            setShowPhone(true)
            setShowEmail(false)
            setDocuments([])
            setStatus("idle")
          }}
          className="mt-6 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 px-6 rounded-lg text-sm transition-colors"
        >
          Yeni Bir Ön Kayıt Yap
        </button>
      </div>
    )
  }

  const loading = status === "loading"

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>
            Ad Soyad <span className="text-brand-500">*</span>
          </label>
          <input
            type="text"
            required
            disabled={loading}
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            placeholder="Örn: Ayşe Yılmaz"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>{isImplementer ? "Unvan / Firma" : "Unvan"}</label>
          <input
            type="text"
            disabled={loading}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder={
              isImplementer
                ? "Örn: ABC İnşaat Ltd. / Usta başı"
                : "Örn: İnşaat Yüksek Mühendisi"
            }
            className={inputCls}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>
            E-Posta <span className="text-brand-500">*</span>
          </label>
          <input
            type="email"
            required
            disabled={loading}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="muhendis@example.com"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>
            Telefon <span className="text-brand-500">*</span>
          </label>
          <input
            type="tel"
            required
            disabled={loading}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="Örn: 0532 000 0000"
            className={inputCls}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={labelCls}>Ana İl</label>
          <input
            type="text"
            disabled={loading}
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            placeholder="Örn: İstanbul"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>İlçe</label>
          <input
            type="text"
            disabled={loading}
            value={form.district}
            onChange={(e) => setForm({ ...form, district: e.target.value })}
            placeholder="Örn: Kadıköy"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Deneyim (yıl)</label>
          <input
            type="number"
            min={0}
            max={70}
            disabled={loading}
            value={form.experience_years}
            onChange={(e) =>
              setForm({ ...form, experience_years: e.target.value })
            }
            placeholder="Örn: 10"
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>
          Uzmanlık Alanları <span className="text-brand-500">*</span>
        </label>
        <p className="text-xs text-ui-fg-muted mb-2">
          Birden fazla seçebilirsiniz. Her uzmanlık ayrıca belge ile doğrulanır.
        </p>
        <div className="flex flex-wrap gap-2">
          {SPECIALIZATIONS.map((s) => {
            const active = specs.includes(s.key)
            return (
              <button
                type="button"
                key={s.key}
                disabled={loading}
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
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Ek Hizmet Bölgeleri</label>
          <input
            type="text"
            disabled={loading}
            value={form.service_areas}
            onChange={(e) =>
              setForm({ ...form, service_areas: e.target.value })
            }
            placeholder="Örn: Kocaeli, Bursa"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>
            Böyle bir dizine aylık ne kadar öderdiniz?
          </label>
          <select
            disabled={loading}
            value={form.budget_tier}
            onChange={(e) => setForm({ ...form, budget_tier: e.target.value })}
            className={inputCls}
          >
            <option value="">Seçiniz (opsiyonel)</option>
            {EXPERT_BUDGET_TIERS.map((b) => (
              <option key={b.key} value={b.key}>
                {b.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="flex items-start gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={imoMember}
          disabled={loading}
          onChange={(e) => setImoMember(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-brand-600"
        />
        <span className="text-sm text-ui-fg-base">
          {isImplementer
            ? "İlgili yetki belgesine / vergi mükellefiyetine sahibim."
            : "İnşaat Mühendisleri Odası (İMO) üyesiyim."}
        </span>
      </label>

      <div>
        <label className={labelCls}>Beklentiniz / İhtiyacınız</label>
        <p className="text-xs text-ui-fg-muted mb-1">
          Bu platformdan ne beklersiniz? Müşteriyle nasıl iletişim istersiniz,
          hangi konularda destek ararsınız? Fikirleriniz dizini şekillendirmemize
          yardımcı olacak.
        </p>
        <textarea
          rows={4}
          disabled={loading}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Örn: Güçlendirme projeleri için ciddi müşteri arıyorum; telefonum gizli kalsın, talep formuyla iletişim isterim..."
          className={`${inputCls} resize-none`}
        />
      </div>

      {/* --- Dizin profili (opsiyonel; doğrulanınca /uzmanlar'da görünür) --- */}
      <div className="border border-ui-border-base rounded-xl bg-ui-bg-subtle p-4 space-y-4">
        <div>
          <h4 className="text-sm font-bold text-ui-fg-base">
            Dizin Profili{" "}
            <span className="font-normal text-ui-fg-muted text-xs">
              (opsiyonel — onaylandığınızda profilinizde görünür)
            </span>
          </h4>
        </div>

        <div>
          <label className={labelCls}>Kısa Tanıtım (Hakkında)</label>
          <textarea
            rows={3}
            disabled={loading}
            value={form.about}
            onChange={(e) => setForm({ ...form, about: e.target.value })}
            placeholder="Deneyiminizi, öne çıkan projelerinizi, çalışma tarzınızı kısaca anlatın."
            className={`${inputCls} resize-none`}
            maxLength={2000}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>WhatsApp (opsiyonel)</label>
            <input
              type="text"
              disabled={loading}
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              placeholder="Örn: 0532 000 0000"
              className={inputCls}
            />
          </div>
          <div className="flex flex-col justify-center gap-1.5 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-ui-fg-base">
              <input
                type="checkbox"
                checked={showPhone}
                disabled={loading}
                onChange={(e) => setShowPhone(e.target.checked)}
                className="h-4 w-4 accent-brand-600"
              />
              Telefonum profilimde görünsün
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-ui-fg-base">
              <input
                type="checkbox"
                checked={showEmail}
                disabled={loading}
                onChange={(e) => setShowEmail(e.target.checked)}
                className="h-4 w-4 accent-brand-600"
              />
              E-postam profilimde görünsün
            </label>
          </div>
        </div>

        <div>
          <label className={labelCls}>Doğrulama Belgeleri</label>
          {specs.length > 0 && requiredDocLabels(specs).length > 0 && (
            <div className="text-xs mb-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">
              Seçtiğiniz uzmanlıklar için <strong>gerekli belgeler</strong>:{" "}
              {requiredDocLabels(specs).join(" · ")}. Her uzmanlık ilgili belgeyle ayrı
              doğrulanır.
            </div>
          )}
          <p className="text-xs text-ui-fg-muted mb-2">
            Diploma, oda (İMO) kaydı veya yetki belgenizi yükleyin. Belgeler yalnız
            ekibimizce incelenir, profilinizde <strong>paylaşılmaz</strong>. Görsel
            veya PDF, en fazla 5 dosya.
          </p>
          {documents.length > 0 && (
            <ul className="mb-2 space-y-1.5">
              {documents.map((doc, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between gap-2 bg-ui-bg-base border border-ui-border-base rounded-lg px-3 py-2 text-xs"
                >
                  <span className="truncate text-ui-fg-subtle">📄 {doc.name}</span>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() =>
                      setDocuments((prev) => prev.filter((_, i) => i !== idx))
                    }
                    className="text-ui-fg-muted hover:text-brand-600 font-semibold shrink-0"
                  >
                    Kaldır
                  </button>
                </li>
              ))}
            </ul>
          )}
          {documents.length < 5 && (
            <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-semibold text-brand-600 hover:text-brand-700">
              <span className="inline-block border border-brand-200 bg-brand-50 rounded-lg px-3 py-1.5">
                {uploadingDoc ? "Yükleniyor..." : "+ Belge Yükle"}
              </span>
              <input
                type="file"
                accept="image/*,application/pdf"
                multiple
                hidden
                disabled={loading || uploadingDoc}
                onChange={handleDocUpload}
              />
            </label>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Ön Kayıt Gönderiliyor...
          </>
        ) : (
          "Ön Kaydımı Gönder"
        )}
      </button>

      {status === "error" && (
        <p className="text-sm text-brand-600 text-center">
          {errorMsg || "Başvuru gönderilemedi. Lütfen tekrar deneyin."}
        </p>
      )}
    </form>
  )
}
