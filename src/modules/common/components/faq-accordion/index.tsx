"use client"

import { useState } from "react"

export interface FaqItem {
  question: string
  answer: string
}

// Yeniden kullanılabilir SSS akordeonu. `items` dışarıdan verilir (SSS sayfası,
// Satıcı Ol sayfası vb.). `defaultOpen` ilk açık olacak soruyu belirler.
export default function FaqAccordion({
  items,
  defaultOpen = 0,
}: {
  items: FaqItem[]
  defaultOpen?: number | null
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpen)

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="space-y-3">
      {items.map((faq, index) => {
        const isOpen = openIndex === index
        return (
          <div
            key={index}
            className="border border-ui-border-base rounded-xl overflow-hidden bg-ui-bg-subtle transition-all duration-300"
          >
            <button
              onClick={() => toggle(index)}
              aria-expanded={isOpen}
              className="w-full flex justify-between items-center px-6 py-4 text-left font-semibold text-ui-fg-base hover:bg-ui-bg-base-hover/50 transition-colors gap-4"
            >
              <span>{faq.question}</span>
              <span
                className={`text-xl transform transition-transform duration-300 ${
                  isOpen ? "rotate-45 text-brand-600" : "text-ui-fg-muted"
                }`}
              >
                +
              </span>
            </button>
            <div
              className={`transition-all duration-300 ease-in-out ${
                isOpen ? "max-h-[800px] border-t border-ui-border-base" : "max-h-0"
              } overflow-hidden`}
            >
              <div className="p-6 text-sm sm:text-base text-ui-fg-subtle leading-relaxed bg-ui-bg-base">
                {faq.answer}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
