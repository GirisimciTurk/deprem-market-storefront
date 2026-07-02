import React from "react"

interface LogoProps {
  className?: string
  /** Yalnız çanta amblemi (kompakt / mobil ikon gösterimi). */
  iconOnly?: boolean
}

/**
 * depremTek marka logosu — çanta+kalkan amblemi (public/images/depremtek-logo.png)
 * + "depremtek .market" yazısı (tümü lacivert; resmi logodaki dizilim).
 * className amblem yüksekliğini ayarlar (örn. footer "!h-20 sm:!h-24"); iconOnly
 * yalnız amblemi gösterir.
 */
export default function Logo({ className = "", iconOnly = false }: LogoProps) {
  return (
    <span className="inline-flex items-center gap-x-2 select-none">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/depremtek-logo.png"
        alt="depremTek"
        className={`w-auto object-contain ${iconOnly ? "h-11" : "h-11 sm:h-14"} ${className}`}
        draggable={false}
      />
      {!iconOnly && (
        <span className="flex flex-col" style={{ color: "#162D4F" }}>
          <span className="font-black tracking-tight leading-none text-2xl sm:text-3xl whitespace-nowrap">
            depremtek
          </span>
          {/* Alt satır: sağa yaslı ".market" — resmi logodaki gibi üst yazının
              hemen altında, daha küçük puntoda. */}
          <span className="self-end leading-none text-lg sm:text-xl font-bold tracking-wide -mt-0.5">
            .market
          </span>
        </span>
      )}
    </span>
  )
}
