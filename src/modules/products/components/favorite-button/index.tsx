"use client"

import React, { useEffect, useLayoutEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { HttpTypes } from "@medusajs/types"
import LoginHint from "@modules/common/components/login-hint"
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
  const t = useTranslations("loginGate")
  const { isFavorite, toggle, isLoggedIn, pendingId } = useWishlist()
  const [isAnimating, setIsAnimating] = useState(false)
  const [showLoginHint, setShowLoginHint] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  // Baloncuk varsayılan olarak sağa hizalı (kalp kartın sağ üstünde). Dar
  // telefon kartlarında bu, baloncuğu ekranın soluna taşırıyordu; ölçüp
  // gerekirse sola hizalıyoruz.
  const [alignLeft, setAlignLeft] = useState(false)

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

  // Baloncuk ekranın dışına taşıyorsa hizayı çevir (boyama öncesi ölç →
  // kullanıcı yanlış konumda bir kare görmez).
  //
  // Ölçüm BALONCUĞUN değil ÇAPANIN (buton) konumundan yapılır: baloncuğun kendi
  // rect'ine bakmak mevcut hizaya bağlı olurdu, yani bir kez çevrildikten sonra
  // ölçüm bir daha aynı sonucu vermez (tek atışlık, geri dönüşsüz). Çapa
  // ölçümü idempotenttir; her yeniden değerlendirmede aynı kararı üretir.
  useLayoutEffect(() => {
    if (!showLoginHint) return

    const decide = () => {
      const anchor = wrapRef.current
      if (!anchor) return
      const a = anchor.getBoundingClientRect()
      const width = Math.min(224, window.innerWidth - 24) // w-56 / max-w
      // Sağa hizalı: sol kenar = çapanın sağı - genişlik.
      const wouldOverflowLeft = a.right - width < 8
      // Sola hizalı: sağ kenar = çapanın solu + genişlik.
      const wouldOverflowRight = a.left + width > window.innerWidth - 8
      // İkisi de taşıyorsa (çok dar ekran) sağ hizada kal; max-w devreye girer.
      setAlignLeft(wouldOverflowLeft && !wouldOverflowRight)
    }

    decide()
    // role="dialog" koşullu mount edildiği için ekran okuyucu kendiliğinden
    // duyurmaz; odağı kutuya taşımak hem duyurur hem Escape'i anlamlı kılar.
    hintRef.current?.focus()
    window.addEventListener("resize", decide)
    window.addEventListener("orientationchange", decide)
    return () => {
      window.removeEventListener("resize", decide)
      window.removeEventListener("orientationchange", decide)
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
      setErrorMsg(t("favoriteError"))
    }
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        aria-pressed={favorite}
        aria-label={favorite ? t("removeFavorite") : t("addFavorite")}
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
          ref={hintRef}
          role="dialog"
          aria-modal="false"
          tabIndex={-1}
          aria-label={t("ariaLabel")}
          // Genişlik ekrana göre sınırlı, hiza taşmaya göre çevriliyor: sabit
          // w-56 + right-0 dar telefon kartlarında baloncuğu ekran dışına
          // taşırıyordu (kart kökündeki overflow-hidden de kırpıyordu).
          className={`absolute top-full z-50 mt-2 w-56 max-w-[calc(100vw-1.5rem)] rounded-xl border border-gray-200 bg-white p-3 text-left text-xs leading-relaxed text-slate-600 shadow-xl outline-none ${
            alignLeft ? "left-0" : "right-0"
          }`}
          data-testid="favorite-login-hint"
          onClick={(e) => {
            // Ürün kartının link'ine tıklama olarak sayılmasın.
            e.preventDefault()
            e.stopPropagation()
          }}
        >
          <LoginHint messageKey="favorite" />
        </div>
      )}

      {errorMsg && (
        <div
          role="alert"
          // Giriş baloncuğuyla AYNI taşma koruması: sabit right-0 + genişlik
          // dar kartlarda bu kutuyu da ekran dışına taşırıyordu.
          className={`absolute top-full z-50 mt-2 w-52 max-w-[calc(100vw-1.5rem)] rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 shadow-lg ${
            alignLeft ? "left-0" : "right-0"
          }`}
        >
          {errorMsg}
        </div>
      )}
    </div>
  )
}
