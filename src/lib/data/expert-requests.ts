"use server"

import { gobitFetch } from "@lib/gobit/client"
import { getAuthHeaders } from "./cookies"

/** Uzmana iletişim talebi (dtm): giriş gerekir. */
export async function sendExpertRequest(
  slug: string,
  input: { name: string; phone: string; email?: string; city?: string; topic?: string; message?: string }
): Promise<{ success: boolean; error: string | null }> {
  const headers = await getAuthHeaders()
  if (!headers.cookie) return { success: false, error: "Uzmana talep göndermek için giriş yapın." }
  try {
    await gobitFetch(`/store/v1/dtm/experts/${encodeURIComponent(slug)}/requests`, {
      method: "POST",
      headers,
      body: {
        sender_name: input.name,
        phone: input.phone,
        email: input.email ?? "",
        city: input.city ?? "",
        topic: input.topic ?? "",
        message: input.message ?? "",
      },
    })
    return { success: true, error: null }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) }
  }
}

/** "Uzman ol": oturumdaki hesabın uzman kartını yazar ve yayımlar (dtm). */
export async function saveMyExpertCard(input: {
  kind: string
  full_name: string
  title: string
  about?: string
  city: string
  district: string
  service_provinces: string[]
  specialties: string[]
  experience_years?: number
  chamber?: string
  phone: string
  whatsapp?: string
  email: string
  contact_hidden: boolean
}): Promise<{ success: boolean; error: string | null; unauthorized?: boolean }> {
  const headers = await getAuthHeaders()
  if (!headers.cookie) return { success: false, error: "Uzman kartı açmak için giriş yapın.", unauthorized: true }
  try {
    await gobitFetch("/store/v1/dtm/experts/me", {
      method: "PUT",
      headers,
      body: {
        kind: input.kind,
        full_name: input.full_name,
        title: input.title,
        headline: "",
        about: input.about ?? "",
        photo_url: "",
        city: input.city,
        district: input.district,
        address: "",
        service_provinces: input.service_provinces,
        nationwide: false,
        specialties: input.specialties,
        experience_years: input.experience_years ?? null,
        chamber: input.chamber ?? "",
        registry_no: "",
        phone: input.phone,
        whatsapp: input.whatsapp ?? "",
        email: input.email,
        website: "",
        contact_hidden: input.contact_hidden,
      },
    })
    await gobitFetch("/store/v1/dtm/experts/me/publish", { method: "POST", headers, body: {} })
    return { success: true, error: null }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) }
  }
}
