import { ImageResponse } from "next/og"
import { readFileSync } from "node:fs"
import { join } from "node:path"

// Apple touch icon — iOS "Ana Ekrana Ekle" ile kurulan PWA'nın ana ekran ikonu.
// iOS önerilen boyut 180x180. iOS şeffaf alanları SİYAH gösterir → beyaz-zeminli,
// güvenli-alan padding'li Depremtek kalp amblemi kullanılır. iOS köşeleri yuvarlatır.
export const size = {
  width: 180,
  height: 180,
}
export const contentType = "image/png"

const heartDataUrl = `data:image/png;base64,${readFileSync(
  join(process.cwd(), "public/images/depremtek-heart.png"),
).toString("base64")}`

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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heartDataUrl}
          width={140}
          height={140}
          alt="Depremtek market"
        />
      </div>
    ),
    {
      ...size,
    }
  )
}
