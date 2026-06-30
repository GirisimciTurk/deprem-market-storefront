"use client"

import { useState } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Search, X } from "lucide-react"
import { ENGINEER_SPECIALIZATIONS } from "@lib/expert-config"

const inputCls =
  "w-full border border-ui-border-base rounded-lg px-3 py-2 bg-ui-bg-base text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"

export default function ExpertFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()

  const [city, setCity] = useState(sp.get("city") ?? "")
  const [district, setDistrict] = useState(sp.get("district") ?? "")
  const [specialization, setSpecialization] = useState(sp.get("specialization") ?? "")
  const [q, setQ] = useState(sp.get("q") ?? "")

  const apply = (overrides?: Record<string, string>) => {
    const next = { city, district, specialization, q, ...overrides }
    const params = new URLSearchParams()
    Object.entries(next).forEach(([k, v]) => {
      if (v && v.trim()) params.set(k, v.trim())
    })
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  const clearAll = () => {
    setCity("")
    setDistrict("")
    setSpecialization("")
    setQ("")
    router.push(pathname)
  }

  const hasActive = !!(city || district || specialization || q)

  return (
    <div className="border border-ui-border-base rounded-2xl bg-ui-bg-subtle p-4 sm:p-5 mb-8">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          apply()
        }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
      >
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="İl (örn. İstanbul)"
          className={inputCls}
        />
        <input
          type="text"
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          placeholder="İlçe (örn. Kadıköy)"
          className={inputCls}
        />
        <select
          value={specialization}
          onChange={(e) => {
            setSpecialization(e.target.value)
            apply({ specialization: e.target.value })
          }}
          className={inputCls}
        >
          <option value="">Tüm uzmanlıklar</option>
          {ENGINEER_SPECIALIZATIONS.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ui-fg-muted" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="İsim ara..."
              className={`${inputCls} pl-9`}
            />
          </div>
          <button
            type="submit"
            className="shrink-0 bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 rounded-lg text-sm transition-colors"
          >
            Ara
          </button>
        </div>
      </form>

      {hasActive && (
        <button
          type="button"
          onClick={clearAll}
          className="mt-3 inline-flex items-center gap-1 text-xs text-ui-fg-muted hover:text-brand-600 transition-colors"
        >
          <X className="w-3.5 h-3.5" /> Filtreleri temizle
        </button>
      )}
    </div>
  )
}
