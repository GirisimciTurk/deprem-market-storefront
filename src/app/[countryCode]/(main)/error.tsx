"use client"

import React, { useEffect } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

/**
 * (main) segmentinin hata sınırı.
 *
 * Bu dosya yokken bir sayfada beklenmedik hata olduğunda kullanıcı Next.js'in
 * ham ekranını görüyordu ("Application error: a client-side exception has
 * occurred") — markasız, Türkçe olmayan ve ne yapacağını söylemeyen bir ekran.
 * Artık nav/footer yerinde kalır ve kullanıcıya somut iki çıkış verilir:
 * tekrar dene, ya da ana sayfaya dön.
 *
 * Metinler bilerek çeviri dosyasına bağlanmadı: çeviri altyapısının kendisi
 * hata verdiğinde bu bileşen de patlar, yani hata sınırının en son savunma
 * hattı olma amacı bozulurdu.
 */
export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Sunucu tarafı zaten logluyor; burada tarayıcı konsoluna da düşürüyoruz ki
    // kullanıcı destek talebinde digest'i paylaşabilsin.
    console.error("[Sayfa hatası]", error)
  }, [error])

  return (
    <div className="flex flex-col gap-4 items-center justify-center min-h-[calc(100vh-64px)] px-4 text-center">
      <span className="text-5xl mb-2" aria-hidden="true">
        ⚠️
      </span>
      <h1 className="text-3xl font-extrabold text-ui-fg-base tracking-tight">
        Bir şeyler ters gitti
      </h1>
      <p className="max-w-md text-base text-ui-fg-subtle leading-relaxed">
        Bu sayfa yüklenirken beklenmedik bir hata oluştu. Tekrar denemek
        sorunu genellikle çözer.
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
          href="/"
          className="rounded-lg border border-ui-border-base px-6 py-2.5 text-sm font-semibold text-ui-fg-base transition-colors hover:bg-slate-50"
        >
          Ana sayfaya dön
        </LocalizedClientLink>
      </div>

      {/* Destek için hata kimliği — sunucu loglarıyla eşleştirmeyi sağlar. */}
      {error.digest && (
        <p className="mt-6 text-xs text-ui-fg-muted">
          Hata kodu: <span className="font-mono">{error.digest}</span>
        </p>
      )}
    </div>
  )
}
