import { ImageResponse } from "next/og"

// Apple touch icon — iOS "Ana Ekrana Ekle" ile kurulan PWA'nın ana ekran ikonu.
// iOS önerilen boyut 180x180. DİKKAT: iOS şeffaf alanları SİYAH gösterir, bu yüzden
// arka plan SOLİD (beyaz) + kalkan ortada padding'li. iOS köşeleri kendi yuvarlatır.
export const size = {
  width: 180,
  height: 180,
}
export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#ffffff",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width="74%"
          height="74%"
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
    ),
    {
      ...size,
    }
  )
}
