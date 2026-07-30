import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  PROMO_VIDEO_COOKIE,
  PROMO_VIDEO_MAX_AGE,
  hasSeenPromoVideo,
  markPromoVideoSeen,
  whenVisible,
} from "./promo-video"

/** jsdom'da kalan çerezleri temizle (testler arası sızmayı önler). */
function clearCookies() {
  for (const c of document.cookie.split(";")) {
    const name = c.split("=")[0]?.trim()
    if (name) document.cookie = `${name}=; path=/; max-age=0`
  }
}

describe("promo-video gösterildi işareti", () => {
  beforeEach(() => {
    clearCookies()
    window.sessionStorage.clear()
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true } as Response)
  })

  it("hiç ziyaret edilmemişse gösterilmemiş sayar", () => {
    expect(hasSeenPromoVideo()).toBe(false)
  })

  it("işaretledikten sonra gösterilmiş sayar", () => {
    markPromoVideoSeen()
    // Çerezi AÇIKÇA kontrol et: yalnız hasSeenPromoVideo()'ya bakmak yetmez, o
    // sessionStorage yedeğiyle de true döner ve çerez hiç yazılmasa test geçerdi.
    expect(document.cookie).toContain(`${PROMO_VIDEO_COOKIE}=1`)
    expect(hasSeenPromoVideo()).toBe(true)
  })

  it("çerez ömrü bir yıl — 'kişi başına bir kez' bu değere bağlı", () => {
    const oneYear = 365 * 24 * 60 * 60
    expect(PROMO_VIDEO_MAX_AGE).toBe(oneYear)
  })

  it("işaretleme sunucu ucunu da çağırır (ITP 7 gün kırpmasını aşmak için)", () => {
    markPromoVideoSeen()
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/promo-video-seen",
      expect.objectContaining({ method: "POST" })
    )
  })

  it("fetch patlasa bile çerez yazılır ve çağıran hata almaz", () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("ağ yok"))
    expect(() => markPromoVideoSeen()).not.toThrow()
    // Sunucu ucu erişilemezken bile ÇEREZİN kendisi yazılmış olmalı — yedeğe
    // düşülmüş olması bu senaryoda kabul edilebilir sonuç değil.
    expect(document.cookie).toContain(`${PROMO_VIDEO_COOKIE}=1`)
  })

  it("çerezi max-age ve SameSite=Lax ile yazar, http'de Secure koymaz", () => {
    const writes: string[] = []
    const real = Object.getOwnPropertyDescriptor(
      Document.prototype,
      "cookie"
    ) as PropertyDescriptor
    Object.defineProperty(document, "cookie", {
      configurable: true,
      get: () => "",
      set: (v: string) => writes.push(v),
    })

    try {
      markPromoVideoSeen()
    } finally {
      Object.defineProperty(document, "cookie", { ...real, configurable: true })
    }

    const written = writes.find((w) => w.startsWith(`${PROMO_VIDEO_COOKIE}=1`))
    expect(written).toBeTruthy()
    expect(written).toContain(`max-age=${PROMO_VIDEO_MAX_AGE}`)
    expect(written).toContain("path=/")
    expect(written).toContain("SameSite=Lax")
    // jsdom varsayılanı http://localhost → Secure eklenmemeli, yoksa çerez hiç yazılmaz.
    expect(written).not.toContain("Secure")
  })

  it("boş değerli çerezi gösterilmiş saymaz", () => {
    document.cookie = `${PROMO_VIDEO_COOKIE}=; path=/`
    expect(hasSeenPromoVideo()).toBe(false)
  })

  it("adı benzeyen başka çerezi kendisi sanmaz", () => {
    document.cookie = `x${PROMO_VIDEO_COOKIE}=1; path=/`
    expect(hasSeenPromoVideo()).toBe(false)
  })

  it("başka çerezlerin arasında dursa da bulur", () => {
    document.cookie = "_medusa_cache_id=abc; path=/"
    document.cookie = `${PROMO_VIDEO_COOKIE}=1; path=/`
    document.cookie = "_medusa_cart_id=xyz; path=/"
    expect(hasSeenPromoVideo()).toBe(true)
  })

  describe("whenVisible", () => {
    function setVisibility(state: "visible" | "hidden") {
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        get: () => state,
      })
    }

    afterEach(() => setVisibility("visible"))

    it("sayfa görünürse hemen ve senkron çalışır", () => {
      setVisibility("visible")
      const run = vi.fn()
      whenVisible(run)
      expect(run).toHaveBeenCalledTimes(1)
    })

    it("gizliyken beklemeye geçer, görünür olunca çalışır", () => {
      setVisibility("hidden")
      const run = vi.fn()
      whenVisible(run)
      expect(run).not.toHaveBeenCalled()

      setVisibility("visible")
      document.dispatchEvent(new Event("visibilitychange"))
      expect(run).toHaveBeenCalledTimes(1)
    })

    it("iptal edildikten sonra artık çalışmaz", () => {
      setVisibility("hidden")
      const run = vi.fn()
      const cancel = whenVisible(run)
      cancel()

      setVisibility("visible")
      document.dispatchEvent(new Event("visibilitychange"))
      expect(run).not.toHaveBeenCalled()
    })

    it("hâlâ gizli kalan visibilitychange olaylarını yoksayar", () => {
      setVisibility("hidden")
      const run = vi.fn()
      whenVisible(run)

      document.dispatchEvent(new Event("visibilitychange"))
      document.dispatchEvent(new Event("visibilitychange"))
      expect(run).not.toHaveBeenCalled()
    })
  })

  it("çerezler kapalıysa oturum yedeğine düşer", () => {
    const real = Object.getOwnPropertyDescriptor(
      Document.prototype,
      "cookie"
    ) as PropertyDescriptor
    Object.defineProperty(document, "cookie", {
      configurable: true,
      get: () => {
        throw new Error("çerezler kapalı")
      },
      set: () => {
        throw new Error("çerezler kapalı")
      },
    })

    try {
      expect(hasSeenPromoVideo()).toBe(false)
      markPromoVideoSeen()
      expect(hasSeenPromoVideo()).toBe(true)
    } finally {
      Object.defineProperty(document, "cookie", { ...real, configurable: true })
    }
  })
})
