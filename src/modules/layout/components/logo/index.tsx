import React from "react"

interface LogoProps {
  className?: string
  /** Yalnız sembol/küçük gösterim için (header'da kompakt). */
  iconOnly?: boolean
}

/**
 * depremTek marka logosu — resmi logo görseli (public/images/depremtek-logo.webp).
 */
export default function Logo({ className = "", iconOnly = false }: LogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/depremtek-logo.webp"
      alt="depremTek"
      className={`w-auto select-none object-contain ${iconOnly ? "h-9" : "h-11 sm:h-12"} ${className}`}
      draggable={false}
    />
  )
}
