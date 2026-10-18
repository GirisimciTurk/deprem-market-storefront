"use client"

import { useState } from "react"
import { BadgeCheck, EyeOff, MessageSquareReply } from "lucide-react"
import RatingStars from "../rating-stars"
import { replyToExpertReview, type OwnReview } from "@lib/data/my-expert"
import { inputCls } from "./editor-parts"

const REPLY_MAX = 1000

/** Kartıma yazılan değerlendirmeler; her birine bir yanıt yazılır (gihak MyReviews'dan). */
export default function MyReviews({ initial }: { initial: OwnReview[] }) {
  const [items, setItems] = useState(initial)
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  const start = (r: OwnReview) => {
    setEditing(r.id)
    setDraft(r.reply)
    setError("")
  }

  const save = async (id: string, reply: string) => {
    setBusy(true)
    setError("")
    const res = await replyToExpertReview(id, reply.trim())
    setBusy(false)
    if (!res.ok) {
      setError(res.error)
      return
    }
    setItems((xs) => xs.map((x) => (x.id === id ? { ...x, reply: reply.trim() } : x)))
    setEditing(null)
  }

  return (
    <section id="degerlendirmeler" className="scroll-mt-24 rounded-2xl border border-ui-border-base bg-ui-bg-base shadow-sm">
      <header className="border-b border-ui-border-base px-5 py-4 sm:px-6">
        <h2 className="font-bold text-ui-fg-base">Değerlendirmeler</h2>
        <p className="text-xs text-ui-fg-muted">
          Yanıtınız yorumun altında herkese açık görünür. Kısa, saygılı ve somut olun.
        </p>
      </header>
      <div className="px-5 py-4 sm:px-6">
        {items.length === 0 ? (
          <p className="py-6 text-center text-sm text-ui-fg-muted">Henüz değerlendirme yok.</p>
        ) : (
          <ul className="space-y-3">
            {items.map((r) => (
              <li key={r.id} className="rounded-xl border border-ui-border-base p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-ui-fg-base">{r.author_name}</span>
                    {r.verified_job && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[0.66rem] font-semibold text-green-700">
                        <BadgeCheck className="h-3 w-3" /> Doğrulanmış iş
                      </span>
                    )}
                  </div>
                  <RatingStars value={r.rating} />
                </div>
                {r.status === "hidden" && (
                  <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-xs text-amber-800">
                    <EyeOff className="h-3.5 w-3.5" /> Yayından kaldırıldı
                    {r.hidden_reason ? `: ${r.hidden_reason}` : ""}
                  </p>
                )}
                {r.body && <p className="mt-2 whitespace-pre-wrap text-sm text-ui-fg-subtle">{r.body}</p>}

                {editing === r.id ? (
                  <div className="mt-3 space-y-2">
                    <textarea
                      className={`${inputCls} min-h-[90px]`}
                      value={draft}
                      maxLength={REPLY_MAX}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="Teşekkür edin ya da açıklama yapın…"
                      aria-label="Yanıtınız"
                      autoFocus
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={busy || !draft.trim()}
                        onClick={() => save(r.id, draft)}
                        className="rounded-lg bg-brand-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-brand-700 disabled:opacity-50"
                      >
                        {busy ? "Kaydediliyor…" : "Yanıtı yayınla"}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setEditing(null)}
                        className="rounded-lg px-3 py-1.5 text-xs text-ui-fg-subtle hover:bg-ui-bg-subtle"
                      >
                        Vazgeç
                      </button>
                      <span className="ml-auto text-xs text-ui-fg-muted">
                        {draft.length}/{REPLY_MAX}
                      </span>
                    </div>
                  </div>
                ) : r.reply ? (
                  <div className="mt-3 border-l-2 border-brand-200 pl-3">
                    <p className="text-xs font-semibold text-brand-700">Yanıtınız</p>
                    <p className="mt-0.5 whitespace-pre-wrap text-sm text-ui-fg-subtle">{r.reply}</p>
                    <div className="mt-1 flex gap-3 text-xs">
                      <button type="button" onClick={() => start(r)} className="text-ui-fg-muted hover:text-brand-600">
                        Düzenle
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => save(r.id, "")}
                        className="text-ui-fg-muted hover:text-red-600"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => start(r)}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:underline"
                  >
                    <MessageSquareReply className="h-3.5 w-3.5" /> Yanıt yaz
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
        {error && (
          <p className="mt-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
      </div>
    </section>
  )
}
