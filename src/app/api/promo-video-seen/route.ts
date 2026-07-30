import { NextResponse } from "next/server"
import { PROMO_VIDEO_COOKIE, PROMO_VIDEO_MAX_AGE } from "@lib/util/promo-video"

/**
 * POST /api/promo-video-seen
 *
 * Tanıtım videosunun gösterildiğini kalıcı çerezle işaretler. İstemci aynı çerezi
 * `document.cookie` ile de yazar; buradaki `Set-Cookie` onu SUNUCU kaynaklı hale
 * getirir. Gerekçe: Safari/ITP script ile yazılan çerezleri 7 güne kırpar, bu uç
 * olmadan video iOS'ta her hafta yeniden açılırdı.
 *
 * Gövde/parametre almaz, kimlik gerektirmez, hiçbir şey okumaz — yalnız işlevsel
 * bir tercih çerezi yazar. `httpOnly: false` zorunlu, çünkü popup açılmadan önce
 * istemci bu çerezi okuyup karar veriyor.
 */
export async function POST() {
  const res = NextResponse.json({ ok: true })

  res.cookies.set(PROMO_VIDEO_COOKIE, "1", {
    path: "/",
    maxAge: PROMO_VIDEO_MAX_AGE,
    sameSite: "lax",
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
  })

  return res
}
