import React from "react"

/**
 * "Deprem Savaşçısı" maskotu — baretli, koruyucu gözlüklü, reflektörlü kurtarma
 * yeleği giyen arama-kurtarma görevlisi (saf inline SVG, dış görsel bağımlılığı
 * yok). Yuvarlak bir çerçeve içinde baş-omuz görünür; her ölçekte net (vektörel).
 *
 * ~32px avatar boyutunda da okunması gerektiği için detay bilinçli olarak az ve
 * şekiller iri tutulmuştur; ince çizgi eklerken bu boyutta test et.
 */
export default function Mascot({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="Deprem Savaşçısı maskotu"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Boyun (montun altında kalsın diye önce) */}
      <rect x="43" y="68" width="14" height="16" rx="7" fill="#E3A876" />
      {/* Omuz / mont */}
      <path d="M22 100c0-15 12-22 28-22s28 7 28 22z" fill="#2B3A55" />
      {/* Kurtarma yeleği (hi-vis) */}
      <path d="M31 100c0-11 7-17 19-19 12 2 19 8 19 19z" fill="#E9E13C" />
      {/* Reflektif şerit — ortada yaka açıklığıyla kesilir */}
      <rect x="33" y="92" width="34" height="3.6" rx="1.8" fill="#EDF3F7" opacity="0.9" />
      {/* Yaka açıklığı (montun görünen V'si) */}
      <path d="M50 81l-5 7 5 12 5-12z" fill="#2B3A55" />
      {/* Kulaklar */}
      <circle cx="27" cy="50" r="6" fill="#F0BC8E" />
      <circle cx="73" cy="50" r="6" fill="#F0BC8E" />
      {/* Yüz */}
      <circle cx="50" cy="48" r="25" fill="#F6C99B" />
      {/* Yanak allığı */}
      <circle cx="34" cy="60" r="4" fill="#F2916B" opacity="0.5" />
      <circle cx="66" cy="60" r="4" fill="#F2916B" opacity="0.5" />
      {/* Gülümseme */}
      <path d="M42 61c4.5 5.5 11.5 5.5 16 0" stroke="#9A5A33" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      {/* Gözler — gözlüğün ARDINDA (lens yarı saydam, bakış okunsun) */}
      <circle cx="41" cy="51" r="3.3" fill="#3A2A1A" />
      <circle cx="59" cy="51" r="3.3" fill="#3A2A1A" />
      <circle cx="42.2" cy="49.8" r="1.1" fill="#fff" />
      <circle cx="60.2" cy="49.8" r="1.1" fill="#fff" />
      {/* Koruyucu gözlük — kayış (yalnız yanlarda; ortada lensler var) */}
      <rect x="23" y="48" width="11" height="4.4" rx="2.2" fill="#4A5568" />
      <rect x="66" y="48" width="11" height="4.4" rx="2.2" fill="#4A5568" />
      {/* Lensler — fillOpacity: çerçeve tam opak kalsın diye opacity DEĞİL */}
      <rect x="32" y="45" width="17" height="12" rx="6" fill="#CFE9F7" fillOpacity="0.72" stroke="#4A5568" strokeWidth="1.6" />
      <rect x="51" y="45" width="17" height="12" rx="6" fill="#CFE9F7" fillOpacity="0.72" stroke="#4A5568" strokeWidth="1.6" />
      {/* Köprü */}
      <rect x="47.5" y="49.5" width="5" height="3" rx="1.5" fill="#4A5568" />
      {/* Lens parlaması */}
      <path d="M35 55l6-8" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
      <path d="M54 55l6-8" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
      {/* Baret — siper */}
      <ellipse cx="50" cy="40.5" rx="31" ry="5.5" fill="#C96F0E" />
      {/* Baret — kubbe */}
      <path
        d="M26 41C26 20 37 12 50 12s24 8 24 29c0 0-11-4.5-24-4.5S26 41 26 41z"
        fill="#F08C1A"
      />
      <path d="M26 41C26 20 37 12 50 12s24 8 24 29" fill="url(#dz-hat)" opacity="0.35" />
      {/* Baret — sırt kaburgası */}
      <path d="M50 12c-2.2 6-3 15-2.9 23.6h5.8C53 27 52.2 18 50 12z" fill="#D9761A" opacity="0.6" />
      {/* Kafa lambası */}
      <circle cx="50" cy="28" r="5.2" fill="#3F4A5C" />
      <circle cx="50" cy="28" r="3.2" fill="#FFF3C4" />
      <circle cx="48.8" cy="26.8" r="1" fill="#fff" />
      <defs>
        <linearGradient id="dz-hat" x1="26" y1="12" x2="74" y2="41" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff" stopOpacity="0.7" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}
