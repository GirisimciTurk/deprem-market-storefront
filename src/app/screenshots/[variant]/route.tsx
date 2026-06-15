import { ImageResponse } from "next/og"

// PWA manifest "screenshots" görselleri. Chrome'un yükleme diyaloğunda zengin
// (uygulama mağazası benzeri) önizleme gösterir. Gerçek ekran görüntüsü yerine
// markalı tanıtım kartı üretiyoruz (yaygın ve kabul edilen yöntem).
//
// form_factor "narrow" → mobil (dikey), "wide" → masaüstü (yatay).
// generateStaticParams + force-static → build'de statik PNG.
export const dynamic = "force-static"
export const dynamicParams = false
export const contentType = "image/png"

const SIZES: Record<string, { width: number; height: number }> = {
  narrow: { width: 1080, height: 1920 },
  wide: { width: 1920, height: 1080 },
}

export function generateStaticParams() {
  return Object.keys(SIZES).map((variant) => ({ variant }))
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ variant: string }> }
) {
  const { variant } = await params
  const { width, height } = SIZES[variant] ?? SIZES.narrow
  const wide = variant === "wide"
  const shield = wide ? 300 : 360

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
          background: "linear-gradient(160deg, #F08C1A 0%, #9F1239 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
          padding: wide ? 80 : 64,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#ffffff",
            borderRadius: 48,
            padding: wide ? 56 : 64,
            marginBottom: wide ? 48 : 72,
          }}
        >
          <svg
            width={shield}
            height={shield}
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 3L4 9V17C4 24.5 9.5 31.5 18 33C26.5 31.5 32 24.5 32 17V9L18 3Z"
              stroke="#F08C1A"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="#FEF6EA"
            />
            <path
              d="M9 19H13L16 12L20 24L23 16L25 19H27"
              stroke="#F08C1A"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="18" cy="7" r="2" fill="#F08C1A" />
          </svg>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: wide ? 88 : 96,
            fontWeight: 800,
            letterSpacing: -2,
          }}
        >
          Deprem Market
        </div>

        <div
          style={{
            display: "flex",
            textAlign: "center",
            fontSize: wide ? 40 : 46,
            opacity: 0.92,
            marginTop: 28,
            maxWidth: wide ? 1100 : 820,
          }}
        >
          Afet ve acil durum hazırlık marketi — deprem çantaları, ilk yardım ve
          hayati ekipmanlar
        </div>
      </div>
    ),
    { width, height }
  )
}
