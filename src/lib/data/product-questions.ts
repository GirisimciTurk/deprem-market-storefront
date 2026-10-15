"use server"

import { gobitData, gobitFetch } from "@lib/gobit/client"
import { productIdOf } from "@lib/gobit/product-id"
import { getAuthHeaders } from "./cookies"

export type StoreQuestion = {
  id: string
  customer_name: string
  question: string
  answer: string | null
  answered_at: string | null
  created_at: string
}

// dtm'nin ürün soruları (/store/v1/dtm/products/{id}/questions): yanıtlanmış
// sorular herkese açık, soran adı paylaşılmaz.

/** Ürünün yanıtlanmış (herkese açık) sorularını listeler. */
export async function listProductQuestions(productHandle: string): Promise<StoreQuestion[]> {
  const id = await productIdOf(productHandle)
  if (!id) return []

  return gobitData<{ id: string; question: string; answer: string; answered_at?: string | null }[]>(
    `/store/v1/dtm/products/${encodeURIComponent(id)}/questions`,
    { cache: "no-store" }
  )
    .then((qs) =>
      qs.map((q) => ({
        id: q.id,
        customer_name: "Müşteri",
        question: q.question,
        answer: q.answer || null,
        answered_at: q.answered_at ?? null,
        created_at: q.answered_at ?? "",
      }))
    )
    .catch(() => [])
}

/** Ürün sorusu gönderir (satıcı yanıtlayınca yayınlanır). */
export async function submitProductQuestion(input: {
  product_handle: string
  question: string
  name: string
  email?: string
}): Promise<{ success: boolean; error: string | null }> {
  const id = await productIdOf(input.product_handle)
  if (!id) return { success: false, error: "Ürün bulunamadı." }
  try {
    await gobitFetch(`/store/v1/dtm/products/${encodeURIComponent(id)}/questions`, {
      method: "POST",
      headers: await getAuthHeaders(),
      body: { customer_name: input.name, customer_email: input.email ?? "", question: input.question },
    })
    return { success: true, error: null }
  } catch (e: any) {
    return { success: false, error: e?.message || String(e) }
  }
}
