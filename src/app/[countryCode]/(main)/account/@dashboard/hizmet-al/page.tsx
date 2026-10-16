import { Metadata } from "next"

import HizmetAlClient from "./hizmet-al-client"

export const metadata: Metadata = {
  title: "Hizmet Al",
  description: "Uzman mühendislik ve karbon fiber güçlendirme hizmetleri.",
}

export default function HizmetAlPage() {
  return <HizmetAlClient />
}
