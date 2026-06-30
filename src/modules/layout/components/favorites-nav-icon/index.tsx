"use client"

import React, { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function FavoritesNavIcon({ label }: { label?: string }) {
  const [favoritesCount, setFavoritesCount] = useState(0)

  const updateCount = () => {
    try {
      const saved = localStorage.getItem("deprem_market_favorites")
      if (saved) {
        const parsed = JSON.parse(saved)
        setFavoritesCount(Array.isArray(parsed) ? parsed.length : 0)
      } else {
        setFavoritesCount(0)
      }
    } catch {
      setFavoritesCount(0)
    }
  }

  useEffect(() => {
    // Initial count load
    updateCount()

    // Listen for custom events when favorites change
    window.addEventListener("favorites-updated", updateCount)

    return () => {
      window.removeEventListener("favorites-updated", updateCount)
    }
  }, [])

  return (
    <LocalizedClientLink
      className="hover:text-ui-fg-base flex items-center gap-x-1.5 p-2 group"
      href="/favorilerim"
      title={label ?? "Favorilerim"}
      aria-label={label ?? "Favorilerim"}
    >
      <span className="relative flex items-center">
        <Heart className="w-5 h-5 shrink-0 text-slate-700 hover:text-brand-600 transition-colors group-hover:scale-105 duration-200" />
        {favoritesCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-brand-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-xs animate-in fade-in zoom-in duration-200">
            {favoritesCount}
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
