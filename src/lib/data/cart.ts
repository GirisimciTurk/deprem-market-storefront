"use server"

import { StoreCart, StoreCartShippingOption, StoreCartUpdate } from "types/store"
import { revalidateTag } from "next/cache"
import { headers as nextHeaders } from "next/headers"
import { redirect } from "next/navigation"

import { GobitError, gobitData, gobitFetch } from "@lib/gobit/client"
import {
  Completed,
  GobitCart,
  PaymentOutcome,
  finishPayment as finishGobitPayment,
  openPaytr,
  rememberPaymentChoice,
  toCart,
  toShippingOption,
  withdrawPayment,
} from "@lib/gobit/cart"
import {
  getAuthHeaders,
  getCacheTag,
  getCartId,
  removeCartId,
  rememberOrderToken,
  setCartId,
} from "./cookies"
import { getRegion, retrieveRegion } from "./regions"
import type { ShippingQuote } from "@lib/util/free-shipping"

// gobit sepeti (/store/v1/carts). Sepet kimliği vitrinin çerezinde
// (_dt_cart_id); oturum varsa istekler onun çerezini de taşır.

const message = (e: unknown) =>
  e instanceof GobitError ? e.message : e instanceof Error ? e.message : String(e)

async function invalidateCart() {
  revalidateTag(await getCacheTag("carts"))
  revalidateTag(await getCacheTag("fulfillment"))
}

async function readCart(id: string): Promise<GobitCart> {
  return gobitData<GobitCart>(`/store/v1/carts/${id}`, { headers: await getAuthHeaders(), cache: "no-store" })
}

/** Sepetin seçili teslimatlarını siler; silinenlerin seçenek kimliklerini döner. */
async function dropShippingMethods(cartId: string, headers: Record<string, string>): Promise<string[]> {
  const cart = await gobitData<GobitCart>(`/store/v1/carts/${cartId}`, { headers, cache: "no-store" })
  const methods = cart.shipping_methods ?? []
  for (const m of methods) {
    await gobitFetch(`/store/v1/carts/${cartId}/shipping-methods/${encodeURIComponent(m.id)}`, {
      method: "DELETE",
      headers,
    }).catch((e) => {
      if (!(e instanceof GobitError && e.status === 404)) throw e
    })
  }

  return Array.from(new Set(methods.map((m) => m.shipping_option_id).filter(Boolean)))
}

/**
 * Satırlar değişince teslimatı yeniden seçer: gobit kargo bedelini teslimat
 * eklenirken bir kez hesaplar (desi ve satıcı eşiği), sepet sonradan değişirse
 * eski bedel kalırdı. Seçili teslimat silinip aynı seçenekle yeniden eklenir;
 * seçenek artık sunulmuyorsa teslimat seçilmemiş kalır (ödeme adımı yeniden ister).
 */
async function rechooseShipping(cartId: string) {
  const headers = await getAuthHeaders()
  try {
    const options = await dropShippingMethods(cartId, headers)
    for (const option of options) {
      await gobitFetch(`/store/v1/carts/${cartId}/shipping-methods`, {
        method: "POST",
        headers,
        body: { shipping_option_id: option },
      }).catch(() => {})
    }
  } catch {
    // Sepet okunamadıysa satır yazımı yine de geçerli; teslimat ödeme adımında seçilir.
  }
}

/** Sepet; kimlik verilmezse çerezdeki. Bulunamazsa çerez silinir. */
export async function retrieveCart(cartId?: string, _fields?: string, _opts?: { fresh?: boolean }) {
  const id = cartId || (await getCartId())
  if (!id) return null

  try {
    const c = await readCart(id)
    if (c.completed_at) {
      await removeCartId()
      return null
    }

    return await toCart(c, await retrieveRegion(c.region_id))
  } catch (e) {
    if (e instanceof GobitError && e.status === 404) await removeCartId()
    return null
  }
}

/** gobit toplamları her okumada günceldir (totals_stale); ayrı bir tazeleme yok. */
export async function refreshCartPrices(_cartId?: string) {}

