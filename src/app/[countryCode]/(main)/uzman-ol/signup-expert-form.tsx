"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createExpertCard, signupExpert } from "@lib/data/experts"
import {
  validateExpertBasics,
  validateExpertSignup,
} from "@lib/util/expert-card"
import { normalizeTrPhone } from "@lib/util/tr-phone"
import PhoneInput from "@modules/common/components/phone-input"
import CityDistrictSelect from "@modules/common/components/city-district-select"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Eye from "@modules/common/icons/eye"
import EyeOff from "@modules/common/icons/eye-off"
import { inputCls, labelCls } from "./expert-form"
import SpecializationChips from "./specialization-chips"

/**
 * "Uzman ol" formunun giriş yapmamış hâli: tek adımda müşteri hesabı ve uzman
 * kartı açılır (signupExpert). Hesap açılıp kart açılamazsa oturum açık
 * kalır; form e-posta/şifreyi gizler ve aynı bilgilerle yalnız kartı yeniden
 * dener — yazılanlar kaybolmaz.
 */
export default function SignupExpertForm() {
  const router = useRouter()
  const { countryCode } = useParams() as { countryCode: string }
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    city: "",
    district: "",
  })
  const [specs, setSpecs] = useState<string[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [emailTaken, setEmailTaken] = useState(false)
  // Hesap açıldı, oturum açık; yalnız kart kaldı.
  const [accountReady, setAccountReady] = useState(false)

  const cardHref = `/${countryCode}/account/uzman-kartim`
  // Giriş sonrası bu formun yerine gelen kısa forma dönülür.
  const loginHref = `/account?rol=uzman&redirect=${encodeURIComponent(
    `/${countryCode}/uzman-ol#kart-ac`
  )}`

  const fail = (msg: string) => {
    setErrorMsg(msg)
    setLoading(false)
  }

  const retryCard = async () => {
    const res = await createExpertCard({
      full_name: form.full_name.trim(),
      phone: normalizeTrPhone(form.phone),
      city: form.city.trim(),
      district: form.district.trim(),
      specializations: specs,
    })
    if (res.expert || res.status === 409) {
      router.push(cardHref)
      return
    }
    fail(res.error || "Uzman kartı açılamadı. Lütfen tekrar deneyin.")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Hesap açıldıysa e-posta/şifre artık gerekmez: kısa formun kuralı.
    const draft = { ...form, specializations: specs }
    const invalid = accountReady
      ? validateExpertBasics(draft)
      : validateExpertSignup(draft)
    if (invalid) {
      setErrorMsg(invalid)
      setEmailTaken(false)
      return
    }

    setLoading(true)
    setErrorMsg("")
    setEmailTaken(false)
    if (accountReady) {
      await retryCard()
      return
    }

    const res = await signupExpert({
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      password: form.password,
      phone: form.phone,
      city: form.city.trim(),
      district: form.district.trim(),
      specializations: specs,
    })
    if (res.ok) {
      router.push(cardHref)
      return
    }
    if (res.code === "email_taken") setEmailTaken(true)
    if (res.code === "card_failed") setAccountReady(true)
    fail(res.error)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {!accountReady && (
        <p className="text-sm text-ui-fg-subtle text-center">
          Zaten hesabınız var mı?{" "}
          <LocalizedClientLink
            href={loginHref}
            className="text-brand-600 font-bold hover:underline"
          >
            Uzman Girişi
          </LocalizedClientLink>
        </p>
      )}

      <div>
        <label htmlFor="signup-full-name" className={labelCls}>
          Ad Soyad <span className="text-brand-500">*</span>
        </label>
        <input
          id="signup-full-name"
          type="text"
          required
          autoComplete="name"
          disabled={loading}
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          placeholder="Örn: Ayşe Yılmaz"
          className={inputCls}
        />
      </div>

      {!accountReady && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="signup-email" className={labelCls}>
              E-posta <span className="text-brand-500">*</span>
            </label>
            <input
              id="signup-email"
              type="email"
              required
              autoComplete="email"
              disabled={loading}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="ornek@eposta.com"
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="signup-password" className={labelCls}>
              Şifre <span className="text-brand-500">*</span>
            </label>
            <div className="relative">
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                autoComplete="new-password"
                disabled={loading}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="En az 8 karakter"
                className={`${inputCls} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                className="absolute right-0 top-0 h-full px-3 text-ui-fg-subtle hover:text-ui-fg-base focus:outline-none"
              >
                {showPassword ? <Eye /> : <EyeOff />}
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <label htmlFor="signup-phone" className={labelCls}>
          Telefon <span className="text-brand-500">*</span>
        </label>
        <PhoneInput
          id="signup-phone"
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
          cityProps={{ id: "signup-city" }}
          districtProps={{ id: "signup-district" }}
        />
      </div>

      <SpecializationChips
        value={specs}
        onChange={setSpecs}
        disabled={loading}
        labelClassName={labelCls}
      />

      <p className="text-xs text-ui-fg-muted">
        Unvan, fotoğraf, hakkında yazısı, hizmet bölgeleri ve doğrulama
        belgelerini kartınız açıldıktan sonra Hesabım → Uzman Kartım sayfasından
        eklersiniz.
      </p>

      {!accountReady && (
        <p className="text-center text-xs text-ui-fg-muted">
          Hesap oluşturarak, depremTek Market{" "}
          <LocalizedClientLink href="/gizlilik-ve-guvenlik" className="underline">
            Gizlilik ve Güvenlik Sözleşmesini
          </LocalizedClientLink>{" "}
          ve{" "}
          <LocalizedClientLink href="/cerez-politikasi" className="underline">
            Çerez Politikasını
          </LocalizedClientLink>{" "}
          kabul etmiş olursunuz.
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg text-sm transition-colors shadow-sm"
      >
        {loading
          ? "Kartınız açılıyor..."
          : accountReady
            ? "Uzman Kartımı Aç"
            : "Hesabımı ve Uzman Kartımı Aç"}
      </button>

      {errorMsg && (
        <div role="alert" className="text-sm text-brand-600 text-center">
          <p>{errorMsg}</p>
          {emailTaken && (
            <LocalizedClientLink
              href={loginHref}
              className="inline-block mt-2 font-bold underline"
            >
              Uzman Girişi
            </LocalizedClientLink>
          )}
        </div>
      )}
    </form>
  )
}
