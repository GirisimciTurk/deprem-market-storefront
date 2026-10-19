"use client"

import { useActionState, useState, useTransition } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { expertSignIn, expertSignUp, requestExpertPasswordReset } from "@lib/data/expert-auth"
import { EXPERT_PASSWORD_MIN } from "@lib/expert-config"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

// Uzman Girişi: müşteri hesabından ayrı uzman hesabının girişi, kaydı ve
// şifre sıfırlama isteği. Aynı e-posta müşteri hesabında da kullanılabilir;
// burada açılan hesap yalnız uzman panelinin hesabıdır.

export type ExpertAuthView = "giris" | "kayit" | "sifre"

const button =
  "w-full mt-5 bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 rounded-lg shadow-sm transition-colors border-0"

function SignIn({ show }: { show: (v: ExpertAuthView) => void }) {
  const { countryCode } = useParams() as { countryCode: string }
  const redirectTo = useSearchParams().get("redirect")
  const [message, formAction] = useActionState(expertSignIn, null)

  return (
    <>
      <h1 className="text-xl font-extrabold text-gray-900 uppercase tracking-tight mb-2">Uzman Girişi</h1>
      <p className="text-center text-sm text-gray-500 mb-6">
        Uzman hesabınızla girin; kartınızı, gelen talepleri ve değerlendirmeleri yönetin.
      </p>
      <form className="w-full" action={formAction}>
        <input type="hidden" name="country_code" value={countryCode} />
        {redirectTo && <input type="hidden" name="redirect" value={redirectTo} />}
        <div className="flex flex-col w-full gap-y-3">
          <Input label="E-posta Adresi" name="email" type="email" autoComplete="email" required />
          <Input label="Şifre" name="password" type="password" autoComplete="current-password" required />
        </div>
        <div className="flex justify-end mt-2">
          <button
            type="button"
            onClick={() => show("sifre")}
            className="text-xs text-gray-500 hover:text-brand-600 font-semibold"
          >
            Şifremi unuttum?
          </button>
        </div>
        <ErrorMessage error={message} data-testid="expert-sign-in-error" />
        <SubmitButton className={button}>Giriş Yap</SubmitButton>
      </form>
      <span className="text-center text-gray-500 text-xs mt-6">
        Uzman hesabınız yok mu?{" "}
        <button type="button" onClick={() => show("kayit")} className="text-brand-600 font-bold hover:underline">
          Uzman Hesabı Açın
        </button>
      </span>
    </>
  )
}

function SignUp({ show }: { show: (v: ExpertAuthView) => void }) {
  const { countryCode } = useParams() as { countryCode: string }
  const [message, formAction] = useActionState(expertSignUp, null)

  return (
    <>
      <h1 className="text-xl font-extrabold text-gray-900 uppercase tracking-tight mb-2">Uzman Hesabı Aç</h1>
      <p className="text-center text-sm text-gray-500 mb-6">
        Uzman hesabı, alışveriş hesabınızdan ayrıdır. Aynı e-postayı kullanabilirsiniz; şifreniz ayrı tutulur.
      </p>
      <form className="w-full" action={formAction}>
        <input type="hidden" name="country_code" value={countryCode} />
        <div className="flex flex-col w-full gap-y-3">
          <Input label="E-posta Adresi" name="email" type="email" autoComplete="email" required />
          <Input
            label={`Şifre (en az ${EXPERT_PASSWORD_MIN} karakter)`}
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={EXPERT_PASSWORD_MIN}
            required
          />
          <Input label="Şifre (Tekrar)" name="password_repeat" type="password" autoComplete="new-password" required />
        </div>
        <label className="flex items-start gap-2 mt-4 text-xs text-gray-600 leading-relaxed">
          <input type="checkbox" name="consent" required className="mt-0.5" />
          <span>
            <LocalizedClientLink href="/kvkk" className="text-brand-600 font-semibold hover:underline" target="_blank">
              KVKK Aydınlatma Metni
            </LocalizedClientLink>
            &apos;ni okudum; uzman kartımda paylaşacağım bilgilerin dizinde yayınlanacağını biliyorum.
          </span>
        </label>
        <ErrorMessage error={message} data-testid="expert-sign-up-error" />
        <SubmitButton className={button}>Hesabımı Aç</SubmitButton>
      </form>
      <span className="text-center text-gray-500 text-xs mt-6">
        Uzman hesabınız var mı?{" "}
        <button type="button" onClick={() => show("giris")} className="text-brand-600 font-bold hover:underline">
          Giriş Yapın
        </button>
      </span>
    </>
  )
}

function Forgot({ show }: { show: (v: ExpertAuthView) => void }) {
  const [isPending, startTransition] = useTransition()
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = (formData: FormData) => {
    setError(null)
    startTransition(async () => {
      const res = await requestExpertPasswordReset(String(formData.get("email") ?? ""))
      if (res.success) setSent(true)
      else setError(res.error)
    })
  }

  return (
    <>
      <h1 className="text-xl font-extrabold text-gray-900 uppercase tracking-tight mb-2">Şifremi Unuttum</h1>
      {sent ? (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm font-medium p-4 rounded-xl my-4 leading-relaxed text-center">
          Bu e-postayla bir uzman hesabı varsa şifre sıfırlama bağlantısı gönderildi. Bağlantı 1 saat geçerlidir.
        </div>
      ) : (
        <>
          <p className="text-center text-sm text-gray-500 mb-6">
            Uzman hesabınızın e-postasını girin; şifrenizi sıfırlamanız için bir bağlantı gönderelim.
          </p>
          <form className="w-full" action={submit}>
            <Input label="E-posta Adresi" name="email" type="email" autoComplete="email" required />
            <ErrorMessage error={error} data-testid="expert-forgot-error" />
            <SubmitButton className={button}>{isPending ? "Gönderiliyor..." : "Bağlantı Gönder"}</SubmitButton>
          </form>
        </>
      )}
      <button
        type="button"
        onClick={() => show("giris")}
        className="text-xs text-gray-500 hover:text-brand-600 font-semibold mt-6"
      >
        Uzman girişine dön
      </button>
    </>
  )
}

export default function ExpertAuth({ initial }: { initial: ExpertAuthView }) {
  const [view, setView] = useState<ExpertAuthView>(initial)

  return (
    <div className="content-container flex justify-center py-16 small:py-24">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm p-8 small:p-10 flex flex-col items-center">
        {view === "giris" && <SignIn show={setView} />}
        {view === "kayit" && <SignUp show={setView} />}
        {view === "sifre" && <Forgot show={setView} />}
        <p className="text-[11px] text-gray-400 mt-8 text-center leading-relaxed">
          Alışveriş yapmak için mi geldiniz?{" "}
          <LocalizedClientLink href="/account" className="font-semibold hover:text-brand-600">
            Müşteri girişi
          </LocalizedClientLink>
        </p>
      </div>
    </div>
  )
}
