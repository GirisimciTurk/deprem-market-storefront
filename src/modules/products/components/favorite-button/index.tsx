"use client"

import React, { useState, useEffect } from "react"
import { HttpTypes } from "@medusajs/types"
import { 
  isProductFavorite, 
  addFavorite, 
  removeFavorite, 
  FavoriteProduct 
} from "@lib/util/favorites"

type FavoriteButtonProps = {
  product: HttpTypes.StoreProduct
  cheapestPrice?: {
    calculated_price: string
  } | null
  className?: string
}

export default function FavoriteButton({ product, cheapestPrice, className }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const updateFavoriteState = () => {
    setIsFavorite(isProductFavorite(product.id))
  }

  useEffect(() => {
    updateFavoriteState()
    window.addEventListener("favorites-updated", updateFavoriteState)
    return () => {
      window.removeEventListener("favorites-updated", updateFavoriteState)
    }
  }, [product.id])

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 300)

    if (isFavorite) {
      removeFavorite(product.id)
    } else {
      const favItem: FavoriteProduct = {
        id: product.id,
        title: product.title || "",
        price: cheapestPrice?.calculated_price || "0 TL",
        image: product.thumbnail || "",
        handle: product.handle || "",
        description: product.description || "",
      }
      addFavorite(favItem)
    }
  }

  return (
    <button
      onClick={toggleFavorite}
      className={`flex items-center justify-center p-2 rounded-full border border-gray-150 bg-white/95 hover:bg-white hover:border-brand-200 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer ${className} ${
        isAnimating ? "scale-125" : "scale-100"
      }`}
      aria-label={isFavorite ? "Favorilerden çıkar" : "Favorilere ekle"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={`w-5 h-5 transition-all duration-350 ${
          isFavorite
            ? "fill-brand-500 text-brand-500 scale-110"
            : "fill-none text-gray-400 hover:text-brand-500 hover:scale-105"
        }`}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  )
}
