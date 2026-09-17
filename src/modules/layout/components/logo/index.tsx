import React from "react"

interface LogoProps {
  className?: string
  /** Yalnız kalp amblemi (kompakt / mobil ikon gösterimi). */
  iconOnly?: boolean
}

/**
 * depremtek.market marka logosu — lacivert "depremtek" + gri-mavi "market"
 * wordmark'ı ve kırmızı kalp/EKG amblemi (public/images/depremtek-lockup-dark.png,
 * şeffaf zemin). Koyu renkli olduğu için BEYAZ zemin üzerinde doğrudan okunur;
 * eski gümüş lockup'ın ihtiyaç duyduğu lacivert "chip" kaldırıldı.
 * className amblem yüksekliğini ayarlar (örn. footer "!h-12 sm:!h-14");
 * iconOnly yalnız kalbi gösterir.
 */
export default function Logo({ className = "", iconOnly = false }: LogoProps) {
  if (iconOnly) {
    return (
      <span className="inline-flex items-center select-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/depremtek-heart.png"
          alt="depremtek market"
          className={`w-auto object-contain h-11 ${className}`}
          draggable={false}
        />
      </span>
    )
  }

  return (
    <span className="inline-flex items-center select-none">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/depremtek-lockup-dark.png"
        alt="depremtek market"
        className={`w-auto object-contain h-11 sm:h-14 ${className}`}
        draggable={false}
      />
    </span>
  )
}
