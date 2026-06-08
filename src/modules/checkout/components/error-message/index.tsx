"use client"

import React from "react"
import { usePathname } from "next/navigation"

const translateError = (errMessage: string, isTr: boolean): string => {
  if (!isTr) return errMessage

  const lower = errMessage.toLowerCase()

  if (lower.includes("credentials database customer already exists") || lower.includes("identity with email") || lower.includes("customer with email already exists")) {
    return "Bu e-posta adresiyle kayıtlı bir hesap zaten var."
  }
  if (lower.includes("invalid email or password") || lower.includes("invalid credentials")) {
    return "E-posta adresi veya şifre hatalı."
  }
  if (lower.includes("password is too short")) {
    return "Şifreniz en az 6 karakter olmalıdır."
  }
  if (lower.includes("discount not found") || lower.includes("invalid discount") || lower.includes("could not find a discount")) {
    return "İndirim kuponu geçersiz veya bulunamadı."
  }
  if (lower.includes("expired")) {
    return "Bu indirim kuponunun kullanım süresi dolmuş."
  }
  if (lower.includes("no shipping options") || lower.includes("select a shipping option")) {
    return "Lütfen geçerli bir teslimat yöntemi seçin."
  }
  if (lower.includes("select a payment method") || lower.includes("payment session")) {
    return "Lütfen bir ödeme yöntemi seçin."
  }
  if (lower.includes("address is required") || lower.includes("required fields missing")) {
    return "Lütfen gerekli tüm adres alanlarını doldurun."
  }
  if (lower.includes("card declined") || lower.includes("payment failed")) {
    return "Ödeme işlemi başarısız oldu. Kart bilgilerinizi kontrol edip tekrar deneyin."
  }
  if (lower.includes("out of stock") || lower.includes("insufficient stock")) {
    return "Seçtiğiniz ürün veya adet stokta bulunmamaktadır."
  }
  if (lower.includes("no response received") || lower.includes("network error")) {
    return "Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edip tekrar deneyin."
  }
  if (lower.includes("internal server error") || lower.includes("something went wrong")) {
    return "Sistemde geçici bir hata oluştu. Lütfen biraz sonra tekrar deneyin."
  }

  // Common fallbacks
  return errMessage
}

const ErrorMessage = ({ error, 'data-testid': dataTestid }: { error?: string | null, 'data-testid'?: string }) => {
  const pathname = usePathname()
  const isTr = pathname?.startsWith("/tr") || pathname === "/tr"

  if (!error) {
    return null
  }

  const translatedText = translateError(error, isTr)

  return (
    <div className="pt-2 text-rose-500 text-small-regular animate-in fade-in-50 duration-200" data-testid={dataTestid}>
      <span>{translatedText}</span>
    </div>
  )
}

export default ErrorMessage
