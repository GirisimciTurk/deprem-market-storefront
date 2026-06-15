"use client"

import { isManual, isStripeLike } from "@lib/constants"
import { placeOrder } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@modules/common/components/ui"
import { useElements, useStripe } from "@stripe/react-stripe-js"
import React, { useEffect, useState } from "react"
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
    case paymentSession?.provider_id === "pp_paytr_paytr":
      return (
        <PayTRPaymentButton
          notReady={notReady || disabled}
          cart={cart}
          data-testid={dataTestId}
        />
      )
    default:
      return <Button disabled>Ödeme yöntemi seçin</Button>
  }
}

/**
 * PayTR iFrame ödeme: "Siparişi Tamamla" → backend'den iframe token alınır →
 * PayTR güvenli ödeme iframe'i modal'da açılır. Ödeme sonucu sunucu-sunucu
 * /paytr-callback'e gelir (sipariş orada oluşur); iframe sonra ok/fail URL'ine
 * (storefront /tr/odeme/sonuc) yönlenir ve üst pencereyi yönlendirir.
 */
const PayTRPaymentButton = ({
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
  const [iframeToken, setIframeToken] = useState<string | null>(null)

  // PayTR iframe boy uyarlayıcısını token gelince yükle.
  useEffect(() => {
    if (!iframeToken) return
    const s = document.createElement("script")
    s.src = "https://www.paytr.com/js/iframeResizer.min.js"
    s.async = true
    s.onload = () => {
      try {
        ;(window as any).iFrameResize?.({}, "#paytriframe")
      } catch {
        /* resizer best-effort */
      }
    }
    document.body.appendChild(s)
    return () => {
      try {
        document.body.removeChild(s)
      } catch {
        /* noop */
      }
    }
  }, [iframeToken])

  const handleSubmit = async () => {
    setSubmitting(true)
    setErrorMessage(null)
    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
      const publishableKey =
        process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
      const res = await fetch(`${backendUrl}/store/paytr/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": publishableKey,
        },
        credentials: "include",
        body: JSON.stringify({ cart_id: cart.id }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json.success || !json.iframe_token) {
        throw new Error(json.error || "PayTR ödeme başlatılamadı. Lütfen tekrar deneyin.")
      }
      setIframeToken(json.iframe_token)
    } catch (err: any) {
      setErrorMessage(err.message || "Bir hata oluştu. Lütfen tekrar deneyin.")
      setSubmitting(false)
    }
  }

  if (iframeToken) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-3 sm:p-4">
        <div className="bg-white rounded-xl w-full max-w-lg max-h-[92vh] overflow-auto relative shadow-2xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 sticky top-0 bg-white">
            <span className="font-semibold text-gray-900">Güvenli Ödeme (PayTR)</span>
            <button
              type="button"
              onClick={() => {
                setIframeToken(null)
                setSubmitting(false)
              }}
              className="text-gray-400 hover:text-gray-700 text-xl leading-none"
              aria-label="Kapat"
            >
              ×
            </button>
          </div>
          <iframe
            src={`https://www.paytr.com/odeme/guvenli/${iframeToken}`}
            id="paytriframe"
            frameBorder={0}
            scrolling="yes"
            style={{ width: "100%", minHeight: 620, border: "none" }}
            title="PayTR Ödeme"
          />
        </div>
      </div>
    )
  }

  return (
    <>
      <Button
        onClick={handleSubmit}
        disabled={notReady}
        isLoading={submitting}
        size="large"
        className="w-full"
        data-testid={dataTestId}
      >
        PayTR ile Güvenli Öde
      </Button>
      <ErrorMessage error={errorMessage} data-testid="paytr-payment-error-message" />
    </>
  )
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
      const usingSavedCard = selectedCard !== "new"

      // Paynkolay'a POST edilecek VE hash'e girecek tek tutarlı csCustomerKey değeri.
      // Doküman: kart saklama kullanılmıyorsa boş olmalı. Hash bununla imzalanır;
      // forma da aynısı POST edilir (uyumsuzluk = geçersiz imza).
      const effectiveCustomerKey = usingSavedCard || saveCard ? customerKey : ""

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
          csCustomerKey: effectiveCustomerKey,
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

      const appendHidden = (name: string, value: string) => {
        const input = document.createElement("input")
        input.type = "hidden"
        input.name = name
        input.value = value
        form.appendChild(input)
      }

      // csCustomerKey: hash'e giren değerle BİREBİR aynı (boş ya da dolu).
      appendHidden("csCustomerKey", effectiveCustomerKey)

      if (usingSavedCard) {
        // Kayıtlı kartla ödeme: kartın token'ı gönderilir.
        appendHidden("csToken", selectedCard)
      } else if (saveCard) {
        // Yeni kartı kaydet: csAutoSave=true (3D Secure zorunlu).
        appendHidden("csAutoSave", "true")
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