export async function getOrSetCart(countryCode: string) {
  const region = await getRegion(countryCode)
  if (!region) throw new Error(`Region not found for country code: ${countryCode}`)

  const existing = await retrieveCart()
  if (existing) return existing

  const headers = await getAuthHeaders()
  const customer = headers.cookie
    ? await gobitData<{ customer_id: string }>("/store/v1/auth/session", { headers, cache: "no-store" })
        .then((s) => s.customer_id)
        .catch(() => undefined)
    : undefined
  const created = await gobitData<GobitCart>("/store/v1/carts", {
    method: "POST",
    headers,
    body: { country_code: countryCode, ...(customer ? { customer_id: customer } : {}) },
  })
  await setCartId(created.id)
  await invalidateCart()

  return toCart(created, region)
}

const addressBody = (a: Record<string, unknown>) => ({
  first_name: a.first_name || "",
  last_name: a.last_name || "",
  company: a.company || "",
  address_1: a.address_1 || "",
  address_2: a.address_2 || "",
  city: a.city || "",
  province: a.province || "",
  postal_code: a.postal_code || "",
  country_code: String(a.country_code || "tr").toLowerCase(),
  phone: a.phone || "",
})

export async function updateCart(data: StoreCartUpdate) {
  const cartId = await getCartId()
  if (!cartId) throw new Error("No existing cart found, please create one before updating")
  const headers = await getAuthHeaders()
  const d = data as Record<string, any>

  try {
    if (d.email !== undefined || d.customer_id !== undefined) {
      await gobitFetch(`/store/v1/carts/${cartId}`, {
        method: "POST",
        headers,
        body: {
          ...(d.email !== undefined ? { email: d.email } : {}),
          ...(d.customer_id ? { customer_id: d.customer_id } : {}),
        },
      })
    }
    if (d.shipping_address) {
      await gobitFetch(`/store/v1/carts/${cartId}/shipping-address`, {
        method: "PUT",
        headers,
        body: addressBody(d.shipping_address),
      })
    }
    if (d.billing_address) {
      await gobitFetch(`/store/v1/carts/${cartId}/billing-address`, {
        method: "PUT",
        headers,
        body: addressBody(d.billing_address),
      })
    }
    if (Array.isArray(d.promo_codes)) {
      for (const code of d.promo_codes) {
        await gobitFetch(`/store/v1/carts/${cartId}/promotions`, { method: "POST", headers, body: { code } })
      }
    }
  } catch (e) {
    throw new Error(message(e))
  }
  // İndirim satıcı ara toplamını, dolayısıyla ücretsiz kargo eşiğini değiştirebilir.
  if (Array.isArray(d.promo_codes) && d.promo_codes.length) await rechooseShipping(cartId)
  await invalidateCart()

  return retrieveCart(cartId)
}

async function addLine(cartId: string, variantId: string, quantity: number) {
  try {
    await gobitFetch(`/store/v1/carts/${cartId}/line-items`, {
      method: "POST",
      headers: await getAuthHeaders(),
      body: { variant_id: variantId, quantity },
    })
  } catch (e) {
    throw new Error(message(e))
  }
}

export async function addToCart({
  variantId,
  quantity,
  countryCode,
}: {
  variantId: string
  quantity: number
  countryCode: string
}) {
  if (!variantId) throw new Error("Missing variant ID when adding to cart")
  const cart = await getOrSetCart(countryCode)
  if (!cart) throw new Error("Error retrieving or creating cart")

  await addLine(cart.id, variantId, quantity)
  if (cart.shipping_methods?.length) await rechooseShipping(cart.id)
  await invalidateCart()
}

/** Birden çok varyantı sırayla sepete ekler (Hazırlık Asistanı "Tümünü Sepete Ekle"). */
export async function addMultipleToCart({
  items,
  countryCode,
}: {
  items: { variantId: string; quantity: number }[]
  countryCode: string
}) {
  const wanted = items.filter((it) => it.variantId)
  if (!wanted.length) return
  const cart = await getOrSetCart(countryCode)
  if (!cart) throw new Error("Error retrieving or creating cart")
  for (const it of wanted) await addLine(cart.id, it.variantId, Math.max(1, it.quantity || 1))
  if (cart.shipping_methods?.length) await rechooseShipping(cart.id)
  await invalidateCart()
}

