"use client"

import React, { useState, useEffect, useMemo } from "react"
import {
  getSellerReviews,
  submitSellerReview,
  type StoreSellerReview,
} from "@lib/data/seller-reviews"

type SellerReviewsProps = {
  sellerHandle: string
  initialName?: string
}

export default function SellerReviews({
  sellerHandle,
  initialName,
}: SellerReviewsProps) {
  const [reviews, setReviews] = useState<StoreSellerReview[]>([])
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [formName, setFormName] = useState(initialName ?? "")
  const [formRating, setFormRating] = useState(5)
  const [formComment, setFormComment] = useState("")
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    ;(async () => {
      const res = await getSellerReviews(sellerHandle)
      if (!active) return
      setReviews(res.reviews)
    })()
    return () => {
      active = false
    }
  }, [sellerHandle])

  const stats = useMemo(() => {
    if (reviews.length === 0)
      return { average: 0, distribution: [0, 0, 0, 0, 0], total: 0 }

    const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0)
    const average = Math.round((sum / reviews.length) * 10) / 10

    const distribution = [0, 0, 0, 0, 0]
    reviews.forEach((r) => {
      const starIndex = Math.min(Math.max(r.rating - 1, 0), 4)
      distribution[starIndex] += 1
    })

    return {
      average,
      distribution: distribution.reverse(),
      total: reviews.length,
    }
  }, [reviews])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim() || !formComment.trim() || submitting) return

    setSubmitting(true)
    const res = await submitSellerReview({
      seller_handle: sellerHandle,
      rating: formRating,
      comment: formComment,
      name: formName.trim(),
    })
    setSubmitting(false)

    if (!res.success) {
      setSubmitError(
        "Değerlendirmeniz gönderilemedi. Lütfen daha sonra tekrar deneyin."
      )
      return
    }

    setSubmitError(null)
    setFormName(initialName ?? "")
    setFormRating(5)
    setFormComment("")
    setSubmitSuccess(true)
    setTimeout(() => {
      setSubmitSuccess(false)
      setShowForm(false)
    }, 4000)
  }

  return (
    <div className="bg-white border border-gray-150 rounded-2xl p-6 sm:p-8 mt-12 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-6 mb-8 gap-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-x-2">
            <span>💬</span> Satıcı Değerlendirmeleri
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Bu satıcıdan alışveriş yapan müşterilerin görüşleri.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-orange-650 hover:bg-orange-700 text-white font-bold py-2.5 px-6 rounded-lg text-sm transition-all duration-200 shadow-sm cursor-pointer hover:-translate-y-0.5"
          >
            Satıcıyı Değerlendir
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Rating Summary (Left Column) */}
        <div className="lg:col-span-4 bg-gray-50 p-6 rounded-2xl flex flex-col items-center justify-center border border-gray-100">
          <div className="text-5xl font-extrabold text-gray-900 mb-2">
            {stats.total > 0 ? stats.average.toFixed(1) : "—"}
          </div>
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
          <span className="text-sm text-gray-500 font-semibold mb-6">
            {stats.total} Değerlendirme
          </span>

          <div className="w-full space-y-3">
            {stats.distribution.map((count, index) => {
              const stars = 5 - index
              const percentage =
                stats.total > 0 ? (count / stats.total) * 100 : 0
              return (
                <div
                  key={stars}
                  className="w-full flex items-center gap-x-2 text-xs font-semibold text-gray-600 p-1"
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
                </div>
              )
            })}
          </div>
        </div>

        {/* Review Form or Reviews List (Right Column) */}
        <div className="lg:col-span-8">
          {showForm ? (
            <form
              onSubmit={handleSubmit}
              className="bg-gray-50 p-6 rounded-2xl border border-gray-100"
            >
              <h3 className="font-bold text-gray-900 mb-4 text-base">
                Değerlendirmeniz
              </h3>

              {submitSuccess ? (
                <div className="bg-green-50 border border-green-200 text-green-800 p-5 rounded-xl text-sm font-semibold flex flex-col gap-y-1 animate-in zoom-in duration-200">
                  <div className="flex items-center gap-x-2 text-base text-green-700">
                    <svg
                      className="w-6 h-6 text-green-600 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Değerlendirmeniz alındı, teşekkürler!
                  </div>
                  <p className="text-xs text-green-600 font-medium ml-8 mt-1">
                    Değerlendirmeniz alındı, onaylandıktan sonra
                    yayınlanacaktır.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Adınız Soyadınız
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Örn: Mehmet Can"
                      className="w-full bg-white border border-gray-250 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all font-medium text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Puanınız
                    </label>
                    <div className="flex items-center gap-x-1">
                      {Array.from({ length: 5 }).map((_, i) => {
                        const starVal = i + 1
                        const active = starVal <= formRating
                        return (
                          <button
                            type="button"
                            key={i}
                            onClick={() => setFormRating(starVal)}
                            aria-label={`${starVal} yıldız`}
                            aria-pressed={active}
                            className="text-2xl focus:outline-none hover:scale-115 transition-transform cursor-pointer"
                          >
                            <span
                              className={
                                active ? "text-yellow-400" : "text-gray-300"
                              }
                            >
                              ★
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Yorumunuz
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formComment}
                      onChange={(e) => setFormComment(e.target.value)}
                      placeholder="Satıcı hakkındaki görüşlerinizi yazın..."
                      className="w-full bg-white border border-gray-250 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none font-medium text-slate-850"
                    />
                  </div>

                  {submitError && (
                    <p className="text-sm font-semibold text-red-600">
                      {submitError}
                    </p>
                  )}

                  <div className="flex justify-end gap-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="bg-white border border-gray-250 text-gray-700 hover:bg-gray-50 font-bold py-2 px-4 rounded-lg text-sm transition-colors cursor-pointer"
                    >
                      Vazgeç
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-orange-650 hover:bg-orange-700 text-white font-extrabold py-2 px-6 rounded-lg text-sm transition-colors shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {submitting ? "Gönderiliyor..." : "Gönder"}
                    </button>
                  </div>
                </div>
              )}
            </form>
          ) : (
            <div className="space-y-6">
              {reviews.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100 text-gray-500 text-sm font-semibold">
                  Bu satıcı için henüz onaylanmış değerlendirme bulunmamaktadır.
                </div>
              ) : (
                reviews.map((r) => (
                  <div
                    key={r.id}
                    className="border-b border-gray-100 pb-6 last:border-0 last:pb-0"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-gray-800 text-sm sm:text-base">
                        {r.customer_name}
                      </span>
                      <span className="text-xs text-gray-400 font-semibold">
                        {new Date(r.created_at).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center text-yellow-400 gap-x-0.5 mb-2.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className="text-lg">
                          {i < r.rating ? "★" : "☆"}
                        </span>
                      ))}
                    </div>

                    <p className="text-sm text-gray-650 leading-relaxed font-medium">
                      {r.comment}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
