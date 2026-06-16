"use client"

import { Home, Briefcase, MapPin } from "lucide-react"
import { useState } from "react"
import Input from "@modules/common/components/input"

// Hepsiburada/Trendyol tarzı adres etiketi seçici (Ev / İş / Diğer) — ikon kartları
// + gizli `address_name`. add-address ve edit-address-modal ortak kullanır.
const LABELS = [
  { value: "Ev", icon: Home },
  { value: "İş", icon: Briefcase },
  { value: "Diğer", icon: MapPin },
] as const

const PRESETS = LABELS.map((l) => l.value) as readonly string[]

export default function AddressLabelPicker({ initial }: { initial?: string | null }) {
  // Mevcut etiket bir preset değilse (ör. "Yazlık") → "Diğer" + custom doldur.
  const initVal = (initial || "").trim()
  const initIsPreset = PRESETS.includes(initVal)
  const [selected, setSelected] = useState<string>(
    initVal ? (initIsPreset ? initVal : "Diğer") : "Ev"
  )
  const [custom, setCustom] = useState(initVal && !initIsPreset ? initVal : "")
  const isOther = selected === "Diğer"
  const value = isOther ? custom || "Diğer" : selected

  return (
    <div className="flex flex-col gap-y-2">
      <span className="text-xs font-semibold text-ui-fg-subtle uppercase tracking-wider">
        Adres Başlığı
      </span>
      <div className="flex gap-2">
        {LABELS.map(({ value: v, icon: Icon }) => (
          <button
            key={v}
            type="button"
            onClick={() => setSelected(v)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-lg border-2 text-sm font-semibold transition-all ${
              selected === v
                ? "border-brand-600 bg-brand-50 text-brand-700"
                : "border-ui-border-base text-ui-fg-subtle hover:border-brand-300"
            }`}
          >
            <Icon size={20} />
            {v}
          </button>
        ))}
      </div>
      {isOther && (
        <Input
          label="Başlık (örn: Yazlık, Annem)"
          name="__custom_label"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
        />
      )}
      <input type="hidden" name="address_name" value={value} />
    </div>
  )
}
