"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Camera, MapPin, Loader2, X, Video } from "lucide-react"
import {
  setServiceAssessment,
  type ServiceMedia,
  type StoreServiceRequest,
} from "@lib/data/service-requests"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
const PUB_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

const toBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "")
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

/**
 * "Ürün + Hizmet" talebinde DEĞERLENDİRME YÖNTEMİ seçimi (hesap kartında).
 * assessment_mode "pending" iken iki seçenek: fotoğraf/video yükle (media) veya
 * yerinde keşif iste (survey). Seçildiyse özet gösterir. Talep havuzda kalır;
 * bayiler bu bilgiye göre uzaktan/keşifle fiyat verir.
 *
 * Medya yüklemesi büyük olabildiği için DOĞRUDAN backend'e (publishable key ile)
 * yapılır; dönen URL'ler `setServiceAssessment` ile talebe bağlanır (küçük yük).
 */
export default function ServiceAssessment({ req }: { req: StoreServiceRequest }) {
  const router = useRouter()
  const mode = req.assessment_mode ?? "pending"
  // Yalnız teklif öncesi (erken) aşamada seçilebilir.
  const editable = ["talep", "kesif_planlandi"].includes(req.status)

  const [panel, setPanel] = useState<null | "media" | "survey">(null)
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [files, setFiles] = useState<ServiceMedia[]>(req.media ?? [])
  // Medya değerlendirmesinde video/foto + ek bilgi: konum + açıklama.
  const [mediaLocation, setMediaLocation] = useState(req.address ?? "")
  const [mediaNote, setMediaNote] = useState(req.note ?? "")

  const [date1, setDate1] = useState("")
  const [date2, setDate2] = useState("")
  const [city, setCity] = useState(req.city ?? "")
  const [district, setDistrict] = useState(req.district ?? "")
  const [address, setAddress] = useState(req.address ?? "")

  // ── Yöntem seçilmiş: özet ──
  if (mode !== "pending") {
    return (
      <div className="rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-3">
        <p className="text-xs font-bold text-brand-800">
          {mode === "media"
            ? "📷 Fotoğraf/Video ile değerlendirme seçildi"
            : "🔍 Yerinde keşif istendi"}
        </p>
        {mode === "media" && (req.media?.length ?? 0) > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {req.media!.map((m, i) => (
              <a
                key={i}
                href={m.url}
                target="_blank"
                rel="noreferrer"
                className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg border border-ui-border-base bg-white"
              >
                {m.type === "video" ? (
                  <Video className="h-5 w-5 text-ui-fg-muted" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.url} alt="" className="h-full w-full object-cover" />
                )}
              </a>
            ))}
          </div>
        )}
        <p className="mt-1.5 text-[11px] text-ui-fg-muted">
          Bayilerimiz bu bilgilere göre fiyat verecek; en uygun teklif size iletilecek.
        </p>
      </div>
    )
  }

  if (!editable) return null

  // ── Medya yükleme (doğrudan backend'e) ──
  const uploadFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return
    setError(null)
    setUploading(true)
    try {
      const payload = await Promise.all(
        Array.from(fileList)
          .slice(0, 8)
          .map(async (f) => ({
            filename: f.name,
            mime_type: f.type,
            data: await toBase64(f),
          }))
      )
      const res = await fetch(`${BACKEND_URL}/store/service-uploads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": PUB_KEY,
        },
        body: JSON.stringify({ files: payload }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || "Yükleme başarısız.")
      setFiles((prev) => [...prev, ...((data.files ?? []) as ServiceMedia[])].slice(0, 8))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yükleme başarısız.")
    } finally {
      setUploading(false)
    }
  }

  const submitMedia = async () => {
    if (files.length === 0) {
      setError("En az bir fotoğraf veya video yükleyin.")
      return
    }
    if (!mediaLocation.trim()) {
      setError("Lütfen konum bilgisini girin.")
      return
    }
    setBusy(true)
    setError(null)
    const res = await setServiceAssessment(req.id, {
      assessment_mode: "media",
      media: files,
      address: mediaLocation.trim(),
      note: mediaNote.trim() || undefined,
    })
    if (res.success) router.refresh()
    else {
      setError(res.error || "Kaydedilemedi.")
      setBusy(false)
    }
  }

  const submitSurvey = async () => {
    const dates = [date1, date2].filter(Boolean)
    if (!city.trim() || !district.trim() || !address.trim()) {
      setError("Keşif için il, ilçe ve adres bilgisini girin.")
      return
    }
    if (dates.length === 0) {
      setError("En az bir tercih ettiğiniz keşif tarihi seçin.")
      return
    }
    setBusy(true)
    setError(null)
    const res = await setServiceAssessment(req.id, {
      assessment_mode: "survey",
      preferred_dates: dates,
      city: city.trim(),
      district: district.trim(),
      address: address.trim(),
    })
    if (res.success) router.refresh()
    else {
      setError(res.error || "Kaydedilemedi.")
      setBusy(false)
    }
  }

  const inputCls = "rounded-lg border border-ui-border-base px-2 py-1.5 text-xs bg-white"

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
      <p className="text-xs font-extrabold text-amber-900">Değerlendirme yöntemi seçin</p>
      <p className="mt-0.5 text-[11px] text-amber-800">
        Bayilerimizin fiyat verebilmesi için ya fotoğraf/video yükleyin ya da yerinde keşif isteyin.
      </p>

      {!panel && (
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setPanel("media")}
            className="flex items-center gap-2 rounded-lg border border-ui-border-base bg-white px-3 py-2.5 text-left text-xs font-bold text-slate-800 transition-colors hover:border-brand-400"
          >
            <Camera className="h-4 w-4 text-brand-600" /> Fotoğraf / Video Yükle
          </button>
          <button
            type="button"
            onClick={() => setPanel("survey")}
            className="flex items-center gap-2 rounded-lg border border-ui-border-base bg-white px-3 py-2.5 text-left text-xs font-bold text-slate-800 transition-colors hover:border-brand-400"
          >
            <MapPin className="h-4 w-4 text-brand-600" /> Yerinde Keşif İste
          </button>
        </div>
      )}

      {panel === "media" && (
        <div className="mt-3 space-y-2">
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-brand-300 bg-white px-3 py-3 text-xs font-bold text-brand-700 hover:bg-brand-50">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            {uploading ? "Yükleniyor…" : "Dosya seç (fotoğraf / video)"}
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              disabled={uploading}
              onChange={(e) => uploadFiles(e.target.files)}
            />
          </label>
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {files.map((m, i) => (
                <div
                  key={i}
                  className="relative h-14 w-14 overflow-hidden rounded-lg border border-ui-border-base bg-white"
                >
                  {m.type === "video" ? (
                    <span className="flex h-full w-full items-center justify-center text-ui-fg-muted">
                      <Video className="h-5 w-5" />
                    </span>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.url} alt="" className="h-full w-full object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => setFiles((p) => p.filter((_, j) => j !== i))}
                    className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-white"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {/* Ek bilgi: konum + açıklama (bayinin uzaktan fiyat verebilmesi için) */}
          <input
            value={mediaLocation}
            onChange={(e) => setMediaLocation(e.target.value)}
            placeholder="Konum (İl / İlçe / adres) *"
            className={`${inputCls} w-full`}
          />
          <textarea
            value={mediaNote}
            onChange={(e) => setMediaNote(e.target.value)}
            rows={2}
            placeholder="Açıklama (örn. 3. kat, kolon çatlağı, yaklaşık ölçüler…)"
            className={`${inputCls} w-full`}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={submitMedia}
              disabled={busy || uploading}
              className="flex-1 rounded-lg bg-brand-600 px-3 py-2 text-xs font-bold text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {busy ? "Gönderiliyor…" : "Gönder"}
            </button>
            <button
              type="button"
              onClick={() => setPanel(null)}
              className="rounded-lg border border-ui-border-base px-3 py-2 text-xs font-semibold text-slate-600"
            >
              Vazgeç
            </button>
          </div>
        </div>
      )}

      {panel === "survey" && (
        <div className="mt-3 space-y-2">
          <p className="text-[11px] font-semibold text-slate-600">Tercih ettiğiniz keşif tarihleri</p>
          <div className="grid grid-cols-2 gap-2">
            <input type="date" value={date1} onChange={(e) => setDate1(e.target.value)} className={inputCls} />
            <input type="date" value={date2} onChange={(e) => setDate2(e.target.value)} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="İl" className={inputCls} />
            <input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="İlçe" className={inputCls} />
          </div>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={2}
            placeholder="Açık adres (keşif için)"
            className={`${inputCls} w-full`}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={submitSurvey}
              disabled={busy}
              className="flex-1 rounded-lg bg-brand-600 px-3 py-2 text-xs font-bold text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {busy ? "Gönderiliyor…" : "Keşif İste"}
            </button>
            <button
              type="button"
              onClick={() => setPanel(null)}
              className="rounded-lg border border-ui-border-base px-3 py-2 text-xs font-semibold text-slate-600"
            >
              Vazgeç
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-2 text-[11px] font-medium text-rose-600">{error}</p>}
    </div>
  )
}
