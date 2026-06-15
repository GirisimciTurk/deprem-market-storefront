import { Metadata } from "next"
import HavarClient from "./havar-client"

export const metadata: Metadata = {
  title: "HavarTek — Drone Hava Aracı Satış & Kiralama | depremTek",
  description:
    "HavarTek drone hava araçları: bireyler ve aileler için satın alma ve kiralama. Kargo ve insan taşımacılığı, afet anında tahliye ve apartman kapı mekanizması. Ön alım / ön kiralama talebinizi bırakın.",
}

export default function HavarPage() {
  return <HavarClient />
}