export async function updateLineItem({ lineId, quantity }: { lineId: string; quantity: number }) {
  if (!lineId) throw new Error("Missing lineItem ID when updating line item")
  const cartId = await getCartId()
  if (!cartId) throw new Error("Missing cart ID when updating line item")

  try {
    await gobitFetch(`/store/v1/carts/${cartId}/line-items/${lineId}`, {
      method: "PATCH",
      headers: await getAuthHeaders(),
      body: { quantity },
    })
  } catch (e) {
    throw new Error(message(e))
  }
  await rechooseShipping(cartId)
  await invalidateCart()
}

export async function deleteLineItem(lineId: string) {
  if (!lineId) throw new Error("Missing lineItem ID when deleting line item")
  const cartId = await getCartId()
  if (!cartId) throw new Error("Missing cart ID when deleting line item")

  try {
    await gobitFetch(`/store/v1/carts/${cartId}/line-items/${lineId}`, {
      method: "DELETE",
      headers: await getAuthHeaders(),
    })
  } catch (e) {
    throw new Error(message(e))
  }
  await rechooseShipping(cartId)
  await invalidateCart()
}

/**
 * Teslimatı seçer. Önce sepetin seçili teslimatları silinir: gobit aynı
 * seçeneği ikinci kez reddeder (409), başka bir seçeneği ise eskisinin yanına
 * ekler (ikisi de ücretlenirdi).
 */
export async function setShippingMethod({ cartId, shippingMethodId }: { cartId: string; shippingMethodId: string }) {
  try {
    const headers = await getAuthHeaders()
    await dropShippingMethods(cartId, headers)
    await gobitFetch(`/store/v1/carts/${cartId}/shipping-methods`, {
      method: "POST",
      headers,
      body: { shipping_option_id: shippingMethodId },
    })
  } catch (e) {
    throw new Error(message(e))
  }
  await invalidateCart()
}

/**
 * Ödeme yöntemi seçimi. PayTR oturumu tutar ve adres kesinleşince, son adımda
 * açılır (openPaytrPayment); burada yalnız seçim tutulur.
 */
export async function initiatePaymentSession(
  cart: StoreCart,
  data: { provider_id: string }
) {
  await rememberPaymentChoice(cart.id, data.provider_id)
  await invalidateCart()

  return { payment_collection: null }
}

export async function applyPromotions(codes: string[]) {
  await updateCart({ promo_codes: codes })
}

export async function submitPromotionForm(currentState: unknown, formData: FormData) {
  const code = formData.get("code") as string
  try {
    await applyPromotions([code])
  } catch (e: any) {
    return e.message
  }
}

export async function setAddresses(currentState: unknown, formData: FormData) {
  try {
    if (!formData) throw new Error("No form data found when setting addresses")
    const cartId = await getCartId()
    if (!cartId) throw new Error("No existing cart found when setting addresses")

    const pick = (prefix: string) => ({
      first_name: formData.get(`${prefix}.first_name`),
      last_name: formData.get(`${prefix}.last_name`),
      address_1: formData.get(`${prefix}.address_1`),
      address_2: (formData.get(`${prefix}.address_2`) as string) || "",
      company: formData.get(`${prefix}.company`),
      postal_code: formData.get(`${prefix}.postal_code`),
      city: formData.get(`${prefix}.city`),
      country_code: formData.get(`${prefix}.country_code`),
      province: formData.get(`${prefix}.province`),
      phone: formData.get(`${prefix}.phone`),
    })
    const shipping = pick("shipping_address")
    const data = {
      shipping_address: shipping,
      billing_address: formData.get("same_as_billing") === "on" ? shipping : pick("billing_address"),
      email: formData.get("email"),
    } as any
    await updateCart(data)
  } catch (e: any) {
    return e.message
  }

  redirect(`/${formData.get("shipping_address.country_code")}/checkout?step=delivery`)
}

