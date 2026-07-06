import React from "react"

interface LogoProps {
  className?: string
  /** Yalnız kalp amblemi (kompakt / mobil ikon gösterimi). */
  iconOnly?: boolean
}

/**
 * depremtek.market marka logosu — gümüş "depremtek market" wordmark'ı + bakır
 * kalp/EKG amblemi (public/images/depremtek-lockup.png).
 *
 * Lockup gümüş/beyaz tonlu olduğundan BEYAZ zemin üzerinde kaybolur; bu yüzden
 * logo, marka lacivertinden (#102040 — kalp ambleminin rengi) yuvarlak köşeli
 * bir "chip" içine alınır. Böylece gümüş yazı ve bakır kalp zemine karşı okunur.
 * className amblem yüksekliğini ayarlar (örn. footer "!h-14 sm:!h-16");
 * iconOnly yalnız lacivert kalbi (beyaz zeminde okunur) gösterir.
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
    <span
      className="inline-flex items-center rounded-2xl px-3.5 py-2 shadow-sm ring-1 ring-white/10 select-none"
      style={{
        background: "linear-gradient(135deg, #18294d 0%, #0d1a33 100%)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/depremtek-lockup.png"
        alt="depremtek market"
        className={`w-auto object-contain h-9 sm:h-11 ${className}`}
        draggable={false}
      />
    </span>
  )
}
