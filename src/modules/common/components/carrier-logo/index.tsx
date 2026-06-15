"use client"

import React, { useState } from "react"

/**
 * Kargo firması logosu. Gerçek logo PNG'leri `public/cargo/<kod>.png` konumundan
 * yüklenir (ör. /cargo/yurtici.png). Dosya yoksa marka renkli şık bir badge'e
 * düşer — böylece PNG'ler eklendiği an her yerde otomatik logo görünür.
 *
 * Resmi logoları eklemek için: deprem-market-storefront/public/cargo/ içine
 * yurtici.png, aras.png, mng.png, ptt.png, surat.png, ups.png, sendeo.png,
 * hepsijet.png dosyalarını koy.
 */

type CarrierMeta = { label: string; bg: string; fg: string }

const CARRIERS: Record<string, CarrierMeta> = {
  yurtici: { label: "Yurtiçi Kargo", bg: "#f37021", fg: "#ffffff" },
  aras: { label: "Aras Kargo", bg: "#005ca9", fg: "#ffffff" },
  mng: { label: "MNG Kargo", bg: "#e2001a", fg: "#ffffff" },
  ptt: { label: "PTT Kargo", bg: "#005bab", fg: "#ffd200" },
  surat: { label: "Sürat Kargo", bg: "#c8102e", fg: "#ffffff" },
  ups: { label: "UPS", bg: "#351c15", fg: "#ffb500" },
  sendeo: { label: "Sendeo", bg: "#5b2d90", fg: "#ffffff" },
  hepsijet: { label: "Hepsijet", bg: "#ff6000", fg: "#ffffff" },
  diger: { label: "Diğer", bg: "#6b7280", fg: "#ffffff" },
}

type CarrierLogoProps = {
  code?: string | null
  /** Logo yüksekliği (px). */
  height?: number
  className?: string
  /** true → logo + firma adı yan yana. */
  withLabel?: boolean
}

export default function CarrierLogo({
  code,
  height = 22,
  className = "",
  withLabel = false,
}: CarrierLogoProps) {
  const c = (code || "").toLowerCase().trim()
  const meta = CARRIERS[c]
  const [imgError, setImgError] = useState(false)

  const label = meta?.label ?? code ?? "Kargo"

  // Bilinmeyen kod veya PNG yüklenemedi → marka renkli badge fallback.
  const fallback = (
    <span
      title={label}
      style={meta ? { backgroundColor: meta.bg, color: meta.fg } : undefined}
      className={
        meta
          ? "inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-bold leading-none"
          : "inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-[11px] font-semibold text-gray-700 leading-none"
      }
    >
      {label}
    </span>
  )

  if (!c || !meta || imgError) {
    return withLabel ? (
      <span className={`inline-flex items-center gap-1.5 ${className}`}>{fallback}</span>
    ) : (
      <span className={className}>{fallback}</span>
    )
  }

  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/cargo/${c}.png`}
      alt={label}
      title={label}
      onError={() => setImgError(true)}
      style={{ height, width: "auto" }}
      className="object-contain"
    />
  )

  return withLabel ? (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      {img}
      <span className="text-xs font-medium text-gray-700">{label}</span>
    </span>
  ) : (
    <span className={`inline-flex items-center ${className}`}>{img}</span>
  )
}
