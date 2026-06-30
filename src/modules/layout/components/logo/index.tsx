import React from "react"

interface LogoProps {
  className?: string
  /** Yalnız kalkan amblemi (kompakt / mobil ikon gösterimi). */
  iconOnly?: boolean
}

/**
 * depremTek marka logosu — kalkan amblemi (public/images/depremtek-logo.webp) +
 * "depremTek" yazısı (deprem=turuncu, Tek=lacivert; ambleme uyumlu).
 * className amblem yüksekliğini ayarlar (örn. footer "!h-20 sm:!h-24"); iconOnly
 * yalnız amblemi gösterir.
 */
export default function Logo({ className = "", iconOnly = false }: LogoProps) {
  return (
    <span className="inline-flex items-center gap-x-2 select-none">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/depremtek-logo.webp"
        alt="depremTek"
        className={`w-auto object-contain ${iconOnly ? "h-11" : "h-11 sm:h-14"} ${className}`}
        draggable={false}
      />
      {!iconOnly && (
        <span className="font-black tracking-tight leading-none text-2xl sm:text-3xl whitespace-nowrap">
          <span style={{ color: "#E8841F" }}>deprem</span>
          <span style={{ color: "#24344D" }}>Tek</span>
        </span>
      )}
    </span>
  )
}
