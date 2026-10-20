import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductTemplate from "@modules/products/templates"
import { StoreProduct } from "types/store"
import ProductJsonLd, { BreadcrumbJsonLd } from "@modules/common/components/json-ld"
import { listProductReviews } from "@lib/data/reviews"
import { seoAlternates } from "@lib/util/seo"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
  searchParams: Promise<{ v_id?: string }>
}

// Sayfa her istekte sunucuda çizilir: çerez (sepet, oturum, dil) ve searchParams
// okuduğu için statik olamaz. Eskiden generateStaticParams vardı; derlemede API'ye
// ulaşılamayınca boş liste dönüyor, Next de rotayı "statik + isteğe bağlı ISR"
// sanıyordu → her ürün sayfası DYNAMIC_SERVER_USAGE ile 500 verdi (gobit geçişinin
// derlemesinde GOBIT_SALES_CHANNEL_ID boştu). Ürün verisi yine fetch önbelleğinden
// gelir (listProducts: revalidate 30 sn + "products" etiketi).
export const dynamic = "force-dynamic"

function getImagesForVariant(
  product: StoreProduct,
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
  // Kök düzenin şablonu ("%s | depremTek Market") markayı <title>'a kendisi
  // ekler; openGraph başlığı şablondan geçmez, markayı kendisi taşır.
  const description = t("productDescription", { title: product.title })

  return {
    title: product.title,
    description,
    // Canonical BİRİNCİL bölgeye sabit: /de, /fr … aynı Türkçe içeriği sunuyor.
    // Önceden canonical kendi bölgesini gösteriyordu; hreflang ise /tr diyordu —
    // iki sinyal birbirini yalanlıyor, her ülke öneki ayrı özgün sayfa sanılıyordu.
    alternates: seoAlternates(`/products/${handle}`),
    openGraph: {
      title: t("productBrandTitle", { title: product.title }),
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
