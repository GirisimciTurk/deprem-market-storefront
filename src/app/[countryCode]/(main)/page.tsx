import { Metadata } from "next"
import { Suspense } from "react"
import { getTranslations } from "next-intl/server"

import StoreTemplate from "@modules/store/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import FeaturedSellers from "@modules/sellers/components/featured-sellers"
import ShowcaseSections from "@modules/home/components/showcase-sections"
import HeroSlider from "@modules/home/components/hero-slider"
import { isShowcaseKey } from "@lib/showcase"
import { listCategories } from "@lib/data/categories"

/** Ana sayfaya kategori seçmeden gelindiğinde seçili gelecek kategori (handle). */
const DEFAULT_CATEGORY_HANDLE = "karbon-fiber"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata")
  return {
    title: t("homeTitle"),
    description: t("homeDescription"),
  }
}

type Params = {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
    minPrice?: string
    maxPrice?: string
    categoryId?: string
    inStock?: string
    showcase?: string
  }>
}

export default async function Home(props: Params) {
  const { countryCode } = await props.params
  const { sortBy, page, minPrice, maxPrice, categoryId: rawCategoryId, inStock, showcase } =
    await props.searchParams
  const t = await getTranslations("metadata")

  // Varsayılan kategori: URL'de hiç `categoryId` yoksa "Karbon Fiber" seçili gelir.
  // `categoryId=` (boş) ise kullanıcı seçimi bilerek kaldırmıştır → tüm ürünler;
  // RefinementList ana sayfada boşaltırken paramı silmek yerine boş bırakır ki
  // varsayılan geri gelmesin. Kategori bulunamazsa (silinmiş/handle değişmiş)
  // sessizce filtresiz devam edilir.
  const categoryId =
    rawCategoryId !== undefined
      ? rawCategoryId || undefined
      : await listCategories()
          .then((cats) => cats.find((c) => c.handle === DEFAULT_CATEGORY_HANDLE)?.id)
          .catch(() => undefined)

  // Ana sayfa: ürünler EN ÜSTTE başlasın (sol filtreler + ürün gridi). İkincil
  // içerik (öne çıkan satıcılar + PDF vizyon şeridi) gridin altına alındı; geri
  // kalan gezinme sağdaki menü şeridinde (CategoryDrawer). Büyük "mağaza" başlığı
  // yalnız /store'da; ana sayfada SEO/erişilebilirlik için görsel-gizli H1.
  // Bir vitrin (hızlı filtre) seçiliyken üstteki vitrin şeritleri gizlenir; aksi
  // halde aynı başlık hem şerit hem filtrelenmiş grid olarak iki kez çıkardı.
  const showcaseActive = isShowcaseKey(showcase)

  // ShowcaseSections/FeaturedSellers kendi ürün çekimlerini yapıyor. Suspense
  // dışında kaldıklarında filtre tıklamasındaki RSC turunun commit'ini de
  // bloklyorlardı (panel saniyelerce "cevapsız" görünüyordu) → akışa alındılar.
  return (
    <>
      <h1 className="sr-only">{t("homeTitle")}</h1>
      {/* Karşılama slider'ı — gorseller/sliders görselleri (bkz. hero-slider/slides.ts). */}
      <HeroSlider />
      {!showcaseActive && (
        <Suspense fallback={null}>
          <ShowcaseSections countryCode={countryCode} />
        </Suspense>
      )}
      <StoreTemplate
        sortBy={sortBy}
        page={page}
        minPrice={minPrice}
        maxPrice={maxPrice}
        categoryId={categoryId}
        inStock={inStock}
        showcase={showcase}
        countryCode={countryCode}
        showSeoContent={false}
        keepEmptyCategoryParam
      />
      <Suspense fallback={null}>
        <FeaturedSellers />
      </Suspense>
    </>
  )
}
