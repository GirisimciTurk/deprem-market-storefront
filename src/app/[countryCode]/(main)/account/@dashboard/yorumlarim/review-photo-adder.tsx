"use client"

import { useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { deleteReviewPhoto, uploadReviewPhoto } from "@lib/data/reviews"
import type { ReviewPhoto } from "@lib/util/review"
import { fileToResizedPhoto } from "@modules/products/components/product-reviews/review-utils"

/** Yorumun yazarı olarak fotoğraf ekler (yorum yazıldıktan sonra; en çok `room` adet daha). */
export default function ReviewPhotoAdder({ reviewId, room }: { reviewId: string; room: number }) {
  const input = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, room)
    e.target.value = ""
    if (!files.length) return
    setError(null)
    startTransition(async () => {
      let lastError: string | null = null
      for (const file of files) {
        try {
          const photo = await fileToResizedPhoto(file)
          const r = await uploadReviewPhoto(reviewId, {
            filename: photo.filename,
            mime_type: photo.mime_type,
            data: photo.data,
          })
          if (r.error) lastError = r.error
        } catch {
          lastError = "Görsel okunamadı."
        }
      }
      setError(lastError)
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={pending}
        className="self-start text-2xs sm:text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline disabled:opacity-60"
      >
        {pending ? "Fotoğraflar yükleniyor..." : "+ Fotoğraf ekle"}
      </button>
      <input ref={input} type="file" accept="image/*" multiple className="hidden" onChange={onPick} />
      {error && <p className="text-2xs text-brand-600">{error}</p>}
    </div>
  )
}

/**
 * Yorumun fotoğrafları (yayında olanlar ve onay bekleyenler); yazar her birini
 * tek tek silebilir.
 */
export function ReviewPhotoGallery({
  reviewId,
  photos,
  pendingPhotos,
}: {
  reviewId: string
  photos: ReviewPhoto[]
  pendingPhotos: ReviewPhoto[]
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [removing, setRemoving] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const all = [
    ...photos.map((p) => ({ ...p, waiting: false })),
    ...pendingPhotos.map((p) => ({ ...p, waiting: true })),
  ]
  if (!all.length) return null

  const onDelete = (photoId: string) => {
    if (!window.confirm("Bu fotoğraf yorumunuzdan kaldırılsın mı?")) return
    setError(null)
    setRemoving(photoId)
    startTransition(async () => {
      const r = await deleteReviewPhoto(reviewId, photoId)
      setError(r.error)
      setRemoving(null)
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-2 flex-wrap">
        {all.map((p) => (
          <div key={p.id} className="relative w-14 h-14 flex-shrink-0">
            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`block w-full h-full rounded-lg overflow-hidden border border-ui-border-base ${
                p.waiting ? "opacity-60" : ""
              }`}
              title={p.waiting ? "Onay bekliyor" : undefined}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt="Yorum fotoğrafı" loading="lazy" className="w-full h-full object-cover" />
            </a>
            {p.waiting && (
              <span className="absolute bottom-0 inset-x-0 text-[9px] leading-3 text-center bg-amber-100 text-amber-700 rounded-b-lg">
                Onayda
              </span>
            )}
            <button
              type="button"
              onClick={() => onDelete(p.id)}
              disabled={pending}
              aria-label="Fotoğrafı sil"
              title="Fotoğrafı sil"
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white border border-ui-border-base text-ui-fg-muted hover:text-brand-600 text-xs leading-none flex items-center justify-center shadow-sm disabled:opacity-60"
            >
              {removing === p.id ? "…" : "×"}
            </button>
          </div>
        ))}
      </div>
      {error && <p className="text-2xs text-brand-600">{error}</p>}
    </div>
  )
}
