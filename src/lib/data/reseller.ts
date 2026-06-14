"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "./cookies"

export interface MyResellerApplication {
  companyName: string
  contactName: string
  taxOfficeNumber?: string
  email: string
  phone: string
  city: string
  message?: string
  date: string
  status: "pending" | "approved" | "rejected"
}

interface BackendApplication {
  company_name: string
  applicant_name: string
  tax_number?: string
  email: string
  phone?: string
  city?: string
  message?: string
  created_at: string
  status: "pending" | "approved" | "rejected"
}

/**
 * Giriş yapmış müşterinin en güncel satıcı başvurusu (gerçek backend verisi,
 * /store/reseller-applications/me). Eskiden localStorage demo'su kullanılıyordu.
 */
export const getMyResellerApplication = async (): Promise<MyResellerApplication | null> => {
  const headers = { ...(await getAuthHeaders()) }
  if (!("authorization" in headers)) return null

  const apps = await sdk.client
    .fetch<{ applications: BackendApplication[] }>(`/store/reseller-applications/me`, {
      method: "GET",
      headers,
      cache: "no-store",
    })
    .then(({ applications }) => applications || [])
    .catch(() => [])

  const a = apps[0]
  if (!a) return null

  return {
    companyName: a.company_name,
    contactName: a.applicant_name,
    taxOfficeNumber: a.tax_number,
    email: a.email,
    phone: a.phone || "",
    city: a.city || "",
    message: a.message,
    date: new Date(a.created_at).toLocaleDateString("tr-TR"),
    status: a.status,
  }
}
