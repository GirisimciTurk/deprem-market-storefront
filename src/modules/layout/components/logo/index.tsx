import React from "react"

interface LogoProps {
  className?: string
  iconOnly?: boolean
}

/**
 * depremTek marka logosu — "dT" monogramı (turuncu d + 3D mavi T) + wordmark.
 * Turuncu #F08C1A (ana), Mavi #1C5DA9 (ikincil), koyu mavi #143F73 (3D yüz).
 */
export default function Logo({ className = "", iconOnly = false }: LogoProps) {
  return (
    <div className={`flex items-center gap-x-2.5 select-none ${className}`}>
      <svg
        width="40"
        height="40"
        viewBox="0 0 52 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
        aria-hidden="true"
      >
        {/* d — turuncu bowl (halka) */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M17 17a11 11 0 1 0 0 22 11 11 0 0 0 0-22Zm0 6.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Z"
          fill="#F08C1A"
        />
        {/* d — turuncu dikey gövde (ascender) */}
        <rect x="24" y="5" width="6.5" height="34" rx="2" fill="#F08C1A" />
        {/* T — 3D koyu mavi yan yüz (derinlik) */}
        <path d="M34 8h15l-3.5 3.5H37.5z" fill="#143F73" />
        <path d="M37.5 11.5h4v27l-4 3.5z" fill="#143F73" />
        {/* T — mavi ön yüz */}
        <rect x="31" y="8" width="15" height="6.5" rx="1.2" fill="#1C5DA9" />
        <rect x="35" y="8" width="6.5" height="31" rx="1.2" fill="#1C5DA9" />
      </svg>

      {!iconOnly && (
        <span className="text-2xl font-extrabold tracking-tight lowercase leading-none">
          <span className="text-brand-600">deprem</span>
          <span className="text-brandblue-600">Tek</span>
        </span>
      )}
    </div>
  )
}
