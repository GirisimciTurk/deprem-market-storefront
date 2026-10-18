import { CreditCard } from "lucide-react"
import React from "react"

/** gobit'in ödeme sağlayıcıları: kimliği → ödeme adımında görünen ad ve simge. */
export const paymentInfoMap: Record<string, { title: string; icon: React.JSX.Element }> = {
  paytr: {
    title: "Kredi / Banka Kartı (PayTR)",
    icon: <CreditCard size={16} />,
  },
  manual: {
    title: "Kapıda Ödeme",
    icon: <CreditCard size={16} />,
  },
}

/** Elle (çevrimiçi tahsilatsız) ödeme: sipariş doğrudan verilir. */
export const isManual = (providerId?: string) => providerId === "manual"
