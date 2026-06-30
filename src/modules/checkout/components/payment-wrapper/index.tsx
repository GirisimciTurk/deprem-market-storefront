"use client"

import { loadStripe } from "@stripe/stripe-js"
import React from "react"
import StripeWrapper from "./stripe-wrapper"
import { HttpTypes } from "@medusajs/types"
import { isStripeLike } from "@lib/constants"

type PaymentWrapperProps = {
  cart: HttpTypes.StoreCart
  children: React.ReactNode
}

const stripeKey =
  process.env.NEXT_PUBLIC_STRIPE_KEY ||
  process.env.NEXT_PUBLIC_MEDUSA_PAYMENTS_PUBLISHABLE_KEY

const medusaAccountId = process.env.NEXT_PUBLIC_MEDUSA_PAYMENTS_ACCOUNT_ID

// Stripe.js'i yalnızca gerçekten bir Stripe ödeme oturumu varken yükle.
// Eskiden modül yüklenir yüklenmez loadStripe çağrılıyordu → checkout'ta
// js.stripe.com enjekte edilip CSP'ye takılıyordu (bu projede Stripe provider
// yok; PayTR/Paynkolay kullanılır). Lazy çağrı bu gürültüyü kaldırır.
let stripePromise: ReturnType<typeof loadStripe> | null = null
const getStripePromise = () => {
  if (!stripeKey) {
    return null
  }
  if (!stripePromise) {
    stripePromise = loadStripe(
      stripeKey,
      medusaAccountId ? { stripeAccount: medusaAccountId } : undefined
    )
  }
  return stripePromise
}

const PaymentWrapper: React.FC<PaymentWrapperProps> = ({ cart, children }) => {
  const paymentSession = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )

  if (isStripeLike(paymentSession?.provider_id) && paymentSession) {
    const stripePromiseValue = getStripePromise()
    if (stripePromiseValue) {
      return (
        <StripeWrapper
          paymentSession={paymentSession}
          stripeKey={stripeKey}
          stripePromise={stripePromiseValue}
        >
          {children}
        </StripeWrapper>
      )
    }
  }

  return <div>{children}</div>
}

export default PaymentWrapper
