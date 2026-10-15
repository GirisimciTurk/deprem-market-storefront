// "Güvenilir Mağaza" rozeti: dtm'nin günlük geçişi verir (son 90 günde en az
// 10 teslim edilmiş sipariş, en az 5 yorumlanmış sipariş, ortalama ≥4,5 ve
// karnede A). Etsy'deki "Star Seller"ın karşılığı.
export default function TrustedBadge({ size = "sm" }: { size?: "sm" | "md" }) {
  const small = size === "sm"

  return (
    <span
      title="Güvenilir Mağaza: zamanında teslimat, yüksek puan ve düzenli satış"
      className={`inline-flex items-center gap-x-1 rounded-full bg-emerald-50 font-semibold text-emerald-700 ring-1 ring-emerald-200 ${
        small ? "px-1.5 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
      }`}
    >
      <svg className={small ? "h-3 w-3" : "h-3.5 w-3.5"} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3Zm-1.2 13.6-3.5-3.5 1.4-1.4 2.1 2.1 4.9-4.9 1.4 1.4-6.3 6.3Z" />
      </svg>
      Güvenilir Mağaza
    </span>
  )
}
