import { Metadata } from "next"
import HavarClient from "./havar-client"

export const metadata: Metadata = {
  title: "HavarTek — Drone Tabanlı Kargo & Teslimat | depremTek",
  description:
    "HavarTek drone hava araçları: bireyler ve aileler için satın alma ve kiralama. Önceliğimiz kargo ve paket taşıma, kapıdan kapıya teslimat. İnsan taşıma ve afet tahliyesi geliştirme/mevzuat sürecindedir. Ön ilgi / talep bırakın.",
}

export default function HavarPage() {
  return <HavarClient />
}
