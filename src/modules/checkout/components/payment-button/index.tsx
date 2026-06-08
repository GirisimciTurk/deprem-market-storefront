"use client"

import { isManual, isStripeLike } from "@lib/constants"
import { placeOrder } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@modules/common/components/ui"
import { useElements, useStripe } from "@stripe/react-stripe-js"
import React, { useState } from "react"
import ErrorMessage from "../error-message"

type PaymentButtonProps = {
  cart: HttpTypes.StoreCart
  "data-testid": string
  disabled?: boolean
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  cart,
  "data-testid": dataTestId,
  disabled = false,
}) => {
  const notReady =
    !cart ||
    !cart.shipping_address ||
    !cart.billing_address ||
    !cart.email ||
    (cart.shipping_methods?.length ?? 0) < 1

  const paymentSession = cart.payment_collection?.payment_sessions?.[0]

  switch (true) {
    case isStripeLike(paymentSession?.provider_id):
      return (
        <StripePaymentButton
          notReady={notReady || disabled}
          cart={cart}
          data-testid={dataTestId}
        />
      )
    case isManual(paymentSession?.provider_id):
      return (
        <ManualTestPaymentButton notReady={notReady || disabled} data-testid={dataTestId} />
      )
    case paymentSession?.provider_id === "pp_paynkolay_paynkolay":
      return (
        <PaynkolayPaymentButton
          notReady={notReady || disabled}
          cart={cart}
          data-testid={dataTestId}
        />
      )
    default:
      return <Button disabled>Ödeme yöntemi seçin</Button>
  }
}

const PaynkolayPaymentButton = ({
  cart,
  notReady,
  "data-testid": dataTestId,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid": string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  const paymentSession = cart.payment_collection?.payment_sessions?.find(
    (s) => s.provider_id === "pp_paynkolay_paynkolay"
  )

  if (!paymentSession) {
    return <Button disabled>Ödeme yöntemi bulunamadı</Button>
  }

  const sessionData = paymentSession.data as Record<string, string>
  // actionUrl is supplied by the backend payment provider (test/prod endpoint is
  // chosen there). Never fall back to a hardcoded test endpoint.
  const actionUrl = sessionData.actionUrl || ""

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMessage(null)

    if (!actionUrl) {
      setErrorMessage("Ödeme yöntemi yapılandırılamadı. Lütfen daha sonra tekrar deneyin.")
      setSubmitting(false)
      return
    }

    try {
      const selectedCard = sessionStorage.getItem("paynkolay_selected_card") || "new"
      const customerKey = sessionStorage.getItem("paynkolay_customer_key") || ""
      const saveCard = customerKey ? (sessionStorage.getItem("paynkolay_save_card") === "true") : false

      const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
      const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

      const response = await fetch(`${backendUrl}/store/paynkolay/hash`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": publishableKey,
        },
        body: JSON.stringify({
          clientRefCode: sessionData.clientRefCode,
          amount: sessionData.amount,
          successUrl: sessionData.successUrl,
          failUrl: sessionData.failUrl,
          rnd: sessionData.rnd,
          csCustomerKey: customerKey,
        }),
      })

      if (!response.ok) {
        throw new Error(`Ödeme imzası oluşturulamadı (Backend Hata Kodu: ${response.status}). Lütfen tekrar deneyin.`)
      }

      const hashResult = await response.json()

      if (!hashResult.success || !hashResult.hashDataV2) {
        throw new Error(hashResult.error || "Ödeme imzası doğrulaması başarısız.")
      }

      // Create temporary form
      const form = document.createElement("form")
      form.method = "POST"
      form.action = actionUrl

      // Add all original session fields except actionUrl, status, and card-saving keys
      Object.entries(sessionData).forEach(([key, value]) => {
        if (
          key === "actionUrl" ||
          key === "status" ||
          key === "csCustomerKey" ||
          key === "csAutoSave" ||
          key === "csToken"
        ) return
        const input = document.createElement("input")
        input.type = "hidden"
        input.name = key
        input.value = value
        form.appendChild(input)
      })

      // Replace the old hashDataV2 with the newly signed hashDataV2
      const hashInput = form.querySelector('input[name="hashDataV2"]') as HTMLInputElement
      if (hashInput) {
        hashInput.value = hashResult.hashDataV2
      } else {
        const input = document.createElement("input")
        input.type = "hidden"
        input.name = "hashDataV2"
        input.value = hashResult.hashDataV2
        form.appendChild(input)
      }

      // If we are paying with a saved card
      if (selectedCard !== "new") {
        const tokenInput = document.createElement("input")
        tokenInput.type = "hidden"
        tokenInput.name = "csToken"
        tokenInput.value = selectedCard
        form.appendChild(tokenInput)

        const keyInput = document.createElement("input")
        keyInput.type = "hidden"
        keyInput.name = "csCustomerKey"
        keyInput.value = customerKey
        form.appendChild(keyInput)
      } else {
        // If we want to save the new card
        if (saveCard) {
          const saveInput = document.createElement("input")
          saveInput.type = "hidden"
          saveInput.name = "csAutoSave"
          saveInput.value = "true"
          form.appendChild(saveInput)

          const keyInput = document.createElement("input")
          keyInput.type = "hidden"
          keyInput.name = "csCustomerKey"
          keyInput.value = customerKey
          form.appendChild(keyInput)
        } else {
          // Explicitly append empty string for csCustomerKey if not saving
          const keyInput = document.createElement("input")
          keyInput.type = "hidden"
          keyInput.name = "csCustomerKey"
          keyInput.value = ""
          form.appendChild(keyInput)
        }
      }

      document.body.appendChild(form)
      form.submit()
    } catch (err: any) {
      setErrorMessage(err.message || "Bir hata oluştu. Lütfen tekrar deneyin.")
      setSubmitting(false)
    }
  }

  return (
    <>
      <form action={actionUrl} method="POST" onSubmit={handleSubmit}>
        {Object.entries(sessionData).map(([key, value]) => {
          if (key === "actionUrl" || key === "status") return null
          return <input key={key} type="hidden" name={key} value={value} />
        })}
        <Button
          type="submit"
          disabled={notReady}
          isLoading={submitting}
          size="large"
          className="w-full"
          data-testid={dataTestId}
        >
          Siparişi Tamamla
        </Button>
      </form>
      <ErrorMessage
        error={errorMessage}
        data-testid="paynkolay-payment-error-message"
      />
    </>
  )
}

