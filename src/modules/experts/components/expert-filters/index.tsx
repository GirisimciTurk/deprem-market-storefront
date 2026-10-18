"use client"

import { useState, useTransition } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Search, X, Loader2 } from "lucide-react"
import { ENGINEER_SPECIALIZATIONS } from "@lib/expert-config"
import { TR_CITIES_DISTRICTS, findCity } from "@lib/util/tr-cities-districts"

const inputCls =
  "w-full border border-ui-border-base rounded-lg px-3 py-2 bg-ui-bg-base text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"

const CITIES = Object.keys(TR_CITIES_DISTRICTS).sort((a, b) => a.localeCompare(b, "tr"))

type Filters = { city: string; district: string; specialization: string; q: string }

// İl/ilçe seçimden gelir: gobit ili 81 il listesinde eşleştirir, yazım hatası
// "sonuç yok" demek olurdu. Seçimler hemen uygulanır; isim araması Enter/Ara ile.
export default function ExpertFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()
  const [pending, startTransition] = useTransition()

  const [filters, setFilters] = useState<Filters>({
    city: findCity(sp.get("city")) ?? "",
    district: sp.get("district") ?? "",
    specialization: sp.get("specialization") ?? "",
    q: sp.get("q") ?? "",
  })

  const districts = filters.city ? TR_CITIES_DISTRICTS[filters.city] ?? [] : []

  // Filtre değişince sayfa başa döner (page parametresi düşer).
  const apply = (patch: Partial<Filters> = {}) => {
    const next = { ...filters, ...patch }
    setFilters(next)
    const params = new URLSearchParams()
    Object.entries(next).forEach(([k, v]) => {
      if (v && v.trim()) params.set(k, v.trim())
    })
    const qs = params.toString()
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    })
  }

  const hasActive = !!(filters.city || filters.district || filters.specialization || filters.q)

  return (
    <div className="border border-ui-border-base rounded-2xl bg-ui-bg-subtle p-4 sm:p-5 mb-8">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault()
          apply()
        }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.4fr] gap-3"
      >
        <label className="sr-only" htmlFor="expert-city">İl</label>
        <select
          id="expert-city"
          value={filters.city}
          onChange={(e) => apply({ city: e.target.value, district: "" })}
          className={inputCls}
        >
          <option value="">Tüm iller</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor="expert-district">İlçe</label>
        <select
          id="expert-district"
          value={filters.district}
          onChange={(e) => apply({ district: e.target.value })}
          disabled={!filters.city}
          className={inputCls}
        >
          <option value="">{filters.city ? "Tüm ilçeler" : "Önce il seçin"}</option>
          {districts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ui-fg-muted" />
            <label className="sr-only" htmlFor="expert-q">İsim ara</label>
            <input
              id="expert-q"
              type="search"
              value={filters.q}
              onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
              placeholder="İsim veya anahtar kelime..."
              maxLength={80}
              className={`${inputCls} pl-9`}
            />
          </div>
          <button
            type="submit"
            className="shrink-0 inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 rounded-lg text-sm transition-colors"
          >
            {pending && <Loader2 className="w-4 h-4 animate-spin" />}
            Ara
          </button>
        </div>
      </form>

      {/* Uzmanlık çipleri */}
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Uzmanlık alanı">
        <Chip
          active={!filters.specialization}
          onClick={() => apply({ specialization: "" })}
        >
          Tümü
        </Chip>
        {ENGINEER_SPECIALIZATIONS.map((s) => (
          <Chip
            key={s.key}
            active={filters.specialization === s.key}
            onClick={() =>
              apply({ specialization: filters.specialization === s.key ? "" : s.key })
            }
          >
            {s.label}
          </Chip>
        ))}
      </div>

      {hasActive && (
        <button
          type="button"
          onClick={() => apply({ city: "", district: "", specialization: "", q: "" })}
          className="mt-3 inline-flex items-center gap-1 text-xs text-ui-fg-muted hover:text-brand-600 transition-colors"
        >
          <X className="w-3.5 h-3.5" /> Filtreleri temizle
        </button>
      )}
    </div>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
        active
          ? "bg-brand-600 border-brand-600 text-white"
          : "bg-ui-bg-base border-ui-border-base text-ui-fg-subtle hover:border-brand-400 hover:text-brand-700"
      }`}
    >
      {children}
    </button>
  )
}
