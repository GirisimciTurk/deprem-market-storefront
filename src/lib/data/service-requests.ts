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

// Müşteriye yansıyan hizmet talebi alanları. Tutarlar TAM LİRA (major): gobit'in
// kuruşları toRequest'te çevrilir.
export type StoreServiceRequest = {
  id: string
  service_title?: string
  service_kind: string
  requires_survey?: boolean
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
// verir; keşif ücreti, kapora ve bakiye operatörce kaydedilir (çevrimiçi
// tahsilat yok).

const KEYS = "_gobit_service_keys"
const KEY_HEADER = "X-Service-Request-Key"

type DtmServiceRequest = {
  id: string
  kind: string
  product_title?: string
  status: string
  /** Ayrıntılı aşama (talep, kesif_planlandi, teklif_gonderildi, onaylandi, …). */
  stage?: string
  city?: string
  district?: string
  /** Müşterinin notu. */
  detail?: string
  service_title?: string
  service_kind?: string
  requires_survey?: boolean
  address?: string
  details?: Record<string, unknown> | null
  preferred_dates?: string[] | null
  quote_price?: number | null
  quote_note?: string
  offer_items?: ServiceOfferItem[] | null
  offer_valid_until?: string | null
  offer_sent_at?: string | null
  offer_decision?: "pending" | "accepted" | "rejected"
  survey_scheduled_at?: string | null
  survey_done_at?: string | null
  survey_report?: string
  install_scheduled_at?: string | null
  install_done_at?: string | null
  survey_fee?: number | null
  deposit_amount?: number | null
  balance_amount?: number | null
  payment_status?: string
  paid_total?: number
  payments?: { phase: ServicePhase; amount: number; method?: string; status?: string; paid_at?: string }[] | null
  created_at: string
  decided_at?: string | null
  // İşi yapan: mağazanın uygulama noktası ya da anlaşmalı uzmanı.
  installer?: { kind: "location" | "expert"; id: string; name: string; slug?: string }
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

// gobit tutarları kuruş tutar; hesap sayfası tam lira gösterir.
const lira = (n?: number | null) => (typeof n === "number" ? n / 100 : null)

const toRequest = (r: DtmServiceRequest): StoreServiceRequest => ({
  id: r.id,
  service_title:
    r.service_title || r.product_title || (r.kind === "discovery" ? "Keşif talebi" : "Hizmet talebi"),
  service_kind: r.service_kind || r.kind,
  requires_survey: r.requires_survey,
  status: r.stage || r.status,
  city: r.city,
  district: r.district,
  address: r.address,
  details: r.details ?? null,
  preferred_dates: r.preferred_dates ?? null,
  note: r.detail,
  survey_scheduled_at: r.survey_scheduled_at ?? null,
  survey_done_at: r.survey_done_at ?? null,
  survey_report: r.survey_report,
  offer_items: r.offer_items?.length
    ? r.offer_items.map((it) => ({
        label: it.label,
        qty: it.qty,
        unit_price: lira(it.unit_price) ?? undefined,
        total: lira(it.total) ?? undefined,
      }))
    : r.quote_note
      ? [{ label: r.quote_note }]
      : null,
  offer_total: lira(r.quote_price),
  offer_valid_until: r.offer_valid_until ?? null,
  offer_sent_at: r.offer_sent_at ?? null,
  offer_decision:
    r.offer_decision ??
    (r.status === "accepted" || r.status === "done" ? "accepted" : r.status === "declined" ? "rejected" : "pending"),
  survey_fee: lira(r.survey_fee),
  deposit_amount: lira(r.deposit_amount),
  balance_amount: lira(r.balance_amount),
  paid_total: lira(r.paid_total),
  payment_status: r.payment_status ?? "none",
  payments: (r.payments ?? []).map((p) => ({
    phase: p.phase,
    amount: lira(p.amount) ?? 0,
    status: p.status === "paid" ? "paid" : "pending",
    method: p.method === "paytr" ? "paytr" : "manual",
    paid_at: p.paid_at,
  })),
  install_scheduled_at: r.install_scheduled_at ?? null,
  install_done_at: r.install_done_at ?? null,
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

/**
 * Hesabın açtığı ve verilen uzmanın tamamladığı işler: uzman değerlendirmesine
 * "Doğrulanmış iş" olarak bağlanabilenler. Misafir talepler sayılmaz; gobit işi
 * yalnız onu açan hesabın değerlendirmesine bağlar.
 */
export async function listMyJobsWithExpert(
  slug: string
): Promise<{ id: string; title: string; created_at: string }[]> {
  const headers = await getAuthHeaders()
  if (!headers.cookie) return []
  const own = await gobitData<DtmServiceRequest[]>("/store/v1/dtm/service-requests", {
    headers,
    cache: "no-store",
  }).catch(() => [] as DtmServiceRequest[])

  return own
    .filter((r) => r.status === "done" && r.installer?.kind === "expert" && r.installer.slug === slug)
    .map((r) => ({ id: r.id, title: toRequest(r).service_title ?? "Hizmet talebi", created_at: r.created_at }))
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
  requires_survey?: boolean
}

/** Hizmet ya da keşif talebi açar; anahtarı üretip saklar. */
export async function createServiceRequest(
  payload: CreateServiceRequestPayload
): Promise<{ success: boolean; error: string | null; id?: string }> {
  const accessKey = randomBytes(32).toString("base64url")
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
        address: payload.address ?? "",
        detail: (payload.note ?? "").slice(0, 2000),
        service_title: payload.service_title ?? "",
        ...(payload.service_kind ? { service_kind: payload.service_kind } : {}),
        ...(payload.requires_survey !== undefined ? { requires_survey: payload.requires_survey } : {}),
        details: payload.details ?? {},
        preferred_dates: payload.preferred_dates ?? [],
        access_key: accessKey,
      },
    })
    await rememberKey(out.id, accessKey)
    return { success: true, error: null, id: out.id }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) }
  }
}
