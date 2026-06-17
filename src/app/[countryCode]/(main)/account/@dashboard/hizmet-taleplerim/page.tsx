import { Metadata } from "next"

import { listMyServiceRequests } from "@lib/data/service-requests"
import ServiceRequestsList from "@modules/account/components/service-requests"

export const metadata: Metadata = {
  title: "Hizmet Taleplerim",
  description: "Keşifli kurulum hizmet taleplerinizin durumunu takip edin ve teklifleri onaylayın.",
}

export default async function ServiceRequestsPage() {
  const requests = await listMyServiceRequests()

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-extrabold text-ui-fg-base flex items-center gap-2">
          🏗️ Hizmet Taleplerim
        </h1>
        <p className="text-xs text-ui-fg-muted mt-1">
          Karbon fiber güçlendirme, panik odası ve diğer keşifli kurulum talepleriniz: süreci takip edin,
          size sunulan teklifi onaylayın.
        </p>
      </div>

      <ServiceRequestsList requests={requests} />
    </div>
  )
}
