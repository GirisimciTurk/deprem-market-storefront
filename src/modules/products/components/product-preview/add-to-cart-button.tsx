"use client"

import React, { useState } from "react"
import { Button } from "@modules/common/components/ui"
import { addToCart } from "@lib/data/cart"
import { useParams } from "next/navigation"

type AddToCartButtonProps = {
  variantId?: string
  className?: string
}

export default function AddToCartButton({ variantId, className }: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [success, setSuccess] = useState(false)
  const params = useParams()
  const countryCode = (params?.countryCode as string) || "tr"

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!variantId) return

    setIsAdding(true)
    try {
      await addToCart({
        variantId,
        quantity: 1,
        countryCode,
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    } catch (error) {
      console.error("Sepete eklenirken hata oluştu:", error)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isAdding || !variantId}
      isLoading={isAdding}
      className={`w-full py-2 h-9 text-xs font-bold transition-all duration-300 rounded-lg ${
        success
          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
          : "bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow"
      } ${className}`}
    >
      {success ? "Sepete Eklendi ✓" : "Sepete Ekle"}
    </Button>
  )
}
