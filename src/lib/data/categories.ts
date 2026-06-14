import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

export const listCategories = async (query?: Record<string, unknown>) => {
  const next = {
    ...(await getCacheOptions("categories")),
  }

  const limit = query?.limit || 100

  return sdk.client
    .fetch<{ product_categories: HttpTypes.StoreProductCategory[] }>(
      "/store/product-categories",
      {
        query: {
          fields:
            "*category_children, *products, *parent_category, *parent_category.parent_category",
          limit,
          ...query,
        },
        next,
        cache: "force-cache",
      }
    )
    .then(({ product_categories }) => product_categories)
}

export const getCategoryByHandle = async (categoryHandle: string[]) => {
  // Next.js catch-all route segmentleri (`[...category]`) URL'den %-encoded gelir
  // (örn. Türkçe/`&` içeren handle'larda `i%CC%87lk-...`). Çözmeden backend'e
  // verilirse SDK `%`'leri tekrar encode eder → çift-encode → handle eşleşmez →
  // 404. Bu yüzden her segmenti güvenli şekilde decode ediyoruz (zaten decode
  // edilmiş/ASCII handle'larda no-op, bozuk girdide orijinali korur).
  const safeDecode = (s: string) => {
    try {
      return decodeURIComponent(s)
    } catch {
      return s
    }
  }
  const handle = categoryHandle.map(safeDecode).join("/")

  const next = {
    ...(await getCacheOptions("categories")),
  }

  return sdk.client
    .fetch<HttpTypes.StoreProductCategoryListResponse>(
      `/store/product-categories`,
      {
        query: {
          fields: "*category_children, *products",
          handle,
        },
        next,
        cache: "force-cache",
      }
    )
    .then(({ product_categories }) => product_categories[0])
}
