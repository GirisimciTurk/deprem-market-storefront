"use client"

import React, { useState, useRef } from "react"
import { submitReview, uploadReviewPhoto } from "@lib/data/reviews"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { fileToResizedPhoto, MAX_PHOTOS, type ReviewPhoto } from "./review-utils"

/**
 * Değerlendirme gönderme formu — tüm form state'ini kendi içinde tutar; başarılı
 * gönderimde yorum onay bekler, liste güncellenmez. Fotoğraflar yorum yazıldıktan
 * sonra yazarı olarak eklenir; bu yüzden yalnız giriş yapmış müşteri fotoğraf
 * ekleyebilir. `onClose` form panelini kapatır (Vazgeç / Tamam).
 */
export default function ReviewForm({
  productHandle,
  isLoggedIn,
  onClose,
}: {
  productHandle: string
  isLoggedIn: boolean
  onClose: () => void
}) {
  const [formName, setFormName] = useState("")
  const [formRating, setFormRating] = useState(5)
  const [formComment, setFormComment] = useState("")
  const [formPhotos, setFormPhotos] = useState<ReviewPhoto[]>([])
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [photoNotice, setPhotoNotice] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const incoming = Array.from(files).filter((f) => f.type.startsWith("image/"))
    // input'u sıfırla (aynı dosya tekrar seçilebilsin)
    e.target.value = ""
    for (const file of incoming) {
      if (file.size > 15 * 1024 * 1024) continue // 15MB üstü ham dosyayı atla
      try {
        const photo = await fileToResizedPhoto(file)
        setFormPhotos((prev) => (prev.length >= MAX_PHOTOS ? prev : [...prev, photo]))
      } catch {
        // bozuk görsel — atla
      }
    }
  }

  const removeFormImage = (indexToRemove: number) => {
    setFormPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim() || !formComment.trim() || submitting) return

    setSubmitting(true)
    setSubmitError(null)
    setPhotoNotice(null)

    // Önce yorum yazılır; fotoğraflar sonra, yorumun yazarı olarak eklenir.
    const res = await submitReview({
      product_handle: productHandle,
      rating: formRating,
      comment: formComment,
      name: formName.trim(),
    })

    if (!res.success) {
      setSubmitting(false)
      setSubmitError(
        res.error || "Değerlendirmeniz gönderilemedi. Lütfen daha sonra tekrar deneyin."
      )
      return
    }

    if (formPhotos.length > 0) {
      if (!res.review_id) {
        setPhotoNotice("Oturumunuz kapandığı için fotoğraflar eklenemedi; yorumunuz fotoğrafsız gönderildi.")
      } else {
        let failed = 0
        let lastError: string | null = null
        // Sırayla: her istek tek fotoğraf taşır (sunucu eylemi gövde sınırı).
        for (const p of formPhotos) {
          const up = await uploadReviewPhoto(res.review_id, {
            filename: p.filename,
            mime_type: p.mime_type,
            data: p.data,
          })
          if (up.error) {
            failed++
            lastError = up.error
          }
        }
        if (failed > 0) {
          setPhotoNotice(
            `${failed} fotoğraf eklenemedi${lastError ? `: ${lastError}` : "."} Fotoğrafları Hesabım › Yorumlarım sayfasından yeniden ekleyebilirsiniz.`
          )
        }
      }
    }
    setSubmitting(false)

    // Başarılı — yorum PENDING (admin onayı bekler), listeye eklemiyoruz; onay mesajı gösteriyoruz.
    setSubmitError(null)
    setFormName("")
    setFormRating(5)
    setFormComment("")
    setFormPhotos([])
    setSubmitSuccess(true)
  }

  return (
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
          {photoNotice && (
            <p className="text-xs text-amber-700 font-medium ml-8 mt-1">{photoNotice}</p>
          )}
          <button
            type="button"
            onClick={onClose}
            className="self-start ml-8 mt-2 text-xs font-bold text-green-700 underline hover:text-green-800 cursor-pointer"
          >
            Tamam
          </button>
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
              className="w-full bg-white border border-gray-250 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all font-medium text-slate-800"
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
                    aria-label={`${starVal} yıldız`}
                    aria-pressed={active}
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
              className="w-full bg-white border border-gray-250 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all resize-none font-medium text-slate-850"
            />
          </div>

          {/* Photo Upload Area — yalnız giriş yapmış müşteri (fotoğraf yorumun yazarına bağlanır) */}
          {!isLoggedIn ? (
            <p className="text-xs text-gray-500">
              Yorumunuza fotoğraf eklemek için{" "}
              <LocalizedClientLink href="/account" className="font-bold text-brand-600 hover:underline">
                giriş yapın
              </LocalizedClientLink>
              .
            </p>
          ) : (
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Fotoğraf Ekle</label>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Upload Box */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-dashed border-gray-300 hover:border-brand-500 bg-white rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group"
              >
                <span className="text-xl text-gray-400 group-hover:text-brand-500 group-hover:scale-110 transition-transform font-bold">+</span>
                <span className="text-[9px] text-gray-400 group-hover:text-brand-655 font-bold">Fotoğraf</span>
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
              {formPhotos.map((photo, idx) => (
                <div key={idx} className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 group">
                  <img src={photo.preview} alt="Önizleme" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeFormImage(idx)}
                    className="absolute -top-1 -right-1 bg-brand-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black shadow-md cursor-pointer hover:bg-brand-700"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
          )}

          {submitError && (
            <p className="text-sm font-semibold text-brand-600">
              {submitError}
            </p>
          )}

          <div className="flex justify-end gap-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-white border border-gray-250 text-gray-700 hover:bg-gray-50 font-bold py-2 px-4 rounded-lg text-sm transition-colors cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-brand-650 hover:bg-brand-700 text-white font-extrabold py-2 px-6 rounded-lg text-sm transition-colors shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (formPhotos.length > 0 && isLoggedIn ? "Gönderiliyor, fotoğraflar yükleniyor..." : "Gönderiliyor...") : "Gönder"}
            </button>
          </div>
        </div>
      )}
    </form>
  )
}
