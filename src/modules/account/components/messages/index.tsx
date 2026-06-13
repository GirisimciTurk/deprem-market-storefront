"use client"

import React, { useState, useEffect, useTransition } from "react"
import {
  getConversationMessages,
  sendMessage,
  type StoreConversationSummary,
  type StoreConversationMessage,
  type StoreConversationDetail,
} from "@lib/data/messages"

type MessagesProps = {
  initialConversations: StoreConversationSummary[]
  labels: {
    empty: string
    emptyHint: string
    selectPrompt: string
    placeholder: string
    send: string
    sending: string
    you: string
    seller: string
    order: string
    sendError: string
    loading: string
  }
}

const fmtDate = (d: string | null) => {
  if (!d) return ""
  try {
    return new Date(d).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return ""
  }
}

export default function Messages({
  initialConversations,
  labels,
}: MessagesProps) {
  const [conversations, setConversations] = useState(initialConversations)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [detail, setDetail] = useState<StoreConversationDetail | null>(null)
  const [messages, setMessages] = useState<StoreConversationMessage[]>([])
  const [draft, setDraft] = useState("")
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [loadingThread, startLoad] = useTransition()

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null

  const openConversation = (id: string) => {
    setActiveId(id)
    setSendError(null)
    setMessages([])
    setDetail(null)
    // Açınca okunmamış rozetini local olarak da sıfırla
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
    )
    startLoad(async () => {
      const res = await getConversationMessages(id)
      setDetail(res.conversation)
      setMessages(res.messages)
    })
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    const body = draft.trim()
    if (!body || sending || !activeId) return

    setSending(true)
    setSendError(null)
    const res = await sendMessage(activeId, body)
    setSending(false)

    if (!res.success || !res.message) {
      setSendError(labels.sendError)
      return
    }

    const sent = res.message
    setMessages((prev) => [...prev, sent])
    setDraft("")
    // Listeyi güncelle: önizleme + en üste taşı
    setConversations((prev) => {
      const updated = prev.map((c) =>
        c.id === activeId
          ? {
              ...c,
              last_message_at: sent.created_at,
              last_message_preview: sent.body,
              last_sender_type: sent.sender_type,
              unread: 0,
            }
          : c
      )
      return [...updated].sort((a, b) => {
        const ta = a.last_message_at ? Date.parse(a.last_message_at) : 0
        const tb = b.last_message_at ? Date.parse(b.last_message_at) : 0
        return tb - ta
      })
    })
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-16 bg-ui-bg-subtle rounded-2xl border border-ui-border-base border-dashed">
        <span className="text-5xl mb-4 block">💬</span>
        <h3 className="font-bold text-ui-fg-base text-sm sm:text-base mb-1">
          {labels.empty}
        </h3>
        <p className="text-2xs sm:text-xs text-ui-fg-muted max-w-sm mx-auto">
          {labels.emptyHint}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 border border-ui-border-base rounded-2xl overflow-hidden bg-ui-bg-subtle min-h-[28rem]">
      {/* Konuşma listesi */}
      <div
        className={`md:col-span-5 lg:col-span-4 border-ui-border-base md:border-r divide-y divide-ui-border-base bg-ui-bg-base ${
          activeId ? "hidden md:block" : "block"
        }`}
      >
        {conversations.map((c) => {
          const isActive = c.id === activeId
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => openConversation(c.id)}
              className={`w-full text-left px-4 py-3.5 transition-colors hover:bg-ui-bg-subtle ${
                isActive ? "bg-orange-50" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-ui-fg-base text-sm truncate">
                  {c.seller?.name ?? labels.seller}
                </span>
                <div className="flex items-center gap-x-2 flex-shrink-0">
                  {c.unread > 0 && (
                    <span className="bg-orange-650 text-white text-3xs font-extrabold min-w-[1.25rem] h-5 px-1.5 rounded-full inline-flex items-center justify-center">
                      {c.unread}
                    </span>
                  )}
                  <span className="text-3xs text-ui-fg-muted">
                    {fmtDate(c.last_message_at)}
                  </span>
                </div>
              </div>
              {c.subject && (
                <span className="block text-2xs text-ui-fg-subtle font-semibold mt-0.5 truncate">
                  {c.subject}
                </span>
              )}
              {c.order_display_id != null && (
                <span className="block text-3xs text-ui-fg-muted mt-0.5">
                  {labels.order} #{c.order_display_id}
                </span>
              )}
              {c.last_message_preview && (
                <span
                  className={`block text-2xs mt-1 truncate ${
                    c.unread > 0
                      ? "text-ui-fg-base font-semibold"
                      : "text-ui-fg-muted"
                  }`}
                >
                  {c.last_sender_type === "customer" ? `${labels.you}: ` : ""}
                  {c.last_message_preview}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Seçili thread */}
      <div
        className={`md:col-span-7 lg:col-span-8 flex flex-col bg-ui-bg-subtle ${
          activeId ? "flex" : "hidden md:flex"
        }`}
      >
        {!activeId ? (
          <div className="flex-1 flex items-center justify-center text-center p-8 text-ui-fg-muted text-sm">
            {labels.selectPrompt}
          </div>
        ) : (
          <>
            <div className="px-4 py-3 border-b border-ui-border-base bg-ui-bg-base flex items-center gap-x-2">
              <button
                type="button"
                onClick={() => setActiveId(null)}
                className="md:hidden text-ui-fg-muted hover:text-ui-fg-base"
                aria-label="Geri"
              >
                ←
              </button>
              <div className="min-w-0">
                <h3 className="font-bold text-ui-fg-base text-sm truncate">
                  {activeConversation?.seller?.name ?? labels.seller}
                </h3>
                {(detail?.subject || activeConversation?.subject) && (
                  <p className="text-2xs text-ui-fg-muted truncate">
                    {detail?.subject || activeConversation?.subject}
                  </p>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 max-h-[24rem]">
              {loadingThread ? (
                <p className="text-center text-xs text-ui-fg-muted py-8">
                  {labels.loading}
                </p>
              ) : (
                messages.map((m) => {
                  const mine = m.sender_type === "customer"
                  return (
                    <div
                      key={m.id}
                      className={`flex ${mine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-3.5 py-2 ${
                          mine
                            ? "bg-orange-650 text-white rounded-br-sm"
                            : "bg-ui-bg-base border border-ui-border-base text-ui-fg-base rounded-bl-sm"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                          {m.body}
                        </p>
                        <span
                          className={`block text-3xs mt-1 ${
                            mine ? "text-white/70" : "text-ui-fg-muted"
                          }`}
                        >
                          {fmtDate(m.created_at)}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <form
              onSubmit={handleSend}
              className="border-t border-ui-border-base bg-ui-bg-base p-3 flex items-end gap-x-2"
            >
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={labels.placeholder}
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSend(e)
                  }
                }}
                className="flex-1 resize-none bg-ui-bg-subtle border border-ui-border-base rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all max-h-32"
              />
              <button
                type="submit"
                disabled={sending || !draft.trim()}
                className="bg-orange-650 hover:bg-orange-700 text-white font-bold py-2 px-5 rounded-xl text-sm transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex-shrink-0"
              >
                {sending ? labels.sending : labels.send}
              </button>
            </form>
            {sendError && (
              <p className="text-xs font-semibold text-red-600 px-4 pb-3">
                {sendError}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
