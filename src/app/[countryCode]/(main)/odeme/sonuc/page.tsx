"use client"

import { useEffect, useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { clearCartCookie } from "./actions"

/**
 * PayTR ödeme sonucu sayfası (merchant_ok_url / merchant_fail_url hedefi).
 * PayTR bu sayfayı önce IFRAME içinde açar → üst pencereye kırılır (breakout).
 * Sipariş, sunucu-sunucu /paytr-callback ile zaten oluşturulmuştur; bu sayfa
 * yalnız sonucu gösterir ve başarılıysa sepet çerezini temizler.
 */
export default function OdemeSonucPage() {
  const [ready, setReady] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // 1) Iframe içindeysek üst pencereyi bu sayfaya yönlendir (breakout).
    if (typeof window !== "undefined" && window.self !== window.top) {
      try {
        window.top!.location.href = window.location.href
      } catch {
        /* cross-origin engeli olmamalı (aynı origin) */
      }
      return
    }
    // 2) Üst penceredeyiz: durumu oku.
    const status = new URLSearchParams(window.location.search).get("status")
    const ok = status === "success"
    setSuccess(ok)
    setReady(true)
    if (ok) {
      clearCartCookie().catch(() => {})
    }
  }, [])

  if (!ready) {
    return (
      <div className="content-container py-24 flex flex-col items-center justify-center text-center">
        <div className="animate-spin h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full mb-4" />
        <p className="text-gray-500">Ödeme sonucu işleniyor…</p>
      </div>
    )
  }

  return (
    <div className="content-container py-20 flex flex-col items-center justify-center text-center max-w-xl mx-auto">
      {success ? (
        <>
          <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-5">
            <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ödemeniz Alındı</h1>
          <p className="text-gray-600 mb-8">
            Siparişiniz başarıyla oluşturuldu. Sipariş detaylarını ve durumunu hesabınızdan takip
            edebilirsiniz. Onay e-postanız gönderildi.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <LocalizedClientLink
              href="/account/orders"
              className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Siparişlerim
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/store"
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Alışverişe Devam Et
            </LocalizedClientLink>
          </div>
        </>
      ) : (
        <>
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-5">
            <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ödeme Tamamlanamadı</h1>
          <p className="text-gray-600 mb-8">
            Ödemeniz alınamadı veya iptal edildi. Sepetiniz korundu; dilerseniz tekrar
            deneyebilirsiniz.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <LocalizedClientLink
              href="/cart"
              className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Sepete Dön
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/store"
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Alışverişe Devam Et
            </LocalizedClientLink>
          </div>
        </>
      )}
    </div>
  )
}
