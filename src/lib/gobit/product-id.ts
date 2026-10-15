import "server-only"

import { SALES_CHANNEL_ID, gobitData } from "./client"

/** Ürün adresinden (handle) gobit ürün kimliği; bulunamazsa null. */
export async function productIdOf(handle: string): Promise<string | null> {
  return gobitData<{ id: string }>(`/store/v1/sales-channels/${SALES_CHANNEL_ID}/products/${encodeURIComponent(handle)}`, {
    next: { revalidate: 300 },
  })
    .then((p) => p.id)
    .catch(() => null)
}
