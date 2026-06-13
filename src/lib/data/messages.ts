"use server"

import { sdk } from "@lib/config"
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

/** Giriş yapmış müşterinin tüm konuşmaları (son mesaja göre sıralı). */
export async function listConversations(): Promise<{
  conversations: StoreConversationSummary[]
  unread_total: number
}> {
  const headers = { ...(await getAuthHeaders()) }
  return sdk.client
    .fetch<{
      conversations: StoreConversationSummary[]
      unread_total: number
    }>(`/store/conversations`, {
      method: "GET",
      headers,
      cache: "no-store",
    })
    .then((r) => ({
      conversations: r.conversations ?? [],
      unread_total: r.unread_total ?? 0,
    }))
    .catch(() => ({ conversations: [], unread_total: 0 }))
}

/** Bir konuşmanın mesajları (açınca müşteri okunmamışı backend'de sıfırlanır). */
export async function getConversationMessages(id: string): Promise<{
  conversation: StoreConversationDetail | null
  messages: StoreConversationMessage[]
}> {
  const headers = { ...(await getAuthHeaders()) }
  return sdk.client
    .fetch<{
      conversation: StoreConversationDetail
      messages: StoreConversationMessage[]
    }>(`/store/conversations/${id}/messages`, {
      method: "GET",
      headers,
      cache: "no-store",
    })
    .then((r) => ({
      conversation: r.conversation ?? null,
      messages: r.messages ?? [],
    }))
    .catch(() => ({ conversation: null, messages: [] }))
}

/** Mevcut bir konuşmaya mesaj gönder. */
export async function sendMessage(
  id: string,
  body: string
): Promise<{
  success: boolean
  error: string | null
  message: StoreConversationMessage | null
}> {
  const headers = { ...(await getAuthHeaders()) }
  try {
    const res = await sdk.client.fetch<{ message: StoreConversationMessage }>(
      `/store/conversations/${id}/messages`,
      {
        method: "POST",
        headers,
        body: { body },
      }
    )
    return { success: true, error: null, message: res.message ?? null }
  } catch (e) {
    return { success: false, error: String(e), message: null }
  }
}

/** Satıcıyla yeni bir konuşma başlat (get-or-create + ilk mesaj). */
export async function startConversation(input: {
  seller_handle?: string
  seller_id?: string
  order_id?: string
  subject?: string
  message: string
}): Promise<{ success: boolean; error: string | null; conversationId?: string }> {
  const headers = { ...(await getAuthHeaders()) }
  try {
    const res = await sdk.client.fetch<{
      conversation: { id: string; status: string }
    }>(`/store/conversations`, {
      method: "POST",
      headers,
      body: input,
    })
    return { success: true, error: null, conversationId: res.conversation?.id }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}
