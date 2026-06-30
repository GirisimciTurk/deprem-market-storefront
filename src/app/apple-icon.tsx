import { ImageResponse } from "next/og"
import { SHIELD_MASKABLE_DATAURL } from "@lib/brand-icons"

// Apple touch icon — iOS "Ana Ekrana Ekle" ile kurulan PWA'nın ana ekran ikonu.
// iOS önerilen boyut 180x180. iOS şeffaf alanları SİYAH gösterir → beyaz-zeminli,
// güvenli-alan padding'li amblem (SHIELD_MASKABLE) kullanılır. iOS köşeleri yuvarlatır.
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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={SHIELD_MASKABLE_DATAURL} width={180} height={180} alt="depremTek" />
      </div>
    ),
    {
      ...size,
    }
  )
}
