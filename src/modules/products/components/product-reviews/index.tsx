"use client"

import React, { useState, useEffect, useMemo, useRef } from "react"
import { listProductReviews, submitReview } from "@lib/data/reviews"

export type Review = {
  id: string
  name: string
  rating: number
  comment: string
  date: string
  verified: boolean
  approved: boolean
  images?: string[]
}

type ProductReviewsProps = {
  productHandle: string
  isLoggedIn: boolean
}

// Initial reviews in Turkish with real-looking customer product photos
const initialReviewsMap: Record<string, Review[]> = {
  "profesyonel-deprem-cantasi-4-kisilik": [
    {
      id: "rev-pro-1",
      name: "Mehmet Y.",
      rating: 5,
      comment: "Çantanın içeriği inanılmaz zengin. İçinden çıkan fener ve düdük çok kaliteli. Deprem hazırlığı için kesinlikle tavsiye ederim.",
      date: "12 May 2026",
      verified: true,
      approved: true,
      images: [
        "https://images.unsplash.com/photo-1599740831464-5eec14d0263f?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600"
      ]
    },
    {
      id: "rev-pro-2",
      name: "Ayşe K.",
      rating: 5,
      comment: "Her evde mutlaka bulunması gereken bir set. Paketleme çok özenliydi, kargo hızlı ulaştı. Teşekkürler.",
      date: "25 May 2026",
      verified: true,
      approved: true,
      images: [
        "https://images.unsplash.com/photo-1583198432857-e6f966144fe9?auto=format&fit=crop&q=80&w=600"
      ]
    },
    {
      id: "rev-pro-3",
      name: "Caner B.",
      rating: 4,
      comment: "Çanta kumaşı çok sağlam. İçindekiler kaliteli ama belki ilk yardım malzemeleri biraz daha fazla olabilirdi.",
      date: "29 May 2026",
      verified: true,
      approved: true,
    },
  ],
  "bireysel-deprem-cantasi": [
    {
      id: "rev-mini-1",
      name: "Esra A.",
      rating: 5,
      comment: "Arabamın bagajı için aldım. Kompakt olması ve su geçirmez kılıfı çok güzel. İçindekiler temel ihtiyaçları fazlasıyla karşılıyor.",
      date: "10 May 2026",
      verified: true,
      approved: true,
      images: [
        "https://images.unsplash.com/photo-1583198432857-e6f966144fe9?auto=format&fit=crop&q=80&w=600"
      ]
    },
    {
      id: "rev-mini-2",
      name: "Burak H.",
      rating: 5,
      comment: "Bireysel kullanım için harika bir çanta. İçine kendim de birkaç ilaç ekledim, çok kullanışlı.",
      date: "18 May 2026",
      verified: true,
      approved: true,
    },
  ],
  "gunes-enerjili-fener-radyo": [
    {
      id: "rev-fen-1",
      name: "Ahmet T.",
      rating: 5,
      comment: "Güneş paneli çok iyi çalışıyor, telefonu hızlıca şarj ediyor. Işığı da çok kuvvetli. Çok memnun kaldım.",
      date: "8 May 2026",
      verified: true,
      approved: true,
      images: [
        "https://images.unsplash.com/photo-1517055729445-fa7d27394b48?auto=format&fit=crop&q=80&w=600"
      ]
    },
    {
      id: "rev-fen-2",
      name: "Elif S.",
      rating: 5,
      comment: "Dinamolu olması elektrik kesintilerinde hayat kurtarır. Malzeme kalitesi beklediğimden çok daha iyi.",
      date: "15 May 2026",
      verified: true,
      approved: true,
    },
  ],
  "kapsamli-ilk-yardim-cantasi-120": [
    {
      id: "rev-kit-1",
      name: "Zeynep D.",
      rating: 5,
      comment: "Kutusu çok sağlam ve kompakt. İçindeki makas, bandaj ve sargı bezleri kaliteli. Evde ve arabada bulundurmak şart.",
      date: "2 May 2026",
      verified: true,
      approved: true,
      images: [
        "https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&q=80&w=600"
      ]
    },
    {
      id: "rev-kit-2",
      name: "Murat K.",
      rating: 5,
      comment: "Malzeme kalitesi çok güzel, içeriği eksiksiz. Hızlı kargo için satıcıya teşekkür ederim.",
      date: "22 May 2026",
      verified: true,
      approved: true,
    },
  ],
}

