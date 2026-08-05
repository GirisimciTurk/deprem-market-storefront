import { afterEach, beforeEach, describe, expect, it } from "vitest"
import {
  LEGACY_FAVORITES_KEY,
  clearLegacyFavorites,
  readLegacyFavoriteIds,
} from "./favorites"

/**
 * Bu yardımcılar yalnızca GÖÇ içindir: favoriler localStorage'dan müşteri
 * hesabına taşındı, cihazlarda kalan eski kayıtlar bir kez hesaba aktarılıyor.
 * Aktarılan şey kullanıcının kendi verisi olduğu için okuma tarafı bozuk/eski
 * biçimlerde bile veri kaybettirmemeli ve ASLA çökmemeli — aksi halde göç
 * yarıda kalır ve favoriler kaybolur.
 *
 * NOT: Bu jsdom sürümünde `window.localStorage` YOK (sessionStorage var), o
 * yüzden testler kendi sahte deposunu kuruyor. Yan fayda: depo erişiminin
 * fırlattığı durumu (gizli mod/kota) gerçekçi biçimde taklit edebiliyoruz.
 */

type FakeStore = {
  store: Map<string, string>
  throwOnGet: boolean
  throwOnRemove: boolean
}

let fake: FakeStore

function installFakeLocalStorage() {
  fake = { store: new Map(), throwOnGet: false, throwOnRemove: false }
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: {
      getItem: (k: string) => {
        if (fake.throwOnGet) throw new Error("SecurityError")
        return fake.store.has(k) ? fake.store.get(k)! : null
      },
      setItem: (k: string, v: string) => {
        fake.store.set(k, v)
      },
      removeItem: (k: string) => {
        if (fake.throwOnRemove) throw new Error("QuotaExceededError")
        fake.store.delete(k)
      },
      clear: () => fake.store.clear(),
    },
  })
}

function seed(value: unknown) {
  fake.store.set(
    LEGACY_FAVORITES_KEY,
    typeof value === "string" ? value : JSON.stringify(value)
  )
}

beforeEach(() => {
  installFakeLocalStorage()
})

afterEach(() => {
  // @ts-expect-error test ortamını temiz bırak
  delete window.localStorage
})

describe("eski localStorage favorilerini okuma", () => {
  it("hiç kayıt yoksa boş dizi döner", () => {
    expect(readLegacyFavoriteIds()).toEqual([])
  })

  it("eski nesne biçiminden ürün id'lerini çıkarır", () => {
    seed([
      { id: "prod_1", title: "Deprem Çantası", price: "1.200 TL" },
      { id: "prod_2", title: "İlk Yardım Seti", price: "450 TL" },
    ])
    expect(readLegacyFavoriteIds()).toEqual(["prod_1", "prod_2"])
  })

  it("düz id dizisini de kabul eder", () => {
    seed(["prod_1", "prod_2"])
    expect(readLegacyFavoriteIds()).toEqual(["prod_1", "prod_2"])
  })

  it("bozuk/eksik kayıtları atlar, sağlamları korur", () => {
    seed([
      { id: "prod_1" },
      { title: "id'siz kayıt" },
      null,
      { id: "" },
      { id: 42 },
      "prod_2",
    ])
    expect(readLegacyFavoriteIds()).toEqual(["prod_1", "prod_2"])
  })

  it("geçersiz JSON'da çökmez", () => {
    seed("{bozuk json")
    expect(readLegacyFavoriteIds()).toEqual([])
  })

  it("dizi olmayan JSON'da boş döner", () => {
    seed({ a: 1 })
    expect(readLegacyFavoriteIds()).toEqual([])
  })

  it("depo erişilemiyorsa (gizli mod/kota) boş döner", () => {
    seed([{ id: "prod_1" }])
    fake.throwOnGet = true
    expect(readLegacyFavoriteIds()).toEqual([])
  })

  it("localStorage hiç yoksa çökmez", () => {
    // @ts-expect-error bilerek kaldırılıyor
    delete window.localStorage
    expect(readLegacyFavoriteIds()).toEqual([])
  })
})

describe("eski favorileri temizleme", () => {
  it("aktarım sonrası anahtarı siler", () => {
    seed([{ id: "prod_1" }])
    clearLegacyFavorites()
    expect(fake.store.has(LEGACY_FAVORITES_KEY)).toBe(false)
    expect(readLegacyFavoriteIds()).toEqual([])
  })

  it("silme başarısız olursa çökmez — kayıt durur, sonraki denemede tekrarlanır", () => {
    seed([{ id: "prod_1" }])
    fake.throwOnRemove = true
    expect(() => clearLegacyFavorites()).not.toThrow()
    // Veri kaybolmadı: göç bir sonraki sayfa yüklemesinde yeniden denenebilir.
    expect(readLegacyFavoriteIds()).toEqual(["prod_1"])
  })
})
