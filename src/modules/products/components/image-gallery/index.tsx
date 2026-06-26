"use client"

import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import React, { useState, useMemo } from "react"

import { toReachableImageUrl } from "@lib/util/image-url"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
  productHandle?: string
}

// Curated high-resolution Unsplash images for earthquake prep products
const mockImagesMap: Record<string, string[]> = {
  "profesyonel-deprem-cantasi": [
    "https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1608889175123-8ec330b86f84?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1532187863486-abf9d39d66e8?auto=format&fit=crop&q=80&w=800",
  ],
  "mini-deprem-cantasi": [
    "https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1607619056574-7b8d304a3b24?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&q=80&w=800",
  ],
  "sarj-edilebilir-fener": [
    "https://images.unsplash.com/photo-1558244661-d248897f7bc4?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1628143004381-c30983d5bc61?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&q=80&w=800",
  ],
  "ilk-yardim-kiti": [
    "https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1607619056574-7b8d304a3b24?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1628771065518-0d82f1938462?auto=format&fit=crop&q=80&w=800",
  ],
}

const ImageGallery = ({ images, productHandle }: ImageGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0)

  // Construct a list of images (DB images + mock images if necessary)
  const productImages = useMemo(() => {
    if (productHandle && mockImagesMap[productHandle]) {
      return mockImagesMap[productHandle].map((url, index) => ({
        id: `mock-${productHandle}-${index}`,
        url,
      }))
    }
    
    if (images && images.length > 0) {
      // r2.dev görsel URL'lerini TR'den erişilebilen /r2/ proxy'sine çevir.
      return images.map((im) => ({
        ...im,
        url: toReachableImageUrl(im.url) ?? im.url,
      }))
    }

    // Default emergency backpack fallback
    return [
      {
        id: "fallback-default",
        url: "https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&q=80&w=800",
      },
    ]
  }, [images, productHandle])

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1))
  }

  const activeImage = productImages[activeIndex]

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full px-4 small:px-16 relative">
      {/* Thumbnails Sidebar - Ordered first on mobile (as horizontal row) and on left on desktop */}
      <div className="flex flex-row md:flex-col gap-3 order-2 md:order-1 overflow-x-auto md:overflow-y-auto max-h-[500px] py-1 md:py-0 justify-center md:justify-start scrollbar-none">
        {productImages.map((image, index) => {
          const isActive = index === activeIndex
          return (
            <button
              key={image.id}
              onClick={() => setActiveIndex(index)}
              onMouseEnter={() => setActiveIndex(index)}
              className={`relative aspect-[29/34] w-16 h-20 md:w-20 md:h-24 rounded-lg overflow-hidden flex-shrink-0 bg-ui-bg-subtle transition-all duration-200 outline-none ${
                isActive
                  ? "ring-2 ring-orange-500 ring-offset-2 scale-95 opacity-100 shadow-md"
                  : "opacity-60 hover:opacity-100 border border-gray-200"
              }`}
            >
              {!!image.url && (
                <Image
                  src={image.url}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  sizes="100px"
                  className="object-cover"
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Main Image Display */}
      <div className="flex-1 order-1 md:order-2 relative group aspect-[29/34] w-full overflow-hidden bg-ui-bg-subtle rounded-2xl shadow-lg border border-gray-100">
        {activeImage?.url && (
          <Image
            src={activeImage.url}
            priority
            alt={`Selected product view ${activeIndex + 1}`}
            fill
            sizes="(max-width: 576px) 100vw, 800px"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        )}

        {/* Carousel Navigation Arrows */}
        {productImages.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-white/70 backdrop-blur-md border border-white/20 text-gray-800 shadow-md hover:bg-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
              aria-label="Önceki görsel"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-white/70 backdrop-blur-md border border-white/20 text-gray-800 shadow-md hover:bg-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
              aria-label="Sonraki görsel"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          </>
        )}

        {/* Active Item Index Counter */}
        {productImages.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold tracking-wider shadow">
            {activeIndex + 1} / {productImages.length}
          </div>
        )}
      </div>
    </div>
  )
}

export default ImageGallery
