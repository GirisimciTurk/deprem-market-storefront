"use client"

import React from "react"
import { useTranslations } from "next-intl"

const errorMessageKey = (errMessage: string): string | null => {
  const lower = errMessage.toLowerCase()

  if (lower.includes("credentials database customer already exists") || lower.includes("identity with email") || lower.includes("customer with email already exists")) {
    return "accountExists"
  }
  if (lower.includes("invalid email or password") || lower.includes("invalid credentials")) {
    return "invalidCredentials"
  }
  if (lower.includes("password is too short")) {
    return "passwordTooShort"
  }
  if (lower.includes("discount not found") || lower.includes("invalid discount") || lower.includes("could not find a discount")) {
    return "discountInvalid"
  }
  if (lower.includes("expired")) {
    return "discountExpired"
  }
  if (lower.includes("no shipping options") || lower.includes("select a shipping option")) {
    return "selectShipping"
  }
  if (lower.includes("select a payment method") || lower.includes("payment session")) {
    return "selectPayment"
  }
  if (lower.includes("address is required") || lower.includes("required fields missing")) {
    return "addressRequired"
  }
  if (lower.includes("card declined") || lower.includes("payment failed")) {
    return "paymentFailed"
  }
  if (lower.includes("out of stock") || lower.includes("insufficient stock")) {
    return "outOfStock"
  }
  if (lower.includes("no response received") || lower.includes("network error")) {
    return "networkError"
  }
  if (lower.includes("internal server error") || lower.includes("something went wrong")) {
    return "serverError"
  }

  return null
}

const ErrorMessage = ({ error, 'data-testid': dataTestid }: { error?: string | null, 'data-testid'?: string }) => {
  const t = useTranslations("checkoutError")

  if (!error) {
    return null
  }

  const key = errorMessageKey(error)
  const translatedText = key ? t(key) : error

  return (
    <div className="pt-2 text-rose-500 text-small-regular animate-in fade-in-50 duration-200" data-testid={dataTestid}>
      <span>{translatedText}</span>
    </div>
  )
}

export default ErrorMessage
