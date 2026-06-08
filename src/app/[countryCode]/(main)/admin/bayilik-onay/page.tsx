import React from "react"
import { Metadata } from "next"
import BayilikOnayClient from "@modules/admin/components/bayilik-onay-client"

export const metadata: Metadata = {
  title: "Bayilik Başvuruları Yönetim Paneli | EKYP Deprem Market",
  description: "Bayilik ön başvurularını denetleyin.",
}

export default function BayilikOnayPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <BayilikOnayClient />
    </div>
  )
}
