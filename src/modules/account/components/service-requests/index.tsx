"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { decideServiceOffer } from "@lib/data/service-requests"
import type { ServicePhase, StoreServiceRequest } from "@lib/data/service-requests"
import ServiceAssessment from "./service-assessment"

// ───────────────────────── Sabitler / yardımcılar ─────────────────────────

const KIND_LABEL: Record<string, string> = {
  carbon_fiber: "Karbon Fiber Güçlendirme",
  panic_room: "Panik Odası",
  descent: "Yüksek Kat İniş Aparatı",
  capsule_bed: "Kapsül Yatak Kiti",
  gas_cutoff: "Gaz/Elektrik Kesici",
  other: "Özel Hizmet",
}

const DETAIL_LABELS: Record<string, string> = {
  kat_sayisi: "Kat Sayısı",
  m2: "Toplam m²",
  kolon_sayisi: "Kolon Sayısı",
  bina_yasi: "Bina Yaşı",
  hedef_kat: "Hedef Kat",
  tahmini_fiyat_araligi: "Tahmini Fiyat Aralığı",
}

const prettyKey = (k: string) =>
  DETAIL_LABELS[k] ?? k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())

// Müşteri dostu durum etiketi + renk.
const STATUS_META: Record<string, { label: string; cls: string }> = {
  talep: { label: "Talebiniz Alındı", cls: "bg-amber-100 text-amber-700 border-amber-200" },
  kesif_planlandi: { label: "Keşif Planlandı", cls: "bg-sky-100 text-sky-700 border-sky-200" },
  kesif_yapildi: { label: "Keşif Yapıldı", cls: "bg-sky-100 text-sky-700 border-sky-200" },
  teklif_gonderildi: { label: "Teklif Bekliyor — Onayınız Gerekli", cls: "bg-brand-100 text-brand-700 border-brand-200" },
  onaylandi: { label: "Onayladınız", cls: "bg-green-100 text-green-700 border-green-200" },
  reddedildi: { label: "İptal / Reddedildi", cls: "bg-red-100 text-red-700 border-red-200" },
  tedarik: { label: "Malzeme Tedarik Ediliyor", cls: "bg-sky-100 text-sky-700 border-sky-200" },
  teslim_edildi: { label: "Sahaya Teslim Edildi", cls: "bg-sky-100 text-sky-700 border-sky-200" },
  montaj_planlandi: { label: "Montaj Randevusu Verildi", cls: "bg-sky-100 text-sky-700 border-sky-200" },
  montaj_yapildi: { label: "Montaj Tamamlandı", cls: "bg-green-100 text-green-700 border-green-200" },
  tamamlandi: { label: "Tamamlandı ✓", cls: "bg-green-100 text-green-700 border-green-200" },
  iptal: { label: "İptal Edildi", cls: "bg-red-100 text-red-700 border-red-200" },
}

const STEPS = ["Talep", "Keşif", "Teklif", "Onay", "Tedarik", "Montaj", "Tamam"]
const STEP_OF: Record<string, number> = {
  talep: 0,
  kesif_planlandi: 1,
  kesif_yapildi: 1,
  teklif_gonderildi: 2,
  onaylandi: 3,
  tedarik: 4,
  teslim_edildi: 4,
  montaj_planlandi: 5,
  montaj_yapildi: 5,
  tamamlandi: 6,
}

const isCanceled = (s: string) => s === "reddedildi" || s === "iptal"

const fmtTL = (n?: number | null) => {
  const v = typeof n === "number" ? n : 0
  try {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 0,
    }).format(v)
  } catch {
    return `${v.toLocaleString("tr-TR")} ₺`
  }
}

