import React from "react"

/**
 * "Depremzede" maskotu — kasketli, sıcak yüzlü, yanağında küçük yara bandı olan
 * sevimli bir karakter (saf inline SVG, dış görsel bağımlılığı yok). Yuvarlak bir
 * çerçeve içinde baş-omuz görünür; her ölçekte net (vektörel).
 */
export default function Mascot({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="Depremzede maskotu"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Omuz / yaka (mavi mont) */}
      <path d="M22 100c0-15 12-22 28-22s28 7 28 22z" fill="#1C5DA9" />
      <path d="M22 100c0-15 12-22 28-22s28 7 28 22z" fill="url(#dz-collar)" opacity="0.25" />
      {/* Boyun */}
      <rect x="43" y="68" width="14" height="16" rx="7" fill="#E3A876" />
      {/* Kulaklar */}
      <circle cx="27" cy="50" r="6" fill="#F0BC8E" />
      <circle cx="73" cy="50" r="6" fill="#F0BC8E" />
      {/* Yüz */}
      <circle cx="50" cy="48" r="25" fill="#F6C99B" />
      {/* Kasket — kubbe */}
      <path
        d="M24 41C24 19 38 11 50 11s26 8 26 30c0 0-13-6-26-6s-26 6-26 6z"
        fill="#8A5A30"
      />
      <path d="M24 41C24 19 38 11 50 11s26 8 26 30" fill="url(#dz-cap)" opacity="0.35" />
      {/* Kasket — siper (öne doğru) */}
      <path d="M20 42c8 8 30 9 36 3 4-4-2-7-15-7-11 0-19 1-21 4z" fill="#6E4423" />
      {/* Tepe düğmesi */}
      <circle cx="50" cy="15" r="2.6" fill="#6E4423" />
      {/* Kaşlar */}
      <path d="M37 43c3-2.5 8-2.5 11 0" stroke="#5A3A1E" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <path d="M52 43c3-2.5 8-2.5 11 0" stroke="#5A3A1E" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      {/* Gözler */}
      <circle cx="42" cy="51" r="3.4" fill="#3A2A1A" />
      <circle cx="58" cy="51" r="3.4" fill="#3A2A1A" />
      <circle cx="43.2" cy="49.8" r="1.1" fill="#fff" />
      <circle cx="59.2" cy="49.8" r="1.1" fill="#fff" />
      {/* Yanak allığı */}
      <circle cx="35" cy="59" r="4" fill="#F2916B" opacity="0.55" />
      <circle cx="65" cy="59" r="4" fill="#F2916B" opacity="0.55" />
      {/* Gülümseme */}
      <path d="M41 60c5 6 13 6 18 0" stroke="#9A5A33" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      {/* Yara bandı (depremzede dokunuşu, sağ yanak — gözün altında) */}
      <g transform="rotate(22 66 58)">
        <rect x="59.5" y="55" width="13" height="6.5" rx="3.25" fill="#FBE3B3" stroke="#E7C079" strokeWidth="0.8" />
        <line x1="66" y1="55.3" x2="66" y2="61.2" stroke="#E7C079" strokeWidth="0.7" />
        <line x1="62.5" y1="58.2" x2="69.5" y2="58.2" stroke="#E7C079" strokeWidth="0.6" />
      </g>
      <defs>
        <linearGradient id="dz-cap" x1="24" y1="11" x2="76" y2="41" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff" stopOpacity="0.7" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="dz-collar" x1="22" y1="78" x2="78" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}
