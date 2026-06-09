"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import {
  getAuthHeaders,
  getCacheOptions,
  getCacheTag,
  getCartId,
  removeAuthToken,
  removeCartId,
  setAuthToken,
} from "./cookies"

export const retrieveCustomer =
  async (): Promise<HttpTypes.StoreCustomer | null> => {
    const authHeaders = await getAuthHeaders()

    if (!authHeaders) return null

    const headers = {
      ...authHeaders,
    }

    const next = {
      ...(await getCacheOptions("customers")),
    }

    return await sdk.client
      .fetch<{ customer: HttpTypes.StoreCustomer }>(`/store/customers/me`, {
        method: "GET",
        query: {
          fields: "*orders",
        },
        headers,
        next,
        cache: "force-cache",
      })
      .then(({ customer }) => customer)
      .catch(() => null)
  }

export const updateCustomer = async (body: HttpTypes.StoreUpdateCustomer) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const updateRes = await sdk.store.customer
    .update(body, {}, headers)
    .then(({ customer }) => customer)
    .catch(medusaError)

  const cacheTag = await getCacheTag("customers")
  revalidateTag(cacheTag)

  return updateRes
}

export async function signup(_currentState: unknown, formData: FormData) {
  const password = formData.get("password") as string
  let phoneVal = (formData.get("phone") as string || "").trim().replace(/[\s\(\)\-\.]/g, "")

  if (phoneVal) {
    // Normalize to Turkish international format (+905XXXXXXXXX)
    if (phoneVal.startsWith("0")) {
      phoneVal = "+90" + phoneVal.substring(1)
    } else if (phoneVal.startsWith("90")) {
      phoneVal = "+" + phoneVal
    } else if (!phoneVal.startsWith("+")) {
      phoneVal = "+90" + phoneVal
    }

    // Format validation: must match +90 followed by 10 digits starting with 5
    const phoneRegex = /^\+905\d{9}$/
    if (!phoneRegex.test(phoneVal)) {
      return "Lütfen geçerli bir cep telefonu numarası girin (Örn: 0555 123 45 67)"
    }
  }

  const customerForm = {
    email: formData.get("email") as string,
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    phone: phoneVal,
  }

  try {
    const token = await sdk.auth.register("customer", "emailpass", {
      email: customerForm.email,
      password: password,
    })

    await setAuthToken(token as string)

    const headers = {
      ...(await getAuthHeaders()),
    }

    const { customer: createdCustomer } = await sdk.store.customer.create(
      customerForm,
      {},
      headers
    )

    const loginToken = await sdk.auth.login("customer", "emailpass", {
      email: customerForm.email,
      password,
    })

    await setAuthToken(loginToken as string)

    const customerCacheTag = await getCacheTag("customers")
    revalidateTag(customerCacheTag)

    await transferCart()

    return createdCustomer
  } catch (error) {
    return String(error)
  }
}

export async function login(_currentState: unknown, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    await sdk.auth
      .login("customer", "emailpass", { email, password })
      .then(async (token) => {
        await setAuthToken(token as string)
        const customerCacheTag = await getCacheTag("customers")
        revalidateTag(customerCacheTag)
      })
  } catch (error) {
    return String(error)
  }

  try {
    await transferCart()
  } catch (error) {
    return String(error)
  }
}

export async function signout(countryCode: string) {
  await sdk.auth.logout()

  await removeAuthToken()

  const customerCacheTag = await getCacheTag("customers")
  revalidateTag(customerCacheTag)

  await removeCartId()

  const cartCacheTag = await getCacheTag("carts")
  revalidateTag(cartCacheTag)

  redirect(`/${countryCode}/account`)
}

export async function transferCart() {
  const cartId = await getCartId()

  if (!cartId) {
    return
  }

  const headers = await getAuthHeaders()

  await sdk.store.cart.transferCart(cartId, {}, headers)

  const cartCacheTag = await getCacheTag("carts")
  revalidateTag(cartCacheTag)
}

