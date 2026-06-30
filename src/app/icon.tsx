import { ImageResponse } from "next/og"
import { SHIELD_ANY_DATAURL } from "@lib/brand-icons"

// Image metadata — 512x512. Hem favicon (tarayıcı küçültür) hem PWA "any" ikonu;
// manifest.ts bununla AYNI boyutu beyan eder. İçerik: depremTek kalkan amblemi.
export const size = {
  width: 512,
  height: 512,
}
export const contentType = "image/png"

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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={SHIELD_ANY_DATAURL} width={512} height={512} alt="depremTek" />
      </div>
    ),
    {
      ...size,
    }
  )
}
