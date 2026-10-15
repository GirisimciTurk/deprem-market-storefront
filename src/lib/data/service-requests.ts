"use server"

import { randomBytes } from "node:crypto"
import { cookies as nextCookies } from "next/headers"
import { gobitData, gobitFetch } from "@lib/gobit/client"
import { getAuthHeaders } from "./cookies"

export type ServiceOfferItem = {
  label: string
  qty?: number
  unit_price?: number
  total?: number
}

// Müşteriye yansıyan hizmet talebi alanları. Tutarlar TAM LİRA (major), kuruş değil.
export type StoreServiceRequest = {
  id: string
  service_title?: string
  service_kind: string
  requires_survey?: boolean
  // Havuz/teklif akışı (Ürün + Hizmet'ten açılan talepler). Değerlendirme seçimi
  // yalnız bu taleplerde gösterilir.
  is_bidding?: boolean
  // Değerlendirme yöntemi: pending (henüz seçilmedi) | media (foto/video) | survey (keşif)
  assessment_mode?: "pending" | "media" | "survey"
  media?: { url: string; type?: string }[] | null
  status: string
  city?: string
  district?: string
  address?: string
  details?: Record<string, unknown> | null
  preferred_dates?: string[] | null
  note?: string
  survey_scheduled_at?: string | null
  survey_done_at?: string | null
  survey_report?: string
  offer_items?: ServiceOfferItem[] | null
  offer_total?: number | null
  offer_valid_until?: string | null
  offer_sent_at?: string | null
  offer_decision?: "pending" | "accepted" | "rejected"
  // ── Ödeme aşamaları (D fazı). Tutarlar TAM LİRA (major). ──
  survey_fee?: number | null
  deposit_amount?: number | null
  balance_amount?: number | null
  paid_total?: number | null
  payment_status?: "none" | "survey_paid" | "deposit_paid" | "paid" | string
  payments?: ServicePayment[] | null
  install_scheduled_at?: string | null
  install_done_at?: string | null
  created_at?: string
}

export type ServicePhase = "survey" | "deposit" | "balance"

export type ServicePayment = {
  phase: ServicePhase
  amount: number
  status: "pending" | "paid"
  method?: "paytr" | "manual"
  merchant_oid?: string | null
  paid_at?: string
  created_at?: string
}

// dtm'nin hizmet talepleri (/store/v1/dtm/service-requests). Bir talep onu açan
// hesaba ya da açılışta verilen anahtara (X-Service-Request-Key) cevap verir;
// başkasına "yok" der. Anahtarı bu sunucu üretir ve misafir talepler için
// HttpOnly bir çerezde tutar; hiçbir yanıtta dönmez. dtm teklifi tek fiyatla
// verir; keşif ücreti, kapora ve bakiyenin çevrimiçi ödemesi dtm'de yok.

const KEYS = "_gobit_service_keys"
const KEY_HEADER = "X-Service-Request-Key"

type DtmServiceRequest = {
  id: string
  kind: string
  product_title?: string
  status: string
  city?: string
  district?: string
  detail?: string
  quote_price?: number | null
  quote_note?: string
  created_at: string
  decided_at?: string | null
}

async function keys(): Promise<Record<string, string>> {
  try {
    const raw = (await nextCookies()).get(KEYS)?.value
    return raw ? (JSON.parse(raw) as Record<string, string>) : {}
  } catch {
    return {}
  }
}

async function rememberKey(id: string, key: string) {
  try {
    const kept = Object.entries(await keys()).slice(-19)
    ;(await nextCookies()).set(KEYS, JSON.stringify(Object.fromEntries([...kept, [id, key]])), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 180,
    })
  } catch {
    /* render bağlamında çerez yazılamaz */
  }
}

async function headersFor(id: string): Promise<Record<string, string>> {
  const key = (await keys())[id]

  return { ...(await getAuthHeaders()), ...(key ? { [KEY_HEADER]: key } : {}) }
}

