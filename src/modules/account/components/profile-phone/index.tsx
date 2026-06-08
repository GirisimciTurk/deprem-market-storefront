"use client"

import React, { useEffect, useActionState } from "react";

import Input from "@modules/common/components/input"

import AccountInfo from "../account-info"
import { HttpTypes } from "@medusajs/types"
import { updateCustomer } from "@lib/data/customer"

type MyInformationProps = {
  customer: HttpTypes.StoreCustomer
}

const ProfilePhone: React.FC<MyInformationProps> = ({ customer }) => {
  const [successState, setSuccessState] = React.useState(false)

  const updateCustomerPhone = async (
    _currentState: Record<string, unknown>,
    formData: FormData
  ) => {
    let phoneVal = (formData.get("phone") as string || "").trim().replace(/[\s\(\)\-\.]/g, "")

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
      return { 
        success: false, 
        error: "Lütfen geçerli bir cep telefonu numarası girin (Örn: 0555 123 45 67)" 
      }
    }

    const updatedData = {
      phone: phoneVal,
    }

    try {
      await updateCustomer(updatedData)
      return { success: true, error: null }
    } catch {
      return { success: false, error: "Telefon numarası güncellenemedi. Lütfen tekrar deneyin." }
    }
  }

  const [state, formAction] = useActionState(updateCustomerPhone, {
    error: null as string | null,
    success: false,
  })

  const clearState = () => {
    setSuccessState(false)
  }

  useEffect(() => {
    setSuccessState(state.success)
  }, [state])

  return (
    <form action={formAction} className="w-full">
      <AccountInfo
        label="Telefon Numarası"
        currentInfo={customer.phone ? `${customer.phone}` : "Tanımlanmamış"}
        isSuccess={successState}
        isError={!!state.error}
        errorMessage={state.error || undefined}
        clearState={clearState}
        data-testid="account-phone-editor"
      >
        <div className="grid grid-cols-1 gap-y-2">
          <Input
            label="Telefon Numarası"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            defaultValue={customer.phone ?? ""}
            data-testid="phone-input"
          />
        </div>
      </AccountInfo>
    </form>
  )
}

export default ProfilePhone
