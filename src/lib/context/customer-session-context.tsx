"use client"

import React, { createContext, useContext, useMemo } from "react"

/**
 * Giriş durumunun istemci tarafındaki tek kaynağı. Müşteri kimliği (_medusa_jwt)
 * yalnızca sunucuda okunabildiği için değer (main) layout'unda hesaplanıp buraya
 * verilir; giriş gerektiren kontroller (favori kalbi, "stoğa gelince haber ver")
 * bunu okuyup sunucuya HİÇ gitmeden giriş uyarısı gösterebilir.
 *
 * Not: `WishlistProvider` da aynı bayrağı ayrı bir prop olarak alır — favoriler
 * akışı bu context'ten önce yazıldı ve çalışıyor; ikisi de layout'taki AYNI
 * `!!customer` değerinden beslendiği için tutarsızlık riski yok.
 */

type CustomerSessionValue = {
  isLoggedIn: boolean
}

const CustomerSessionContext = createContext<CustomerSessionValue | null>(null)

export function CustomerSessionProvider({
  children,
  isLoggedIn,
}: {
  children: React.ReactNode
  isLoggedIn: boolean
}) {
  const value = useMemo(() => ({ isLoggedIn }), [isLoggedIn])
  return (
    <CustomerSessionContext.Provider value={value}>
      {children}
    </CustomerSessionContext.Provider>
  )
}

/**
 * Provider dışında da güvenle çağrılabilir (ör. checkout layout'u sarmıyor):
 * o durumda "giriş yok" döner, bileşenler çökmez.
 */
export function useCustomerSession(): CustomerSessionValue {
  return useContext(CustomerSessionContext) ?? { isLoggedIn: false }
}
