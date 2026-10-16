"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ENGINEER_SPECIALIZATIONS } from "@lib/expert-config"
import { createExpertCard } from "@lib/data/experts"
import { validateExpertBasics } from "@lib/util/expert-card"

const inputCls =
  "w-full border border-ui-border-base rounded-lg px-4 py-2 bg-ui-bg-base text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
const labelCls =
  "block text-xs font-bold text-ui-fg-base uppercase tracking-wider mb-1"

/**
 * "Uzman ol" kısa formu. Giriş yapmış müşteri yalnız temel bilgileri girer;
 * kart anında açılır ve gerisi (fotoğraf, hakkında, bölgeler, belgeler)
 * Hesabım → Uzman Kartım'dan düzenlenir. Kart, ekibimiz doğrulayana kadar
 * dizinde görünmez.
 */
export default function ExpertForm({
  initial,
}: {
  initial: { full_name: string; phone: string }
}) {
  const router = useRouter()
  const { countryCode } = useParams() as { countryCode: string }
  const [form, setForm] = useState({
    full_name: initial.full_name,
    title: "",
    phone: initial.phone,
    city: "",
    district: "",
  })
  const [specs, setSpecs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const toggleSpec = (key: string) =>
    setSpecs((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )

  const cardHref = `/${countryCode}/account/uzman-kartim`

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const invalid = validateExpertBasics({ ...form, specializations: specs })
    if (invalid) {
      setErrorMsg(invalid)
      return
    }

    setLoading(true)
    setErrorMsg("")
    const res = await createExpertCard({
      full_name: form.full_name.trim(),
      title: form.title.trim() || undefined,
      phone: form.phone.trim(),
      city: form.city.trim(),
      district: form.district.trim(),
      specializations: specs,
    })
    // 409: müşterinin zaten kartı var — kartına götür.
    if (res.expert || res.status === 409) {
      router.push(cardHref)
      return
    }
    setErrorMsg(res.error || "Uzman kartı açılamadı. Lütfen tekrar deneyin.")
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="expert-full-name" className={labelCls}>
            Ad Soyad <span className="text-brand-500">*</span>
          </label>
          <input
            id="expert-full-name"
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
          <label htmlFor="expert-title" className={labelCls}>
            Unvan
          </label>
          <input
            id="expert-title"
            type="text"
            disabled={loading}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Örn: İnşaat Yüksek Mühendisi"
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label htmlFor="expert-phone" className={labelCls}>
          Telefon <span className="text-brand-500">*</span>
        </label>
        <input
          id="expert-phone"
          type="tel"
          required
          disabled={loading}
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="Örn: 0532 000 0000"
          className={inputCls}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="expert-city" className={labelCls}>
            İl <span className="text-brand-500">*</span>
          </label>
          <input
            id="expert-city"
            type="text"
            required
            disabled={loading}
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            placeholder="Örn: İstanbul"
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="expert-district" className={labelCls}>
            İlçe <span className="text-brand-500">*</span>
          </label>
          <input
            id="expert-district"
            type="text"
            required
            disabled={loading}
            value={form.district}
            onChange={(e) => setForm({ ...form, district: e.target.value })}
            placeholder="Örn: Kadıköy"
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <span className={labelCls}>
          Uzmanlık Alanları <span className="text-brand-500">*</span>
        </span>
        <p className="text-xs text-ui-fg-muted mb-2">
          Birden fazla seçebilirsiniz. Her uzmanlık ayrıca belge ile doğrulanır.
        </p>
        <div className="flex flex-wrap gap-2">
          {ENGINEER_SPECIALIZATIONS.map((s) => {
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

      <p className="text-xs text-ui-fg-muted">
        Fotoğraf, hakkında yazısı, hizmet bölgeleri ve doğrulama belgelerini kartınız
        açıldıktan sonra Hesabım → Uzman Kartım sayfasından eklersiniz.
      </p>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg text-sm transition-colors shadow-sm"
      >
        {loading ? "Kartınız açılıyor..." : "Uzman Kartımı Aç"}
      </button>

      {errorMsg && (
        <p role="alert" className="text-sm text-brand-600 text-center">
          {errorMsg}
        </p>
      )}
    </form>
  )
}
