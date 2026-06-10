"use client"

import React from "react"
import { usePathname } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function NotFound() {
  const pathname = usePathname()
  const isTr = pathname?.startsWith("/tr") || pathname === "/tr"

  return (
    <div className="flex flex-col gap-4 items-center justify-center min-h-[calc(100vh-64px)] px-4 text-center">
      <h1 className="text-4xl font-extrabold text-ui-fg-base tracking-tight mb-2">
        {isTr ? "Sayfa Bulunamadı" : "Sayfa Bulunamadı"}
      </h1>
      <p className="max-w-md text-base text-ui-fg-subtle leading-relaxed">
        {isTr
          ? "Ulaşmaya çalıştığınız sayfa mevcut değil veya taşınmış olabilir. Lütfen adresi kontrol edin."
          : "Ulaşmaya çalıştığınız sayfa mevcut değil veya taşınmış olabilir. Lütfen adresi kontrol edin."}
      </p>
      <div className="mt-4">
        <LocalizedClientLink 
          href="/" 
          className="text-rose-600 font-bold hover:underline"
        >
          {isTr ? "← Ana Sayfaya Dön" : "← Ana Sayfaya Dön"}
        </LocalizedClientLink>
      </div>
    </div>
  )
}
