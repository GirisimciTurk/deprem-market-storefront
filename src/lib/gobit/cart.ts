import "server-only"

import { randomUUID } from "node:crypto"
import { cookies } from "next/headers"
import type { HttpTypes } from "@medusajs/types"

import { GobitError, SALES_CHANNEL_ID, gobitData, gobitFetch } from "./client"
import { GobitProduct, toProduct } from "./adapt"

// gobit sepeti (/store/v1/carts) ve PayTR ödemesi (gobit ADR 0438). Vitrinin
// bileşenleri Medusa'nın StoreCart şeklini okur; burada çevrilir.

export type GobitAddress = {
  id?: string
  first_name?: string
  last_name?: string
  company?: string
  address_1?: string
  address_2?: string
  city?: string
  province?: string
  postal_code?: string
  country_code?: string
  phone?: string
  metadata?: Record<string, unknown> | null
}

type GobitLine = {
  id: string
  variant_id: string
  title: string
  quantity: number
  unit_price: number
  subtotal: number
  discount_total: number
  tax_total: number
  total: number
  metadata?: Record<string, unknown> | null
  parent_line_id?: string | null
}

export type GobitCart = {
  id: string
  region_id: string
  currency_code: string
  email?: string | null
  customer_id?: string | null
  subtotal: number
  discount_total: number
  tax_total: number
  shipping_total: number
  total: number
  prices_include_tax?: boolean
  items?: GobitLine[]
  shipping_address?: GobitAddress | null
  billing_address?: GobitAddress | null
  shipping_methods?: { id: string; name: string; amount: number; shipping_option_id: string }[]
  promotion_codes?: string[]
  completed_at?: string | null
  metadata?: Record<string, unknown> | null
}

// Vitrin bileşenleri Medusa'nın sağlayıcı kimliklerini tanır.
const toMedusaProvider: Record<string, string> = { paytr: "pp_paytr_paytr", manual: "pp_system_default" }
const fromMedusaProvider: Record<string, string> = { pp_paytr_paytr: "paytr", pp_system_default: "manual" }
export const medusaProviderId = (id: string) => toMedusaProvider[id] ?? id
export const gobitProviderId = (id: string) => fromMedusaProvider[id] ?? id

// Seçilen ödeme yöntemi: PayTR oturumu ancak son adımda (tutar ve adres
// kesinleşince) açılır; seçim o zamana kadar bu çerezde durur.
const choiceCookie = "_gobit_payment_choice"

export async function rememberPaymentChoice(cartId: string, providerId: string) {
  ;(await cookies()).set(choiceCookie, JSON.stringify({ cartId, providerId }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24,
  })
}

async function paymentChoice(cartId: string): Promise<string | undefined> {
  try {
    const raw = (await cookies()).get(choiceCookie)?.value
    const v = raw ? (JSON.parse(raw) as { cartId: string; providerId: string }) : undefined
    return v?.cartId === cartId ? v.providerId : undefined
  } catch {
    return undefined
  }
}

/** Sepet satırlarının ürünü ve varyantı: gobit listesi varyant kimliğiyle süzer. */
export async function productsByVariant(variantIds: string[], regionId: string) {
  const out = new Map<string, { product: HttpTypes.StoreProduct; variant: any }>()
  if (!variantIds.length) return out
  const page = await gobitFetch<{ data: GobitProduct[] }>(`/store/v1/sales-channels/${SALES_CHANNEL_ID}/products`, {
    query: { variant_id: variantIds, region_id: regionId, limit: 100 },
    cache: "no-store",
  })
  for (const raw of page.data) {
    const product = toProduct(raw)
    for (const v of (product.variants ?? []) as any[]) out.set(v.id, { product, variant: { ...v, product } })
  }

  return out
}

