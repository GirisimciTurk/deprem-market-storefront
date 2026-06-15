"use client"

import React, { useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { updateCustomer } from "@lib/data/customer"

type Props = { customer: HttpTypes.StoreCustomer }

type Pref = { key: "comm_sms" | "comm_email" | "comm_phone"; title: string; desc: string }

const PREFS: Pref[] = [
  { key: "comm_sms", title: "Anlık / Kısa Mesaj (SMS)", desc: "Kampanya ve sipariş bilgilendirmelerini SMS ile alın." },
  { key: "comm_email", title: "E-Posta", desc: "Kampanya ve bildirimleri e-posta ile alın." },
  { key: "comm_phone", title: "Telefon Araması", desc: "Önemli durumlarda telefonla aranmayı kabul edin." },
]

const Toggle = ({ on, onClick, disabled }: { on: boolean; onClick: () => void; disabled?: boolean }) => (
  <button
    type="button"
    role="switch"
    aria-checked={on}
    disabled={disabled}
    onClick={onClick}
    className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
      on ? "bg-brand-600" : "bg-gray-300"
    }`}
  >
    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`} />
  </button>
)

export default function CommunicationPreferences({ customer }: Props) {
  const meta = (customer.metadata || {}) as Record<string, unknown>
  const [prefs, setPrefs] = useState({
    comm_sms: meta.comm_sms === true,
    comm_email: meta.comm_email === true,
    comm_phone: meta.comm_phone === true,
  })
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle")
  const [dirty, setDirty] = useState(false)

  const toggle = (k: keyof typeof prefs) => {
    setPrefs((p) => ({ ...p, [k]: !p[k] }))
    setDirty(true)
    setStatus("idle")
  }

  const save = async () => {
    setStatus("saving")
    try {
      // Mevcut metadata'yı KORU (phone_verified vb.), sadece tercihleri güncelle.
      await updateCustomer({ metadata: { ...meta, ...prefs } as Record<string, unknown> })
      setStatus("success")
      setDirty(false)
    } catch {
      setStatus("error")
    }
  }

  return (
    <div className="w-full">
      <div className="flex flex-col mb-4">
        <span className="uppercase text-ui-fg-base text-small-regular font-semibold">
          İletişim Tercihleri
        </span>
        <p className="text-small-regular text-ui-fg-subtle mt-1 max-w-xl">
          Kampanya ve bildirimler için tercih ettiğiniz iletişim yöntemlerini seçin.
        </p>
      </div>

      <div className="flex flex-col gap-y-1 border border-ui-border-base rounded-lg divide-y divide-ui-border-base">
        {PREFS.map((p) => (
          <div key={p.key} className="flex items-start justify-between gap-4 p-4">
            <div>
              <div className="font-semibold text-sm">{p.title}</div>
              <div className="text-small-regular text-ui-fg-subtle mt-0.5">{p.desc}</div>
            </div>
            <Toggle on={prefs[p.key]} onClick={() => toggle(p.key)} disabled={status === "saving"} />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 mt-3 justify-end">
        {status === "success" && <span className="text-sm text-green-600">Tercihleriniz kaydedildi.</span>}
        {status === "error" && <span className="text-sm text-red-600">Kaydedilemedi, tekrar deneyin.</span>}
        <button
          type="button"
          onClick={save}
          disabled={!dirty || status === "saving"}
          className="bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white font-semibold py-2 px-5 rounded-lg text-sm transition-colors"
        >
          {status === "saving" ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </div>
    </div>
  )
}
