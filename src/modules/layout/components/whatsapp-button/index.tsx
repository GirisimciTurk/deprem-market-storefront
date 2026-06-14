"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { clx } from "@modules/common/components/ui"

export default function WhatsAppButton() {
  // Lütfen aşağıdaki telefon numarasını kendi WhatsApp numaranızla güncelleyin.
  // Ülke kodu ile birlikte (örn: 905XXXXXXXXX) yazılmalıdır.
  const whatsappNumber = "905395741904"
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Merhaba,%20deprem%20hazırlık%20ürünleri%20hakkında%20bilgi%20almak%20istiyorum.`

  // Ürün detay sayfalarında mobilde alt sabit "Sepete ekle" çubuğu var;
  // butonu onunla çakışmaması için yukarı kaydır (masaüstünde normal konum).
  const pathname = usePathname()
  const isProductPage = /\/products\//.test(pathname || "")

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={clx(
        "fixed right-6 z-40 flex items-center bg-[#25D366] hover:bg-[#20ba5a] text-white p-3.5 rounded-full shadow-2xl hover:shadow-green-200/50 hover:scale-105 transition-all duration-300 group max-w-xs overflow-hidden",
        isProductPage ? "bottom-28 small:bottom-6" : "bottom-6"
      )}
      aria-label="WhatsApp Destek Hattı"
    >
      {/* Pulsing Green Glow Effect */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-30 group-hover:scale-110 transition-transform animate-ping pointer-events-none" />

      {/* WhatsApp SVG Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        fill="currentColor"
        className="w-7 h-7 relative z-10 shrink-0"
      >
        <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.129 6.744 3.047 9.379L1.054 30.27a1 1 0 001.222 1.222l4.891-1.993A15.924 15.924 0 0016.004 32C24.826 32 32 24.824 32 16S24.826 0 16.004 0zm9.335 22.594c-.387 1.09-1.929 1.996-3.158 2.26-.84.18-1.937.322-5.631-1.21-4.725-1.959-7.763-6.748-7.998-7.062-.225-.314-1.893-2.521-1.893-4.81s1.197-3.413 1.623-3.879c.348-.383.924-.576 1.475-.576.178 0 .338.009.482.017.426.018.64.044.92.716.35.84 1.204 2.935 1.31 3.15.107.215.215.502.068.779-.138.283-.26.459-.476.709-.214.25-.42.44-.635.709-.195.234-.414.486-.178.912.236.42 1.05 1.732 2.254 2.808 1.549 1.383 2.854 1.813 3.26 2.012.308.15.674.126.918-.143.31-.348.693-.926 1.082-1.496.277-.406.625-.459.965-.314.344.138 2.18 1.028 2.555 1.215.375.188.625.281.717.437.09.155.09.902-.297 1.992z"/>
      </svg>

      {/* Expandable text label on hover */}
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-3 transition-all duration-500 ease-in-out whitespace-nowrap text-sm font-bold tracking-wide relative z-10 select-none">
        WhatsApp Destek
      </span>
    </a>
  )
}
