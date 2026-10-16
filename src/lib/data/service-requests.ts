"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "./cookies"

// Müşteriye yansıyan hizmet talebi alanları. Teklif, keşif ve ödeme yüz yüze yürür;
// takip ekranı yalnız müşterinin verdiği bilgileri ve sade durumu gösterir.
export type StoreServiceRequest = {
  id: string
  service_title?: string
  service_kind: string
  requires_survey?: boolean
  media?: { url: string; type?: string }[] | null
  status: string
  city?: string
  district?: string
  address?: string
  details?: Record<string, unknown> | null
  preferred_dates?: string[] | null
  note?: string
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

/**
 * Müşteri hizmet talebi açar (ör. karbon fiber sayfasındaki form).
 * Giriş yapmışsa auth header ile talep hesabına bağlanır (Hizmet Taleplerim'de görünür);
 * misafir de açabilir. Talep doğrudan platforma düşer; bayi havuzu ya da otomatik atama yok.
 */
export async function createServiceRequest(
  payload: CreateServiceRequestPayload
): Promise<{ success: boolean; error: string | null; id?: string }> {
  const headers = { ...(await getAuthHeaders()) }
  try {
    const res = await sdk.client.fetch<{ service_request?: { id?: string } }>(
      `/store/service-requests`,
      {
        method: "POST",
        headers,
        body: payload,
      }
    )
    return { success: true, error: null, id: res?.service_request?.id }
  } catch (e) {
    const msg =
      typeof e === "object" && e && "message" in e ? String((e as { message: unknown }).message) : String(e)
    return { success: false, error: msg }
  }
}