const StripePaymentButton = ({
  cart,
  notReady,
  "data-testid": dataTestId,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const stripe = useStripe()
  const elements = useElements()
  const card = elements?.getElement("card")

  const session = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )

  const disabled = !stripe || !elements ? true : false

  const handlePayment = async () => {
    setSubmitting(true)

    if (!stripe || !elements || !card || !cart) {
      setSubmitting(false)
      return
    }

    await stripe
      .confirmCardPayment(session?.data.client_secret as string, {
        payment_method: {
          card: card,
          billing_details: {
            name:
              cart.billing_address?.first_name +
              " " +
              cart.billing_address?.last_name,
            address: {
              city: cart.billing_address?.city ?? undefined,
              country: cart.billing_address?.country_code ?? undefined,
              line1: cart.billing_address?.address_1 ?? undefined,
              line2: cart.billing_address?.address_2 ?? undefined,
              postal_code: cart.billing_address?.postal_code ?? undefined,
              state: cart.billing_address?.province ?? undefined,
            },
            email: cart.email,
            phone: cart.billing_address?.phone ?? undefined,
          },
        },
      })
      .then(({ error, paymentIntent }) => {
        if (error) {
          const pi = error.payment_intent

          if (
            (pi && pi.status === "requires_capture") ||
            (pi && pi.status === "succeeded")
          ) {
            onPaymentCompleted()
          }

          setErrorMessage(error.message || null)
          return
        }

        if (
          (paymentIntent && paymentIntent.status === "requires_capture") ||
          paymentIntent.status === "succeeded"
        ) {
          return onPaymentCompleted()
        }

        return
      })
  }

  return (
    <>
      <Button
        disabled={disabled || notReady}
        onClick={handlePayment}
        size="large"
        isLoading={submitting}
        data-testid={dataTestId}
      >
        Siparişi Tamamla
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="stripe-payment-error-message"
      />
    </>
  )
}

const ManualTestPaymentButton = ({ notReady }: { notReady: boolean }) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const handlePayment = () => {
    setSubmitting(true)

    onPaymentCompleted()
  }

  return (
    <>
      <Button
        disabled={notReady}
        isLoading={submitting}
        onClick={handlePayment}
        size="large"
        data-testid="submit-order-button"
      >
        Siparişi Tamamla
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="manual-payment-error-message"
      />
    </>
  )
}

export default PaymentButton
