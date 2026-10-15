"use server"

import { gobitFetch } from "@lib/gobit/client"
import { getOrderHeaders } from "./cookies"

export type StoreReturnReason = {
  id: string
  label: string
  value: string
  description?: string
}

export type ReturnRequestItem = {
  id: string // sipariş kalemi (line item) id
  quantity: number
  reason_id?: string | null
}

// gobit'in mağaza tarafında iade nedeni listesi yok; neden metin olarak iadeye
// yazılır. Liste depremtek'in formundaki seçeneklerdir.
const REASONS: StoreReturnReason[] = [
  { id: "hasarli", value: "hasarli", label: "Ürün hasarlı geldi" },
  { id: "yanlis", value: "yanlis", label: "Yanlış ürün gönderildi" },
  { id: "eksik", value: "eksik", label: "Eksik parça" },
  { id: "beklenti", value: "beklenti", label: "Beklentimi karşılamadı" },
  { id: "vazgectim", value: "vazgectim", label: "Vazgeçtim (cayma hakkı)" },
  { id: "diger", value: "diger", label: "Diğer" },
]

export const listReturnReasons = async (): Promise<StoreReturnReason[]> => REASONS

/** İade talebi (gobit /store/v1/orders/{id}/returns): oturum ya da siparişin jetonu. */
export const createReturnRequest = async (
  orderId: string,
  items: ReturnRequestItem[],
  note?: string
): Promise<{ success: boolean; error: string | null }> => {
  const reasons = Array.from(
    new Set(items.map((i) => REASONS.find((r) => r.id === i.reason_id)?.label).filter(Boolean) as string[])
  )
  try {
    await gobitFetch(`/store/v1/orders/${encodeURIComponent(orderId)}/returns`, {
      method: "POST",
      headers: await getOrderHeaders(orderId),
      body: {
        lines: items.map((i) => ({ order_line_item_id: i.id, quantity: i.quantity })),
        reason: [...reasons, note?.trim()].filter(Boolean).join(" — ").slice(0, 1000),
      },
    })
    return { success: true, error: null }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "İade talebi oluşturulamadı." }
  }
}
