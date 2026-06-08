"use client"

import React, { useState, useEffect } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

interface UserReview {
  id: string
  productTitle: string
  productImage: string
  rating: number
  comment: string
  status: "approved" | "pending"
  date: string
}

const defaultReviews: UserReview[] = [
  {
    id: "rev_1",
    productTitle: "EKYP Profesyonel İlkyardım Seti",
    productImage: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&q=80&w=400",
    rating: 5,
    comment: "İlk yardım setinde her şey eksiksiz düşünülmüş. Malzeme kalitesi harika, kargo hızı da gayet iyiydi. Teşekkürler!",
    status: "approved",
    date: "05.06.2026"
  },
  {
    id: "rev_2",
    productTitle: "EKYP Deprem & Afet Çantası (Standart)",
    productImage: "https://images.unsplash.com/photo-1583198432857-e6f966144fe9?auto=format&fit=crop&q=80&w=400",
    rating: 4,
    comment: "Çantanın içeriği çok zengin, düdük ve fener gayet güçlü çalışıyor. Toz maskesi sayısı biraz daha fazla olabilirdi ama genel olarak çok başarılı.",
    status: "pending",
    date: "05.06.2026"
  }
]

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<UserReview[]>([])

  useEffect(() => {
    const saved = localStorage.getItem("deprem_market_user_reviews")
    if (saved) {
      try {
        setReviews(JSON.parse(saved))
      } catch {
        setReviews(defaultReviews)
      }
    } else {
      localStorage.setItem("deprem_market_user_reviews", JSON.stringify(defaultReviews))
      setReviews(defaultReviews)
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-extrabold text-ui-fg-base flex items-center gap-2">
          ⭐ Yorumlarım
        </h1>
        <p className="text-xs text-ui-fg-muted mt-1">
          Satın aldığınız ürünler hakkında yaptığınız değerlendirmeler ve onay durumları.
        </p>
      </div>

      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div 
              key={review.id} 
              className="border border-ui-border-base bg-ui-bg-subtle rounded-2xl p-5 hover:shadow-sm transition-shadow space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 border-ui-border-base">
                {/* Product Name & Image */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-ui-bg-base border flex-shrink-0">
                    <img 
                      src={review.productImage} 
                      alt={review.productTitle} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-ui-fg-base text-sm">
                      {review.productTitle}
                    </h3>
                    <span className="text-3xs text-ui-fg-muted block mt-0.5">{review.date}</span>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex items-center gap-2">
                  <span className={`text-2xs font-extrabold px-3 py-1 rounded-full ${
                    review.status === "approved" 
                      ? "bg-green-100 text-green-700 border border-green-200" 
                      : "bg-amber-100 text-amber-700 border border-amber-200"
                  }`}>
                    {review.status === "approved" ? "Yayında ✓" : "Onay Bekliyor ⏳"}
                  </span>
                </div>
              </div>

              {/* Review Comment Content */}
              <div className="space-y-2">
                {/* Star rating */}
                <div className="flex gap-0.5 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="text-sm">
                      {i < review.rating ? "★" : "☆"}
                    </span>
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-ui-fg-base italic leading-relaxed bg-ui-bg-base/50 p-3.5 rounded-xl border border-ui-border-base">
                  &ldquo;{review.comment}&rdquo;
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-ui-bg-subtle rounded-2xl border border-ui-border-base border-dashed">
          <span className="text-5xl mb-4 block">💬</span>
          <h3 className="font-bold text-ui-fg-base text-sm sm:text-base mb-1">
            Henüz yorumunuz bulunmuyor
          </h3>
          <p className="text-2xs sm:text-xs text-ui-fg-muted max-w-sm mx-auto mb-6">
            Satın aldığınız deprem ve afet çantaları hakkında deneyimlerinizi paylaşarak diğer kullanıcılarımıza yardımcı olabilirsiniz.
          </p>
          <LocalizedClientLink
            href="/account/orders"
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm py-2 px-6 rounded-lg transition-colors inline-block"
          >
            Siparişlerime Git
          </LocalizedClientLink>
        </div>
      )}
    </div>
  )
}
