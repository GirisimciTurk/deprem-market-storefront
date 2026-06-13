"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "./cookies"

export type StoreQuestion = {
  id: string
  customer_name: string
  question: string
  answer: string | null
  answered_at: string | null
  created_at: string
}

/** Ürünün yanıtlanmış (herkese açık) sorularını listeler. */
export async function listProductQuestions(
  productHandle: string
): Promise<StoreQuestion[]> {
  return sdk.client
    .fetch<{ questions: StoreQuestion[] }>(`/store/product-questions`, {
      method: "GET",
      query: { product_handle: productHandle },
    })
    .then((r) => r.questions ?? [])
    .catch(() => [])
}

/** Ürün sorusu gönderir (pending → satıcı yanıtlayınca yayınlanır). Auth opsiyonel. */
export async function submitProductQuestion(input: {
  product_handle: string
  question: string
  name: string
}): Promise<{ success: boolean; error: string | null }> {
  const headers = { ...(await getAuthHeaders()) }
  try {
    await sdk.client.fetch(`/store/product-questions`, {
      method: "POST",
      headers,
      body: input,
    })
    return { success: true, error: null }
  } catch (e: any) {
    return { success: false, error: e?.message || String(e) }
  }
}
