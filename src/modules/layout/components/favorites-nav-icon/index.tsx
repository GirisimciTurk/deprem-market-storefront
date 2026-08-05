"use client"

import React from "react"
import { Heart } from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useWishlist } from "@lib/context/wishlist-context"

/**
 * Üst bardaki favori ikonu + sayaç. Sayı artık localStorage'dan değil, hesaba
 * bağlı wishlist context'inden okunur → kalp butonuyla anında senkron.
 * Giriş yoksa sayaç görünmez (rozet 0'da zaten gizli).
 */
export default function FavoritesNavIcon({ label }: { label?: string }) {
  const { count } = useWishlist()

  return (
    <LocalizedClientLink
      className="hover:text-ui-fg-base flex items-center gap-x-1.5 p-2 group"
      href="/favorilerim"
      title={label ?? "Favorilerim"}
      aria-label={label ?? "Favorilerim"}
    >
      <span className="relative flex items-center">
        <Heart className="w-5 h-5 shrink-0 text-slate-700 hover:text-brand-600 transition-colors group-hover:scale-105 duration-200" />
        {count > 0 && (
          <span className="absolute -top-2 -right-2 bg-brand-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-xs animate-in fade-in zoom-in duration-200">
            {count}
          </span>
        )}
      </span>
      {label && (
        <span className="hidden small:inline text-sm font-medium text-slate-700 whitespace-nowrap">
          {label}
        </span>
      )}
    </LocalizedClientLink>
  )
}
