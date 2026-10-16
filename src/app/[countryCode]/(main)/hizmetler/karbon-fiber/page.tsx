import { Metadata } from "next"
import KarbonFiberClient from "./karbon-fiber-client"

export const metadata: Metadata = {
  title: "Karbon Fiber Kolon Güçlendirme — Malzeme ve Uygulama | depremTek",
  description:
    "Binanızın taşıyıcı kolonlarını karbon fiber ile güçlendirin. Malzeme ve uygulama birlikte; fiyat yüz yüze görüşmede netleşir. Kaba fiyat tahmini alın, talebinizi bırakın.",
}

export default function KarbonFiberPage() {
  return <KarbonFiberClient />
}
