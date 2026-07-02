import React from "react"

interface LogoProps {
  className?: string
  /** Yalnız kalkan amblemi (kompakt / mobil ikon gösterimi). */
  iconOnly?: boolean
}

/**
 * depremTek marka logosu — kalkan amblemi (public/images/depremtek-logo.svg) +
 * "depremTek" yazısı (deprem=turuncu, Tek=lacivert; ambleme uyumlu).
 * className amblem yüksekliğini ayarlar (örn. footer "!h-20 sm:!h-24"); iconOnly
 * yalnız amblemi gösterir.
 */
export default function Logo({ className = "", iconOnly = false }: LogoProps) {
  return (
    <span className="inline-flex items-center gap-x-2 select-none">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/depremtek-logo.svg"
        alt="depremTek"
        className={`w-auto object-contain ${iconOnly ? "h-11" : "h-11 sm:h-14"} ${className}`}
        draggable={false}
      />
      {!iconOnly && (
        <span className="flex flex-col">
          <span className="font-black tracking-tight leading-none text-2xl sm:text-3xl whitespace-nowrap">
            <span style={{ color: "#E8841F" }}>deprem</span>
            <span style={{ color: "#24344D" }}>Tek</span>
          </span>
          {/* Alt satır: sağa yaslı "market" — yazıya bitişik dursun diye yukarı
              çekilir; tracking'in son harften sonra bıraktığı boşluk -mr ile
              telafi edilir ki "Tek" ile aynı hizada bitsin. */}
          <span
            className="self-end leading-none text-[10px] sm:text-xs font-bold uppercase tracking-[0.24em] -mr-[0.24em] -mt-[3px]"
            style={{ color: "#24344D" }}
          >
            market
          </span>
        </span>
      )}
    </span>
  )
}
