"use server"

import { HttpTypes } from "@medusajs/types"
import { gobitData, gobitFetch } from "@lib/gobit/client"
import { productsByVariant } from "@lib/gobit/cart"
import { getAuthHeaders, getOrderHeaders } from "./cookies"

// gobit siparişi: /store/v1/orders/{id} (oturumdaki müşterinin ya da
// X-Order-Token'ı saklı siparişin) ve /store/v1/customers/{id}/orders.

type GobitOrderLine = {
  id: string
  variant_id: string
  title: string
  product_title: string
  quantity: number
  unit_price: number
  subtotal: number
  tax_total: number
  discount_total: number
  total: number
  metadata?: Record<string, unknown> | null
}

type GobitOrder = {
  id: string
  display_id: number
  email: string
  status: string
  region_id: string
  currency_code: string
  placed_at?: string
  created_at: string
  canceled_at?: string | null
  subtotal: number
  tax_total: number
  shipping_total: number
  discount_total: number
  total: number
  items?: GobitOrderLine[]
  shipping_methods?: { id: string; name: string; amount: number }[]
  metadata?: Record<string, unknown> | null
}

async function toOrder(o: GobitOrder): Promise<HttpTypes.StoreOrder> {
  const lines = o.items ?? []
  const products = await productsByVariant(Array.from(new Set(lines.map((l) => l.variant_id))), o.region_id).catch(
    () => new Map()
  )
  const items = lines.map((l) => {
    const found = products.get(l.variant_id)
    const product = found?.product as any

    return {
      id: l.id,
      title: l.product_title || l.title,
      subtitle: l.title,
      variant_title: l.title,
      product_title: l.product_title,
      product_handle: product?.handle,
      thumbnail: product?.thumbnail ?? null,
      quantity: l.quantity,
      unit_price: l.unit_price,
      subtotal: l.subtotal,
      tax_total: l.tax_total,
      discount_total: l.discount_total,
      total: l.total,
      original_total: l.total + l.discount_total,
      variant_id: l.variant_id,
      variant: found?.variant ?? { id: l.variant_id, title: l.title },
      product,
      metadata: l.metadata ?? {},
      detail: { fulfilled_quantity: 0, shipped_quantity: 0, delivered_quantity: 0 },
    }
  })

  return {
    id: o.id,
    display_id: o.display_id,
    email: o.email,
    status: o.status,
    fulfillment_status: o.canceled_at ? "canceled" : "not_fulfilled",
    payment_status: "captured",
    region_id: o.region_id,
    currency_code: o.currency_code.toLowerCase(),
    created_at: o.placed_at ?? o.created_at,
    items,
    shipping_methods: (o.shipping_methods ?? []).map((m) => ({ ...m, total: m.amount, subtotal: m.amount })),
    subtotal: o.subtotal,
    item_total: items.reduce((s, i) => s + i.total, 0),
    item_subtotal: items.reduce((s, i) => s + i.subtotal, 0),
    item_tax_total: items.reduce((s, i) => s + i.tax_total, 0),
    tax_total: o.tax_total,
    shipping_total: o.shipping_total,
    shipping_subtotal: o.shipping_total,
    discount_total: o.discount_total,
    gift_card_total: 0,
    total: o.total,
    original_total: o.total + o.discount_total,
    // gobit'in vitrin siparişi ödemeyi ayrıntılandırmaz; depremtek'te ödeme
    // PayTR kartıdır.
    payment_collections: [
      {
        id: `${o.id}-payment`,
        amount: o.total,
        currency_code: o.currency_code.toLowerCase(),
        payments: [
          { id: `${o.id}-payment`, provider_id: "pp_paytr_paytr", amount: o.total, created_at: o.placed_at ?? o.created_at, data: {} },
        ],
      },
    ],
    metadata: o.metadata ?? {},
  } as unknown as HttpTypes.StoreOrder
}

export const retrieveOrder = async (id: string) => {
  const o = await gobitData<GobitOrder>(`/store/v1/orders/${encodeURIComponent(id)}`, {
    headers: await getOrderHeaders(id),
    cache: "no-store",
  })

  return toOrder(o)
}

export const listOrders = async (limit: number = 10, offset: number = 0, _filters?: Record<string, unknown>) => {
  const headers = await getAuthHeaders()
  if (!headers.cookie) return []
  const session = await gobitData<{ customer_id: string }>("/store/v1/auth/session", { headers, cache: "no-store" })
  const page = await gobitFetch<{ data: GobitOrder[] }>(
    `/store/v1/customers/${encodeURIComponent(session.customer_id)}/orders`,
    { query: { limit, offset }, headers, cache: "no-store" }
  )

  return Promise.all(page.data.map(toOrder))
}

// Siparişi başka hesaba devretme gobit'te yok.
type TransferState = { success: boolean; error: string | null; order: HttpTypes.StoreOrder | null }
const noTransfer: TransferState = { success: false, error: "Sipariş devri desteklenmiyor.", order: null }

export const createTransferRequest = async (_state: TransferState, _formData: FormData): Promise<TransferState> =>
  noTransfer
export const acceptTransferRequest = async (_id: string, _token: string) => noTransfer
export const declineTransferRequest = async (_id: string, _token: string) => noTransfer

/** Sipariş numarası ve e-postayla takip gobit'te yok; misafir siparişi postadaki bağlantıyla açılır. */
export const trackOrder = async (_displayId: string, _email: string) => {
  throw new Error("Sipariş takibi için siparişinizdeki bağlantıyı kullanın ya da giriş yapın.")
}
