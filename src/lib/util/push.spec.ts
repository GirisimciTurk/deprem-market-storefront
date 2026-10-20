import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// Sunucu eylemleri: anahtar gobit'ten gelir, kayıt gobit'e gider.
vi.mock("@lib/data/push", () => ({
  getVapidPublicKey: vi.fn(),
  savePushSubscription: vi.fn(async () => ({ success: true, error: null })),
  removePushSubscription: vi.fn(async () => ({ success: true, error: null })),
  saveStockAlert: vi.fn(),
  unbindPushSubscription: vi.fn(),
}))

import { getVapidPublicKey, removePushSubscription, savePushSubscription } from "@lib/data/push"

// 65 baytlık sıkıştırılmamış P-256 noktası; içerik değil uzunluk ve eşitlik önemli.
const raw = (fill: number) => new Uint8Array(65).fill(fill)
const b64url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...Array.from(bytes))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")

function fakeSubscription(endpoint: string, key: Uint8Array) {
  return {
    endpoint,
    options: { applicationServerKey: key.buffer },
    toJSON: () => ({ keys: { p256dh: "p256dh", auth: "auth" } }),
    unsubscribe: vi.fn(async () => true),
  }
}

let current: ReturnType<typeof fakeSubscription> | null
const pushManager = {
  getSubscription: vi.fn(async () => current),
  subscribe: vi.fn(async (opts: { applicationServerKey: Uint8Array }) => {
    current = fakeSubscription("https://push.example/yeni", new Uint8Array(opts.applicationServerKey))
    return current
  }),
}

beforeEach(() => {
  vi.resetModules()
  vi.clearAllMocks()
  const reg = { pushManager }
  Object.defineProperty(navigator, "serviceWorker", {
    configurable: true,
    value: { getRegistration: async () => reg, ready: Promise.resolve(reg) },
  })
  vi.stubGlobal("PushManager", function PushManager() {})
  vi.stubGlobal("Notification", { permission: "granted", requestPermission: vi.fn() })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("push aboneliğinin eşitlenmesi", () => {
  it("gobit'in anahtarı değiştiyse aboneliği istem göstermeden yeni anahtarla yeniler", async () => {
    current = fakeSubscription("https://push.example/eski", raw(1))
    const old = current
    vi.mocked(getVapidPublicKey).mockResolvedValue(b64url(raw(2)))

    const { syncPushSubscription } = await import("./push")
    await syncPushSubscription("tr")

    expect(old.unsubscribe).toHaveBeenCalled()
    expect(removePushSubscription).toHaveBeenCalledWith("https://push.example/eski")
    expect(pushManager.subscribe).toHaveBeenCalledTimes(1)
    expect(new Uint8Array(pushManager.subscribe.mock.calls[0][0].applicationServerKey)).toEqual(raw(2))
    expect(savePushSubscription).toHaveBeenCalledWith(
      expect.objectContaining({ endpoint: "https://push.example/yeni", locale: "tr" })
    )
    expect(Notification.requestPermission).not.toHaveBeenCalled()
  })

  it("anahtar aynıysa var olan aboneliği yeniden yazar, yenisini açmaz", async () => {
    current = fakeSubscription("https://push.example/ayni", raw(3))
    vi.mocked(getVapidPublicKey).mockResolvedValue(b64url(raw(3)))

    const { syncPushSubscription } = await import("./push")
    await syncPushSubscription("tr")

    expect(pushManager.subscribe).not.toHaveBeenCalled()
    expect(current.unsubscribe).not.toHaveBeenCalled()
    expect(savePushSubscription).toHaveBeenCalledWith(
      expect.objectContaining({ endpoint: "https://push.example/ayni" })
    )
  })

  it("gobit'te web-push kurulu değilse (anahtar yok) aboneliğe dokunmaz", async () => {
    current = fakeSubscription("https://push.example/eski", raw(1))
    vi.mocked(getVapidPublicKey).mockResolvedValue(null)

    const { syncPushSubscription } = await import("./push")
    await syncPushSubscription("tr")

    expect(current.unsubscribe).not.toHaveBeenCalled()
    expect(pushManager.subscribe).not.toHaveBeenCalled()
    expect(savePushSubscription).not.toHaveBeenCalled()
  })
})
