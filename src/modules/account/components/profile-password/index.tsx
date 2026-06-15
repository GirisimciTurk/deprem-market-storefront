"use client"

import React, { useEffect, useActionState } from "react"
import Input from "@modules/common/components/input"
import AccountInfo from "../account-info"
import { HttpTypes } from "@medusajs/types"
import { updateCustomerPassword } from "@lib/data/customer"

type MyInformationProps = {
  customer: HttpTypes.StoreCustomer
}

const ProfilePassword: React.FC<MyInformationProps> = ({ customer: _customer }) => {
  const [successState, setSuccessState] = React.useState(false)

  const [state, formAction] = useActionState(updateCustomerPassword, {
    error: null as string | null,
    success: false,
  })

  const clearState = () => setSuccessState(false)

  useEffect(() => {
    setSuccessState(state.success)
  }, [state])

  return (
    <form action={formAction} onReset={clearState} className="w-full">
      <AccountInfo
        label="Şifre"
        currentInfo={<span>Şifre güvenlik nedeniyle gösterilmez</span>}
        isSuccess={successState}
        isError={!!state.error}
        errorMessage={state.error || undefined}
        clearState={clearState}
        data-testid="account-password-editor"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Mevcut şifre"
            name="old_password"
            required
            type="password"
            autoComplete="current-password"
            data-testid="old-password-input"
          />
          <div className="hidden sm:block" />
          <Input
            label="Yeni şifre (en az 8 karakter)"
            type="password"
            name="new_password"
            required
            autoComplete="new-password"
            data-testid="new-password-input"
          />
          <Input
            label="Yeni şifre (tekrar)"
            type="password"
            name="confirm_password"
            required
            autoComplete="new-password"
            data-testid="confirm-password-input"
          />
        </div>
      </AccountInfo>
    </form>
  )
}

export default ProfilePassword
