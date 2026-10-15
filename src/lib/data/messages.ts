"use server"

import { gobitData, gobitFetch } from "@lib/gobit/client"
import { getAuthHeaders } from "./cookies"

export type StoreConversationSummary = {
  id: string
  seller: { id: string; name: string; handle: string }
  order_display_id: number | null
  subject: string | null
  status: string
  last_message_at: string | null
  last_message_preview: string | null
  last_sender_type: "customer" | "seller" | null
  unread: number
}

export type StoreConversationMessage = {
  id: string
  sender_type: "customer" | "seller"
  body: string
  created_at: string
}

export type StoreConversationDetail = {
  id: string
  subject: string | null
  order_display_id: number | null
  status: string
}

// dtm'nin konuşmaları (/store/v1/dtm/threads): her konuşma oturumdaki
// müşterinin hesabınındır; başkasınınkine "yok" denir.

type DtmThread = {
  id: string
  subject: string
  status: string
  last_message_at: string | null
  seller: { id: string; name: string; handle: string }
  unread: number
  last_message_preview: string | null
  last_sender_type: "customer" | "seller" | null
}

/** Giriş yapmış müşterinin tüm konuşmaları (son mesaja göre sıralı). */
export async function listConversations(): Promise<{
  conversations: StoreConversationSummary[]
  unread_total: number
}> {
  const headers = await getAuthHeaders()
  if (!headers.cookie) return { conversations: [], unread_total: 0 }

  return gobitData<DtmThread[]>("/store/v1/dtm/threads", { headers, cache: "no-store" })
    .then((ts) => ({
      conversations: ts.map((t) => ({
        id: t.id,
        seller: t.seller,
        order_display_id: null,
        subject: t.subject || null,
        status: t.status,
        last_message_at: t.last_message_at,
        last_message_preview: t.last_message_preview,
        last_sender_type: t.last_sender_type,
        unread: t.unread,
      })),
      unread_total: ts.reduce((n, t) => n + t.unread, 0),
    }))
    .catch(() => ({ conversations: [], unread_total: 0 }))
}

/** Bir konuşmanın mesajları; açılınca satıcının notları okundu işaretlenir. */
export async function getConversationMessages(id: string): Promise<{
  conversation: StoreConversationDetail | null
  messages: StoreConversationMessage[]
}> {
  const headers = await getAuthHeaders()
  if (!headers.cookie) return { conversation: null, messages: [] }
  const path = `/store/v1/dtm/threads/${encodeURIComponent(id)}`
  try {
    const [messages, list] = await Promise.all([
      gobitData<{ id: string; side: "customer" | "seller"; body: string; created_at: string }[]>(path, {
        headers,
        cache: "no-store",
      }),
      gobitData<DtmThread[]>("/store/v1/dtm/threads", { headers, cache: "no-store" }),
    ])
    await gobitFetch(`${path}/read`, { method: "POST", headers }).catch(() => {})
    const head = list.find((t) => t.id === id)

    return {
      conversation: head ? { id, subject: head.subject || null, order_display_id: null, status: head.status } : null,
      messages: messages.map((m) => ({ id: m.id, sender_type: m.side, body: m.body, created_at: m.created_at })),
    }
  } catch {
    return { conversation: null, messages: [] }
  }
}

/** Mevcut bir konuşmaya mesaj gönder. */
export async function sendMessage(
  id: string,
  body: string
): Promise<{ success: boolean; error: string | null; message: StoreConversationMessage | null }> {
  try {
    const m = await gobitData<{ id: string; side: "customer" | "seller"; body: string; created_at: string }>(
      `/store/v1/dtm/threads/${encodeURIComponent(id)}`,
      { method: "POST", headers: await getAuthHeaders(), body: { body } }
    )
    return { success: true, error: null, message: { id: m.id, sender_type: m.side, body: m.body, created_at: m.created_at } }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e), message: null }
  }
}

/** Satıcıyla konuşma başlat (varsa aynı konuşma) ve ilk mesajı yaz. Giriş gerekir. */
export async function startConversation(input: {
  seller_handle?: string
  seller_id?: string
  order_id?: string
  subject?: string
  message: string
}): Promise<{ success: boolean; error: string | null; conversationId?: string }> {
  const headers = await getAuthHeaders()
  if (!headers.cookie) return { success: false, error: "Mesaj göndermek için giriş yapın." }
  try {
    const th = await gobitData<{ id: string }>("/store/v1/dtm/threads", {
      method: "POST",
      headers,
      body: {
        ...(input.seller_id ? { seller_id: input.seller_id } : { seller_handle: input.seller_handle }),
        subject: input.subject ?? "",
        message: input.message,
      },
    })
    return { success: true, error: null, conversationId: th.id }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) }
  }
}
