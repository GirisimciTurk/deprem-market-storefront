import { ImageResponse } from "next/og"
import { readFileSync } from "node:fs"
import { join } from "node:path"

// Image metadata — 512x512. Hem favicon (tarayıcı küçültür) hem PWA "any" ikonu;
// manifest.ts bununla AYNI boyutu beyan eder. İçerik: Depremtek kalp amblemi
// (public/images/depremtek-heart.png) beyaz zeminde — koyu/açık sekmelerde okunur.
export const size = {
  width: 512,
  height: 512,
}
export const contentType = "image/png"

const heartDataUrl = `data:image/png;base64,${readFileSync(
  join(process.cwd(), "public/images/depremtek-heart.png"),
).toString("base64")}`

export default function Icon() {
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
          width={400}
          height={400}
          alt="Depremtek market"
        />
      </div>
    ),
    {
      ...size,
    }
  )
}
