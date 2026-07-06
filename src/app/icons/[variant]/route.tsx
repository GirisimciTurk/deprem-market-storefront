import { ImageResponse } from "next/og"
import { readFileSync } from "node:fs"
import { join } from "node:path"

// PWA ikon üretici route handler. manifest.ts'in referans verdiği boyut/amaç
// varyantlarını next/og ile PNG olarak üretir (any-512 zaten src/app/icon.tsx'te).
// İçerik: Depremtek kalp amblemi (public/images/depremtek-heart.png) beyaz zeminde.
//
// - "any": beyaz zeminli amblem (favicon / klasik ikon; koyu tuvalde de okunur).
// - "maskable": Android adaptif ikon tuvali daire/squircle KIRPAR → beyaz-zeminli +
//   fazladan güvenli-alan padding'i.
//
// generateStaticParams + force-static → build'de statik PNG. dynamicParams:false → 404.
export const dynamic = "force-static"
export const dynamicParams = false
export const contentType = "image/png"

const VARIANTS = ["any-192", "maskable-192", "maskable-512"] as const

export function generateStaticParams() {
  return VARIANTS.map((variant) => ({ variant }))
}

const heartDataUrl = `data:image/png;base64,${readFileSync(
  join(process.cwd(), "public/images/depremtek-heart.png"),
).toString("base64")}`

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ variant: string }> }
) {
  const { variant } = await params
  const [purpose, sizeStr] = variant.split("-")
  const dim = Number(sizeStr) || 512
  const maskable = purpose === "maskable"
  // maskable: adaptif tuval kırptığı için daha çok güvenli-alan padding'i.
  const imgSize = Math.round(dim * (maskable ? 0.6 : 0.78))

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heartDataUrl}
          width={imgSize}
          height={imgSize}
          alt="Depremtek market"
        />
      </div>
    ),
    { width: dim, height: dim }
  )
}
