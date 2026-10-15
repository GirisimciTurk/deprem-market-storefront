"use client"

import { useState } from "react"

export type SellerContract = {
  id: string
  title: string
  version: number
  body: string
  required?: boolean
}

/**
 * Pazaryeri sözleşmeleri (dtm /store/v1/dtm/contracts): başvuru öncesi okunup
 * kabul edilir. Bayilik ve firma başvuru formları ortak kullanır.
 */
export default function SellerContracts({
  contracts,
  accepted,
  setAccepted,
  disabled,
  title = "Bayilik Sözleşmeleri",
}: {
  contracts: SellerContract[]
  accepted: boolean
  setAccepted: (v: boolean) => void
  disabled?: boolean
  title?: string
}) {
  const [viewing, setViewing] = useState<SellerContract | null>(null)
  const status = disabled ? "loading" : "idle"

  return (
    <>
      {contracts.length > 0 && (
        <div className="border border-ui-border-base rounded-lg p-4 bg-ui-bg-subtle">
          <p className="text-xs font-bold text-ui-fg-base uppercase tracking-wider mb-2">
            {title} <span className="text-brand-500">*</span>
          </p>
          <p className="text-xs text-ui-fg-subtle mb-3">
            Bayi olmak için aşağıdaki sözleşmeleri okuyup onaylamanız
            gerekmektedir. Başvurunuz onaylandıktan sonra bayilik panelinde, kimlik
            ve IP bilgilerinizle birlikte bağlayıcı dijital onayınız ayrıca alınır.
          </p>
          <ul className="space-y-1.5 mb-3">
            {contracts.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-2">
                <span className="text-sm text-ui-fg-base">{c.title}</span>
                <button
                  type="button"
                  onClick={() => setViewing(c)}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 underline shrink-0"
                >
                  Görüntüle
                </button>
              </li>
            ))}
          </ul>
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={accepted}
              disabled={status === "loading"}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-brand-600"
            />
            <span className="text-sm text-ui-fg-base">
              Yukarıdaki sözleşmeleri okudum, anladım ve kabul ediyorum.
            </span>
          </label>
        </div>
      )}

      {viewing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setViewing(null)}
        >
          <div
            className="bg-ui-bg-base rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-ui-border-base px-5 py-3">
              <h4 className="text-sm font-bold text-ui-fg-base pr-4">
                {viewing.title}{" "}
                <span className="text-ui-fg-subtle font-normal">
                  (v{viewing.version})
                </span>
              </h4>
              <button
                type="button"
                onClick={() => setViewing(null)}
                aria-label="Kapat"
                className="text-ui-fg-subtle hover:text-ui-fg-base text-xl leading-none shrink-0"
              >
                ×
              </button>
            </div>
            <div
              className="overflow-y-auto px-5 py-4 prose prose-sm max-w-none text-sm leading-relaxed [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-1 [&_h3]:font-semibold [&_h3]:mt-3 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1 [&_p]:mb-2"
              dangerouslySetInnerHTML={{ __html: viewing.body }}
            />
            <div className="border-t border-ui-border-base px-5 py-3 flex justify-end">
              <button
                type="button"
                onClick={() => setViewing(null)}
                className="bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2 px-5 rounded-lg text-sm"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  )
}
