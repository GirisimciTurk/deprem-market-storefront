"use client"

import { isManual } from "@lib/constants"
import { openPaytrPayment, placeOrder } from "@lib/data/cart"
import { StoreCart } from "types/store"
import { Button } from "@modules/common/components/ui"
import React, { useEffect, useState } from "react"
import ErrorMessage from "../error-message"

type PaymentButtonProps = {
  cart: StoreCart
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
    case isManual(paymentSession?.provider_id):
      return (
        <ManualTestPaymentButton notReady={notReady || disabled} data-testid={dataTestId} />
      )
    case paymentSession?.provider_id === "paytr":
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
 * PayTR iFrame ödeme: "Siparişi Tamamla" → gobit'te PayTR oturumu açılır, iframe
 * jetonu alınır → PayTR güvenli ödeme iframe'i modal'da açılır. PayTR ödemeyi
 * gobit'e bildirir; iframe sonra ok/fail URL'ine (/tr/odeme/sonuc) yönlenir,
 * o sayfa sepeti tamamlama sırrıyla tamamlayıp siparişe gider (gobit ADR 0438).
 */
const PayTRPaymentButton = ({
  cart: _cart,
  notReady,
  "data-testid": dataTestId,
}: {
  cart: StoreCart
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
      // gobit'te PayTR oturumunu açar (tutar ve adres kesinleşti); iframe jetonu döner.
      const json = await openPaytrPayment()
      if (!json.iframe_token) {
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
            src={`${process.env.NEXT_PUBLIC_PAYTR_BASE_URL || "https://www.paytr.com"}/odeme/guvenli/${iframeToken}`}
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
