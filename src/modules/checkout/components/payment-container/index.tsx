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

export const PaynkolayContainer = ({
  cart,
  paymentProviderId,
  selectedPaymentOptionId,
  paymentInfoMap,
  disabled = false,
}: Omit<PaymentContainerProps, "children"> & {
  cart: any
}) => {
  const [cards, setCards] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedCardToken, setSelectedCardToken] = useState<string>("new")
  const [saveCardChecked, setSaveCardChecked] = useState(true)
  const [deletingToken, setDeletingToken] = useState<string | null>(null)

  const customerPhone = useMemo(() => {
    const rawPhone = cart?.shipping_address?.phone || cart?.billing_address?.phone || ""
    const cleaned = rawPhone.replace(/\D/g, "")
    if (cleaned.length < 5 && cart?.email) {
      return cart.email.replace(/[^a-zA-Z0-9]/g, "")
    }
    return cleaned
  }, [cart])

  const fetchCards = async () => {
    if (!customerPhone) return
    setLoading(true)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
      const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
      const res = await fetch(`${backendUrl}/store/paynkolay/cards?customerKey=${customerPhone}`, {
        headers: {
          "x-publishable-api-key": publishableKey,
        },
      })
      if (res.ok) {
        const json = await res.json()
        if (json.success && json.data?.Data?.cards?.Card) {
          const rawCards = json.data.Data.cards.Card
          // The API might return a single object or an array. Normalizing:
          let normalized: any[] = []
          if (rawCards.CardFileds?.Detail) {
            const detail = rawCards.CardFileds.Detail
            normalized = Array.isArray(detail) ? detail : [detail]
          } else if (Array.isArray(rawCards)) {
            normalized = rawCards.map((c: any) => c.CardFileds?.Detail).filter(Boolean)
          } else if (Array.isArray(rawCards.CardFileds)) {
            normalized = rawCards.CardFileds.map((c: any) => c.Detail).filter(Boolean)
          }
          setCards(normalized)
          if (normalized.length > 0) {
            setSelectedCardToken(normalized[0].Token || normalized[0].TranId)
          }
        } else {
          setCards([])
        }
      }
    } catch (err) {
      console.error("Failed to fetch saved cards:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedPaymentOptionId === paymentProviderId && customerPhone) {
      fetchCards()
    }
  }, [selectedPaymentOptionId, paymentProviderId, customerPhone])

  // Sync selections to sessionStorage for the submit button to read
  useEffect(() => {
    if (selectedPaymentOptionId === paymentProviderId) {
      sessionStorage.setItem("paynkolay_selected_card", selectedCardToken)
      if (selectedCardToken !== "new") {
        sessionStorage.setItem("paynkolay_customer_key", customerPhone)
        sessionStorage.removeItem("paynkolay_save_card")
      } else {
        sessionStorage.setItem("paynkolay_save_card", saveCardChecked ? "true" : "false")
        if (saveCardChecked && customerPhone) {
          sessionStorage.setItem("paynkolay_customer_key", customerPhone)
        } else {
          sessionStorage.removeItem("paynkolay_customer_key")
        }
      }
    } else {
      // Clear if unselected
      sessionStorage.removeItem("paynkolay_selected_card")
      sessionStorage.removeItem("paynkolay_customer_key")
      sessionStorage.removeItem("paynkolay_save_card")
    }
  }, [selectedPaymentOptionId, paymentProviderId, selectedCardToken, saveCardChecked, customerPhone])

  const handleDeleteCard = async (token: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("Bu kayıtlı kartı silmek istediğinize emin misiniz?")) return
    setDeletingToken(token)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
      const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
      const res = await fetch(`${backendUrl}/store/paynkolay/cards`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": publishableKey,
        },
        body: JSON.stringify({
          customerKey: customerPhone,
          token,
        }),
      })
      if (res.ok) {
        // Refresh list
        await fetchCards()
        if (selectedCardToken === token) {
          setSelectedCardToken("new")
        }
      }
    } catch (err) {
      console.error("Failed to delete card:", err)
    } finally {
      setDeletingToken(null)
    }
  }

  if (selectedPaymentOptionId !== paymentProviderId) {
    return (
      <PaymentContainer
        paymentProviderId={paymentProviderId}
        selectedPaymentOptionId={selectedPaymentOptionId}
        paymentInfoMap={paymentInfoMap}
        disabled={disabled}
      />
    )
  }

  return (
    <PaymentContainer
      paymentProviderId={paymentProviderId}
      selectedPaymentOptionId={selectedPaymentOptionId}
      paymentInfoMap={paymentInfoMap}
      disabled={disabled}
    >
      <div className="my-4 p-4 border border-ui-border-base rounded-lg bg-ui-bg-subtle transition-all duration-300">
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            <span className="ml-3 text-sm text-ui-fg-subtle">Kayıtlı kartlarınız yükleniyor...</span>
          </div>
        ) : (
          <div className="flex flex-col gap-y-4">
            {cards.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <Text className="text-sm font-semibold text-ui-fg-base">Kayıtlı Kartlarınız ile Ödeyin</Text>
                <div className="flex flex-col gap-y-2">
                  {cards.map((card) => {
                    const isSelected = selectedCardToken === card.Token
                    
                    return (
                      <div
                        key={card.Token}
                        onClick={() => setSelectedCardToken(card.Token)}
                        className={clx(
                          "flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm",
                          {
                            "border-indigo-600 bg-indigo-50/30": isSelected,
                            "border-ui-border-base bg-white": !isSelected,
                          }
                        )}
                      >
                        <div className="flex items-center gap-x-3">
                          <input
                            type="radio"
                            name="paynkolay_saved_card"
                            checked={isSelected}
                            onChange={() => setSelectedCardToken(card.Token)}
                            className="text-indigo-600 focus:ring-indigo-500"
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-ui-fg-base">
                              {card.CARD_ALIACE || card.CARDISSUER || "Kayıtlı Kart"}
                            </span>
                            <span className="text-xs text-ui-fg-subtle">
                              {card.Maskedpan}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleDeleteCard(card.Token, e)}
                          disabled={deletingToken === card.Token}
                          className="text-ui-fg-subtle hover:text-brand-600 p-1.5 rounded-full hover:bg-brand-50 transition-colors"
                          title="Kartı Sil"
                        >
                          {deletingToken === card.Token ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-600"></div>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                          )}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div
              onClick={() => setSelectedCardToken("new")}
              className={clx(
                "flex flex-col p-3 border rounded-lg cursor-pointer transition-all duration-200",
                {
                  "border-indigo-600 bg-indigo-50/30": selectedCardToken === "new",
                  "border-ui-border-base bg-white": selectedCardToken !== "new",
                }
              )}
            >
              <div className="flex items-center gap-x-3">
                <input
                  type="radio"
                  name="paynkolay_saved_card"
                  checked={selectedCardToken === "new"}
                  onChange={() => setSelectedCardToken("new")}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-ui-fg-base">Yeni Kart ile Öde</span>
              </div>

              {selectedCardToken === "new" && (
                <div className="mt-4 pt-3 border-t border-dashed border-ui-border-base flex flex-col gap-y-3">
                  <label className="flex items-start gap-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveCardChecked}
                      onChange={(e) => setSaveCardChecked(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-ui-fg-base">Kartımı gelecekteki alışverişlerim için güvenli şekilde sakla</span>
                      <span className="text-xs text-ui-fg-subtle mt-0.5">
                        Kart bilgileriniz Paynkolay (PCI-DSS uyumlu) altyapısında güvenle saklanır, bir sonraki alışverişinizde SMS şifresiyle kolayca ödeyebilirsiniz.
                      </span>
                    </div>
                  </label>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </PaymentContainer>
  )
}
