"use client"

import { useState, useTransition } from "react"
import { useParams, useRouter } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { verifyRegistration } from "@lib/data/customer"

/**
 * Bağlantı tek kullanımlıktır ve açıldığı tarayıcıda oturum kurar; bu yüzden
 * doğrulama sayfa açılınca değil düğmeyle yapılır: bağlantıyı önceden açan
 * e-posta tarayıcıları jetonu harcamasın. Doğrulanınca kişi hesap sayfasına
 * gider.
 */
export default function VerifyRegistration({ token, sent }: { token: string; sent: boolean }) {
  const { countryCode } = useParams() as { countryCode: string }
  const router = useRouter()
  const [error, setError] = useState<string | null>(token ? null : "Doğrulama bağlantısı eksik.")
  const [pending, startTransition] = useTransition()

  const onConfirm = () =>
    startTransition(async () => {
      const r = await verifyRegistration(token)
      if (r.success) router.replace(`/${countryCode}/account`)
      else setError(r.error || "Doğrulama yapılamadı.")
    })

  if (sent) {
    return (
      <div className="content-container py-24 flex flex-col items-center text-center max-w-md mx-auto">
        <h1 className="text-xl font-bold text-gray-900 mb-2">E-postanızı kontrol edin</h1>
        <p className="text-gray-600">
          Adresinize bir doğrulama bağlantısı gönderdik. Bağlantıyı açarak üyeliğinizi tamamlayın; bağlantı bir saat
          geçerlidir.
        </p>
      </div>
    )
  }

  return (
    <div className="content-container py-24 flex flex-col items-center text-center max-w-md mx-auto">
      {error ? (
        <>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Üyelik doğrulanamadı</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <LocalizedClientLink href="/account" className="text-brand-600 font-semibold hover:underline">
            Üye ol / Giriş yap
          </LocalizedClientLink>
        </>
      ) : (
        <>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Üyeliğinizi tamamlayın</h1>
          <p className="text-gray-600 mb-6">
            E-posta adresinizi doğrulamak ve hesabınızı açmak için aşağıdaki düğmeye basın.
          </p>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 px-6 rounded-lg text-sm transition-colors disabled:opacity-60"
          >
            {pending ? "Doğrulanıyor..." : "Üyeliğimi tamamla"}
          </button>
        </>
      )}
    </div>
  )
}
