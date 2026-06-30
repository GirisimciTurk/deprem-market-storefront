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
      className={`w-auto select-none object-contain ${iconOnly ? "h-11" : "h-14 sm:h-16"} ${className}`}
      draggable={false}
    />
  )
}
