import { describe, expect, it } from "vitest"
import { PROMO_VIDEO_COOKIE, PROMO_VIDEO_MAX_AGE } from "@lib/util/promo-video"
import { POST } from "./route"

/**
 * Bu uç, çerezi SUNUCU kaynaklı hâle getirmek için var (Safari/ITP script ile
 * yazılan çerezleri 7 güne kırpar). Dolayısıyla asıl sözleşme Set-Cookie'nin
 * kendisi: adı, ömrü ve istemcinin okuyabilir olması.
 */
describe("POST /api/promo-video-seen", () => {
  it("çerezi doğru ad, değer ve ömürle yazar", async () => {
    const res = await POST()
    const cookie = res.cookies.get(PROMO_VIDEO_COOKIE)

    expect(res.status).toBe(200)
    expect(cookie?.value).toBe("1")
    expect(cookie?.maxAge).toBe(PROMO_VIDEO_MAX_AGE)
    expect(cookie?.path).toBe("/")
  })

  it("çerez istemciden okunabilir olmalı — popup kararı JS'te veriliyor", async () => {
    const res = await POST()
    // httpOnly true olsa hasSeenPromoVideo() çerezi hiç göremez ve video her
    // sayfa yüklemesinde yeniden açılırdı.
    expect(res.cookies.get(PROMO_VIDEO_COOKIE)?.httpOnly).toBe(false)
  })

  it("SameSite=Lax — dış bağlantıdan gelen ilk ziyarette de gönderilir", async () => {
    const res = await POST()
    expect(res.cookies.get(PROMO_VIDEO_COOKIE)?.sameSite).toBe("lax")
  })
})
