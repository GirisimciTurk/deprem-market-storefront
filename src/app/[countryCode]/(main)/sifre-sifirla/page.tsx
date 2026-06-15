"use client"

import { useMemo, useState, useTransition } from "react"
import { useSearchParams } from "next/navigation"
import { resetPassword } from "@lib/data/customer"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Input from "@modules/common/components/input"
import { SubmitButton } from "@modules/checkout/components/submit-button"

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""
  const email = searchParams.get("email") || ""

  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const linkValid = useMemo(() => !!token && !!email, [token, email])

  const handleSubmit = (formData: FormData) => {
    setError(null)
    const password = (formData.get("password") as string) || ""
    const confirm = (formData.get("confirm") as string) || ""
    if (password.length < 8) {
      setError("Şifre en az 8 karakter olmalıdır.")
      return
    }
    if (password !== confirm) {
      setError("Şifreler eşleşmiyor.")
      return
    }
    startTransition(async () => {
      const res = await resetPassword(email, password, token)
      if (res.success) {
        setDone(true)
      } else {
        setError(res.error)
      }
    })
  }

  return (
    <div className="content-container flex justify-center py-16 small:py-24">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm p-8 small:p-10">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V7.5a4.5 4.5 0 10-9 0v3M6.75 10.5h10.5a2.25 2.25 0 012.25 2.25v6A2.25 2.25 0 0117.25 21H6.75A2.25 2.25 0 014.5 18.75v-6a2.25 2.25 0 012.25-2.25z" />
            </svg>
          </div>
          <h1 className="text-xl font-extrabold text-gray-900 uppercase tracking-tight">
            Yeni Şifre Belirle
          </h1>
        </div>

        {!linkValid ? (
          <div className="text-center">
            <div className="bg-brand-50 border border-brand-200 text-brand-700 text-sm font-medium p-4 rounded-xl mb-5 leading-relaxed">
              Sıfırlama bağlantısı geçersiz. Lütfen şifre sıfırlama e-postasındaki bağlantıyı
              kullanın veya yeni bir bağlantı isteyin.
            </div>
            <LocalizedClientLink href="/account" className="text-orange-600 font-bold text-sm hover:underline">
              Girişe dön
            </LocalizedClientLink>
          </div>
        ) : done ? (
          <div className="text-center">
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm font-medium p-4 rounded-xl mb-5 leading-relaxed">
              Şifreniz başarıyla güncellendi. Artık yeni şifrenizle giriş yapabilirsiniz.
            </div>
            <LocalizedClientLink
              href="/account"
              className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 px-7 rounded-lg text-sm transition-colors"
            >
              Giriş Yap
            </LocalizedClientLink>
          </div>
        ) : (
          <>
            <p className="text-center text-sm text-gray-500 mb-6 leading-relaxed">
              <strong className="text-gray-700">{email}</strong> hesabı için yeni şifrenizi belirleyin.
            </p>
            <form action={handleSubmit}>
              <div className="flex flex-col gap-y-3">
                <Input
                  label="Yeni Şifre"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  data-testid="new-password-input"
                />
                <Input
                  label="Yeni Şifre (Tekrar)"
                  name="confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  data-testid="confirm-password-input"
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">En az 8 karakter.</p>
              {error && (
                <div className="bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold p-3 rounded-lg mt-3">
                  {error}
                </div>
              )}
              <SubmitButton
                data-testid="reset-password-button"
                className="w-full mt-5 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 rounded-lg shadow-sm transition-colors border-0"
              >
                Şifreyi Güncelle
              </SubmitButton>
            </form>
            {isPending && (
              <p className="text-xs text-gray-400 mt-3 text-center">Güncelleniyor...</p>
            )}
            <div className="text-center mt-6">
              <LocalizedClientLink href="/account" className="text-xs text-gray-500 hover:text-orange-600 font-semibold">
                Girişe dön
              </LocalizedClientLink>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
