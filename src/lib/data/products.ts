"use server"

import { sdk } from "@lib/config"
import { sortProducts } from "@lib/util/sort-products"
import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { getRegion, retrieveRegion } from "./regions"
import { getLocaleSafe, pickTranslation } from "@lib/util/localize"
import { toReachableImageUrl } from "@lib/util/image-url"
import { matchesPriceRange } from "@lib/util/price-filter"

// Ürünün görsel URL'lerini (thumbnail + product.images) TR'den erişilemeyen
// r2.dev'den /r2/ proxy'sine çevirir. Tek merkezde yapıldığı için her bileşen +
// RSC hidrasyon verisi otomatik temiz URL alır (galeri product.images'ı kullanır).
function normalizeProductImages(
  product: HttpTypes.StoreProduct
): HttpTypes.StoreProduct {
  const out = { ...product }
  if (product.thumbnail) {
    out.thumbnail = toReachableImageUrl(product.thumbnail) ?? product.thumbnail
  }
  if (product.images) {
    out.images = product.images.map((im) => ({
      ...im,
      url: toReachableImageUrl(im.url) ?? im.url,
    }))
  }
  return out
}

// Mağaza ürün verisinin tazelik aralığı (sn). Satıcı bir ürünü güncelleyince
// değişiklik en geç bu süre içinde storefront'a yansır (ISR / stale-while-revalidate).
const PRODUCT_REVALIDATE_SECONDS = 30

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

  // Ürün verisi: force-cache + session-bazlı tag (products-{cache_id}) verisini
  // SÜRESIZ donduruyordu → satıcı ürünü güncellese de mağazada eski resim/bilgi
  // görünüyordu. Çözüm iki katman:
  //  - revalidate: webhook yoksa ≤30 sn'de otomatik tazelik (ISR).
  //  - statik "products" tag: backend ürün güncelleyince revalidateTag("products")
  //    ile (/api/revalidate) ANINDA global tazeleme.
  const cacheOpts = await getCacheOptions("products")
  const next = {
    ...cacheOpts,
    tags: [...("tags" in cacheOpts ? cacheOpts.tags : []), "products"],
    revalidate: PRODUCT_REVALIDATE_SECONDS,
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
            "*variants.calculated_price,*variants.options,+variants.title,+variants.sku,+variants.barcode,+variants.manage_inventory,+variants.allow_backorder,+variants.inventory_quantity,+variants.metadata,*variants.images,*options,*options.values,+metadata,+tags,+seller.id,+seller.name,+seller.handle,+seller.rating_sum,+seller.rating_count",
          ...queryParams,
        },
        headers,
        next,
      }
    )
    .then(({ products, count }) => {
      const nextPage = count > offset + limit ? pageParam + 1 : null
      const reachable = products.map(normalizeProductImages)
      const localized =
        locale === "tr" ? reachable : reachable.map((p) => localizeProduct(p, locale))

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
  showcase,
}: {
  page?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  sortBy?: SortOptions
  countryCode: string
  minPrice?: string
  maxPrice?: string
  inStock?: string
  /** Sabit vitrin kategorisi key'i — ürün metadata.showcase içermeli. */
  showcase?: string
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

  // Fiyat aralığı filtresi. Birim uyumu (TL girdi → kuruş karşılaştırma) ve boş/geçersiz
  // sınır davranışı @lib/util/price-filter içinde (saf + birim-testli).
  if (minPrice || maxPrice) {
    products = products.filter((product) => matchesPriceRange(product, minPrice, maxPrice))
  }

  // Vitrin (sabit) kategori filtresi: ürün metadata.showcase key'i içermeli.
  if (showcase) {
    products = products.filter((p) => {
      const s = (p.metadata as Record<string, unknown> | null)?.showcase
      return Array.isArray(s) && s.includes(showcase)
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
