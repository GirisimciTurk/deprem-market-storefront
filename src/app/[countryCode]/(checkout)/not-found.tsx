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
        {isTr ? "Sipariş / Ödeme Sayfası Bulunamadı" : "Checkout Page Not Found"}
      </h1>
      <p className="max-w-md text-base text-ui-fg-subtle leading-relaxed">
        {isTr
          ? "Ulaşmaya çalıştığınız ödeme adımı veya sipariş sepeti bulunamadı. Lütfen alışveriş sepetinize geri dönün."
          : "The checkout step or order you tried to access does not exist or has expired."}
      </p>
      <div className="mt-4">
        <LocalizedClientLink 
          href="/cart" 
          className="text-rose-600 font-bold hover:underline"
        >
          {isTr ? "← Sepete Geri Dön" : "← Return to Cart"}
        </LocalizedClientLink>
      </div>
    </div>
  )
}
