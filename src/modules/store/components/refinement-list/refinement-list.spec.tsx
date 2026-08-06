import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"

// Gezinme katmanı: push'u gözlüyoruz, URL'i testin kendisi belirliyor.
// (Gerçek uygulamada bu iki değer aynı kaynaktan gelir; testte prop'lar ile
// `useSearchParams` bilerek birlikte kurgulanıyor.)
const push = vi.fn()
let currentSearch = ""

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/tr",
  useSearchParams: () => new URLSearchParams(currentSearch),
}))

import RefinementList from "./index"

const categories = [
  { id: "cat_1", name: "Deprem Çantası" },
  { id: "cat_2", name: "İlk Yardım", parent_category_id: "cat_1" },
]

function setup(props: Record<string, unknown> = {}, search = "") {
  currentSearch = search
  return render(
    <RefinementList sortBy="created_at" categories={categories} {...(props as any)} />
  )
}

describe("RefinementList — hızlı filtreler (vitrin)", () => {
  beforeEach(() => push.mockClear())
  afterEach(cleanup)

  it("çipe tıklayınca ?showcase=<key> yazar ve sayfayı başa kaydırmaz", () => {
    setup()
    fireEvent.click(screen.getByText("En Çok Satanlar"))
    expect(push).toHaveBeenCalledWith("/tr?showcase=bestsellers", { scroll: false })
  })

  it("seçili çip prop'tan geldiğinde basılı görünür", () => {
    setup({ showcase: "deals" }, "showcase=deals")
    expect(
      screen.getByText("Fırsat Ürünleri").closest("button")
    ).toHaveAttribute("aria-pressed", "true")
  })

  it("seçili çipe tekrar tıklayınca filtre kalkar ve boş query'de çıplak yol push edilir", () => {
    setup({ showcase: "deals" }, "showcase=deals")
    fireEvent.click(screen.getByText("Fırsat Ürünleri"))
    expect(push).toHaveBeenCalledWith("/tr", { scroll: false })
  })
})

describe("RefinementList — seçimleri temizleme", () => {
  beforeEach(() => push.mockClear())
  afterEach(cleanup)

  const dolu = {
    sortBy: "price_asc",
    categoryId: "cat_1",
    minPrice: "100",
    maxPrice: "500",
    inStock: "true",
    showcase: "deals",
  }
  const doluSearch =
    "sortBy=price_asc&categoryId=cat_1&minPrice=100&maxPrice=500&inStock=true&showcase=deals&page=3"

  it("tüm filtreleri siler, sıralamayı korur, sayfalamayı sıfırlar", () => {
    setup(dolu, doluSearch)
    fireEvent.click(screen.getByText("Seçimleri Temizle"))
    expect(push).toHaveBeenCalledWith("/tr?sortBy=price_asc", { scroll: false })
  })

  it("aktif filtre yokken 'Seçimleri Temizle' hiç görünmez", () => {
    setup()
    expect(screen.queryByText("Seçimleri Temizle")).toBeNull()
  })

  it("vitrin filtresi tek başına aktifken de temizle butonu çıkar", () => {
    // Regresyon: ana sayfada showcase sayılmadığı için buton görünmüyordu ve
    // ?showcase= URL'e yapışıp panelden kaldırılamıyordu.
    setup({ showcase: "deals" }, "showcase=deals")
    expect(screen.getByText("Seçimleri Temizle")).toBeTruthy()
  })
})

describe("RefinementList — kategori ve stok", () => {
  beforeEach(() => push.mockClear())
  afterEach(cleanup)

  it("kategori seçimi çoklu birikir", () => {
    setup({ categoryId: "cat_1" }, "categoryId=cat_1")
    // Alt kategoriye ulaşmak için önce dalı aç (chevron), sonra seç.
    fireEvent.click(screen.getByLabelText("Alt kategorileri göster"))
    fireEvent.click(screen.getByText("İlk Yardım"))
    expect(push).toHaveBeenCalledWith("/tr?categoryId=cat_1%2Ccat_2", { scroll: false })
  })

  it("stok anahtarı erişilebilir bir switch'tir", () => {
    setup()
    const sw = screen.getByRole("switch", { name: /Sadece Stoktakiler/ })
    expect(sw).toHaveAttribute("aria-checked", "false")
    fireEvent.click(sw)
    expect(push).toHaveBeenCalledWith("/tr?inStock=true", { scroll: false })
  })

  it("stok açıkken tekrar tıklanınca kapanır", () => {
    setup({ inStock: "true" }, "inStock=true")
    expect(screen.getByRole("switch", { name: /Sadece Stoktakiler/ })).toHaveAttribute(
      "aria-checked",
      "true"
    )
    fireEvent.click(screen.getByRole("switch", { name: /Sadece Stoktakiler/ }))
    expect(push).toHaveBeenCalledWith("/tr", { scroll: false })
  })
})
