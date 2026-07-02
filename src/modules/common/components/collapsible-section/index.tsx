"use client"

import { useState } from "react"

// Uzun bilgi bölümlerini başlığa tıklayınca açılan kartlara çeviren sarmalayıcı
// (FaqAccordion ile aynı görsel dil). İçerik yüksekliği bilinmediği için
// max-h yerine grid-rows animasyonu kullanılır.
export default function CollapsibleSection({
  title,
  subtitle,
  defaultOpen = false,
  children,
}: {
  title: string
  subtitle?: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border border-ui-border-base rounded-2xl bg-ui-bg-subtle overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="w-full flex justify-between items-center px-6 py-5 text-left gap-4 hover:bg-ui-bg-base-hover/50 transition-colors"
      >
        <span>
          <span className="block font-extrabold text-ui-fg-base">{title}</span>
          {subtitle && (
            <span className="block text-xs text-ui-fg-muted mt-1">
              {subtitle}
            </span>
          )}
        </span>
        <span
          className={`text-xl shrink-0 transform transition-transform duration-300 ${
            isOpen ? "rotate-45 text-brand-600" : "text-ui-fg-muted"
          }`}
        >
          +
        </span>
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-6 pb-6 pt-5 border-t border-ui-border-base bg-ui-bg-base">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
