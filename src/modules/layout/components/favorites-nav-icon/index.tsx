"use client"

import React, { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function FavoritesNavIcon() {
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
      className="hover:text-ui-fg-base flex items-center justify-center p-1 relative group"
      href="/favorilerim"
      title="Favorilerim"
    >
      <Heart className="w-5 h-5 text-slate-700 hover:text-rose-600 transition-colors group-hover:scale-105 duration-200" />
      {favoritesCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-xs scale-100 animate-in fade-in zoom-in duration-200">
          {favoritesCount}
        </span>
      )}
    </LocalizedClientLink>
  )
}
