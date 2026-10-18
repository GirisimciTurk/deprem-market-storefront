"use server"

import { gobitData, gobitFetch, GobitError, SALES_CHANNEL_ID } from "@lib/gobit/client"
import { GobitProduct, ProductCard, toProduct, withCardRating } from "@lib/gobit/adapt"
import { sortProducts } from "@lib/util/sort-products"
import { StoreProduct, StoreProductListParams, StoreRegion } from "types/store"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getCacheOptions } from "./cookies"
import { getRegion, retrieveRegion } from "./regions"
import { getLocaleSafe, pickTranslation } from "@lib/util/localize"
import { toReachableImageUrl } from "@lib/util/image-url"
import { matchesPriceRange } from "@lib/util/price-filter"
import { getProductPrice } from "@lib/util/get-product-price"

// Ürünün görsel URL'lerini (thumbnail + product.images) TR'den erişilemeyen
// r2.dev'den /r2/ proxy'sine çevirir. Tek merkezde yapıldığı için her bileşen +
// RSC hidrasyon verisi otomatik temiz URL alır (galeri product.images'ı kullanır).
function normalizeProductImages(
  product: StoreProduct
): StoreProduct {
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
  product: StoreProduct,
  locale: string
): StoreProduct {
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

// gobit'ten bir sayfa ürün: adresle (handle), kimlik listesiyle (id) ya da
// süzgeçle. Kartın mağazası ve ürün puanı dtm'nin /product-cards okumasından
// tek istekte gelir (en çok 100 kimlik).
async function gobitProducts(
  q: Record<string, any>,
  limit: number,
  offset: number,
  region: StoreRegion,
  next: NextFetchRequestConfig
): Promise<{ products: StoreProduct[]; count: number }> {
  const base = `/store/v1/sales-channels/${SALES_CHANNEL_ID}/products`
  const one = (key: string) =>
    gobitData<GobitProduct>(`${base}/${encodeURIComponent(key)}`, { query: { region_id: region.id }, next }).catch(
      (e) => {
        if (e instanceof GobitError && e.status === 404) return null
        throw e
      }
    )
  const first = (v: unknown) => (Array.isArray(v) ? v[0] : v) as string | undefined

  let raw: GobitProduct[]
  let count: number
  if (Array.isArray(q.handle)) {
    // Birden çok adres (blog yazısının ilgili ürünleri): tek tek okunur.
    const handles = (q.handle as unknown[]).map(String).filter(Boolean)
    raw = (await Promise.all(handles.slice(offset, offset + limit).map(one))).filter(Boolean) as GobitProduct[]
    count = handles.length
  } else if (q.handle) {
    const p = await one(String(q.handle))
    raw = p ? [p] : []
    count = raw.length
  } else if (q.id) {
    // gobit'in listesi ürün kimliğiyle süzmüyor: birkaç kimlik tek tek okunur.
    const ids = (Array.isArray(q.id) ? q.id : [q.id]).map(String)
    raw = (await Promise.all(ids.slice(offset, offset + limit).map(one))).filter(Boolean) as GobitProduct[]
    count = ids.length
  } else {
    const page = await gobitFetch<{ data: GobitProduct[]; count?: number }>(base, {
      query: {
        limit,
        offset,
        region_id: region.id,
        q: q.q,
        category_tree_id: first(q.category_id),
        collection_id: first(q.collection_id),
        tag_id: first(q.tag_id),
        sort: q.order === "created_at" ? "oldest" : "newest",
      },
      next,
    })
    raw = page.data
    count = page.count ?? raw.length
  }

  const cards = new Map<string, ProductCard>()
  if (raw.length) {
    const ids = raw.map((p) => p.id)
    const pages = await Promise.all(
      Array.from({ length: Math.ceil(ids.length / 100) }, (_, i) =>
        gobitData<ProductCard[]>("/store/v1/dtm/product-cards", {
          query: { product_id: ids.slice(i * 100, i * 100 + 100) },
          next,
        }).catch(() => [] as ProductCard[])
      )
    )
    pages.flat().forEach((c) => cards.set(c.product_id, c))
  }

  return {
    products: raw.map((p) => {
      const card = cards.get(p.id)
      return toProduct(withCardRating(p, card), region as any, card?.seller)
    }),
    count,
  }
}

export const listProducts = async ({
  pageParam = 1,
  queryParams,
  countryCode,
  regionId,
}: {
  pageParam?: number
  queryParams?: StoreProductListParams
  countryCode?: string
  regionId?: string
}): Promise<{
  response: { products: StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: StoreProductListParams
}> => {
  if (!countryCode && !regionId) {
    throw new Error("Country code or region ID is required")
  }

  const limit = queryParams?.limit || 12
  const _pageParam = Math.max(pageParam, 1)
  const offset = _pageParam === 1 ? 0 : (_pageParam - 1) * limit

  let region: StoreRegion | undefined | null

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

  return gobitProducts(queryParams ?? {}, limit, offset, region, next)
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

export type SearchHit = {
  id: string
  title: string
  handle: string
  thumbnail: string | null
  price?: string
}

/** Üst çubuktaki canlı arama: ilk birkaç eşleşme, kartlardaki fiyatla. */
export const searchProducts = async (term: string, countryCode: string): Promise<SearchHit[]> => {
  const q = term.trim()
  if (q.length < 2) return []
  const { response } = await listProducts({ countryCode, queryParams: { q, limit: 8 } })
  return response.products.map((p) => ({
    id: p.id,
    title: p.title,
    handle: p.handle,
    thumbnail: p.thumbnail,
    price: getProductPrice({ product: p }).cheapestPrice?.calculated_price,
  }))
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
  queryParams?: StoreProductListParams
  sortBy?: SortOptions
  countryCode: string
  minPrice?: string
  maxPrice?: string
  inStock?: string
  /** Sabit vitrin kategorisi key'i — ürün metadata.showcase içermeli. */
  showcase?: string
}): Promise<{
  response: { products: StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: StoreProductListParams
}> => {
  const limit = queryParams?.limit || 12

  // HIZLI YOL: bellekte filtre/sıralama GEREKMİYORSA sayfalamayı backend yapsın.
  // Aksi halde çalışma kümesi MAX_WORKING_SET'te tavan yapıyor ve `count` olarak
  // bu KIRPILMIŞ sayı dönüyor. Ana kategoriler alt ağaçlarıyla birlikte
  // sorgulanmaya başlayınca (bkz. category-tree) bu yol ana kategorilerin
  // VARSAYILAN yolu oldu: 600 ürünlük bir kategoride son 100 ürüne hiç
  // ulaşılamıyor ve kullanıcı "Tüm ürünler listelendi" yazısını görüyordu.
  const needsInMemoryPass =
    Boolean(minPrice || maxPrice || showcase) ||
    inStock === "true" ||
    sortBy === "price_asc" ||
    sortBy === "price_desc"

  if (!needsInMemoryPass) {
    const { response, nextPage } = await listProducts({
      pageParam: Math.max(page, 1),
      // sortProducts "created_at"i AZALAN sıralıyor; sıralama backend'e
      // devredilirken "-" öneki ŞART, yoksa liste en eski üründen başlar.
      queryParams: { ...queryParams, limit, order: "-created_at" },
      countryCode,
    })
    return { response, nextPage, queryParams }
  }

  // Fiyat/stok/vitrin filtreleri ve fiyat sıralaması calculated_price / envanter /
  // metadata gerektirdiğinden bellekte uygulanır. Bu yüzden çalışma kümesi katalogun
  // tamamını (sınırlı) kapsamalı; aksi halde 100. üründen sonrası "sessizce" düşer.
  const CHUNK = 100
  const MAX_WORKING_SET = 480

  const first = await listProducts({
    pageParam: 1,
    queryParams: { ...queryParams, limit: CHUNK },
    countryCode,
  })
  let products = first.response.products
  const totalCount = first.response.count

  // Katalog 100'ü aşıyorsa kalan sayfaları (sınırlı) paralel çek — böylece filtre,
  // sıralama ve sayfalama ilk 100 değil gerçek katalog üzerinde çalışır.
  if (totalCount > CHUNK) {
    const target = Math.min(totalCount, MAX_WORKING_SET)
    const rest = await Promise.all(
      Array.from({ length: Math.ceil(target / CHUNK) - 1 }, (_, i) =>
        listProducts({
          pageParam: i + 2,
          queryParams: { ...queryParams, limit: CHUNK },
          countryCode,
        })
      )
    )
    for (const r of rest) products = products.concat(r.response.products)
    if (totalCount > MAX_WORKING_SET) {
      // Sessiz kırpma yok: bu boyutta backend-seviyesi filtre/sıralama gerekir.
      console.warn(
        `[products] Katalog ${totalCount} ürün — filtre/sıralama ilk ${MAX_WORKING_SET} ürün üzerinde uygulandı.`
      )
    }
  }

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

/** Kimliği verilen ürünler (favoriler gibi istemci bileşenleri için). */
export const listProductsByIds = async (ids: string[], regionId: string): Promise<StoreProduct[]> => {
  if (!ids.length) return []
  const { response } = await listProducts({ regionId, queryParams: { id: ids, limit: ids.length } as any })

  return response.products
}
