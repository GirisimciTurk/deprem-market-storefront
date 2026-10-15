"use server"

import { gobitData } from "@lib/gobit/client"

/** PayTR'nin taksit oranları, depremtek arka ucundan (dtm): {success, data}. */
export async function getInstallments(): Promise<{ success: boolean; data: any }> {
  return gobitData<{ success: boolean; data: any }>("/store/v1/dtm/installments", { next: { revalidate: 3600 } }).catch(
    () => ({ success: false, data: null })
  )
}
