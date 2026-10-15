import { HttpTypes } from "@medusajs/types"
import { gobitFetch } from "@lib/gobit/client"
import { GobitCategory, toCategories } from "@lib/gobit/adapt"
import { getCacheOptions } from "./cookies"

// gobit kategorileri düz liste verir; ağaç (category_children, parent_category)
// burada kurulur. Medusa'nın `*products` gömmesi yok: bir kategorinin ürünleri
// ürün listesinden `category_tree_id` ile okunur.
async function allCategories(): Promise<HttpTypes.StoreProductCategory[]> {
  const cacheOpts = await getCacheOptions("categories")
  const next = {
    ...cacheOpts,
    tags: [...("tags" in cacheOpts ? cacheOpts.tags : []), "categories"],
    revalidate: 60,
  }
  const flat: GobitCategory[] = []
  for (let offset = 0; ; offset += 100) {
    const page = await gobitFetch<{ data: GobitCategory[]; count?: number }>("/store/v1/categories", {
      query: { limit: 100, offset },
      next,
    })
    flat.push(...page.data)
    if (!page.data.length || flat.length >= (page.count ?? flat.length)) break
  }

  return toCategories(flat)
}

export const listCategories = async (query?: Record<string, unknown>) => {
  const all = await allCategories()
  if (query?.parent_category_id === "null") return all.filter((c) => !c.parent_category_id)

  return all
}

export const getCategoryByHandle = async (
  categoryHandle: string[]
): Promise<HttpTypes.StoreProductCategory> => {
  const safeDecode = (s: string) => {
    try {
      return decodeURIComponent(s)
    } catch {
      return s
    }
  }
  const handle = categoryHandle.map(safeDecode)
  const last = handle[handle.length - 1]

  // Bulunamayan kategori Medusa'daki gibi boş cevaptır; sayfa notFound() der.
  return (await allCategories()).find((c) => c.handle === last) as HttpTypes.StoreProductCategory
}
