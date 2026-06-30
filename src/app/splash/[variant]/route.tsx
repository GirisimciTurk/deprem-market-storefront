import { ImageResponse } from "next/og"
import { APPLE_SPLASH_DEVICES, splashVariant } from "@lib/util/apple-splash"
import { SHIELD_ANY_DATAURL } from "@lib/brand-icons"

// iOS PWA splash görselleri (apple-touch-startup-image). Cihaz başına piksel
// boyutunda markalı (logo + isim) bir görsel üretir. Link'leri AppleSplash
// bileşeni <head>'e koyar; eşleşmeyen cihazlar beyaz ekrana düşer.
export const dynamic = "force-static"
export const dynamicParams = false
export const contentType = "image/png"

export function generateStaticParams() {
  const seen = new Set<string>()
  const params: { variant: string }[] = []
  for (const d of APPLE_SPLASH_DEVICES) {
    const v = splashVariant(d)
    if (!seen.has(v)) {
      seen.add(v)
      params.push({ variant: v })
    }
  }
  return params
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ variant: string }> }
) {
  const { variant } = await params
  const [w, h] = variant.split("x").map((n) => Number(n))
  const width = w || 1170
  const height = h || 2532
  const logo = Math.round(Math.min(width, height) * 0.4)

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={SHIELD_ANY_DATAURL} width={logo} height={logo} alt="depremTek" />
        <div
          style={{
            display: "flex",
            marginTop: Math.round(logo * 0.14),
            fontSize: Math.round(logo * 0.13),
            fontWeight: 800,
            letterSpacing: -1,
          }}
        >
          <span style={{ color: "#EE7F1A" }}>deprem</span>
          <span style={{ color: "#1E2D50" }}>Tek</span>
        </div>
      </div>
    ),
    { width, height }
  )
}
