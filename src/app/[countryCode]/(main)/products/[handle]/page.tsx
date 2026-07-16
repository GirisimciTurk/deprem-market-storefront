import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { listProducts } from "@lib/data/products"
import { getRegion, listRegions } from "@lib/data/regions"
import ProductTemplate from "@modules/products/templates"
import { HttpTypes } from "@medusajs/types"
import ProductJsonLd, { BreadcrumbJsonLd } from "@modules/common/components/json-ld"
import { listProductReviews } from "@lib/data/reviews"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
  searchParams: Promise<{ v_id?: string }>
}

export async function generateStaticParams() {
  try {
    const countryCodes = await listRegions().then((regions) =>
      regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat()
    )

    if (!countryCodes) {
      return []
    }

    const promises = countryCodes.map(async (country) => {
      const { response } = await listProducts({
        countryCode: country,
        queryParams: { limit: 100, fields: "handle" },
      })

      return {
        country,
        products: response.products,
      }
    })

    const countryProducts = await Promise.all(promises)

    return countryProducts
      .flatMap((countryData) =>
        countryData.products.map((product) => ({
          countryCode: countryData.country,
          handle: product.handle,
        }))
      )
      .filter((param) => param.handle)
  } catch (error) {
    console.error(
      `Failed to generate static paths for product pages: ${
        error instanceof Error ? error.message : "Unknown error"
      }.`
    )
    return []
  }
}

function getImagesForVariant(
  product: HttpTypes.StoreProduct,
  selectedVariantId?: string
) {
  if (!selectedVariantId || !product.variants) {
    return product.images
  }

  const variant = product.variants!.find((v) => v.id === selectedVariantId)
  if (!variant || !variant.images?.length) {
    return product.images
  }

  const imageIdsMap = new Map(variant.images!.map((i) => [i.id, true]))
  return product.images?.filter((i) => imageIdsMap.has(i.id)) ?? null
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { handle } = params
  const region = await getRegion(params.countryCode)

  if (!region) {
    notFound()
  }

  const product = await listProducts({
    countryCode: params.countryCode,
    queryParams: { handle },
  }).then(({ response }) => response.products[0])

  if (!product) {
    notFound()
  }

  const t = await getTranslations("metadata")
  const title = t("productBrandTitle", { title: product.title })
  const description = t("productDescription", { title: product.title })

  return {
    title,
    description,
    alternates: {
      canonical: `/${params.countryCode}/products/${handle}`,
      // Dil cookie-tabanlı (URL'de değil); bölgesel URL'ler aynı Türkçe içeriği sunar.
      // Bu yüzden yalnız doğru olan tr + x-default emit edilir (fr/de vb. YANLIŞ olurdu).
      languages: {
        tr: `/tr/products/${handle}`,
        "x-default": `/tr/products/${handle}`,
      },
    },
    openGraph: {
      title,
      description,
      images: product.thumbnail ? [product.thumbnail] : [],
    },
  }
}

export default async function ProductPage(props: Props) {
  const params = await props.params
  const region = await getRegion(params.countryCode)
  const searchParams = await props.searchParams

  const selectedVariantId = searchParams.v_id

  if (!region) {
    notFound()
  }

  const pricedProduct = await listProducts({
    countryCode: params.countryCode,
    queryParams: { handle: params.handle },
  }).then(({ response }) => response.products[0])

  if (!pricedProduct) {
    notFound()
  }

  const images = getImagesForVariant(pricedProduct, selectedVariantId)

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://depremmarket.com"
  const productUrl = `${baseUrl}/${params.countryCode}/products/${params.handle}`

  // Onaylı yorumlardan AggregateRating (Google yıldızları). Yorum yoksa eklenmez.
  const reviews = await listProductReviews(params.handle)
  const reviewCount = reviews.length
  const ratingValue =
    reviewCount > 0
      ? Math.round((reviews.reduce((a, r) => a + r.rating, 0) / reviewCount) * 10) / 10
      : 0

  return (
    <>
      <ProductJsonLd
        product={pricedProduct}
        url={productUrl}
        aggregateRating={reviewCount > 0 ? { ratingValue, reviewCount } : undefined}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Ana Sayfa", url: `${baseUrl}/${params.countryCode}` },
          { name: "Mağaza", url: `${baseUrl}/${params.countryCode}/store` },
          { name: pricedProduct.title || "", url: productUrl },
        ]}
      />
      <ProductTemplate
        product={pricedProduct}
        region={region}
        countryCode={params.countryCode}
        images={images ?? []}
      />
    </>
  )
}
