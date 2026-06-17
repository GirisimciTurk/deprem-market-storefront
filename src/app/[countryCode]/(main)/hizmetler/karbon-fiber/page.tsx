import { Metadata } from "next"
import KarbonFiberClient from "./karbon-fiber-client"

export const metadata: Metadata = {
  title: "Karbon Fiber Kolon Güçlendirme — Keşifli Kurulum | depremTek",
  description:
    "Binanızın taşıyıcı kolonlarını karbon fiber ile güçlendirin. Keşif → teklif → onay → usta montajı. Kaba fiyat tahmini alın, keşif talebinizi bırakın.",
}

export default function KarbonFiberPage() {
  return <KarbonFiberClient />
}
