"use server"

import { StoreOrder } from "types/store"
import { GobitError, gobitData, gobitFetch } from "@lib/gobit/client"
import {
  toTrackingView,
  type TrackedOrder,
  type TrackingView,
} from "@modules/order-tracking/components/tracking-utils"
import { productsByVariant } from "@lib/gobit/cart"
import {
  fulfillmentStatusOf,
  paymentStatusOf,
  toShippingAddress,
  type DtmOrderTracking,
  type GobitOrderSummary,
} from "@lib/gobit/order"
import {
  parseOrderReference,
  transferErrorMessage,
  type StoreTransfer,
} from "@lib/util/order-transfer"
import { getAuthHeaders, getOrderHeaders, savedOrderIds } from "./cookies"

// gobit siparişi: /store/v1/orders/{id} (oturumdaki müşterinin ya da
// X-Order-Token'ı saklı siparişin) ve /store/v1/customers/{id}/orders. gobit'in
// vitrin siparişi adres ve müşteri kimliği taşımaz (ADR 0193, 0439): teslimat
// adresi ve gönderim aşaması dtm'nin takibinden okunur (lib/gobit/order.ts),
// siparişin oturumdaki müşterinin olup olmadığı isOwnOrder'dan.

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
  summary?: GobitOrderSummary | null
  items?: GobitOrderLine[]
  shipping_methods?: { id: string; name: string; amount: number }[]
  metadata?: Record<string, unknown> | null
}

async function toOrder(o: GobitOrder, tracking?: DtmOrderTracking | null): Promise<StoreOrder> {
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
    fulfillment_status: fulfillmentStatusOf(tracking?.stage, o.canceled_at),
    payment_status: paymentStatusOf(o.summary),
    stage_label: tracking?.stage_label || null,
    shipping_address: toShippingAddress(tracking?.shipping_address),
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
          { id: `${o.id}-payment`, provider_id: "paytr", amount: o.total, created_at: o.placed_at ?? o.created_at, data: {} },
        ],
      },
    ],
    metadata: o.metadata ?? {},
  }
}

/** token: sipariş e-postasındaki jeton (verilmezse çerezdeki kullanılır). */
export const retrieveOrder = async (id: string, token?: string) => {
  const headers = await getOrderHeaders(id, token)
  const path = encodeURIComponent(id)
  const [o, tracking] = await Promise.all([
    gobitData<GobitOrder>(`/store/v1/orders/${path}`, { headers, cache: "no-store" }),
    // Takip okunamazsa sipariş yine gösterilir (adressiz, aşaması "hazırlanıyor").
    gobitData<DtmOrderTracking>(`/store/v1/dtm/orders/${path}/shipments`, { headers, cache: "no-store" }).catch(
      () => null
    ),
  ])

  return toOrder(o, tracking)
}

/**
 * Sipariş oturumdaki müşterinin mi: gobit siparişi jetonsuz, yalnız oturumla
 * okunabiliyorsa (gobit yalnız siparişin kendi müşterisine açar, ADR 0439)
 * evet. Oturum yoksa ya da gobit 404 derse hayır; başka bir hatada null
 * (bilinmiyor).
 */
export const isOwnOrder = async (id: string): Promise<boolean | null> => {
  const headers = await getAuthHeaders()
  if (!headers.cookie) return false
  try {
    await gobitData<GobitOrder>(`/store/v1/orders/${encodeURIComponent(id)}`, { headers, cache: "no-store" })
    return true
  } catch (e) {
    if (e instanceof GobitError && e.status === 404) return false
    return null
  }
}

export const listOrders = async (limit: number = 10, offset: number = 0, _filters?: Record<string, unknown>) => {
  const headers = await getAuthHeaders()
  if (!headers.cookie) return []
  const session = await gobitData<{ customer_id: string }>("/store/v1/auth/session", { headers, cache: "no-store" })
  const page = await gobitFetch<{ data: GobitOrder[] }>(
    `/store/v1/customers/${encodeURIComponent(session.customer_id)}/orders`,
    { query: { limit, offset }, headers, cache: "no-store" }
  )

  return Promise.all(page.data.map((o) => toOrder(o)))
}

// Sipariş devri (gobit ADR 0450): oturumdaki müşteri, açabildiği (jetonu bu
// tarayıcıda saklı) bir siparişin kendisine geçmesini ister; gobit siparişin
// e-posta adresine tek kullanımlık bir jeton yollar, o adresi okuyan 7 gün
// içinde kabul ya da reddeder. Jeton yalnız gövdede gider: gobit'in istek
// kaydı yolu yazar, jeton yola ve kayıtlara girmez.

export type TransferRequestState = {
  success: boolean
  error: string | null
  /** Talep edilen sipariş (display_id biliniyorsa onunla). */
  order: { id: string; display_id?: number } | null
  /** Bekleyen talep: geri çekmek için. */
  transfer: { id: string; expires_at?: string } | null
}

export type TransferAnswer = { success: boolean; error: string | null; transfer: StoreTransfer | null }

const requestFailed = (error: string): TransferRequestState => ({ success: false, error, order: null, transfer: null })

/** Sipariş numarası (#1234) → bu tarayıcının jetonunu sakladığı siparişlerden biri. */
async function savedOrderByNumber(displayId: number): Promise<GobitOrder | null> {
  const ids = (await savedOrderIds()).reverse()
  const orders = await Promise.all(
    ids.map(async (id) =>
      gobitData<GobitOrder>(`/store/v1/orders/${encodeURIComponent(id)}`, {
        headers: await getOrderHeaders(id),
        cache: "no-store",
      }).catch(() => null)
    )
  )

  return orders.find((o) => o?.display_id === displayId) ?? null
}

