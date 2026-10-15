"use server"

import { gobitFetch } from "@lib/gobit/client"

/** dtm'nin iletişim kutusuna bir mesaj (/store/v1/dtm/contact). */
export async function sendContact(input: {
  name: string
  email: string
  subject: string
  message: string
}): Promise<{ success: boolean; error: string | null }> {
  try {
    await gobitFetch("/store/v1/dtm/contact", { method: "POST", body: input })
    return { success: true, error: null }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) }
  }
}
