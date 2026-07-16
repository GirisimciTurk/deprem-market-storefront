"use client"

import { useState, useEffect, useMemo } from "react"
import { listProductReviews } from "@lib/data/reviews"
import { type Review } from "./review-utils"
import RatingStats from "./rating-stats"
import ReviewsList from "./reviews-list"
import ReviewForm from "./review-form"

type ProductReviewsProps = {
  productHandle: string
  isLoggedIn: boolean
}

export default function ProductReviews({ productHandle, isLoggedIn: _isLoggedIn }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [showForm, setShowForm] = useState(false)
  const [filterRating, setFilterRating] = useState<number | null>(null)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)

  // Backend'den YALNIZ onaylı (gerçek) yorumları yükle. Yeni müşteri yorumları
  // ancak admin "Yayınla" dedikten sonra burada görünür. (Örnek/mock yorumlar kaldırıldı.)
  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const apiReviews = await listProductReviews(productHandle)
        if (!active) return
        const mapped: Review[] = apiReviews.map((r) => ({
          id: r.id,
          name: r.customer_name,
          rating: r.rating,
          comment: r.comment,
          date: new Date(r.created_at).toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
          verified: !!r.verified_purchase,
          approved: true,
          images: r.images ?? undefined,
        }))
        setReviews(mapped)
      } catch (e) {
        console.error(e)
        if (active) setReviews([])
      }
    })()
    return () => {
      active = false
    }
  }, [productHandle])

  const approvedReviews = useMemo(() => {
    return reviews.filter((r) => r.approved)
  }, [reviews])

  // Get all photos from approved reviews
  const allReviewPhotos = useMemo(() => {
    const photos: { url: string; reviewId: string; reviewer: string }[] = []
    approvedReviews.forEach((r) => {
      r.images?.forEach((img) => {
        photos.push({ url: img, reviewId: r.id, reviewer: r.name })
      })
    })
    return photos
  }, [approvedReviews])

  const stats = useMemo(() => {
    if (approvedReviews.length === 0) return { average: 0, distribution: [0, 0, 0, 0, 0], total: 0 }

    const sum = approvedReviews.reduce((acc, curr) => acc + curr.rating, 0)
    const average = Math.round((sum / approvedReviews.length) * 10) / 10

    const distribution = [0, 0, 0, 0, 0]
    approvedReviews.forEach((r) => {
      const starIndex = Math.min(Math.max(r.rating - 1, 0), 4)
      distribution[starIndex] += 1
    })

    return {
      average,
      distribution: distribution.reverse(),
      total: approvedReviews.length
    }
  }, [approvedReviews])

  const filteredReviews = useMemo(() => {
    if (filterRating === null) return approvedReviews
    return approvedReviews.filter((r) => r.rating === filterRating)
  }, [approvedReviews, filterRating])

  return (
    <div className="bg-white border border-gray-150 rounded-2xl p-6 sm:p-8 mt-12 shadow-sm">
      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setLightboxImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Değerlendirme fotoğrafı"
        >
          <div className="relative max-w-3xl max-h-[90vh] bg-white rounded-xl overflow-hidden shadow-2xl flex flex-col">
            <button
              className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white rounded-full w-9 h-9 flex items-center justify-center font-bold text-lg cursor-pointer z-10 transition-colors"
              onClick={() => setLightboxImage(null)}
              aria-label="Kapat"
            >
              ✕
            </button>
            <img
              src={lightboxImage}
              alt="Müşteri Değerlendirme Fotoğrafı"
              className="object-contain max-h-[80vh] w-full"
            />
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-6 mb-8 gap-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-x-2">
            <span>💬</span> Müşteri Değerlendirmeleri
          </h2>
          <p className="text-sm text-gray-500 mt-1">Ürünü satın almış müşterilerimizin görsel değerlendirmeleri ve görüşleri.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-brand-650 hover:bg-brand-700 text-white font-bold py-2.5 px-6 rounded-lg text-sm transition-all duration-200 shadow-sm cursor-pointer hover:-translate-y-0.5"
          >
            Değerlendir & Fotoğraf Ekle
          </button>
        )}
      </div>

      {/* Photo Gallery Bar (Trendyol Style) */}
      {allReviewPhotos.length > 0 && !showForm && (
        <div className="mb-8 border border-gray-100 rounded-xl p-4 bg-slate-50/50">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-x-1">
            <span>📸</span> Fotoğraflı Değerlendirmeler ({allReviewPhotos.length})
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
            {allReviewPhotos.map((photo, idx) => (
              <div
                key={`${photo.reviewId}-${idx}`}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-gray-200 cursor-pointer flex-shrink-0 hover:border-orange-500 hover:scale-105 transition-all duration-200 shadow-2xs"
                onClick={() => setLightboxImage(photo.url)}
              >
                <img
                  src={photo.url}
                  alt={`Review by ${photo.reviewer}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Rating Summary (Left Column) */}
        <RatingStats stats={stats} filterRating={filterRating} onFilterChange={setFilterRating} />

        {/* Review Form or Reviews List (Right Column) */}
        <div className="lg:col-span-8">
          {showForm ? (
            <ReviewForm productHandle={productHandle} onClose={() => setShowForm(false)} />
          ) : (
            <ReviewsList
              reviews={filteredReviews}
              filterRating={filterRating}
              onImageClick={setLightboxImage}
            />
          )}
        </div>
      </div>
    </div>
  )
}
