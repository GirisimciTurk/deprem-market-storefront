"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Star, PenLine, Send } from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { writeExpertReview } from "@lib/data/expert-requests"

const inputCls =
  "w-full border border-ui-border-base rounded-lg px-3.5 py-2 bg-ui-bg-base text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"

const RATING_LABELS = ["", "Çok kötü", "Kötü", "Orta", "İyi", "Çok iyi"]
const BODY_MAX = 2000

/**
 * "Değerlendir" — oturum açmış ziyaretçi uzmana puan ve yorum bırakır. Satın
 * alma bağı yok; yazar bunun kendi deneyimi olduğunu beyan eder. Hesabın bu
 * uzmana platformda yaptırdığı bir işi seçerse yorum "Doğrulanmış iş" rozeti alır.
 */
export default function ExpertReviewForm({
  slug,
  expertName,
  signedIn,
  defaultName = "",
  jobs = [],
}: {
  slug: string
  expertName: string
  signedIn: boolean
  defaultName?: string
  /** Hesabın bu uzmana yaptırıp tamamlanan işleri. */
  jobs?: { id: string; title: string }[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [name, setName] = useState(defaultName)
  const [body, setBody] = useState("")
  const [jobId, setJobId] = useState(jobs.length === 1 ? jobs[0].id : "")
  const [declaration, setDeclaration] = useState(false)
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [error, setError] = useState("")
  const [needsLogin, setNeedsLogin] = useState(!signedIn)

  // LocalizedClientLink ülke kodunu kendisi ekler; pathname onu zaten içerir.
  const loginHref = `/account?redirect=${encodeURIComponent(`${pathname}#degerlendirmeler`)}`

  if (status === "success") {
    return (
      <div className="border border-green-200 bg-green-50 rounded-xl p-4 text-sm text-green-800">
        Teşekkürler! Değerlendirmeniz yayımlandı.
      </div>
    )
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 border border-ui-border-base bg-ui-bg-base hover:border-brand-400 text-ui-fg-base font-bold py-2 px-4 rounded-xl text-sm transition-colors"
      >
        <PenLine className="w-4 h-4" /> Değerlendirme yaz
      </button>
    )
  }

  if (needsLogin) {
    return (
      <div className="border border-ui-border-base rounded-xl bg-ui-bg-subtle p-4 text-sm text-ui-fg-subtle">
        {error || "Değerlendirme yazmak için giriş yapmanız gerekiyor."}{" "}
        <LocalizedClientLink href={loginHref} className="font-semibold text-brand-600 hover:underline">
          Giriş yap / Üye ol →
        </LocalizedClientLink>
      </div>
    )
  }

  const loading = status === "loading"
  const shown = hover || rating

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating < 1) {
      setError("Lütfen 1–5 arası bir puan seçin.")
      setStatus("error")
      return
    }
    if (!declaration) {
      setError("Lütfen değerlendirmenin kendi deneyiminiz olduğunu onaylayın.")
      setStatus("error")
      return
    }
    setStatus("loading")
    setError("")
    const res = await writeExpertReview(slug, {
      author_name: name.trim(),
      rating,
      body: body.trim(),
      declaration,
      job_id: jobId.trim() || undefined,
    })
    if (res.success) {
      setStatus("success")
      router.refresh()
      return
    }
    if (res.unauthorized) setNeedsLogin(true)
    setError(res.error || "Değerlendirme gönderilemedi.")
    setStatus("error")
  }

  return (
    <form
      onSubmit={submit}
      className="border border-ui-border-base rounded-xl bg-ui-bg-subtle p-4 sm:p-5 space-y-4"
    >
      <p className="text-sm text-ui-fg-subtle">
        <strong>{expertName}</strong> ile çalıştınız mı? Deneyiminizi paylaşın.
      </p>

      <fieldset>
        <legend className="text-xs font-semibold text-ui-fg-base mb-1.5">Puanınız *</legend>
        <div className="flex items-center gap-2">
          <div className="flex" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                type="button"
                disabled={loading}
                onClick={() => setRating(i)}
                onMouseEnter={() => setHover(i)}
                aria-label={`${i} yıldız`}
                aria-pressed={rating === i}
                className="p-0.5"
              >
                <Star
                  className={`w-7 h-7 transition-colors ${
                    i <= shown ? "fill-amber-400 text-amber-400" : "text-ui-border-base"
                  }`}
                />
              </button>
            ))}
          </div>
          <span className="text-sm text-ui-fg-muted min-w-[5rem]">{RATING_LABELS[shown]}</span>
        </div>
      </fieldset>

      <div>
        <label htmlFor="review-name" className="text-xs font-semibold text-ui-fg-base">
          Görünecek adınız *
        </label>
        <input
          id="review-name"
          type="text"
          required
          maxLength={60}
          disabled={loading}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="örn. Ayşe K."
          className={`${inputCls} mt-1`}
        />
        <p className="text-[0.7rem] text-ui-fg-muted mt-1">
          Adınızı kısaltarak da yazabilirsiniz; bu ad herkese açık görünür.
        </p>
      </div>

      <div>
        <label htmlFor="review-body" className="text-xs font-semibold text-ui-fg-base">
          Yorumunuz
        </label>
        <textarea
          id="review-body"
          rows={4}
          maxLength={BODY_MAX}
          disabled={loading}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Hangi hizmeti aldınız, süreç nasıl geçti, tavsiye eder misiniz?"
          className={`${inputCls} mt-1 resize-y`}
        />
        <p className="text-[0.7rem] text-ui-fg-muted text-right">
          {body.length}/{BODY_MAX}
        </p>
      </div>

      {jobs.length > 0 && (
        <div>
          <label htmlFor="review-job" className="text-xs font-semibold text-ui-fg-base">
            Bu uzmana yaptırdığınız iş
          </label>
          <select
            id="review-job"
            disabled={loading}
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            className={`${inputCls} mt-1`}
          >
            <option value="">Seçmeden devam et</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title} · #{j.id.slice(-6).toUpperCase()}
              </option>
            ))}
          </select>
          <p className="text-[0.7rem] text-ui-fg-muted mt-1">
            İşi seçerseniz yorumunuz &quot;Doğrulanmış iş&quot; rozetiyle görünür.
          </p>
        </div>
      )}

      <label className="flex items-start gap-2 text-xs text-ui-fg-subtle cursor-pointer">
        <input
          type="checkbox"
          checked={declaration}
          disabled={loading}
          onChange={(e) => setDeclaration(e.target.checked)}
          className="mt-0.5 accent-brand-600"
        />
        <span>
          Bu değerlendirme bu uzmanla yaşadığım <strong>kendi deneyimimdir</strong>;
          karalama, reklam veya kişisel veri içermez. *
        </span>
      </label>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-400 text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-colors shadow-sm"
        >
          <Send className="w-4 h-4" /> {loading ? "Gönderiliyor..." : "Değerlendirmeyi Gönder"}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => setOpen(false)}
          className="text-sm text-ui-fg-muted hover:text-ui-fg-base"
        >
          Vazgeç
        </button>
      </div>

      {status === "error" && error && (
        <p className="text-sm text-brand-600" role="alert">
          {error}
        </p>
      )}
      <p className="text-[0.7rem] text-ui-fg-muted">
        Her hesap bir uzmanı bir kez değerlendirebilir. Kurallara aykırı yorumlar
        ekibimizce yayından kaldırılabilir.
      </p>
    </form>
  )
}
