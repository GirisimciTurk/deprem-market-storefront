import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import ProductCertifications from "@modules/products/components/product-certifications"
import Breadcrumb from "@modules/common/components/breadcrumb"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

import ProductActionsWrapper from "./product-actions-wrapper"
import ProductShowcase from "../components/product-showcase"
import ProductReviews from "@modules/products/components/product-reviews"
import ProductQuestions from "@modules/products/components/product-questions"
import { retrieveCustomer } from "@lib/data/customer"
import { listProducts } from "@lib/data/products"
import RecentlyViewed from "@modules/products/components/recently-viewed"
import TrackView from "@modules/products/components/track-view"
import BoughtTogether from "@modules/products/components/bought-together"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

const ProductTemplate = async ({
  product,
  region,
  countryCode,
  images,
}: ProductTemplateProps) => {
  if (!product || !product.id) {
    return notFound()
  }

  const customer = await retrieveCustomer()
  const isLoggedIn = !!customer

  const {
    response: { products: allProducts },
  } = await listProducts({
    countryCode,
  })

  // Görünür kırıntı navigasyonu. Varsa ürünün ilk kategorisi araya eklenir.
  const primaryCategory = (product as any).categories?.[0] as
    | { name?: string; handle?: string }
    | undefined
  const breadcrumbItems = [
    { label: "Ana Sayfa", href: "/" },
    { label: "Mağaza", href: "/store" },
    ...(primaryCategory?.handle && primaryCategory?.name
      ? [{ label: primaryCategory.name, href: `/categories/${primaryCategory.handle}` }]
      : []),
    { label: product.title || "Ürün" },
  ]

  return (
    <>
      {/* Davranış izleme: ürün görüntüleme olayı (görsel çıktı yok) */}
      <TrackView productId={product.id} handle={product.handle} />
      <div className="content-container pt-4 pb-1">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      <div
        className="content-container flex flex-col md:flex-row md:items-start py-6 gap-y-8 md:gap-x-12 lg:gap-x-16 relative"
        data-testid="product-container"
      >
        {/* Left Column: Interactive Product Image Gallery (60% width on large screens) */}
        <div className="w-full md:w-3/5 block relative">
          <ImageGallery images={images} productHandle={product.handle} />
        </div>

        {/* Right Column: Consolidated Purchase & Detail Sidebar (40% width on large screens) */}
        <div className="w-full md:w-2/5 flex flex-col gap-y-6 md:sticky md:top-24 py-4 md:py-0">
          <ProductInfo product={product} />
          
          <Suspense
            fallback={
              <ProductActions
                disabled={true}
                product={product}
                region={region}
              />
            }
          >
            <ProductActionsWrapper id={product.id} region={region} />
          </Suspense>

          {/* Satın alma anında güven: yapılandırılmış sertifikalar (varsa) */}
          <ProductCertifications product={product} />

          <ProductOnboardingCta />
        </div>
      </div>
      
      {/* Premium Feature Showcase Section */}
      <ProductShowcase product={product} images={images} />

      {/* Full-width Product Information Tabs (Ürün Bilgileri, Kargo & İade) */}
      <div className="content-container my-8">
        <ProductTabs product={product} />
      </div>

      {/* Interactive Customer Reviews Section */}
      <div className="content-container my-12">
        <ProductReviews productHandle={product.handle} isLoggedIn={isLoggedIn} />
      </div>

      {/* Soru & Cevap */}
      <div className="content-container my-12">
        <ProductQuestions productHandle={product.handle} isLoggedIn={isLoggedIn} />
      </div>

      {/* User Behavior/Personalization: Recently Viewed Section */}
      <RecentlyViewed
        allProducts={allProducts}
        currentHandle={product.handle}
        region={region}
      />

      {/* Ticaret önerisi: gerçek sipariş geçmişinden "birlikte alınanlar" */}
      <div className="content-container my-16 small:my-24" data-testid="bought-together-container">
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <BoughtTogether product={product} countryCode={countryCode} />
        </Suspense>
      </div>

      <div
        className="content-container my-16 small:my-32"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </>
  )
}

export default ProductTemplate
