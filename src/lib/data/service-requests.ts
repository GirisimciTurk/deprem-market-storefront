"use server"

import { sdk } from "@lib/config"
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

/** Giriş yapmış müşterinin kendi hizmet talepleri (takip ekranı için). */
export async function listMyServiceRequests(): Promise<StoreServiceRequest[]> {
  const headers = { ...(await getAuthHeaders()) }
  return sdk.client
    .fetch<{ service_requests: StoreServiceRequest[] }>(`/store/service-requests`, {
      method: "GET",
      headers,
      cache: "no-store",
    })
    .then((r) => r.service_requests ?? [])
    .catch(() => [])
}

/**
 * Müşteri gönderilen teklifi onaylar/reddeder.
 * Yalnız "teklif_gonderildi" durumundaki talepte geçerli (backend doğrular).
 */
export async function decideServiceOffer(
  id: string,
  decision: "accept" | "reject"
): Promise<{ success: boolean; error: string | null }> {
  const headers = { ...(await getAuthHeaders()) }
  try {
    await sdk.client.fetch(`/store/service-requests/${id}`, {
      method: "POST",
      headers,
      body: { decision },
    })
    return { success: true, error: null }
  } catch (e) {
    const msg =
      typeof e === "object" && e && "message" in e ? String((e as { message: unknown }).message) : String(e)
    return { success: false, error: msg }
  }
}
