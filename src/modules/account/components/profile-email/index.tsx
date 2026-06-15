"use client"

import React from "react"
import { HttpTypes } from "@medusajs/types"

type MyInformationProps = {
  customer: HttpTypes.StoreCustomer
}

/**
 * E-posta SALT-OKUNUR gösterilir. Medusa'da müşteri e-postası giriş (auth) kimliğine
 * bağlıdır ve /store/customers/me ile değiştirilemez (400 döner). Bu yüzden düzenleme
 * yerine bilgilendirici not gösterilir (eskiden sahte "başarıyla güncellendi" çıkıyordu).
 */
const ProfileEmail: React.FC<MyInformationProps> = ({ customer }) => {
  return (
    <div className="w-full" data-testid="account-email-editor">
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <span className="uppercase text-ui-fg-base text-small-regular font-semibold">
            E-posta
          </span>
          <span className="font-semibold mt-1" data-testid="current-info">
            {customer.email}
          </span>
        </div>
        <span className="text-small-regular text-ui-fg-muted bg-ui-bg-subtle border border-ui-border-base rounded-full px-3 py-1">
          Değiştirilemez
        </span>
      </div>
      <p className="text-small-regular text-ui-fg-subtle mt-2 max-w-xl">
        E-posta adresiniz hesap giriş kimliğinizdir ve bu sayfadan değiştirilemez.
        Değişiklik için <strong>bilgi@girisimciturk.com</strong> üzerinden bizimle
        iletişime geçebilirsiniz.
      </p>
    </div>
  )
}

export default ProfileEmail
