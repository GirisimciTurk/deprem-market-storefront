import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { act, cleanup, render } from "@testing-library/react"
import { PROMO_VIDEO_COOKIE } from "@lib/util/promo-video"

// next-intl provider kurmadan çalışabilmek için çeviriyi anahtarı döndüren
// sahte bir fonksiyona indiriyoruz — bu testin konusu metin değil, AÇILMA KARARI.
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}))

import PromoVideoPopup from "./index"

const OPEN_DELAY_MS = 600

function clearCookies() {
  for (const c of document.cookie.split(";")) {
    const name = c.split("=")[0]?.trim()
    if (name) document.cookie = `${name}=; path=/; max-age=0`
  }
}

/** Popup açıldıysa video elemanı DOM'da olur. */
function videoEl() {
  return document.querySelector('video[src="/videos/tanitim.mp4"]')
}

describe("PromoVideoPopup açılma kararı", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    clearCookies()
    window.sessionStorage.clear()
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true } as Response)
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it("ilk ziyarette (çerez yok) gecikmeden sonra açılır", () => {
    render(<PromoVideoPopup />)
    expect(videoEl()).toBeNull() // gecikme dolmadan görünmez

    act(() => {
      vi.advanceTimersByTime(OPEN_DELAY_MS)
    })

    expect(videoEl()).not.toBeNull()
  })

  it("açılırken çerezi yazar — asıl 'bir kez' garantisi bu", () => {
    render(<PromoVideoPopup />)
    act(() => {
      vi.advanceTimersByTime(OPEN_DELAY_MS)
    })

    expect(document.cookie).toContain(`${PROMO_VIDEO_COOKIE}=1`)
  })

  it("çerez zaten varsa HİÇ açılmaz (sonraki sayfa / yeni sekme / sonraki gün)", () => {
    document.cookie = `${PROMO_VIDEO_COOKIE}=1; path=/`

    render(<PromoVideoPopup />)
    act(() => {
      vi.advanceTimersByTime(OPEN_DELAY_MS * 10)
    })

    expect(videoEl()).toBeNull()
  })

  it("ilk gösterimden sonra yeniden mount edilirse tekrar açılmaz", () => {
    const first = render(<PromoVideoPopup />)
    act(() => {
      vi.advanceTimersByTime(OPEN_DELAY_MS)
    })
    expect(videoEl()).not.toBeNull()
    first.unmount()

    // Aynı tarayıcıda başka bir sayfaya gidilmiş gibi yeniden mount.
    render(<PromoVideoPopup />)
    act(() => {
      vi.advanceTimersByTime(OPEN_DELAY_MS * 10)
    })

    expect(videoEl()).toBeNull()
  })

  // Arka plan sekmesi / Chrome prerender: sayfa hydrate olur ama kullanıcı görmez.
  // Damga 1 yıllık olduğu için burada yanlışlıkla basılırsa video hiç oynamaz.
  describe("sayfa görünür değilken", () => {
    /** jsdom'da visibilityState salt-okunur; testlik olarak geçersiz kılıyoruz. */
    function setVisibility(state: "visible" | "hidden") {
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        get: () => state,
      })
    }

    afterEach(() => {
      setVisibility("visible")
    })

    it("arka plan sekmesinde ne açılır ne de çerez yazılır", () => {
      setVisibility("hidden")

      render(<PromoVideoPopup />)
      act(() => {
        vi.advanceTimersByTime(OPEN_DELAY_MS * 50)
      })

      expect(videoEl()).toBeNull()
      expect(document.cookie).not.toContain(PROMO_VIDEO_COOKIE)
      expect(globalThis.fetch).not.toHaveBeenCalled()
    })

    it("sekme öne geldiğinde açılır — tek gösterim harcanmamış olur", () => {
      setVisibility("hidden")
      render(<PromoVideoPopup />)
      act(() => {
        vi.advanceTimersByTime(OPEN_DELAY_MS * 50)
      })
      expect(videoEl()).toBeNull()

      setVisibility("visible")
      act(() => {
        document.dispatchEvent(new Event("visibilitychange"))
        vi.advanceTimersByTime(OPEN_DELAY_MS)
      })

      expect(videoEl()).not.toBeNull()
      expect(document.cookie).toContain(`${PROMO_VIDEO_COOKIE}=1`)
    })

    it("gizliyken unmount olursa dinleyici kalmaz, sonradan açılmaz", () => {
      setVisibility("hidden")
      const { unmount } = render(<PromoVideoPopup />)
      unmount()

      setVisibility("visible")
      act(() => {
        document.dispatchEvent(new Event("visibilitychange"))
        vi.advanceTimersByTime(OPEN_DELAY_MS * 10)
      })

      expect(videoEl()).toBeNull()
      expect(document.cookie).not.toContain(PROMO_VIDEO_COOKIE)
    })
  })

  it("gecikme dolmadan unmount olursa çerez yazılmaz ve açılmamış sayılır", () => {
    const { unmount } = render(<PromoVideoPopup />)
    act(() => {
      vi.advanceTimersByTime(OPEN_DELAY_MS - 100)
    })
    unmount()

    expect(document.cookie).not.toContain(PROMO_VIDEO_COOKIE)

    // Sonraki mount'ta hâlâ ilk ziyaret sayılır.
    render(<PromoVideoPopup />)
    act(() => {
      vi.advanceTimersByTime(OPEN_DELAY_MS)
    })
    expect(videoEl()).not.toBeNull()
  })
})
