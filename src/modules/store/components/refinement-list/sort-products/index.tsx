"use client"

import { useState, useRef, useEffect } from "react"
import { clx } from "@modules/common/components/ui"

export type SortOptions = "price_asc" | "price_desc" | "created_at"

type SortProductsProps = {
  sortBy: SortOptions
  setQueryParams: (name: string, value: SortOptions) => void
  "data-testid"?: string
}

const sortOptions = [
  {
    value: "created_at" as const,
    label: "En Yeniler",
  },
  {
    value: "price_asc" as const,
    label: "Fiyat: Düşükten Yükseğe",
  },
  {
    value: "price_desc" as const,
    label: "Fiyat: Yüksekten Düşüğe",
  },
]

const SortProducts = ({
  "data-testid": dataTestId,
  sortBy,
  setQueryParams,
}: SortProductsProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleChange = (value: SortOptions) => {
    setQueryParams("sortBy", value)
    setIsOpen(false)
  }

  const selectedOption = sortOptions.find((opt) => opt.value === sortBy) || sortOptions[0]

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div 
      ref={dropdownRef} 
      className="relative w-full max-w-[280px]" 
      data-testid={dataTestId}
    >
      <span className="text-2xs uppercase text-ui-fg-muted font-bold block mb-1.5 tracking-wider">
        Sıralama
      </span>
      
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white border border-ui-border-base rounded-xl px-4 py-2.5 text-xs font-semibold text-ui-fg-base hover:bg-gray-50 focus:outline-none transition-all shadow-sm"
      >
        <span>{selectedOption.label}</span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className={clx("text-ui-fg-muted transition-transform duration-200", {
            "transform rotate-180": isOpen,
          })}
        >
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>

      {/* Dropdown Options List */}
      {isOpen && (
        <div className="absolute left-0 right-0 z-35 mt-1.5 bg-white border border-ui-border-base rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          <ul className="py-1">
            {sortOptions.map((option) => {
              const active = option.value === sortBy
              return (
                <li key={option.value}>
                  <button
                    type="button"
                    onClick={() => handleChange(option.value)}
                    className={clx(
                      "w-full text-left px-4 py-2.5 text-xs transition-colors font-bold",
                      {
                        "bg-red-50 text-red-700 font-extrabold flex items-center justify-between": active,
                        "text-ui-fg-subtle hover:bg-gray-50 hover:text-ui-fg-base": !active,
                      }
                    )}
                  >
                    <span>{option.label}</span>
                    {active && <span className="text-red-650 font-bold">✓</span>}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

export default SortProducts
