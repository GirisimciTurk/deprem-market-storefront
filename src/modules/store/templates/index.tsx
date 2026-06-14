import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { listCategories } from "@lib/data/categories"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = async ({
  sortBy,
  page,
  minPrice,
  maxPrice,
  categoryId,
  inStock,
  countryCode,
}: {
  sortBy?: SortOptions
  page?: string
  minPrice?: string
  maxPrice?: string
  categoryId?: string
  inStock?: string
  countryCode: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  const categories = await listCategories().catch(() => [])

  return (
    <>
      <div
        className="flex flex-col small:flex-row small:items-start py-6 content-container gap-x-8"
        data-testid="category-container"
      >
        <RefinementList
          sortBy={sort}
          categoryId={categoryId}
          minPrice={minPrice}
          maxPrice={maxPrice}
          inStock={inStock}
          categories={categories}
        />
        <div className="w-full">
          <div className="mb-6">
            <h1
              data-testid="store-page-title"
              className="text-2xl font-bold text-slate-800"
            >
              Tüm Deprem ve Afet Hazırlık Ürünleri
            </h1>
            <p className="mt-2 text-sm text-slate-500 max-w-2xl leading-relaxed">
              Deprem çantalarından ilk yardım setlerine, aydınlatmadan ısınma ve
              acil durum gıdasına kadar afet hazırlığı için ihtiyacınız olan tüm
              ürünler tek sayfada.
            </p>
          </div>
          <Suspense fallback={<SkeletonProductGrid />}>
            <PaginatedProducts
              sortBy={sort}
              page={pageNumber}
              minPrice={minPrice}
              maxPrice={maxPrice}
              categoryId={categoryId}
              inStock={inStock}
              countryCode={countryCode}
            />
          </Suspense>
        </div>
      </div>

      <StoreSeoContent />
    </>
  )
}

/**
 * Mağaza sayfası SEO içerik bloğu — ürün ızgarasının altında, arama motorlarına
 * sayfanın bağlamını anlatan açıklayıcı metin (250+ kelime, çok paragraf, uzun
 * cümleler). İçerik gerçek ve kullanıcıya da faydalı; doldurma/anahtar yığını değil.
 */
const StoreSeoContent = () => {
  return (
    <section className="content-container pb-16 pt-4">
      <div className="border-t border-ui-border-base pt-10 max-w-4xl">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          Afet ve Acil Durum Hazırlığı için Doğru Ürünler
        </h2>
        <div className="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed">
          <p>
            Deprem ülkesi olan Türkiye'de hazırlıklı olmak, en kritik anlarda
            hayat kurtarır. Bu sayfada, evde, iş yerinde, okulda ve aracınızda
            bulundurmanız gereken afet hazırlık ürünlerini bir arada
            bulabilirsiniz. Profesyonel deprem çantaları, sertifikalı ilk yardım
            setleri, şarj edilebilir el fenerleri ve uzun ömürlü acil durum
            gıdaları gibi temel kategorilerin tamamı, ihtiyaçlarınıza göre
            kolayca filtrelenebilir şekilde listelenir.
          </p>
          <p>
            Hazır bir <strong>deprem çantası</strong>, afet sonrasının ilk 72
            saatinde su, gıda, ilk yardım malzemesi, aydınlatma ve iletişim
            ihtiyaçlarınızı tek bir yerde toplar. İlk yardım setlerimiz T.C.
            Sağlık Bakanlığı onaylı malzemelerden oluşur; el fenerleri, düdük,
            radyo ve güç bankası gibi ekipmanlar ise elektrik ve iletişim
            kesintilerinde sizi güçlü tutar. Isınma ve barınma ürünleri, soğuk
            koşullarda vücut ısınızı korumanıza yardımcı olur.
          </p>
          <p>
            Aile büyüklüğünüze ve yaşam alanınıza göre farklı boyut ve içeriklerde
            setler sunuyoruz; bireysel kullanım için kompakt çantalardan, kalabalık
            haneler ve kurumlar için kapsamlı setlere kadar geniş bir yelpaze
            mevcuttur. Soldaki filtreleri kullanarak kategoriye, fiyat aralığına
            ve stok durumuna göre arama yapabilir, size en uygun ürünleri hızlıca
            bulabilirsiniz. Tüm ürünler dayanıklı malzemelerden üretilir ve
            güvenli ödeme altyapısıyla aynı gün kargo seçeneğiyle gönderilir.
          </p>
          <p>
            Afet hazırlığı tek seferlik bir alışveriş değil, sürekli güncellenen
            bir sorumluluktur. Çantanızdaki gıda, su ve ilaçların son kullanma
            tarihlerini düzenli olarak kontrol etmenizi, pillerin şarj durumunu
            gözden geçirmenizi öneririz. Hazırlığınızı bugün tamamlayın; sevdiklerinizin
            güvenliği için doğru ürünleri Deprem Market güvencesiyle tedarik edin.
          </p>
        </div>
      </div>
    </section>
  )
}

export default StoreTemplate
