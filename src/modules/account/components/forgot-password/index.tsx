"use client"

import { useState, useTransition } from "react"
import { requestPasswordReset } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const ForgotPassword = ({ setCurrentView }: Props) => {
  const [isPending, startTransition] = useTransition()
  const [sent, setSent] = useState(false)

  const handleSubmit = (formData: FormData) => {
    const email = (formData.get("email") as string)?.trim()
    if (!email) return
    startTransition(async () => {
      await requestPasswordReset(email)
      // Güvenlik: e-posta kayıtlı olsun olmasın aynı mesajı göster.
      setSent(true)
    })
  }

  return (
    <div
      className="max-w-sm w-full flex flex-col items-center"
      data-testid="forgot-password-page"
    >
      <h1 className="text-xl font-extrabold text-gray-900 uppercase tracking-tight mb-2">
        Şifremi Sıfırla
      </h1>

      {sent ? (
        <>
          <div className="w-full bg-green-50 border border-green-200 text-green-700 text-sm font-medium p-4 rounded-lg my-4 text-center leading-relaxed">
            Eğer bu e-posta adresine kayıtlı bir hesap varsa, şifre sıfırlama bağlantısı
            gönderildi. Lütfen gelen kutunuzu (ve spam klasörünüzü) kontrol edin.
          </div>
          <button
            type="button"
            onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
            className="text-orange-600 font-bold text-sm hover:underline mt-2"
          >
            Girişe dön
          </button>
        </>
      ) : (
        <>
          <p className="text-center text-sm text-gray-500 mb-6">
            E-posta adresinizi girin; size şifrenizi sıfırlamanız için bir bağlantı gönderelim.
          </p>
          <form className="w-full" action={handleSubmit}>
            <Input
              label="E-posta Adresi"
              name="email"
              type="email"
              title="Geçerli bir e-posta girin."
              autoComplete="email"
              required
              data-testid="forgot-email-input"
            />
            <SubmitButton
              data-testid="send-reset-button"
              className="w-full mt-5 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 rounded-lg shadow-sm transition-colors border-0"
            >
              Sıfırlama Bağlantısı Gönder
            </SubmitButton>
          </form>
          <span className="text-center text-gray-500 text-xs mt-6 select-none">
            Şifrenizi hatırladınız mı?{" "}
            <button
              type="button"
              onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
              className="text-orange-600 font-bold hover:underline"
            >
              Giriş Yap
            </button>
          </span>
        </>
      )}
      {isPending && (
        <span className="text-xs text-gray-400 mt-3">Gönderiliyor...</span>
      )}
    </div>
  )
}

export default ForgotPassword
