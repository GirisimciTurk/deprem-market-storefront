"use client"

import React, { useEffect } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

/**
 * Ödeme akışının hata sınırı — ayrı tutuldu çünkü buradaki hata en pahalısı:
 * kullanıcı sepetini doldurmuş, ödemeye gelmiş ve ekran çökerse alışveriş
 * tamamen kaybedilir.
 *
 * Bu yüzden metin, siparişin/sepetin kaybolmadığını AÇIKÇA söyler ve kullanıcıyı
 * sepete geri döndürür — genel hata sayfasının "ana sayfaya dön"ü burada
 * kullanıcıyı akıştan büsbütün uzaklaştırırdı.
 */
export default function CheckoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[Ödeme akışı hatası]", error)
  }, [error])

  return (
    <div className="flex flex-col gap-4 items-center justify-center min-h-[60vh] px-4 text-center">
      <span className="text-5xl mb-2" aria-hidden="true">
        ⚠️
      </span>
      <h1 className="text-2xl font-extrabold text-ui-fg-base tracking-tight">
        Ödeme adımında bir sorun oluştu
      </h1>
      <p className="max-w-md text-base text-ui-fg-subtle leading-relaxed">
        <strong>Sepetiniz duruyor</strong> ve kartınızdan bir çekim yapılmadı.
        Tekrar deneyebilir veya sepetinize dönüp ödemeyi yeniden başlatabilirsiniz.
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-700"
        >
          Tekrar dene
        </button>
        <LocalizedClientLink
          href="/cart"
          className="rounded-lg border border-ui-border-base px-6 py-2.5 text-sm font-semibold text-ui-fg-base transition-colors hover:bg-slate-50"
        >
          Sepete dön
        </LocalizedClientLink>
      </div>

      {error.digest && (
        <p className="mt-6 text-xs text-ui-fg-muted">
          Hata kodu: <span className="font-mono">{error.digest}</span>
        </p>
      )}
    </div>
  )
}
