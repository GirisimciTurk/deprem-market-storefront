import { describe, expect, it } from "vitest"
import { expandCategoryIds } from "./category-tree"

// Ağaç:  canta ─ aile ─ bebek
//        isik
const agac = [
  { id: "canta", products: [] },
  { id: "aile", parent_category_id: "canta", products: [{ id: "p1" }, { id: "p2" }] },
  { id: "bebek", parent_category_id: "aile", products: [{ id: "p3" }] },
  { id: "isik", products: [{ id: "p4" }] },
]

describe("expandCategoryIds", () => {
  it("seçilen kategoriyi TÜM alt ağacıyla döndürür", () => {
    // Asıl hata buydu: ana kategori seçilince yalnız kendi id'si sorgulanıyor,
    // ürünler yaprak kategorilerde olduğu için sonuç boş geliyordu.
    expect(expandCategoryIds(["canta"], agac)).toEqual(["canta", "aile", "bebek"])
  })

  it("birden fazla seviyeyi atlamaz (torun dahil)", () => {
    expect(expandCategoryIds(["aile"], agac)).toEqual(["aile", "bebek"])
  })

  it("yaprak kategoride yalnız kendisini döndürür", () => {
    expect(expandCategoryIds(["bebek"], agac)).toEqual(["bebek"])
  })

  it("çoklu seçimde tekrarları ayıklar", () => {
    // canta zaten aile'yi kapsıyor; aile ikinci kez eklenmemeli.
    expect(expandCategoryIds(["canta", "aile"], agac)).toEqual([
      "canta",
      "aile",
      "bebek",
    ])
  })

  it("parent_category nesnesi biçimini de anlar", () => {
    const alt = [
      { id: "ust" },
      { id: "alt", parent_category: { id: "ust" } },
    ]
    expect(expandCategoryIds(["ust"], alt)).toEqual(["ust", "alt"])
  })

  it("boş seçimde boş döner (filtre uygulanmamalı)", () => {
    expect(expandCategoryIds([], agac)).toEqual([])
  })

  it("listede olmayan id'yi olduğu gibi korur", () => {
    // Kategori limit dışında kalmış olabilir; filtre yine de denenmeli.
    expect(expandCategoryIds(["bilinmeyen"], agac)).toEqual(["bilinmeyen"])
  })

  it("döngüsel veride sonsuz döngüye girmez", () => {
    const dongu = [
      { id: "a", parent_category_id: "b" },
      { id: "b", parent_category_id: "a" },
    ]
    expect(expandCategoryIds(["a"], dongu).sort()).toEqual(["a", "b"])
  })
})
