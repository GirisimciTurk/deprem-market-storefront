"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { verifyRegistration } from "@lib/data/customer"

/**
 * Üyelik doğrulama: e-postadaki bağlantı buraya gelir. Bağlantı tek kullanımlıktır;
 * doğrulanınca hesap açılır ve oturum kurulur, kişi hesap sayfasına gider.
 */
export default function KayitOnayPage() {
  const params = useSearchParams()
  const token = params.get("token") || ""
  const sent = params.get("gonderildi") === "1"
  const { countryCode } = useParams() as { countryCode: string }
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const started = useRef(false)

  useEffect(() => {
    if (started.current || sent) return
    started.current = true
    if (!token) {
      setError("Doğrulama bağlantısı eksik.")
      return
    }
    verifyRegistration(token).then((r) => {
      if (r.success) router.replace(`/${countryCode}/account`)
      else setError(r.error || "Doğrulama yapılamadı.")
    })
  }, [token, sent, countryCode, router])

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
          <div className="animate-spin h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full mb-4" />
          <p className="text-gray-500">Üyeliğiniz doğrulanıyor…</p>
        </>
      )}
    </div>
  )
}
