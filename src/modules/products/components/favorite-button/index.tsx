"use client"

import React, { useEffect, useRef, useState } from "react"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useWishlist } from "@lib/context/wishlist-context"

type FavoriteButtonProps = {
  product: HttpTypes.StoreProduct
  cheapestPrice?: {
    calculated_price: string
  } | null
  className?: string
}

/**
 * Ürün kartı/detayındaki kalp butonu. Favoriler MÜŞTERİ HESABINA yazılır
 * (wishlist-context → /store/wishlist).
 *
 * Giriş yapılmamışsa sunucuya HİÇ gidilmez: kalbin yanında küçük bir baloncuk
 * açılır ("Favorilere eklemek için giriş yapın" + Giriş Yap). Kullanıcı baktığı
 * üründen koparılmaz — bu, giriş sayfasına zorla yönlendirmeye tercih edildi.
 */
export default function FavoriteButton({
  product,
  cheapestPrice: _cheapestPrice,
  className,
}: FavoriteButtonProps) {
  const { isFavorite, toggle, isLoggedIn, pendingId } = useWishlist()
  const [isAnimating, setIsAnimating] = useState(false)
  const [showLoginHint, setShowLoginHint] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  const favorite = isFavorite(product.id)
  const busy = pendingId === product.id

  // Baloncuk açıkken dışarı tıklama / Escape ile kapansın.
  useEffect(() => {
    if (!showLoginHint) return
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setShowLoginHint(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowLoginHint(false)
    }
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [showLoginHint])

  // Hata mesajı birkaç saniye sonra kendiliğinden kaybolsun.
  useEffect(() => {
    if (!errorMsg) return
    const t = setTimeout(() => setErrorMsg(null), 4000)
    return () => clearTimeout(t)
  }, [errorMsg])

  const onClick = async (e: React.MouseEvent) => {
    // Kart tıklaması ürün sayfasına gitmesin.
    e.preventDefault()
    e.stopPropagation()

    if (!isLoggedIn) {
      setShowLoginHint(true)
      return
    }

    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 300)

    const res = await toggle(product.id)
    if (res.unauthorized) {
      // Oturum arada düşmüş olabilir (cookie süresi doldu).
      setShowLoginHint(true)
    } else if (res.error) {
      setErrorMsg("Favori kaydedilemedi, tekrar deneyin.")
    }
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        aria-pressed={favorite}
        aria-label={favorite ? "Favorilerden çıkar" : "Favorilere ekle"}
        className={`flex items-center justify-center p-2 rounded-full border border-gray-150 bg-white/95 hover:bg-white hover:border-brand-200 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-wait ${className} ${
          isAnimating ? "scale-125" : "scale-100"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className={`w-5 h-5 transition-all duration-350 ${
            favorite
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

      {showLoginHint && (
        <div
          role="dialog"
          aria-label="Giriş gerekli"
          // Kart ızgarasında sağa taşmasın diye sağa hizalı ve dar tutuldu.
          className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-gray-200 bg-white p-3 text-left shadow-xl"
          data-testid="favorite-login-hint"
          onClick={(e) => {
            // Ürün kartının link'ine tıklama olarak sayılmasın.
            e.preventDefault()
            e.stopPropagation()
          }}
        >
          <p className="text-xs leading-relaxed text-slate-600">
            Favorilere eklemek için giriş yapmanız gerekiyor.
          </p>
          <LocalizedClientLink
            href="/account"
            className="mt-2.5 block rounded-lg bg-brand-600 px-3 py-2 text-center text-xs font-bold text-white transition-colors hover:bg-brand-700"
          >
            Giriş Yap
          </LocalizedClientLink>
        </div>
      )}

      {errorMsg && (
        <div
          role="alert"
          className="absolute right-0 top-full z-50 mt-2 w-52 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 shadow-lg"
        >
          {errorMsg}
        </div>
      )}
    </div>
  )
}