export default function ProductReviews({ productHandle, isLoggedIn: _isLoggedIn }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [showForm, setShowForm] = useState(false)
  const [filterRating, setFilterRating] = useState<number | null>(null)
  
  // Form state
  const [formName, setFormName] = useState("")
  const [formRating, setFormRating] = useState(5)
  const [formComment, setFormComment] = useState("")
  const [formImages, setFormImages] = useState<string[]>([])
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Lightbox Modal state
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load APPROVED reviews from the backend, merged with the curated demo seed
  // reviews for this product. New customer reviews only appear here once an
  // admin approves ("Yayınla") them.
  useEffect(() => {
    let active = true
    const demo = initialReviewsMap[productHandle] || []
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
          verified: !!r.customer_id,
          approved: true,
          images: r.images ?? undefined,
        }))
        setReviews([...mapped, ...demo])
      } catch (e) {
        console.error(e)
        if (active) setReviews(demo)
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
    if (approvedReviews.length === 0) return { average: 5, distribution: [0, 0, 0, 0, 0], total: 0 }
    
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return
      
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setFormImages((prev) => [...prev, reader.result as string])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeFormImage = (indexToRemove: number) => {
    setFormImages((prev) => prev.filter((_, idx) => idx !== indexToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim() || !formComment.trim() || submitting) return

    setSubmitting(true)
    const res = await submitReview({
      product_handle: productHandle,
      rating: formRating,
      comment: formComment,
      name: formName.trim(),
      images: formImages.length > 0 ? formImages : undefined,
    })
    setSubmitting(false)

    if (!res.success) {
      setSubmitError(
        "Değerlendirmeniz gönderilemedi. Lütfen daha sonra tekrar deneyin."
      )
      return
    }

    // Submitted successfully — it is now PENDING admin approval, so we do NOT
    // add it to the visible list. Show a confirmation instead.
    setSubmitError(null)
    setFormName("")
    setFormRating(5)
    setFormComment("")
    setFormImages([])
    setSubmitSuccess(true)
    setTimeout(() => {
      setSubmitSuccess(false)
      setShowForm(false)
    }, 4000)
  }

  return (
    <div className="bg-white border border-gray-150 rounded-2xl p-6 sm:p-8 mt-12 shadow-sm">
      {/* Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] bg-white rounded-xl overflow-hidden shadow-2xl flex flex-col">
            <button 
              className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white rounded-full w-9 h-9 flex items-center justify-center font-bold text-lg cursor-pointer z-10 transition-colors"
              onClick={() => setLightboxImage(null)}
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
            className="bg-orange-650 hover:bg-orange-700 text-white font-bold py-2.5 px-6 rounded-lg text-sm transition-all duration-200 shadow-sm cursor-pointer hover:-translate-y-0.5"
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
                  onClick={() => setFilterRating(isSelected ? null : stars)}
                  className={`w-full flex items-center gap-x-2 text-xs font-semibold text-gray-600 hover:text-orange-600 transition-colors p-1 rounded-md cursor-pointer ${
                    isSelected ? "bg-orange-50 text-orange-650" : ""
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
              onClick={() => setFilterRating(null)}
              className="text-xs text-orange-600 hover:underline font-bold mt-4 cursor-pointer"
            >
              Filtreyi Temizle
            </button>
          )}
        </div>

        {/* Review Form or Reviews List (Right Column) */}
        <div className="lg:col-span-8">
          {showForm ? (
            <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 text-base">Değerlendirmeniz</h3>
              
              {submitSuccess ? (
                <div className="bg-green-50 border border-green-200 text-green-800 p-5 rounded-xl text-sm font-semibold flex flex-col gap-y-1 animate-in zoom-in duration-200">
                  <div className="flex items-center gap-x-2 text-base text-green-700">
                    <svg className="w-6 h-6 text-green-600 fill-current" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    Değerlendirmeniz alındı, teşekkürler!
                  </div>
                  <p className="text-xs text-green-600 font-medium ml-8 mt-1">
                    Yorumunuz onay için ekibimize iletildi. Onaylandıktan sonra ürün
                    sayfasında yayınlanacaktır.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Adınız Soyadınız</label>
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
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Puanınız</label>
                    <div className="flex items-center gap-x-1">
                      {Array.from({ length: 5 }).map((_, i) => {
                        const starVal = i + 1
                        const active = starVal <= formRating
                        return (
                          <button
                            type="button"
                            key={i}
                            onClick={() => setFormRating(starVal)}
                            className="text-2xl focus:outline-none hover:scale-115 transition-transform cursor-pointer"
                          >
                            <span className={active ? "text-yellow-400" : "text-gray-300"}>★</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Yorumunuz</label>
                    <textarea
                      required
                      rows={4}
                      value={formComment}
                      onChange={(e) => setFormComment(e.target.value)}
                      placeholder="Ürün hakkındaki görüşlerinizi yazın..."
                      className="w-full bg-white border border-gray-250 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none font-medium text-slate-850"
                    />
                  </div>

                  {/* Photo Upload Area */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Fotoğraf Ekle</label>
                    <div className="flex items-center gap-3 flex-wrap">
                      {/* Upload Box */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-dashed border-gray-300 hover:border-orange-500 bg-white rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group"
                      >
                        <span className="text-xl text-gray-400 group-hover:text-orange-500 group-hover:scale-110 transition-transform font-bold">+</span>
                        <span className="text-[9px] text-gray-400 group-hover:text-orange-655 font-bold">Fotoğraf</span>
                      </button>
                      <input 
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        multiple
                        className="hidden"
                      />

                      {/* Image Previews */}
                      {formImages.map((img, idx) => (
                        <div key={idx} className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 group">
                          <img src={img} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeFormImage(idx)}
                            className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black shadow-md cursor-pointer hover:bg-red-700"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
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
              {filteredReviews.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100 text-gray-500 text-sm font-semibold">
                  Bu puan derecesinde henüz onaylanmış yorum bulunmamaktadır.
                </div>
              ) : (
                filteredReviews.map((r) => (
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
                            onClick={() => setLightboxImage(img)}
                          >
                            <img src={img} alt="User upload" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
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
