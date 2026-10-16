import LocalizedClientLink from "@modules/common/components/localized-client-link"
import type { StoreServiceRequest } from "@lib/data/service-requests"
import { customerStatusOf } from "./status"

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
}

// Eski taleplerde kalmış olabilecek, müşteriye artık gösterilmeyen alanlar.
const HIDDEN_DETAILS = new Set(["tahmini_fiyat_araligi"])

const prettyKey = (k: string) =>
  DETAIL_LABELS[k] ?? k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())

const fmtDate = (d?: string | null) => {
  if (!d) return ""
  try {
    return new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })
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
          Karbon fiber güçlendirme, panik odası, iniş aparatı gibi hizmetler için talep oluşturduğunuzda
          talepleriniz burada listelenir; ekibimiz sizi telefonla arar.
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
  const status = customerStatusOf(req.status)
  const details = req.details && typeof req.details === "object" ? req.details : {}
  const detailEntries = Object.entries(details)
    .filter(([k]) => !HIDDEN_DETAILS.has(k))
    .map(([k, v]) => [k, Array.isArray(v) ? v.join(", ") : v] as const)
    .filter(([, v]) => v != null && v !== "" && typeof v !== "object")
  const location = [[req.city, req.district].filter(Boolean).join(" / "), req.address]
    .filter(Boolean)
    .join(" — ")

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
        <span className={`text-2xs font-extrabold px-3 py-1 rounded-full border whitespace-nowrap ${status.cls}`}>
          {status.label}
        </span>
      </div>

      {status.canceled && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          Bu talep iptal edildi. Yeni bir talep oluşturabilir ya da bizi arayabilirsiniz.
        </div>
      )}

      {/* Müşterinin verdiği bilgiler */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
        {location && <Info label="Adres" value={location} />}
        {detailEntries.map(([k, v]) => (
          <Info key={k} label={prettyKey(k)} value={String(v)} />
        ))}
      </div>

      {req.note && (
        <div className="text-xs">
          <span className="text-ui-fg-muted font-semibold">Not: </span>
          <span className="text-ui-fg-base whitespace-pre-wrap">{req.note}</span>
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
