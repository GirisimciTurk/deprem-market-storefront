"use client"

import { useActionState, useState, useTransition } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { marketerSignIn, requestMarketerPasswordReset } from "@lib/data/marketer"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"

// Pazarlamacı Girişi: yönetimin açtığı pazarlamacı hesabının girişi ve şifre
// bağlantısı isteği. Kayıt yoktur; hesap yönetim tarafından açılır.

export type MarketerAuthView = "giris" | "sifre"

const button =
  "w-full mt-5 bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 rounded-lg shadow-sm transition-colors border-0"

function SignIn({ show }: { show: (v: MarketerAuthView) => void }) {
  const { countryCode } = useParams() as { countryCode: string }
  const redirectTo = useSearchParams().get("redirect")
  const [message, formAction] = useActionState(marketerSignIn, null)

  return (
    <>
      <h1 className="text-xl font-extrabold text-gray-900 uppercase tracking-tight mb-2">Pazarlamacı Girişi</h1>
      <p className="text-center text-sm text-gray-500 mb-6">
        Referans kodunuzu, getirdiğiniz satıcıları ve hak edişinizi görün.
      </p>
      <form className="w-full" action={formAction}>
        <input type="hidden" name="country_code" value={countryCode} />
        {redirectTo && <input type="hidden" name="redirect" value={redirectTo} />}
        <div className="flex flex-col w-full gap-y-3">
          <Input label="E-posta Adresi" name="email" type="email" autoComplete="email" required />
          <Input label="Şifre" name="password" type="password" autoComplete="current-password" required />
        </div>
        <div className="flex justify-end mt-2">
          <button type="button" onClick={() => show("sifre")} className="text-xs text-gray-500 hover:text-brand-600 font-semibold">
            Şifremi unuttum?
          </button>
        </div>
        <ErrorMessage error={message} data-testid="marketer-sign-in-error" />
        <SubmitButton className={button}>Giriş Yap</SubmitButton>
      </form>
      <p className="text-center text-gray-500 text-xs mt-6 leading-relaxed">
        Pazarlamacı hesabını yönetim açar; size gelen e-postadaki bağlantıyla şifrenizi belirleyin.
      </p>
    </>
  )
}

function Forgot({ show }: { show: (v: MarketerAuthView) => void }) {
  const [isPending, startTransition] = useTransition()
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = (formData: FormData) => {
    setError(null)
    startTransition(async () => {
      const res = await requestMarketerPasswordReset(String(formData.get("email") ?? ""))
      if (res.success) setSent(true)
      else setError(res.error)
    })
  }

  return (
    <>
      <h1 className="text-xl font-extrabold text-gray-900 uppercase tracking-tight mb-2">Şifremi Unuttum</h1>
      {sent ? (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm font-medium p-4 rounded-xl my-4 leading-relaxed text-center">
          Bu e-postayla bir pazarlamacı hesabı varsa şifre bağlantısı gönderildi. Bağlantı 1 saat geçerlidir.
        </div>
      ) : (
        <>
          <p className="text-center text-sm text-gray-500 mb-6">
            Pazarlamacı hesabınızın e-postasını girin; şifrenizi belirlemeniz için bir bağlantı gönderelim.
          </p>
          <form className="w-full" action={submit}>
            <Input label="E-posta Adresi" name="email" type="email" autoComplete="email" required />
            <ErrorMessage error={error} data-testid="marketer-forgot-error" />
            <SubmitButton className={button}>{isPending ? "Gönderiliyor..." : "Bağlantı Gönder"}</SubmitButton>
          </form>
        </>
      )}
      <button type="button" onClick={() => show("giris")} className="text-xs text-gray-500 hover:text-brand-600 font-semibold mt-6">
        Pazarlamacı girişine dön
      </button>
    </>
  )
}

export default function MarketerAuth({ initial }: { initial: MarketerAuthView }) {
  const [view, setView] = useState<MarketerAuthView>(initial)

  return (
    <div className="content-container flex justify-center py-16 small:py-24">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm p-8 small:p-10 flex flex-col items-center">
        {view === "giris" ? <SignIn show={setView} /> : <Forgot show={setView} />}
      </div>
    </div>
  )
}