export async function toCart(c: GobitCart, region: HttpTypes.StoreRegion | undefined): Promise<HttpTypes.StoreCart> {
  const lines = c.items ?? []
  const products = await productsByVariant(
    Array.from(new Set(lines.map((l) => l.variant_id))),
    c.region_id
  ).catch(() => new Map())
  const items = lines.map((l) => {
    const found = products.get(l.variant_id)
    const product = found?.product as any

    return {
      id: l.id,
      cart_id: c.id,
      title: product?.title ?? l.title,
      subtitle: l.title,
      variant_title: l.title,
      quantity: l.quantity,
      unit_price: l.unit_price,
      subtotal: l.subtotal,
      tax_total: l.tax_total,
      discount_total: l.discount_total,
      total: l.total,
      original_total: l.total + l.discount_total,
      thumbnail: product?.thumbnail ?? null,
      product_id: product?.id,
      product_title: product?.title ?? l.title,
      product_handle: product?.handle,
      variant_id: l.variant_id,
      variant: found?.variant ?? { id: l.variant_id, title: l.title },
      product,
      metadata: l.metadata ?? {},
      is_tax_inclusive: c.prices_include_tax ?? true,
    }
  })
  const itemTotal = items.reduce((s, i) => s + i.total, 0)
  const choice = await paymentChoice(c.id)

  return {
    id: c.id,
    region_id: c.region_id,
    region,
    currency_code: c.currency_code.toLowerCase(),
    email: c.email ?? undefined,
    customer_id: c.customer_id ?? undefined,
    items,
    shipping_address: c.shipping_address ?? undefined,
    billing_address: c.billing_address ?? undefined,
    shipping_methods: (c.shipping_methods ?? []).map((m) => ({
      id: m.id,
      name: m.name,
      amount: m.amount,
      total: m.amount,
      subtotal: m.amount,
      shipping_option_id: m.shipping_option_id,
    })),
    promotions: (c.promotion_codes ?? []).map((code) => ({ id: code, code, is_automatic: false })),
    subtotal: c.subtotal,
    item_total: itemTotal,
    // Medusa'daki gibi: vergi hariç satır toplamı.
    item_subtotal: items.reduce((sum, i) => sum + i.subtotal, 0),
    item_tax_total: items.reduce((sum, i) => sum + i.tax_total, 0),
    tax_total: c.tax_total,
    discount_total: c.discount_total,
    shipping_total: c.shipping_total,
    shipping_subtotal: c.shipping_total,
    total: c.total,
    original_total: c.total + c.discount_total,
    gift_card_total: 0,
    payment_collection: choice
      ? {
          id: `choice-${c.id}`,
          amount: c.total,
          currency_code: c.currency_code.toLowerCase(),
          payment_sessions: [
            { id: `choice-${c.id}`, provider_id: medusaProviderId(choice), status: "pending", amount: c.total, data: {} },
          ],
        }
      : undefined,
    metadata: c.metadata ?? {},
  } as unknown as HttpTypes.StoreCart
}

// --- PayTR: kendi sayfasında ödenen sağlayıcı (gobit ADR 0438) -------------

// Açılan ödeme ödeme sayfaları için HttpOnly çerezde tutulur; tamamlama sırrı
// hiçbir URL'ye girmez. Bir gün yaşar.
const paymentCookie = "_gobit_payment"

export type OpenedPayment = {
  cartId: string
  sessionId: string
  providerId: string
  total: number
  currency: string
  secret: string
  key: string
  data: Record<string, unknown>
}

export async function openedPayment(): Promise<OpenedPayment | undefined> {
  try {
    const raw = (await cookies()).get(paymentCookie)?.value
    return raw ? (JSON.parse(raw) as OpenedPayment) : undefined
  } catch {
    return undefined
  }
}

async function keepPayment(p: OpenedPayment) {
  ;(await cookies()).set(paymentCookie, JSON.stringify(p), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24,
  })
}

async function forgetPayment() {
  ;(await cookies()).set(paymentCookie, "", { maxAge: -1 })
}

const addressLine = (a?: GobitAddress | null) =>
  a ? [a.address_1, a.address_2, a.province, a.city, a.postal_code].filter(Boolean).join(", ") : ""

/**
 * Sepetin PayTR ödemesini, onaylanan toplam için açar ve iframe jetonunu
 * döner. Aynı sepet ve toplamla açılmış ödeme yeniden gösterilir; başkası
 * önce geri çekilir.
 */
