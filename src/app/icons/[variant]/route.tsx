import { ImageResponse } from "next/og"

// PWA ikon üretici route handler. manifest.ts'in referans verdiği boyut/amaç
// varyantlarını next/og ile PNG olarak üretir. (any-512 zaten src/app/icon.tsx'te.)
//
// - "any": şeffaf arka plan, kalkan tuvali doldurur (favicon / klasik ikon).
// - "maskable": Android adaptif ikonlar tuvali daire/squircle vb. KIRPAR; bu yüzden
//   arka plan kenara kadar SOLİD dolu + ikon merkezde "güvenli alan" içinde (~%60)
//   tutulur, kırpılınca logo kesilmez.
//
// generateStaticParams + force-static → build'de statik PNG'ye dönüşür (hızlı,
// önbelleklenebilir). dynamicParams:false → listede olmayan varyant 404.
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

  // maskable'da güvenli alan: logo merkezde ~%62 → kenarda kırpma payı kalır.
  const shieldSize = maskable ? "62%" : "100%"

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
        <svg
          width={shieldSize}
          height={shieldSize}
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
      </div>
    ),
    { width: dim, height: dim }
  )
}
