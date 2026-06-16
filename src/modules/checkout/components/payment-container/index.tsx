import { Radio as RadioGroupOption } from "@headlessui/react"
import { Text, clx } from "@modules/common/components/ui"
import React, { useContext, useMemo, useState, useEffect, type JSX } from "react"

import Radio from "@modules/common/components/radio"

import { isManual } from "@lib/constants"
import SkeletonCardDetails from "@modules/skeletons/components/skeleton-card-details"
import { CardElement } from "@stripe/react-stripe-js"
import { StripeCardElementOptions } from "@stripe/stripe-js"
import PaymentTest from "../payment-test"
import { StripeContext } from "../payment-wrapper/stripe-wrapper"

type PaymentContainerProps = {
  paymentProviderId: string
  selectedPaymentOptionId: string | null
  disabled?: boolean
  paymentInfoMap: Record<string, { title: string; icon: JSX.Element }>
  children?: React.ReactNode
}

const PaymentContainer: React.FC<PaymentContainerProps> = ({
  paymentProviderId,
  selectedPaymentOptionId,
  paymentInfoMap,
  disabled = false,
  children,
}) => {
  const isDevelopment = process.env.NODE_ENV === "development"

  return (
    <RadioGroupOption
      key={paymentProviderId}
      value={paymentProviderId}
      disabled={disabled}
      className={clx(
        "flex flex-col gap-y-2 text-small-regular cursor-pointer py-4 border rounded-rounded px-8 mb-2 hover:shadow-borders-interactive-with-active",
        {
          "border-ui-border-interactive":
            selectedPaymentOptionId === paymentProviderId,
        }
      )}
    >
      <div className="flex items-center justify-between ">
        <div className="flex items-center gap-x-4">
          <Radio checked={selectedPaymentOptionId === paymentProviderId} />
          <Text className="text-base-regular">
            {paymentInfoMap[paymentProviderId]?.title || paymentProviderId}
          </Text>
          {isManual(paymentProviderId) && isDevelopment && (
            <PaymentTest className="hidden small:block" />
          )}
        </div>
        <span className="justify-self-end text-ui-fg-base">
          {paymentInfoMap[paymentProviderId]?.icon}
        </span>
      </div>
      {isManual(paymentProviderId) && isDevelopment && (
        <PaymentTest className="small:hidden text-[10px]" />
      )}
      {children}
    </RadioGroupOption>
  )
}

export default PaymentContainer

export const StripeCardContainer = ({
  paymentProviderId,
  selectedPaymentOptionId,
  paymentInfoMap,
  disabled = false,
  setCardBrand,
  setError,
  setCardComplete,
}: Omit<PaymentContainerProps, "children"> & {
  setCardBrand: (brand: string) => void
  setError: (error: string | null) => void
  setCardComplete: (complete: boolean) => void
}) => {
  const stripeReady = useContext(StripeContext)

  const useOptions: StripeCardElementOptions = useMemo(() => {
    return {
      style: {
        base: {
          fontFamily: "Inter, sans-serif",
          color: "#424270",
          "::placeholder": {
            color: "rgb(107 114 128)",
          },
        },
      },
      classes: {
        base: "pt-3 pb-1 block w-full h-11 px-4 mt-0 bg-ui-bg-field border rounded-md appearance-none focus:outline-none focus:ring-0 focus:shadow-borders-interactive-with-active border-ui-border-base hover:bg-ui-bg-field-hover transition-all duration-300 ease-in-out",
      },
    }
  }, [])

  return (
    <PaymentContainer
      paymentProviderId={paymentProviderId}
      selectedPaymentOptionId={selectedPaymentOptionId}
      paymentInfoMap={paymentInfoMap}
      disabled={disabled}
    >
      {selectedPaymentOptionId === paymentProviderId &&
        (stripeReady ? (
          <div className="my-4 transition-all duration-150 ease-in-out">
            <Text className="txt-medium-plus text-ui-fg-base mb-1">
              Kart bilgilerinizi girin:
            </Text>
            <CardElement
              options={useOptions as StripeCardElementOptions}
              onChange={(e) => {
                setCardBrand(
                  e.brand && e.brand.charAt(0).toUpperCase() + e.brand.slice(1)
                )
                setError(e.error?.message || null)
                setCardComplete(e.complete)
              }}
            />
          </div>
        ) : (
          <SkeletonCardDetails />
        ))}
    </PaymentContainer>
  )
}