/**
 * Formdaki siparişin (order_id: ord_… ya da sipariş numarası) oturumdaki
 * müşteriye devri için talep. Siparişi açan jeton bu tarayıcıda saklı olmalı.
 */
export const createTransferRequest = async (
  _state: TransferRequestState,
  formData: FormData
): Promise<TransferRequestState> => {
  const ref = parseOrderReference(formData.get("order_id"))
  if (!ref) return requestFailed("Lütfen sipariş numarasını girin.")

  if (!(await getAuthHeaders()).cookie) return requestFailed(transferErrorMessage("order_transfer_unproven", 401))

  let order: { id: string; display_id?: number }
  if (ref.kind === "number") {
    const found = await savedOrderByNumber(ref.displayId)
    if (!found) return requestFailed(transferErrorMessage("order_not_found", 404))
    order = { id: found.id, display_id: found.display_id }
  } else {
    order = { id: ref.id }
  }

  try {
    const transfer = await gobitData<StoreTransfer>(
      `/store/v1/orders/${encodeURIComponent(order.id)}/transfer-requests`,
      { method: "POST", headers: await getOrderHeaders(order.id), cache: "no-store" }
    )
    return { success: true, error: null, order, transfer: { id: transfer.id, expires_at: transfer.expires_at } }
  } catch (e) {
    if (e instanceof GobitError) {
      // Kodsuz 404 de siparişe erişim yok demek (jeton bu tarayıcıda değil).
      return requestFailed(transferErrorMessage(e.status === 404 ? e.code || "order_not_found" : e.code, e.status))
    }
    return requestFailed(transferErrorMessage(null, null))
  }
}

/** Devir e-postasının kabul/ret yanıtı; oturum gerekmez, jeton gövdede. */
async function answerTransfer(answer: "accept" | "decline", transferId: string, token: string): Promise<TransferAnswer> {
  const id = String(transferId ?? "").trim()
  const t = String(token ?? "").trim()
  if (!id || !t) return { success: false, error: transferErrorMessage("order_transfer_not_found", 404), transfer: null }

  try {
    const transfer = await gobitData<StoreTransfer>(
      `/store/v1/order-transfers/${encodeURIComponent(id)}/${answer}`,
      { method: "POST", body: { token: t }, cache: "no-store" }
    )
    return { success: true, error: null, transfer }
  } catch (e) {
    const fallback =
      answer === "accept"
        ? "Devir kabul edilirken bir hata oluştu. Lütfen tekrar deneyin."
        : "Devir reddedilirken bir hata oluştu. Lütfen tekrar deneyin."
    return {
      success: false,
      error: e instanceof GobitError ? transferErrorMessage(e.code, e.status, fallback) : fallback,
      transfer: null,
    }
  }
}

export const acceptTransferRequest = async (transferId: string, token: string) =>
  answerTransfer("accept", transferId, token)
export const declineTransferRequest = async (transferId: string, token: string) =>
  answerTransfer("decline", transferId, token)

/** Oturumdaki müşterinin kendi bekleyen talebini geri çeker. */
export const cancelTransferRequest = async (transferId: string): Promise<TransferAnswer> => {
  const id = String(transferId ?? "").trim()
  if (!id) return { success: false, error: transferErrorMessage("order_transfer_not_found", 404), transfer: null }

  try {
    const transfer = await gobitData<StoreTransfer>(`/store/v1/order-transfers/${encodeURIComponent(id)}/cancel`, {
      method: "POST",
      headers: await getAuthHeaders(),
      cache: "no-store",
    })
    return { success: true, error: null, transfer }
  } catch (e) {
    const fallback = "Devir talebi geri çekilirken bir hata oluştu. Lütfen tekrar deneyin."
    return {
      success: false,
      error: e instanceof GobitError ? transferErrorMessage(e.code, e.status, fallback) : fallback,
      transfer: null,
    }
  }
}

/**
 * Misafir sipariş takibi: sipariş numarası ve siparişin e-postasıyla
 * (POST /store/v1/dtm/order-tracking; adres URL'ye ve kayıtlara girmesin diye
 * gövdede). Yanıt adres, sipariş kimliği ve ödeme durumu taşımaz.
 */
export const trackOrder = async (
  displayId: string,
  email: string
): Promise<{ order: TrackingView | null; error: string | null }> => {
  const number = String(displayId ?? "").trim().replace(/^#/, "")
  const address = String(email ?? "").trim()
  if (!/^\d+$/.test(number) || !address) {
    return { order: null, error: "Lütfen sipariş numarasını ve e-posta adresinizi girin." }
  }
  try {
    const t = await gobitData<TrackedOrder>("/store/v1/dtm/order-tracking", {
      method: "POST",
      body: { display_id: Number(number), email: address },
    })
    return { order: toTrackingView(t), error: null }
  } catch (e) {
    if (e instanceof GobitError && e.status === 404)
      return { order: null, error: "Bu numara ve e-posta adresiyle eşleşen bir sipariş bulunamadı." }
    if (e instanceof GobitError && e.status === 422)
      return { order: null, error: "Sipariş numarası yalnız rakamlardan oluşmalı; e-posta adresi gerekli." }
    if (e instanceof GobitError && e.status === 429)
      return { order: null, error: "Çok fazla deneme yapıldı. Lütfen biraz sonra tekrar deneyin." }
    return { order: null, error: "Sipariş sorgulanırken bir hata oluştu." }
  }
}
