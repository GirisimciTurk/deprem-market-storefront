import React from "react"

interface LogoProps {
  className?: string
  iconOnly?: boolean
}

export default function Logo({ className = "", iconOnly = false }: LogoProps) {
  return (
    <div className={`flex items-center gap-x-3 select-none ${className}`}>
      {/* SVG Icon: Shield with Seismic Wave & Structural Pillar */}
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-rose-600 flex-shrink-0"
      >
        {/* Shield outline representing protection */}
        <path
          d="M18 3L4 9V17C4 24.5 9.5 31.5 18 33C26.5 31.5 32 24.5 32 17V9L18 3Z"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="#FFF1F2"
        />
        {/* Seismic Pulse / Fault Line */}
        <path
          d="M9 19H13L16 12L20 24L23 16L25 19H27"
          stroke="#E11D48"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Safety Anchor Point */}
        <circle cx="18" cy="7" r="2" fill="#E11D48" />
      </svg>

      {!iconOnly && (
        <div className="flex flex-col items-start leading-none">
          <span className="text-xs font-semibold text-ui-fg-subtle tracking-wider uppercase">
            EKYP
          </span>
          <span className="text-lg font-extrabold text-ui-fg-base tracking-tight uppercase">
            DEPREM <span className="text-rose-600">MARKET</span>
          </span>
        </div>
      )}
    </div>
  )
}
