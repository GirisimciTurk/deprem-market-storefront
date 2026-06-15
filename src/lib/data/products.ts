"use server"

import { sdk } from "@lib/config"
import { sortProducts } from "@lib/util/sort-products"
import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { getRegion, retrieveRegion } from "./regions"
import { getLocaleSafe, pickTranslation } from "@lib/util/localize"

// Ürün başlık/açıklamasını aktif locale için metadata.i18n'den overlay eder.
// Çeviri yoksa orijinal (tr) alan korunur. Ham veri tek cache'te paylaşılır;
// overlay request başına JS'de uygulanır (sayfalar cookie okuduğu için dynamic).
function localizeProduct(
  product: HttpTypes.StoreProduct,
  locale: string
): HttpTypes.StoreProduct {
  const i18n = (product.metadata as any)?.i18n as
    | Record<string, { title?: string; subtitle?: string; description?: string }>
    | undefined
  const tr = pickTranslation(i18n, locale)
  if (!tr) return product
  return {
    ...product,
    title: tr.title || product.title,
    subtitle: tr.subtitle ?? product.subtitle,
    description: tr.description ?? product.description,
  }
}

export const listProducts = async ({
  pageParam = 1,
  queryParams,
  countryCode,
  regionId,
}: {
  pageParam?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams
  countryCode?: string
  regionId?: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams
}> => {
  if (!countryCode && !regionId) {
    throw new Error("Country code or region ID is required")
  }

  const limit = queryParams?.limit || 12
  const _pageParam = Math.max(pageParam, 1)
  const offset = _pageParam === 1 ? 0 : (_pageParam - 1) * limit

  let region: HttpTypes.StoreRegion | undefined | null

  if (countryCode) {
    region = await getRegion(countryCode)
  } else {
    region = await retrieveRegion(regionId!)
  }

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("products")),
  }

  // Locale'i fetch'ten ÖNCE (request scope'ta) oku — cache'li promise zincirinin
  // .then microtask'ında cookies() scope'u kaybolabiliyor.
  const locale = await getLocaleSafe()

  return sdk.client
    .fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
      `/store/products`,
      {
        method: "GET",
        query: {
          limit,
          offset,
          region_id: region?.id,
          fields:
            "*variants.calculated_price,*variants.options,+variants.title,+variants.sku,+variants.barcode,+variants.manage_inventory,+variants.allow_backorder,+variants.inventory_quantity,*variants.images,*options,*options.values,+metadata,+tags,+seller.id,+seller.name,+seller.handle,+seller.rating_sum,+seller.rating_count",
          ...queryParams,
        },
        headers,
        next,
        cache: "force-cache",
      }
    )
    .then(({ products, count }) => {
      const nextPage = count > offset + limit ? pageParam + 1 : null
      const localized =
        locale === "tr" ? products : products.map((p) => localizeProduct(p, locale))

      return {
        response: {
          products: localized,
          count,
        },
        nextPage: nextPage,
        queryParams,
      }
    })
}

/**
 * This will fetch 100 products to the Next.js cache and sort them based on the sortBy parameter.
 * It will then return the paginated products based on the page and limit parameters.
 */
export const listProductsWithSort = async ({
  page = 0,
  queryParams,
  sortBy = "created_at",
  countryCode,
  minPrice,
  maxPrice,
  inStock,
}: {
  page?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  sortBy?: SortOptions
  countryCode: string
  minPrice?: string
  maxPrice?: string
  inStock?: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> => {
  const limit = queryParams?.limit || 12

  let {
    response: { products },
  } = await listProducts({
    pageParam: 0,
    queryParams: {
      ...queryParams,
      limit: 100,
    },
    countryCode,
  })

  // Filter by stock status if requested
  if (inStock === "true") {
    products = products.filter((p) => {
      return p.variants?.some((v: any) => {
        return (v.inventory_quantity ?? 0) > 0 || v.manage_inventory === false
      }) ?? false
    })
  }

  // Filter by price range
  const minPriceNum = minPrice ? parseFloat(minPrice) : null
  const maxPriceNum = maxPrice ? parseFloat(maxPrice) : null

  if (minPriceNum !== null || maxPriceNum !== null) {
    products = products.filter((product) => {
      const minPriceOfProduct = product.variants && product.variants.length > 0
        ? Math.min(...product.variants.map((v) => v?.calculated_price?.calculated_amount || 0))
        : 0
      
      if (minPriceNum !== null && minPriceOfProduct < minPriceNum) {
        return false
      }
      if (maxPriceNum !== null && minPriceOfProduct > maxPriceNum) {
        return false
      }
      return true
    })
  }

  const filteredCount = products.length
  const sortedProducts = sortProducts(products, sortBy)
  const pageParam = (page - 1) * limit
  const nextPage = filteredCount > pageParam + limit ? pageParam + limit : null
  const paginatedProducts = sortedProducts.slice(pageParam, pageParam + limit)

  return {
    response: {
      products: paginatedProducts,
      count: filteredCount,
    },
    nextPage,
    queryParams,
  }
}