export const IyzicoCardContainer = ({
  paymentProviderId,
  selectedPaymentOptionId,
  paymentInfoMap,
  disabled = false,
  setIyzicoComplete,
}: Omit<PaymentContainerProps, "children"> & {
  setIyzicoComplete: (complete: boolean) => void
}) => {
  const [cardholderName, setCardholderName] = useState("")
  const [cardNumber, setCardNumber] = useState("")
  const [expiry, setExpiry] = useState("")
  const [cvc, setCvc] = useState("")
  const [selectedInstallment, setSelectedInstallment] = useState("1")

  const formattedCardNumber = cardNumber
    .replace(/\D/g, "")
    .replace(/(\d{4})/g, "$1 ")
    .trim()

  const formattedExpiry = expiry
    .replace(/\D/g, "")
    .replace(/(\d{2})/g, "$1/")
    .replace(/\/$/, "")

  const cardBrand = useMemo(() => {
    const clean = cardNumber.replace(/\D/g, "")
    if (clean.startsWith("4")) return "Visa"
    if (/^(5[1-5]|2[2-7])/.test(clean)) return "Mastercard"
    if (clean.startsWith("9792")) return "Troy"
    if (/^(34|37)/.test(clean)) return "Amex"
    return "Bilinmeyen"
  }, [cardNumber])

  const isValid = useMemo(() => {
    const cleanNum = cardNumber.replace(/\D/g, "")
    const cleanExp = expiry.replace(/\D/g, "")
    const cleanCvc = cvc.replace(/\D/g, "")

    const numValid = cleanNum.length === 16 || cleanNum.length === 15
    const expValid = cleanExp.length === 4
    const cvcValid = cleanCvc.length === 3 || cleanCvc.length === 4
    const nameValid = cardholderName.trim().length > 3

    return numValid && expValid && cvcValid && nameValid
  }, [cardNumber, expiry, cvc, cardholderName])

  useEffect(() => {
    setIyzicoComplete(isValid)
  }, [isValid, setIyzicoComplete])

  return (
    <PaymentContainer
      paymentProviderId={paymentProviderId}
      selectedPaymentOptionId={selectedPaymentOptionId}
      paymentInfoMap={paymentInfoMap}
      disabled={disabled}
    >
      {selectedPaymentOptionId === paymentProviderId && (
        <div className="my-6 p-4 border border-ui-border-base rounded-lg bg-ui-bg-subtle transition-all duration-300">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold text-ui-fg-base text-sm">iyzico Güvenli Ödeme Simülasyonu</span>
            {cardBrand !== "Bilinmeyen" && (
              <span className="text-xs px-2 py-1 bg-brand-50 border border-brand-200 text-brand-700 rounded-md font-semibold">
                {cardBrand}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-y-3">
            <div>
              <label className="block text-xs font-semibold text-ui-fg-subtle mb-1">Kart Sahibi Adı Soyadı</label>
              <input
                type="text"
                placeholder="Ahmet Yılmaz"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                className="w-full h-10 px-3 border border-ui-border-base rounded-md focus:outline-none focus:border-brand-500 text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ui-fg-subtle mb-1">Kart Numarası</label>
              <input
                type="text"
                placeholder="0000 0000 0000 0000"
                value={formattedCardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
                className="w-full h-10 px-3 border border-ui-border-base rounded-md focus:outline-none focus:border-brand-500 text-sm bg-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-x-3">
              <div>
                <label className="block text-xs font-semibold text-ui-fg-subtle mb-1">Son Kullanma (AA/YY)</label>
                <input
                  type="text"
                  placeholder="AA/YY"
                  value={formattedExpiry}
                  onChange={(e) => setExpiry(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  className="w-full h-10 px-3 border border-ui-border-base rounded-md focus:outline-none focus:border-brand-500 text-sm bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ui-fg-subtle mb-1">CVC (Güvenlik Kodu)</label>
                <input
                  type="text"
                  placeholder="000"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  className="w-full h-10 px-3 border border-ui-border-base rounded-md focus:outline-none focus:border-brand-500 text-sm bg-white"
                />
              </div>
            </div>

            {cardNumber.replace(/\D/g, "").length >= 6 && (
              <div className="mt-4 border-t pt-4">
                <label className="block text-xs font-semibold text-ui-fg-subtle mb-2">Taksit Seçenekleri</label>
                <div className="flex flex-col border border-ui-border-base rounded-md overflow-hidden bg-white">
                  <label className="flex items-center justify-between p-3 border-b border-ui-border-base last:border-0 hover:bg-ui-bg-field-hover cursor-pointer">
                    <div className="flex items-center gap-x-2">
                      <input
                        type="radio"
                        name="installments"
                        value="1"
                        checked={selectedInstallment === "1"}
                        onChange={() => setSelectedInstallment("1")}
                        className="text-brand-600 focus:ring-brand-500"
                      />
                      <span className="text-sm text-ui-fg-base font-medium">Tek Çekim</span>
                    </div>
                    <span className="text-sm font-semibold text-ui-fg-base">Peşin Fiyatına</span>
                  </label>
                  <label className="flex items-center justify-between p-3 border-b border-ui-border-base last:border-0 hover:bg-ui-bg-field-hover cursor-pointer">
                    <div className="flex items-center gap-x-2">
                      <input
                        type="radio"
                        name="installments"
                        value="3"
                        checked={selectedInstallment === "3"}
                        onChange={() => setSelectedInstallment("3")}
                        className="text-brand-600 focus:ring-brand-500"
                      />
                      <span className="text-sm text-ui-fg-base font-medium">3 Taksit</span>
                    </div>
                    <span className="text-sm font-semibold text-ui-fg-base">Peşin Fiyatına</span>
                  </label>
                  <label className="flex items-center justify-between p-3 border-b border-ui-border-base last:border-0 hover:bg-ui-bg-field-hover cursor-pointer">
                    <div className="flex items-center gap-x-2">
                      <input
                        type="radio"
                        name="installments"
                        value="6"
                        checked={selectedInstallment === "6"}
                        onChange={() => setSelectedInstallment("6")}
                        className="text-brand-600 focus:ring-brand-500"
                      />
                      <span className="text-sm text-ui-fg-base font-medium">6 Taksit</span>
                    </div>
                    <span className="text-sm font-semibold text-ui-fg-base">Peşin Fiyatına</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </PaymentContainer>
  )
}