export async function openPaytr(
  cart: GobitCart,
  shopperIp: string,
  headers: Record<string, string>
): Promise<OpenedPayment> {
  const kept = await openedPayment()
  if (kept?.cartId === cart.id && kept.providerId === "paytr" && kept.total === cart.total) return kept
  await withdrawPayment(headers)

  const address = cart.shipping_address
  const opened = await gobitData<{
    payment_session_id: string
    amount: number
    currency_code: string
    completion_secret: string
    data?: Record<string, unknown>
  }>(`/store/v1/carts/${cart.id}/payment-sessions`, {
    method: "POST",
    headers,
    body: {
      payment_provider_id: "paytr",
      expected_total: cart.total,
      payment_data: {
        email: cart.email,
        user_ip: shopperIp,
        user_name: [address?.first_name, address?.last_name].filter(Boolean).join(" ") || undefined,
        user_address: addressLine(address) || undefined,
        user_phone: address?.phone || undefined,
        basket: (cart.items ?? []).map((l) => [l.title, (l.unit_price / 100).toFixed(2), l.quantity]),
      },
    },
  })
  const payment: OpenedPayment = {
    cartId: cart.id,
    sessionId: opened.payment_session_id,
    providerId: "paytr",
    total: opened.amount,
    currency: opened.currency_code,
    secret: opened.completion_secret,
    key: randomUUID(),
    data: opened.data ?? {},
  }
  await keepPayment(payment)

  return payment
}

/** Açık ödemeyi geri çeker; gobit'in artık tanımadığı sepetin ödemesi onunla gider. */
export async function withdrawPayment(headers: Record<string, string>) {
  const p = await openedPayment()
  if (!p) return
  try {
    await gobitFetch(`/store/v1/carts/${p.cartId}/payment-sessions/${p.sessionId}/cancel`, {
      method: "POST",
      headers,
    })
  } catch (e) {
    if (!(e instanceof GobitError) || (e.status !== 404 && e.status !== 409)) throw e
  }
  await forgetPayment()
}

const pending = new Set(["checkout_workflow_payment_pending", "idempotency_in_flight"])
const declined = new Set([
  "checkout_workflow_payment_reported_declined",
  "checkout_workflow_payment_session_closed",
  "checkout_workflow_payment_session_stale",
  "checkout_workflow_payment_session_foreign",
  "checkout_workflow_total_mismatch",
  "checkout_workflow_cart_changed",
])

export type Completed = { order_id: string; order_token: string; currency_code: string; total: number }

export type PaymentOutcome =
  | { order: Completed }
  | { wait: number }
  | { refused: "declined" | "gone" | "other"; message?: string }

/**
 * Sepeti açık ödemeyle tamamlar. PayTR ödemeyi bildirene kadar gobit
 * beklemesini ister (409 + Retry-After); bildirdikten sonra siparişi ve
 * jetonunu verir — sepeti bu tamamlama da, bildirim de kapatmış olabilir.
 */
export async function finishPayment(headers: Record<string, string>): Promise<PaymentOutcome> {
  const p = await openedPayment()
  if (!p) return { refused: "gone" }
  try {
    const done = await gobitData<Completed>(`/store/v1/carts/${p.cartId}/complete`, {
      method: "POST",
      headers: { ...headers, "Idempotency-Key": p.key },
      body: {
        payment_provider_id: p.providerId,
        payment_session_id: p.sessionId,
        completion_secret: p.secret,
        expected_total: p.total,
      },
    })
    await forgetPayment()

    return { order: done }
  } catch (e) {
    if (!(e instanceof GobitError)) throw e
    // gobit-storefront'un ret sınıfları (src/lib/payment.ts refusalOf).
    if (pending.has(e.code)) return { wait: Math.max(e.retryAfter ?? 2, 2) }
    if (e.status === 404) {
      await forgetPayment()
      return { refused: "gone" }
    }
    if (declined.has(e.code)) {
      await withdrawPayment(headers).catch(() => {})
      return { refused: "declined", message: e.message }
    }

    return { refused: "other", message: e.message }
  }
}

/** gobit kargo seçeneği → Medusa StoreCartShippingOption (sabit fiyat, kuralsız). */
export function toShippingOption(o: { id: string; name: string; amount: number; currency_code: string }) {
  const currency = o.currency_code.toLowerCase()

  return {
    id: o.id,
    name: o.name,
    amount: o.amount,
    price_type: "flat",
    prices: [{ id: `${o.id}-price`, amount: o.amount, currency_code: currency, price_rules: [] }],
    calculated_price: { calculated_amount: o.amount, currency_code: currency },
    insufficient_inventory: false,
    service_zone: { fulfillment_set: { type: "shipping" } },
  } as unknown as HttpTypes.StoreCartShippingOption
}
