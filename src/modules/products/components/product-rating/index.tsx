"use client"

import { useEffect, useState } from "react"
import { listProductReviews } from "@lib/data/reviews"

/**
 * Ürün başlığı altındaki yıldız + değerlendirme özeti. CANLI (client-side) çekilir
 * — ürün sayfası ISR ile statik cache'lendiği için server-side render edilen puan
 * bayat kalıyordu (yeni onaylanan yorumlar görünmüyordu) ve sayfanın altındaki
 * "Müşteri Değerlendirmeleri" ile çelişiyordu. Bu bileşen alt bölümle AYNI
 * kaynaktan (listProductReviews → onaylı yorumlar) okuyarak tutarlılığı garanti eder.
 */
export default function ProductRating({ productHandle }: { productHandle: string }) {
  const [count, setCount] = useState<number | null>(null)
  const [average, setAverage] = useState(0)

  useEffect(() => {
    let active = true
    listProductReviews(productHandle)
      .then((reviews) => {
        if (!active) return
        const n = reviews.length
        setCount(n)
        setAverage(n > 0 ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / n : 0)
      })
      .catch(() => {
        if (active) setCount(0)
      })
    return () => {
      active = false
    }
  }, [productHandle])

  const loaded = count !== null
  const hasReviews = (count ?? 0) > 0
  const rounded = Math.round(average)

  return (
    <div className="flex items-center gap-x-2">
      <div className={`flex items-center ${hasReviews ? "text-yellow-400" : "text-gray-300"}`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            className={`w-5 h-5 ${hasReviews && i < rounded ? "fill-current" : "text-gray-300"}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="text-sm text-gray-500 font-medium">
        {!loaded
          ? " "
          : hasReviews
          ? `${average.toFixed(1)} · ${count} değerlendirme`
          : "Henüz değerlendirilmemiş"}
      </span>
    </div>
  )
}
