import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

import ProductActionsWrapper from "./product-actions-wrapper"
import ProductShowcase from "../components/product-showcase"
import ProductReviews from "@modules/products/components/product-reviews"
import { retrieveCustomer } from "@lib/data/customer"
import { listProducts } from "@lib/data/products"
import RecentlyViewed from "@modules/products/components/recently-viewed"

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

  return (
    <>
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

      {/* User Behavior/Personalization: Recently Viewed Section */}
      <RecentlyViewed
        allProducts={allProducts}
        currentHandle={product.handle}
        region={region}
      />

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