const fmtDate = (d?: string | null) => {
  if (!d) return ""
  try {
    return new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })
  } catch {
    return ""
  }
}
const fmtDateTime = (d?: string | null) => {
  if (!d) return ""
  try {
    return new Date(d).toLocaleString("tr-TR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })
  } catch {
    return ""
  }
}

// ───────────────────────── Bileşen ─────────────────────────

export default function ServiceRequestsList({ requests }: { requests: StoreServiceRequest[] }) {
  if (!requests.length) {
    return (
      <div className="text-center py-16 bg-ui-bg-subtle rounded-2xl border border-ui-border-base border-dashed">
        <span className="text-5xl mb-4 block">🏗️</span>
        <h3 className="font-bold text-ui-fg-base text-sm sm:text-base mb-1">Henüz hizmet talebiniz yok</h3>
        <p className="text-2xs sm:text-xs text-ui-fg-muted max-w-sm mx-auto mb-6">
          Karbon fiber güçlendirme, panik odası, iniş aparatı gibi keşifli kurulum hizmetleri için talep
          oluşturduğunuzda, sürecin tüm aşamalarını buradan takip edebilirsiniz.
        </p>
        <LocalizedClientLink
          href="/hizmetler/karbon-fiber"
          className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm py-2 px-6 rounded-lg transition-colors inline-block"
        >
          Hizmetleri İncele
        </LocalizedClientLink>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {requests.map((r) => (
        <RequestCard key={r.id} req={r} />
      ))}
    </div>
  )
}

function RequestCard({ req }: { req: StoreServiceRequest }) {
  const router = useRouter()
  const [busy, setBusy] = useState<null | "accept" | "reject">(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmReject, setConfirmReject] = useState(false)

  const meta = STATUS_META[req.status] ?? { label: req.status, cls: "bg-gray-100 text-gray-600 border-gray-200" }
  const canceled = isCanceled(req.status)
  const currentStep = STEP_OF[req.status] ?? 0
  const offerPending = req.status === "teklif_gonderildi"
  const details = req.details && typeof req.details === "object" ? req.details : {}
  const detailEntries = Object.entries(details).filter(([, v]) => v != null && v !== "")

  const decide = async (decision: "accept" | "reject") => {
    setBusy(decision)
    setError(null)
    const res = await decideServiceOffer(req.id, decision)
    if (res.success) {
      router.refresh()
    } else {
      setError(res.error || "İşlem başarısız. Lütfen tekrar deneyin.")
      setBusy(null)
      setConfirmReject(false)
    }
  }

  return (
    <div className="border border-ui-border-base bg-ui-bg-subtle rounded-2xl p-5 space-y-4">
      {/* Başlık */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-ui-border-base pb-3">
        <div>
          <h3 className="font-extrabold text-ui-fg-base text-sm sm:text-base">
            {req.service_title || KIND_LABEL[req.service_kind] || "Özel Hizmet"}
          </h3>
          <span className="text-3xs text-ui-fg-muted block mt-0.5">
            Talep No: #{req.id.slice(-6).toUpperCase()} · {fmtDate(req.created_at)}
          </span>
        </div>
        <span className={`text-2xs font-extrabold px-3 py-1 rounded-full border whitespace-nowrap ${meta.cls}`}>
          {meta.label}
        </span>
      </div>

      {/* Durum çubuğu */}
      {!canceled ? (
        <div className="flex items-center gap-1">
          {STEPS.map((label, i) => {
            const done = i <= currentStep
            return (
              <div key={label} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-center">
                  {i > 0 && <div className={`h-0.5 flex-1 ${i <= currentStep ? "bg-brand-500" : "bg-ui-border-base"}`} />}
                  <div
                    className={`w-3 h-3 rounded-full flex-shrink-0 ${
                      done ? "bg-brand-600" : "bg-ui-bg-base border border-ui-border-base"
                    } ${i === currentStep ? "ring-2 ring-brand-200" : ""}`}
                  />
                  {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 ${i < currentStep ? "bg-brand-500" : "bg-ui-border-base"}`} />}
                </div>
                <span className={`text-[9px] ${done ? "text-brand-700 font-bold" : "text-ui-fg-muted"}`}>{label}</span>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          Bu talep iptal edildi veya teklif reddedildi. Yeni bir talep oluşturabilirsiniz.
        </div>
      )}

      {/* Değerlendirme yöntemi (Ürün + Hizmet): pending ise seçim, seçildiyse özet.
          Yalnız havuz (is_bidding) taleplerinde gösterilir. */}
      {req.is_bidding && !canceled && <ServiceAssessment req={req} />}

      {/* Saha / detay özeti */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
        {(req.city || req.district || req.address) && (
          <Info label="Adres" value={[[req.city, req.district].filter(Boolean).join(" / "), req.address].filter(Boolean).join(" — ")} />
        )}
        {detailEntries.map(([k, v]) => (
          <Info key={k} label={prettyKey(k)} value={String(v)} />
        ))}
        {req.survey_scheduled_at && <Info label="Keşif Randevusu" value={fmtDateTime(req.survey_scheduled_at)} />}
        {req.install_scheduled_at && <Info label="Montaj Randevusu" value={fmtDateTime(req.install_scheduled_at)} />}
      </div>

      {/* Keşif raporu */}
      {req.survey_report && (
        <div className="text-xs">
          <span className="text-ui-fg-muted font-semibold">Keşif Raporu: </span>
          <span className="text-ui-fg-base whitespace-pre-wrap">{req.survey_report}</span>
        </div>
      )}

      {/* Teklif */}
      {req.offer_sent_at && (
        <div className="bg-ui-bg-base border border-ui-border-base rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-ui-fg-base text-sm">Size Sunulan Teklif</h4>
            {req.offer_valid_until && (
              <span className="text-3xs text-ui-fg-muted">Geçerlilik: {fmtDate(req.offer_valid_until)}</span>
            )}
          </div>

          {req.offer_items && req.offer_items.length > 0 && (
            <div className="divide-y divide-ui-border-base text-xs">
              {req.offer_items.map((it, idx) => (
                <div key={idx} className="flex items-center justify-between py-1.5">
                  <span className="text-ui-fg-base">
                    {it.label}
                    {it.qty ? <span className="text-ui-fg-muted"> × {it.qty}</span> : null}
                  </span>
                  <span className="font-semibold text-ui-fg-base">
                    {fmtTL(it.total ?? (Number(it.qty) || 0) * (Number(it.unit_price) || 0))}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-ui-border-base pt-2">
            <span className="font-extrabold text-ui-fg-base text-sm">Toplam</span>
            <span className="font-extrabold text-brand-700 text-lg">{fmtTL(req.offer_total)}</span>
          </div>

          {offerPending ? (
            <div className="space-y-2 pt-1">
              {error && <p className="text-2xs text-red-600">{error}</p>}
              {!confirmReject ? (
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={() => decide("accept")}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold text-sm py-2.5 px-4 rounded-lg transition-colors"
                  >
                    {busy === "accept" ? "Onaylanıyor..." : "Teklifi Onayla"}
                  </button>
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={() => setConfirmReject(true)}
                    className="flex-1 sm:flex-none border border-ui-border-base hover:bg-ui-bg-subtle text-ui-fg-base font-semibold text-sm py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Reddet
                  </button>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-100 rounded-lg p-3 space-y-2">
                  <p className="text-2xs text-red-700">
                    Teklifi reddederseniz talep iptal edilir. Emin misiniz?
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={busy !== null}
                      onClick={() => decide("reject")}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold text-xs py-2 px-3 rounded-lg transition-colors"
                    >
                      {busy === "reject" ? "İşleniyor..." : "Evet, Reddet"}
                    </button>
                    <button
                      type="button"
                      disabled={busy !== null}
                      onClick={() => setConfirmReject(false)}
                      className="flex-1 border border-ui-border-base text-ui-fg-base font-semibold text-xs py-2 px-3 rounded-lg disabled:opacity-50"
                    >
                      Vazgeç
                    </button>
                  </div>
                </div>
              )}
              <p className="text-3xs text-ui-fg-muted text-center">
                Onayladığınızda bayimiz malzeme tedarikine başlar ve montaj için sizinle iletişime geçer.
              </p>
            </div>
          ) : req.offer_decision === "accepted" ? (
            <p className="text-2xs text-green-700 font-semibold flex items-center gap-1">
              ✓ Bu teklifi onayladınız. Süreç devam ediyor.
            </p>
          ) : req.offer_decision === "rejected" ? (
            <p className="text-2xs text-red-600 font-semibold">Bu teklifi reddettiniz.</p>
          ) : null}
        </div>
      )}

      {/* Ödeme aşamaları (keşif ücreti / kapora / bakiye) */}
      <PaymentSection req={req} />
    </div>
  )
}

// ───────────────────────── Ödeme bölümü ─────────────────────────

const PHASE_LABEL: Record<ServicePhase, string> = {
  survey: "Keşif Ücreti",
  deposit: "Kapora",
  balance: "Bakiye",
}
const PHASE_FIELD: Record<ServicePhase, "survey_fee" | "deposit_amount" | "balance_amount"> = {
  survey: "survey_fee",
  deposit: "deposit_amount",
  balance: "balance_amount",
}

const isPhasePaid = (req: StoreServiceRequest, phase: ServicePhase) =>
  (req.payments ?? []).some((p) => p.phase === phase && p.status === "paid")

/** Müşteri bu fazı şu an ödeyebilir mi? (backend ayrıca doğrular). */
function isPhasePayable(req: StoreServiceRequest, phase: ServicePhase): boolean {
  const amount = Number(req[PHASE_FIELD[phase]] ?? 0)
  if (amount <= 0 || isPhasePaid(req, phase)) return false
  if (isCanceled(req.status)) return false
  if (phase === "deposit") {
    return ["onaylandi", "tedarik", "teslim_edildi", "montaj_planlandi", "montaj_yapildi", "tamamlandi"].includes(req.status)
  }
  if (phase === "balance") {
    const depositOk = Number(req.deposit_amount ?? 0) <= 0 || isPhasePaid(req, "deposit")
    return depositOk && ["teslim_edildi", "montaj_planlandi", "montaj_yapildi", "tamamlandi"].includes(req.status)
  }
  return true // survey: tutar belirlenmişse ödenebilir
}

function PaymentSection({ req }: { req: StoreServiceRequest }) {
  const [paying, setPaying] = useState<ServicePhase | null>(null)
  const [iframeToken, setIframeToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // PayTR iframe boy uyarlayıcısı.
  useEffect(() => {
    if (!iframeToken) return
    const s = document.createElement("script")
    s.src = "https://www.paytr.com/js/iframeResizer.min.js"
    s.async = true
    s.onload = () => {
      try {
        ;(window as any).iFrameResize?.({}, "#paytriframe-service")
      } catch {
        /* best-effort */
      }
    }
    document.body.appendChild(s)
    return () => {
      try {
        document.body.removeChild(s)
      } catch {
        /* noop */
      }
    }
  }, [iframeToken])

  const phases: ServicePhase[] = ["survey", "deposit", "balance"]
  const configured = phases.filter((p) => Number(req[PHASE_FIELD[p]] ?? 0) > 0)
  if (configured.length === 0) return null

  const pay = async (phase: ServicePhase) => {
    setPaying(phase)
    setError(null)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
      const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
      const res = await fetch(`${backendUrl}/store/service-requests/${req.id}/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": publishableKey,
        },
        credentials: "include",
        body: JSON.stringify({ phase }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json.success || !json.iframe_token) {
        throw new Error(json.error || "Ödeme başlatılamadı. Lütfen tekrar deneyin.")
      }
      setIframeToken(json.iframe_token)
    } catch (e: any) {
      setError(e.message || "Bir hata oluştu.")
      setPaying(null)
    }
  }

  return (
    <div className="bg-ui-bg-base border border-ui-border-base rounded-xl p-4 space-y-2.5">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-ui-fg-base text-sm">Ödeme</h4>
        {Number(req.paid_total ?? 0) > 0 && (
          <span className="text-3xs text-ui-fg-muted">
            Tahsil edilen: <strong className="text-green-700">{fmtTL(req.paid_total)}</strong>
          </span>
        )}
      </div>

      <div className="divide-y divide-ui-border-base">
        {configured.map((phase) => {
          const amount = Number(req[PHASE_FIELD[phase]] ?? 0)
          const paid = isPhasePaid(req, phase)
          const payable = isPhasePayable(req, phase)
          return (
            <div key={phase} className="flex items-center justify-between py-2 gap-3">
              <div className="min-w-0">
                <span className="text-xs font-semibold text-ui-fg-base">{PHASE_LABEL[phase]}</span>
                <span className="text-xs text-ui-fg-muted ml-2">{fmtTL(amount)}</span>
              </div>
              {paid ? (
                <span className="text-2xs font-bold text-green-700 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full whitespace-nowrap">
                  Ödendi ✓
                </span>
              ) : payable ? (
                <button
                  type="button"
                  disabled={paying !== null}
                  onClick={() => pay(phase)}
                  className="bg-brand-600 hover:bg-brand-700 disabled:bg-gray-400 text-white font-bold text-2xs py-1.5 px-4 rounded-lg transition-colors whitespace-nowrap"
                >
                  {paying === phase ? "Açılıyor..." : "Güvenli Öde"}
                </button>
              ) : (
                <span className="text-2xs text-ui-fg-muted whitespace-nowrap">Sırada</span>
              )}
            </div>
          )
        })}
      </div>

      {error && <p className="text-2xs text-red-600">{error}</p>}
      <p className="text-3xs text-ui-fg-muted">
        Ödemeniz PayTR güvenli ödeme altyapısı ile alınır; iş teslim edilene kadar güvence hesabında tutulur.
      </p>

      {iframeToken && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[92vh] overflow-auto relative shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 sticky top-0 bg-white">
              <span className="font-semibold text-gray-900">Güvenli Ödeme (PayTR)</span>
              <button
                type="button"
                onClick={() => {
                  setIframeToken(null)
                  setPaying(null)
                }}
                className="text-gray-400 hover:text-gray-700 text-xl leading-none"
                aria-label="Kapat"
              >
                ×
              </button>
            </div>
            <iframe
              src={`https://www.paytr.com/odeme/guvenli/${iframeToken}`}
              id="paytriframe-service"
              frameBorder={0}
              scrolling="yes"
              style={{ width: "100%", minHeight: 620, border: "none" }}
              title="PayTR Ödeme"
            />
          </div>
        </div>
      )}
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  if (!value) return null
  return (
    <div className="flex justify-between gap-2 sm:block">
      <span className="text-ui-fg-muted">{label}</span>
      <span className="text-ui-fg-base font-medium sm:ml-1">{value}</span>
    </div>
  )
}
