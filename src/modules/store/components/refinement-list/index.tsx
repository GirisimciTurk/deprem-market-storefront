"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState, useEffect } from "react"
import SortProducts, { SortOptions } from "./sort-products"
import { SHOWCASE_CATEGORIES } from "@lib/showcase"

type RefinementListProps = {
  sortBy: SortOptions
  categoryId?: string
  minPrice?: string
  maxPrice?: string
  inStock?: string
  showcase?: string
  categories?: any[]
  'data-testid'?: string
}

const RefinementList = ({
  sortBy,
  categoryId,
  minPrice,
  maxPrice,
  inStock,
  showcase,
  categories = [],
  'data-testid': dataTestId,
}: RefinementListProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [minInput, setMinInput] = useState(minPrice || "")
  const [maxInput, setMaxInput] = useState(maxPrice || "")

  useEffect(() => {
    setMinInput(minPrice || "")
  }, [minPrice])

  useEffect(() => {
    setMaxInput(maxPrice || "")
  }, [maxPrice])

  const updateQueryParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams)
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null) {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      })
      params.delete("page")
      router.push(`${pathname}?${params.toString()}`)
    },
    [searchParams, pathname, router]
  )

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault()
    updateQueryParams({
      minPrice: minInput ? minInput : null,
      maxPrice: maxInput ? maxInput : null,
    })
  }

  const handlePriceClear = () => {
    setMinInput("")
    setMaxInput("")
    updateQueryParams({
      minPrice: null,
      maxPrice: null,
    })
  }

  const handleCategoryToggle = (id: string) => {
    if (categoryId === id) {
      updateQueryParams({ categoryId: null })
    } else {
      updateQueryParams({ categoryId: id })
    }
  }

  const handleStockToggle = () => {
    updateQueryParams({
      inStock: inStock === "true" ? null : "true",
    })
  }

  const handleShowcaseToggle = (key: string) => {
    updateQueryParams({ showcase: showcase === key ? null : key })
  }

  // SortProducts callback'i (name, value) imzasıyla çağırır → gerçek sıralama
  // değeri İKİNCİ argümandır. Önceden ilk argüman ("sortBy") alınıyordu, bu yüzden
  // URL'e sortBy=sortBy yazılıp sıralama hiç uygulanmıyordu.
  const handleSortChange = (_name: string, value: string) => {
    updateQueryParams({ sortBy: value })
  }

  return (
    <div className="flex flex-col gap-y-6 py-4 mb-8 pl-4 pr-4 small:pr-0 small:pl-6 small:min-w-[280px] w-full small:w-[280px] shrink-0">
      
      {/* 1. Sıralama Seçenekleri */}
      <div className="bg-slate-50/40 p-5 rounded-2xl border border-slate-200/60">
        <SortProducts sortBy={sortBy} setQueryParams={handleSortChange} data-testid={dataTestId} />
      </div>

      {/* 2. Kategoriler */}
      {categories.length > 0 && (
        <div className="bg-slate-50/40 p-5 rounded-2xl border border-slate-200/60 flex flex-col gap-y-3">
          <span className="text-xs font-bold text-slate-600 tracking-wider uppercase">Kategoriler</span>
          <div className="flex flex-col gap-y-1 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
            {categories.map((cat) => {
              const isSelected = categoryId === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryToggle(cat.id)}
                  className={`flex items-center justify-between text-left text-sm py-2 px-3 rounded-xl transition-all duration-200 select-none ${
                    isSelected
                      ? "bg-brand-600 text-white font-semibold shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span>{cat.name}</span>
                  {isSelected && (
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-md font-bold">Aktif</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Vitrin Kategorileri (sabit) — tekli seç/kaldır → ?showcase=<key> */}
      <div className="bg-slate-50/40 p-5 rounded-2xl border border-slate-200/60 flex flex-col gap-y-3">
        <span className="text-xs font-bold text-slate-600 tracking-wider uppercase">Vitrin Kategorileri</span>
        <div className="flex flex-col gap-y-1">
          {SHOWCASE_CATEGORIES.map((sc) => {
            const isSelected = showcase === sc.key
            return (
              <button
                key={sc.key}
                onClick={() => handleShowcaseToggle(sc.key)}
                className={`flex items-center gap-x-2 text-left text-sm py-2 px-3 rounded-xl transition-all duration-200 select-none ${
                  isSelected
                    ? "bg-brand-600 text-white font-semibold shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span>{sc.emoji}</span>
                <span className="flex-1">{sc.label}</span>
                {isSelected && (
                  <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-md font-bold">Aktif</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 3. Fiyat Filtresi */}
      <div className="bg-slate-50/40 p-5 rounded-2xl border border-slate-200/60 flex flex-col gap-y-3">
        <span className="text-xs font-bold text-slate-600 tracking-wider uppercase">Fiyat Aralığı</span>
        <form onSubmit={handlePriceApply} className="flex flex-col gap-y-3">
          <div className="flex items-center gap-x-2">
            <input
              type="number"
              placeholder="En az"
              value={minInput}
              onChange={(e) => setMinInput(e.target.value)}
              className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 placeholder-slate-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-slate-600">-</span>
            <input
              type="number"
              placeholder="En çok"
              value={maxInput}
              onChange={(e) => setMaxInput(e.target.value)}
              className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 placeholder-slate-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <div className="flex gap-x-2">
            <button
              type="submit"
              className="flex-1 text-xs font-semibold py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl transition-all duration-200 shadow-sm"
            >
              Uygula
            </button>
            {(minPrice || maxPrice) && (
              <button
                type="button"
                onClick={handlePriceClear}
                className="text-xs font-semibold py-2.5 px-3 border border-slate-200 hover:bg-slate-100 text-slate-500 rounded-xl transition-all duration-200"
              >
                Temizle
              </button>
            )}
          </div>
        </form>
      </div>

      {/* 4. Stok Durumu */}
      <div
        className="bg-slate-50/40 p-5 rounded-2xl border border-slate-200/60 flex items-center justify-between cursor-pointer select-none"
        onClick={handleStockToggle}
      >
        <span className="text-sm font-semibold text-slate-700">Sadece Stoktakiler</span>
        <button
          className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-all duration-300 pointer-events-none ${
            inStock === "true" ? "bg-brand-600 justify-end" : "bg-slate-300 justify-start"
          }`}
        >
          <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
        </button>
      </div>

    </div>
  )
}

export default RefinementList
