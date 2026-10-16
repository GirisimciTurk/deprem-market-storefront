"use server"

import { gobitData } from "@lib/gobit/client"
import { Commission, toCommissionList } from "@lib/util/paytr-rates"

// PayTR'nin taksit oranları (dtm /store/v1/dtm/installments, PayTR'nin
// taksit-sorgulama cevabı). Ürün sayfasının bileşeni banka bazlı
// COMMISSION_LIST bekler; PayTR oranları kart programı → taksit_N → oran
// olarak verir ("oranlar", belgede "rates"). Burada çevrilir.

export async function getInstallments(): Promise<{ success: boolean; data: { COMMISSION_LIST: Commission[] } | null }> {
  const r = await gobitData<{ success: boolean; data: unknown }>("/store/v1/dtm/installments", {
    next: { revalidate: 3600 },
  }).catch(() => ({ success: false, data: null }))
  if (!r.success) return { success: false, data: null }
  const list = toCommissionList(r.data)

  return list.length ? { success: true, data: { COMMISSION_LIST: list } } : { success: false, data: null }
}
