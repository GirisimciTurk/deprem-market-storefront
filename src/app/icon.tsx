import { ImageResponse } from "next/og"

// Image metadata — 512x512 (vektör temiz ölçeklenir). Tek üretilen ikon hem favicon
// (tarayıcı küçültür) hem PWA manifest ikonu olarak kullanılır; manifest.ts bununla
// AYNI boyutu (512x512) beyan eder, aksi halde "Resource size is not correct" uyarısı çıkar.
export const size = {
  width: 512,
  height: 512,
}
export const contentType = "image/png"

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "transparent",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Shield outline representing protection */}
          <path
            d="M18 3L4 9V17C4 24.5 9.5 31.5 18 33C26.5 31.5 32 24.5 32 17V9L18 3Z"
            stroke="#E11D48"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="#FFF1F2"
          />
          {/* Seismic Pulse / Fault Line */}
          <path
            d="M9 19H13L16 12L20 24L23 16L25 19H27"
            stroke="#E11D48"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Safety Anchor Point */}
          <circle cx="18" cy="7" r="2" fill="#E11D48" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}
