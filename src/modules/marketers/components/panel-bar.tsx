"use client"

import { useState, useTransition } from "react"
import { useParams } from "next/navigation"
import { marketerSignOut } from "@lib/data/marketer"

/** Panelin üst şeridi: hesap, başvuru bağlantısını kopyalama ve çıkış. */
export default function MarketerPanelBar({ email, link }: { email: string; link: string }) {
  const { countryCode } = useParams() as { countryCode: string }
  const [isPending, startTransition] = useTransition()
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* pano kapalı: bağlantı alanından seçilir */
    }
  }

  return (
    <div className="rounded-xl border border-ui-border-base bg-ui-bg-subtle p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ui-fg-subtle">
          Pazarlamacı hesabı: <strong className="text-ui-fg-base">{email}</strong>
        </p>
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => marketerSignOut(countryCode))}
          className="text-xs font-semibold text-brand-600 hover:underline disabled:opacity-60"
        >
          Çıkış Yap
        </button>
      </div>
      <div className="flex gap-2">
        <input
          readOnly
          value={link}
          onFocus={(e) => e.currentTarget.select()}
          aria-label="Satıcı başvuru bağlantınız"
          className="min-w-0 flex-1 rounded-lg border border-ui-border-base bg-white px-3 py-2 font-mono text-xs"
        />
        <button
          type="button"
          onClick={copy}
          className="shrink-0 rounded-lg bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700"
        >
          {copied ? "Kopyalandı" : "Kopyala"}
        </button>
      </div>
    </div>
  )
}