async function settle(done: Completed) {
  await rememberOrderToken(done.order_id, done.order_token)
  await removeCartId()
  revalidateTag(await getCacheTag("carts"))
  revalidateTag(await getCacheTag("orders"))
}

/**
 * Ödemesi sayfasız sağlayıcıyla (manual) sepeti tamamlar ve siparişe gider.
 * PayTR'nin tamamlaması ödeme sonuç sayfasındadır (finishPayment).
 */
export async function placeOrder(cartId?: string) {
  const id = cartId || (await getCartId())
  if (!id) throw new Error("No existing cart found when placing an order")

  const headers = await getAuthHeaders()
  const cart = await readCart(id)
  let done: Completed
  try {
    done = await gobitData<Completed>(`/store/v1/carts/${id}/complete`, {
      method: "POST",
      headers,
      body: { payment_provider_id: "manual", expected_total: cart.total },
    })
  } catch (e) {
    throw new Error(message(e))
  }
  await settle(done)
  const countryCode = (cart.shipping_address?.country_code || "tr").toLowerCase()
  redirect(`/${countryCode}/order/${done.order_id}/confirmed`)
}

/** PayTR iframe'i için ödeme oturumunu açar; iframe jetonunu ya da hatayı döner. */
export async function openPaytrPayment(): Promise<{ iframe_token?: string; error?: string }> {
  const id = await getCartId()
  if (!id) return { error: "Sepet bulunamadı." }
  try {
    const h = await nextHeaders()
    const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "127.0.0.1"
    const opened = await openPaytr(await readCart(id), ip, await getAuthHeaders())
    const token = opened.data.iframe_token

    return typeof token === "string" && token
      ? { iframe_token: token }
      : { error: "PayTR ödeme sayfası açılamadı." }
  } catch (e) {
    return { error: message(e) }
  }
}

/**
 * PayTR dönüşünde sepeti açık ödemeyle tamamlar. Sipariş oluştuysa jetonu
 * saklanır ve sepet çerezi silinir.
 */
export async function finishPayment(): Promise<PaymentOutcome> {
  const outcome = await finishGobitPayment(await getAuthHeaders())
  if ("order" in outcome) await settle(outcome.order)

  return outcome
}

/** PayTR ödemesini geri çeker (ödeme sayfasından vazgeçildiğinde). */
export async function cancelPayment() {
  await withdrawPayment(await getAuthHeaders())
  await invalidateCart()
}

/** Tek bölge (Türkiye): bölge değişimi yalnız adresi değiştirir. */
export async function updateRegion(countryCode: string, currentPath: string) {
  redirect(`/${countryCode}${currentPath}`)
}

export async function listCartOptions() {
  const cartId = await getCartId()
  if (!cartId) return { shipping_options: [] as StoreCartShippingOption[] }
  const options = await gobitData<{ id: string; name: string; amount: number; currency_code: string }[]>(
    `/store/v1/carts/${cartId}/shipping-options`,
    { headers: await getAuthHeaders(), cache: "no-store" }
  ).catch(() => [])

  return { shipping_options: options.map(toShippingOption) }
}

/**
 * dtm'nin kargo teklifi: sepetin şimdiki hâliyle desi ve satıcı eşiklerine
 * göre kargo bedeli, satıcı satıcı. Okunamazsa null.
 */
export async function getShippingQuote(cartId?: string): Promise<ShippingQuote | null> {
  const id = cartId || (await getCartId())
  if (!id) return null

  return gobitData<ShippingQuote>(`/store/v1/dtm/shipping-quote`, {
    query: { cart_id: id },
    headers: await getAuthHeaders(),
    cache: "no-store",
  }).catch(() => null)
}

/** Kargo yöntemi seçilmeden önceki tahmin (dtm'nin kargo teklifi). */
export async function estimateShipping(cartId: string): Promise<{ amount: number; free: boolean } | null> {
  const quote = await getShippingQuote(cartId)
  if (!quote) return null

  return { amount: quote.amount, free: quote.free }
}
