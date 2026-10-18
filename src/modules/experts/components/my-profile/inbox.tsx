"use client"

import { useState } from "react"
import { Mail, Phone, Inbox as InboxIcon } from "lucide-react"
import { moveInboxRequest, type InboxRequest } from "@lib/data/my-expert"

const STATUS: Record<InboxRequest["status"], { label: string; cls: string }> = {
  new: { label: "Yeni", cls: "bg-brand-50 text-brand-700 border-brand-200" },
  read: { label: "Okundu", cls: "bg-ui-bg-subtle text-ui-fg-subtle border-ui-border-base" },
  closed: { label: "Kapatıldı", cls: "bg-ui-bg-subtle text-ui-fg-muted border-ui-border-base" },
}

function fmt(iso: string) {
  const d = new Date(iso)
  return isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })
}

/** Karta "Talep Bırak" ile gelen talepler: oku, ara/yaz, kapat. */
export default function ExpertInbox({ initial }: { initial: InboxRequest[] }) {
  const [items, setItems] = useState(initial)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [showClosed, setShowClosed] = useState(false)

  const move = async (id: string, status: "read" | "closed") => {
    setBusy(id)
    setError("")
    const res = await moveInboxRequest(id, status)
    setBusy(null)
    if (!res.ok) {
      setError(res.error)
      return
    }
    setItems((xs) => xs.map((x) => (x.id === id ? { ...x, status } : x)))
  }

  const open = items.filter((x) => x.status !== "closed")
  const closed = items.filter((x) => x.status === "closed")
  const shown = showClosed ? items : open

  return (
    <section id="talepler" className="scroll-mt-24 rounded-2xl border border-ui-border-base bg-ui-bg-base shadow-sm">
      <header className="flex items-center justify-between gap-3 border-b border-ui-border-base px-5 py-4 sm:px-6">
        <div>
          <h2 className="font-bold text-ui-fg-base">Gelen talepler</h2>
          <p className="text-xs text-ui-fg-muted">
            Profilinizdeki &quot;Talep Bırak&quot; formundan gelenler. Size e-posta ile de bildirilir.
          </p>
        </div>
        {closed.length > 0 && (
          <button
            type="button"
            onClick={() => setShowClosed((v) => !v)}
            className="shrink-0 text-xs font-semibold text-brand-600 hover:underline"
          >
            {showClosed ? "Kapatılanları gizle" : `Kapatılanlar (${closed.length})`}
          </button>
        )}
      </header>
      <div className="px-5 py-4 sm:px-6">
        {error && (
          <p className="mb-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
        {shown.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center text-sm text-ui-fg-muted">
            <InboxIcon className="mb-2 h-8 w-8 text-ui-fg-muted" />
            Açık talep yok.
          </div>
        ) : (
          <ul className="space-y-3">
            {shown.map((r) => (
              <li
                key={r.id}
                className={`rounded-xl border p-4 ${
                  r.status === "new" ? "border-brand-200 bg-brand-50/40" : "border-ui-border-base"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-ui-fg-base">{r.sender_name}</span>
                    <span className={`rounded-full border px-2 py-0.5 text-[0.66rem] font-semibold ${STATUS[r.status].cls}`}>
                      {STATUS[r.status].label}
                    </span>
                  </div>
                  <time className="text-xs text-ui-fg-muted" dateTime={r.created_at}>
                    {fmt(r.created_at)}
                  </time>
                </div>
                {(r.topic || r.city) && (
                  <p className="mt-1 text-xs text-ui-fg-muted">{[r.topic, r.city].filter(Boolean).join(" · ")}</p>
                )}
                {r.message && (
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ui-fg-subtle">{r.message}</p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {r.phone && (
                    <a
                      href={`tel:${r.phone.replace(/\s/g, "")}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-700"
                    >
                      <Phone className="h-3.5 w-3.5" /> {r.phone}
                    </a>
                  )}
                  {r.email && (
                    <a
                      href={`mailto:${r.email}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-ui-border-base px-3 py-1.5 text-xs font-bold text-ui-fg-base hover:border-brand-400"
                    >
                      <Mail className="h-3.5 w-3.5" /> E-posta
                    </a>
                  )}
                  <span className="ml-auto flex gap-2">
                    {r.status === "new" && (
                      <button
                        type="button"
                        disabled={busy === r.id}
                        onClick={() => move(r.id, "read")}
                        className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-ui-fg-subtle hover:bg-ui-bg-subtle disabled:opacity-50"
                      >
                        Okundu
                      </button>
                    )}
                    {r.status !== "closed" && (
                      <button
                        type="button"
                        disabled={busy === r.id}
                        onClick={() => move(r.id, "closed")}
                        className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-ui-fg-subtle hover:bg-ui-bg-subtle disabled:opacity-50"
                      >
                        Kapat
                      </button>
                    )}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
