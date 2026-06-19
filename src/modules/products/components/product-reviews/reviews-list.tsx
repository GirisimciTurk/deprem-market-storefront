"use client"

import { type Review } from "./review-utils"

/** Sağ sütun (form kapalıyken): filtrelenmiş onaylı yorumların listesi. */
export default function ReviewsList({
  reviews,
  filterRating,
  onImageClick,
}: {
  reviews: Review[]
  filterRating: number | null
  onImageClick: (url: string) => void
}) {
  return (
    <div className="space-y-6">
      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100 text-gray-500 text-sm font-semibold">
          {filterRating !== null
            ? "Bu puan derecesinde henüz onaylanmış yorum bulunmamaktadır."
            : "Bu ürün için henüz değerlendirme yapılmamış. İlk değerlendirmeyi siz ekleyin!"}
        </div>
      ) : (
        reviews.map((r) => (
          <div key={r.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-x-2">
                <span className="font-bold text-gray-800 text-sm sm:text-base">{r.name}</span>
                {r.verified && (
                  <span className="flex items-center gap-x-1 bg-green-50 border border-green-100 text-green-600 text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-bold select-none">
                    <svg className="w-3 h-3 text-green-500 fill-current" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    Satın Almış Müşteri
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-400 font-semibold">{r.date}</span>
            </div>

            <div className="flex items-center text-yellow-400 gap-x-0.5 mb-2.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="text-lg">
                  {i < r.rating ? "★" : "☆"}
                </span>
              ))}
            </div>

            <p className="text-sm text-gray-650 leading-relaxed font-medium mb-3">
              {r.comment}
            </p>

            {/* Review Attached Images */}
            {r.images && r.images.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {r.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border border-gray-250 cursor-pointer hover:border-orange-500 transition-all duration-200 flex-shrink-0"
                    onClick={() => onImageClick(img)}
                  >
                    <img src={img} alt="Kullanıcı yüklemesi" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
