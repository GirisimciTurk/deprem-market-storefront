"use client"

import { useState, useTransition } from "react"
import { resetExpertPassword } from "@lib/data/expert-auth"
import { EXPERT_PASSWORD_MIN } from "@lib/expert-config"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

/** Uzman hesabının sıfırlama bağlantısı (?token=&email=): yeni şifre yazılır, kişi uzman paneline girer. */
export default function ExpertResetForm({ token, email }: { token: string; email: string }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const submit = (formData: FormData) => {
    setError(null)
    const password = String(formData.get("password") ?? "")
    if (password.length < EXPERT_PASSWORD_MIN) {
      setError(`Şifre en az ${EXPERT_PASSWORD_MIN} karakter olmalı.`)
      return
    }
    if (password !== String(formData.get("confirm") ?? "")) {
      setError("Şifreler eşleşmiyor.")
      return
    }
    startTransition(async () => {
      const res = await resetExpertPassword(token, password)
      if (res.success) setDone(true)
      else setError(res.error)
    })
  }

  return (
    <div className="content-container flex justify-center py-16 small:py-24">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm p-8 small:p-10">
        <h1 className="text-xl font-extrabold text-gray-900 uppercase tracking-tight text-center mb-6">
          Uzman Hesabı · Yeni Şifre
        </h1>
        {done ? (
          <div className="text-center">
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm font-medium p-4 rounded-xl mb-5 leading-relaxed">
              Şifreniz güncellendi ve uzman hesabınıza giriş yaptınız. Diğer cihazlardaki uzman oturumlarınız kapatıldı.
            </div>
            <LocalizedClientLink
              href="/uzman/panel"
              className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 px-7 rounded-lg text-sm transition-colors"
            >
              Uzman Paneline Git
            </LocalizedClientLink>
          </div>
        ) : (
          <>
            <p className="text-center text-sm text-gray-500 mb-6 leading-relaxed">
              {email ? (
                <>
                  <strong className="text-gray-700">{email}</strong> uzman hesabı için yeni şifrenizi belirleyin.
                </>
              ) : (
                "Uzman hesabınız için yeni şifrenizi belirleyin."
              )}
            </p>
            <form action={submit}>
              <div className="flex flex-col gap-y-3">
                <Input label="Yeni Şifre" name="password" type="password" autoComplete="new-password" required />
                <Input label="Yeni Şifre (Tekrar)" name="confirm" type="password" autoComplete="new-password" required />
              </div>
              <p className="text-xs text-gray-400 mt-2">En az {EXPERT_PASSWORD_MIN} karakter.</p>
              {error && (
                <div className="bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold p-3 rounded-lg mt-3">
                  {error}
                </div>
              )}
              <SubmitButton className="w-full mt-5 bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 rounded-lg shadow-sm transition-colors border-0">
                {isPending ? "Güncelleniyor..." : "Şifreyi Güncelle"}
              </SubmitButton>
            </form>
            <div className="text-center mt-6">
              <LocalizedClientLink href="/uzman/giris" className="text-xs text-gray-500 hover:text-brand-600 font-semibold">
                Uzman girişine dön
              </LocalizedClientLink>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
