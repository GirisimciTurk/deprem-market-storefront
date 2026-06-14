import { ImageResponse } from "next/og"
import { APPLE_SPLASH_DEVICES, splashVariant } from "@lib/util/apple-splash"

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
        <svg
          width={logo}
          height={logo}
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M18 3L4 9V17C4 24.5 9.5 31.5 18 33C26.5 31.5 32 24.5 32 17V9L18 3Z"
            stroke="#E11D48"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="#FFF1F2"
          />
          <path
            d="M9 19H13L16 12L20 24L23 16L25 19H27"
            stroke="#E11D48"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="18" cy="7" r="2" fill="#E11D48" />
        </svg>
        <div
          style={{
            display: "flex",
            marginTop: Math.round(logo * 0.14),
            fontSize: Math.round(logo * 0.13),
            fontWeight: 800,
            color: "#E11D48",
            letterSpacing: -1,
          }}
        >
          Deprem Market
        </div>
      </div>
    ),
    { width, height }
  )
}
