"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createExpertCard } from "@lib/data/experts"
import { validateExpertBasics } from "@lib/util/expert-card"
import { formatTrPhone, normalizeTrPhone } from "@lib/util/tr-phone"
import PhoneInput from "@modules/common/components/phone-input"
import CityDistrictSelect from "@modules/common/components/city-district-select"
import ExpertTitleSelect from "@modules/experts/components/title-select"
import SpecializationChips from "./specialization-chips"

export const inputCls =
  "w-full border border-ui-border-base rounded-lg px-4 py-2 bg-ui-bg-base text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
export const labelCls =
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
    phone: formatTrPhone(initial.phone),
    city: "",
    district: "",
  })
  const [specs, setSpecs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

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
      phone: normalizeTrPhone(form.phone),
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
          <ExpertTitleSelect
            id="expert-title"
            disabled={loading}
            value={form.title}
            onChange={(title) => setForm({ ...form, title })}
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label htmlFor="expert-phone" className={labelCls}>
          Telefon <span className="text-brand-500">*</span>
        </label>
        <PhoneInput
          id="expert-phone"
          required
          disabled={loading}
          value={form.phone}
          onChange={(phone) => setForm({ ...form, phone })}
          className={inputCls}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CityDistrictSelect
          city={form.city}
          district={form.district}
          onChange={({ city, district }) => setForm({ ...form, city, district })}
          required
          disabled={loading}
          className={inputCls}
          labelClassName={labelCls}
          cityLabel={
            <>
              İl <span className="text-brand-500">*</span>
            </>
          }
          districtLabel={
            <>
              İlçe <span className="text-brand-500">*</span>
            </>
          }
          cityProps={{ id: "expert-city" }}
          districtProps={{ id: "expert-district" }}
        />
      </div>

      <SpecializationChips
        value={specs}
        onChange={setSpecs}
        disabled={loading}
        labelClassName={labelCls}
      />

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