export const addCustomerAddress = async (
  currentState: Record<string, unknown>,
  formData: FormData
): Promise<{ success: boolean; error: string | null }> => {
  const isDefaultBilling = (currentState.isDefaultBilling as boolean) || false
  const isDefaultShipping = (currentState.isDefaultShipping as boolean) || false

  const address = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    company: formData.get("company") as string,
    address_1: formData.get("address_1") as string,
    address_2: formData.get("address_2") as string,
    city: formData.get("city") as string,
    postal_code: formData.get("postal_code") as string,
    province: formData.get("province") as string,
    country_code: formData.get("country_code") as string,
    phone: formData.get("phone") as string,
    is_default_billing: isDefaultBilling,
    is_default_shipping: isDefaultShipping,
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.customer
    .createAddress(address, {}, headers)
    .then(async () => {
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const deleteCustomerAddress = async (
  addressId: string
): Promise<void> => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.store.customer
    .deleteAddress(addressId, headers)
    .then(async () => {
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const updateCustomerAddress = async (
  currentState: Record<string, unknown>,
  formData: FormData
): Promise<{ success: boolean; error: string | null }> => {
  const addressId =
    (currentState.addressId as string) || (formData.get("addressId") as string)

  if (!addressId) {
    return { success: false, error: "Address ID is required" }
  }

  const address = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    company: formData.get("company") as string,
    address_1: formData.get("address_1") as string,
    address_2: formData.get("address_2") as string,
    city: formData.get("city") as string,
    postal_code: formData.get("postal_code") as string,
    province: formData.get("province") as string,
    country_code: formData.get("country_code") as string,
  } as HttpTypes.StoreUpdateCustomerAddress

  const phone = formData.get("phone") as string

  if (phone) {
    address.phone = phone
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.customer
    .updateAddress(addressId, address, {}, headers)
    .then(async () => {
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

// Decode the payload of a Medusa auth JWT (no verification — used only to read
// non-sensitive claims like actor_id/email after the backend already issued it).
function decodeAuthToken(token: string): { actor_id?: string; email?: string } {
  try {
    const payload = token.split(".")[1]
    if (!payload) return {}
    const json = Buffer.from(
      payload.replace(/-/g, "+").replace(/_/g, "/"),
      "base64"
    ).toString("utf-8")
    const data = JSON.parse(json)
    return {
      actor_id: data?.actor_id,
      // Medusa's registration JWT carries the provider profile in `user_metadata`
      // (the Google provider stores the verified email there).
      email:
        data?.email ??
        data?.user_metadata?.email ??
        data?.app_metadata?.email,
    }
  } catch {
    return {}
  }
}

/**
 * Step 1 of the real Google OAuth flow: ask Medusa where to redirect the user.
 * Returns the Google consent-screen URL. Requires GOOGLE_CLIENT_ID/SECRET to be
 * configured on the backend, otherwise the redirect will fail closed.
 */
export async function initiateGoogleLogin(): Promise<{ location: string }> {
  const result = await sdk.auth.login("customer", "google", {})

  if (typeof result === "object" && result !== null && "location" in result) {
    return { location: (result as { location: string }).location }
  }

  // If a token string is returned the session already exists; treat as ready.
  if (typeof result === "string") {
    await setAuthToken(result)
    return { location: "" }
  }

  throw new Error("Google ile giriş başlatılamadı. Lütfen tekrar deneyin.")
}

/**
 * Step 2: validate the callback Google sent back, creating the customer record on
 * first login, and persist the resulting session token.
 */
export async function validateGoogleCallback(
  query: Record<string, unknown>
): Promise<{ success: boolean; error: string | null }> {
  try {
    let token = await sdk.auth.callback("customer", "google", query)

    if (typeof token !== "string") {
      return { success: false, error: "Google doğrulaması tamamlanamadı." }
    }

    const decoded = decodeAuthToken(token)

    // actor_id is empty on the very first login with this Google identity.
    // Hand off to the backend, which either LINKS this identity to an existing
    // customer that already uses this email (e.g. an email/password account) or
    // creates a new customer — avoiding duplicate accounts and the
    // (email, has_account) unique-constraint error.
    if (!decoded.actor_id) {
      await sdk.client.fetch("/store/customers/google-link", {
        method: "POST",
        headers: { authorization: `Bearer ${token}` },
      })
      // Refresh to obtain a token whose actor_id is now populated. The SDK does
      // not persist the token server-side, so pass it explicitly — otherwise the
      // refresh call is unauthenticated and Medusa returns 401.
      token = await sdk.auth.refresh({
        authorization: `Bearer ${token}`,
      } as Record<string, string>)
    }

    await setAuthToken(token as string)

    const customerCacheTag = await getCacheTag("customers")
    revalidateTag(customerCacheTag)

    await transferCart()

    return { success: true, error: null }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}