const toRequest = (r: DtmServiceRequest): StoreServiceRequest => ({
  id: r.id,
  service_title: r.product_title || (r.kind === "discovery" ? "Keşif talebi" : "Hizmet talebi"),
  service_kind: r.kind,
  status: r.status,
  city: r.city,
  district: r.district,
  note: r.detail,
  offer_total: r.quote_price ?? null,
  offer_items: r.quote_note ? [{ label: r.quote_note }] : null,
  offer_decision: r.status === "accepted" || r.status === "done" ? "accepted" : r.status === "declined" ? "rejected" : "pending",
  payment_status: "none",
  payments: [],
  created_at: r.created_at,
})

/** Müşterinin hizmet talepleri: hesabındakiler ve bu tarayıcıda anahtarı olanlar. */
export async function listMyServiceRequests(): Promise<StoreServiceRequest[]> {
  const headers = await getAuthHeaders()
  const own = headers.cookie
    ? await gobitData<DtmServiceRequest[]>("/store/v1/dtm/service-requests", { headers, cache: "no-store" }).catch(
        () => [] as DtmServiceRequest[]
      )
    : []
  const seen = new Set(own.map((r) => r.id))
  const kept = await keys()
  const guest = await Promise.all(
    Object.entries(kept)
      .filter(([id]) => !seen.has(id))
      .map(([id, key]) =>
        gobitData<DtmServiceRequest>(`/store/v1/dtm/service-requests/${encodeURIComponent(id)}`, {
          headers: { [KEY_HEADER]: key },
          cache: "no-store",
        }).catch(() => null)
      )
  )

  return [...own, ...(guest.filter(Boolean) as DtmServiceRequest[])]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map(toRequest)
}

/** Teklifi kabul ya da reddet. */
export async function decideServiceOffer(
  id: string,
  decision: "accept" | "reject"
): Promise<{ success: boolean; error: string | null }> {
  try {
    await gobitFetch(
      `/store/v1/dtm/service-requests/${encodeURIComponent(id)}/${decision === "accept" ? "accept" : "decline"}`,
      { method: "POST", headers: await headersFor(id), body: {} }
    )
    return { success: true, error: null }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) }
  }
}

export type CreateServiceRequestPayload = {
  product_id?: string
  service_title?: string
  service_kind?: string
  full_name: string
  email: string
  phone?: string
  city?: string
  district?: string
  address?: string
  note?: string
  details?: Record<string, unknown>
  preferred_dates?: string[]
}

/** Hizmet ya da keşif talebi açar; anahtarı üretip saklar. */
export async function createServiceRequest(
  payload: CreateServiceRequestPayload
): Promise<{ success: boolean; error: string | null; id?: string }> {
  const accessKey = randomBytes(32).toString("base64url")
  const extra = [
    payload.service_title ? `Hizmet: ${payload.service_title}` : "",
    payload.address ? `Adres: ${payload.address}` : "",
    payload.preferred_dates?.length ? `Tercih edilen tarihler: ${payload.preferred_dates.join(", ")}` : "",
    payload.details ? Object.entries(payload.details).map(([k, v]) => `${k}: ${String(v)}`).join("\n") : "",
    payload.note ?? "",
  ]
    .filter(Boolean)
    .join("\n")
  try {
    const out = await gobitData<{ id: string }>("/store/v1/dtm/service-requests", {
      method: "POST",
      headers: await getAuthHeaders(),
      body: {
        kind: payload.product_id ? "service" : "discovery",
        product_id: payload.product_id ?? "",
        customer_name: payload.full_name,
        customer_email: payload.email,
        customer_phone: payload.phone ?? "",
        city: payload.city ?? "",
        district: payload.district ?? "",
        detail: extra.slice(0, 2000),
        access_key: accessKey,
      },
    })
    await rememberKey(out.id, accessKey)
    return { success: true, error: null, id: out.id }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) }
  }
}

export type ServiceMedia = { url: string; type?: string }

/** Keşif/medya değerlendirme adımı dtm'de yok; talep açıklamasıyla birlikte gelir. */
export async function setServiceAssessment(
  _id: string,
  _payload: {
    assessment_mode: "media" | "survey"
    media?: ServiceMedia[]
    preferred_dates?: string[]
    city?: string
    district?: string
    address?: string
    note?: string
  }
): Promise<{ success: boolean; error: string | null }> {
  return { success: false, error: "Değerlendirme bilgisi talebinizle birlikte iletilir; mağaza size teklif gönderecek." }
}
