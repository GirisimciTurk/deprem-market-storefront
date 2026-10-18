// Sipariş devri (gobit ADR 0450): saf yardımcılar. Hem sunucu eylemleri
// (data/orders.ts) hem istemci sayfası (order/transfer/[transferId]) kullanır.

/** gobit'in vitrine gösterdiği devir kaydı (müşteri ve adres taşımaz). */
export type StoreTransfer = {
  id: string
  order_id: string
  status: "requested" | "accepted" | "declined" | "canceled" | "expired"
  created_at: string
  expires_at?: string
  closed_at?: string
}

/**
 * Devir e-postasındaki bağlantının parçası (#token=…[&display_id=…]).
 * Jeton yalnız URL parçasında gelir: parça sunucuya ve Referer'a gitmez.
 * Jeton yoksa null.
 */
export function parseTransferFragment(hash: string | null | undefined): { token: string; displayId: string | null } | null {
  if (!hash) return null
  const params = new URLSearchParams(hash.replace(/^#/, ""))
  const token = params.get("token")?.trim()
  if (!token) return null
  const display = params.get("display_id")?.trim().replace(/^#/, "") ?? ""

  return { token, displayId: /^\d+$/.test(display) ? display : null }
}

/**
 * Hesaptaki aktarım formuna yazılan sipariş: gobit sipariş kimliği (ord_…)
 * ya da sipariş numarası (#1234 / 1234). Boş ya da anlamsızsa null.
 */
export function parseOrderReference(
  input: unknown
): { kind: "id"; id: string } | { kind: "number"; displayId: number } | null {
  const v = String(input ?? "").trim()
  if (!v) return null
  const number = v.replace(/^#/, "").trim()
  if (/^\d+$/.test(number)) {
    const n = Number(number)
    return Number.isSafeInteger(n) && n > 0 ? { kind: "number", displayId: n } : null
  }
  if (/^[A-Za-z0-9_-]+$/.test(v)) return { kind: "id", id: v }

  return null
}

const MESSAGES: Record<string, string> = {
  order_transfer_unproven: "Siparişi hesabınıza eklemek için giriş yapmanız gerekiyor.",
  order_not_found: "Bu siparişi sipariş e-postanızdaki bağlantıdan açıp oradan aktarın.",
  order_transfer_own_order: "Bu sipariş zaten hesabınızda.",
  order_not_transferable:
    "Bu sipariş devredilemez: iptal edilmiş, kişisel verileri silinmiş ya da e-posta adresi olmayan bir sipariş.",
  order_transfer_addition:
    "Bu sipariş başka bir siparişe ek olarak verilmiş; o siparişle birlikte devredilir.",
  order_transfer_pending: "Bu sipariş için yanıt bekleyen bir devir talebi zaten var.",
  order_transfer_mail_failed:
    "Onay e-postası gönderilemedi, talep geri alındı. Lütfen biraz sonra tekrar deneyin.",
  order_transfer_not_found: "Devir talebi bulunamadı ya da bağlantı geçersiz.",
  order_transfer_expired: "Bu devir talebinin süresi (7 gün) dolmuş.",
  order_transfer_closed: "Bu devir talebi daha önce yanıtlanmış ya da geri çekilmiş.",
  order_transfer_stale:
    "Talepten sonra siparişin sahibi, adresi ya da durumu değiştiği için devir yapılamıyor.",
  order_transfer_receiver_unknown: "Talepte bulunan hesap artık mevcut değil; devir yapılamıyor.",
}

/** gobit'in devir reddi (kod, HTTP durumu) → Türkçe ileti. */
export function transferErrorMessage(
  code: string | undefined | null,
  status: number | undefined | null,
  fallback = "Sipariş devri sırasında bir hata oluştu. Lütfen tekrar deneyin."
): string {
  if (code && MESSAGES[code]) return MESSAGES[code]
  if (status === 401) return MESSAGES.order_transfer_unproven
  if (status === 429) return "Çok fazla deneme yapıldı. Lütfen biraz sonra tekrar deneyin."

  return fallback
}
