"use client"

type Stats = { average: number; distribution: number[]; total: number }

/** Sol sütun: ortalama puan + yıldız dağılımı (puanlara tıklayınca filtreler). */
export default function RatingStats({
  stats,
  filterRating,
  onFilterChange,
}: {
  stats: Stats
  filterRating: number | null
  onFilterChange: (rating: number | null) => void
}) {
  return (
    <div className="lg:col-span-4 bg-gray-50 p-6 rounded-2xl flex flex-col items-center justify-center border border-gray-100">
      <div className="text-5xl font-extrabold text-gray-900 mb-2">{stats.average}</div>
      <div className="flex items-center text-yellow-400 gap-x-1 mb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            className={`w-6 h-6 ${
              i < Math.round(stats.average) ? "fill-current" : "text-gray-300"
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="text-sm text-gray-500 font-semibold mb-6">{stats.total} Değerlendirme</span>

      <div className="w-full space-y-3">
        {stats.distribution.map((count, index) => {
          const stars = 5 - index
          const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0
          const isSelected = filterRating === stars
          return (
            <button
              key={stars}
              onClick={() => onFilterChange(isSelected ? null : stars)}
              className={`w-full flex items-center gap-x-2 text-xs font-semibold text-gray-600 hover:text-orange-600 transition-colors p-1 rounded-md cursor-pointer ${
                isSelected ? "bg-orange-50 text-brand-650" : ""
              }`}
            >
              <span className="w-3 text-right">{stars}</span>
              <span>★</span>
              <div className="flex-1 h-2 bg-gray-250 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-right text-gray-400">{count}</span>
            </button>
          )
        })}
      </div>

      {filterRating !== null && (
        <button
          onClick={() => onFilterChange(null)}
          className="text-xs text-orange-600 hover:underline font-bold mt-4 cursor-pointer"
        >
          Filtreyi Temizle
        </button>
      )}
    </div>
  )
}
