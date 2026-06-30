import { ImageResponse } from "next/og"
import { SHIELD_ANY_DATAURL, SHIELD_MASKABLE_DATAURL } from "@lib/brand-icons"

// PWA ikon üretici route handler. manifest.ts'in referans verdiği boyut/amaç
// varyantlarını next/og ile PNG olarak üretir (any-512 zaten src/app/icon.tsx'te).
// İçerik: depremTek kalkan amblemi (lib/brand-icons data-URL).
//
// - "any": şeffaf zeminli amblem (favicon / klasik ikon).
// - "maskable": Android adaptif ikon tuvali daire/squircle KIRPAR → beyaz-zeminli +
//   güvenli-alan padding'li amblem (SHIELD_MASKABLE'da padding gömülü).
//
// generateStaticParams + force-static → build'de statik PNG. dynamicParams:false → 404.
export const dynamic = "force-static"
export const dynamicParams = false
export const contentType = "image/png"

const VARIANTS = ["any-192", "maskable-192", "maskable-512"] as const

export function generateStaticParams() {
  return VARIANTS.map((variant) => ({ variant }))
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ variant: string }> }
) {
  const { variant } = await params
  const [purpose, sizeStr] = variant.split("-")
  const dim = Number(sizeStr) || 512
  const maskable = purpose === "maskable"
  const src = maskable ? SHIELD_MASKABLE_DATAURL : SHIELD_ANY_DATAURL

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: maskable ? "#ffffff" : "transparent",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={dim} height={dim} alt="depremTek" />
      </div>
    ),
    { width: dim, height: dim }
  )
}
