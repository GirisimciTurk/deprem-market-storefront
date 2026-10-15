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
