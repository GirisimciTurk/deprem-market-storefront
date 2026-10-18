"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { parseTransferFragment } from "@lib/util/order-transfer"
import { Heading, Text } from "@modules/common/components/ui"
import TransferActions from "@modules/order/components/transfer-actions"
import TransferImage from "@modules/order/components/transfer-image"

function safeDecode(v: string) {
  try {
    return decodeURIComponent(v)
  } catch {
    return v
  }
}

/**
 * Devir e-postasının bağlantısı:
 * {STOREFRONT_URL}/tr/order/transfer/{transfer_id}#token=…[&display_id=…]
 * (gobit ADR 0450). Jeton URL parçasındadır: sunucuya, Referer'a ve gobit'in
 * istek kaydına gitmez; bu yüzden sayfa istemcide okur. Sayfa GET ile hiçbir
 * şey yapmaz, yanıt yalnız düğmeyle verilir (e-posta tarayıcıları bağlantıyı
 * izlese de devri kabul edemez).
 */
export default function OrderTransferPage() {
  const params = useParams<{ transferId: string }>()
  const transferId = safeDecode(String(params?.transferId ?? ""))
  const [fragment, setFragment] = useState<ReturnType<typeof parseTransferFragment> | undefined>(undefined)

  useEffect(() => {
    const read = () => setFragment(parseTransferFragment(window.location.hash))
    read()
    window.addEventListener("hashchange", read)
    return () => window.removeEventListener("hashchange", read)
  }, [])

  const title = fragment?.displayId
    ? `#${fragment.displayId} numaralı sipariş için devir talebi`
    : "Sipariş için devir talebi"

  return (
    <div className="content-container flex flex-col gap-y-4 items-start w-full max-w-xl mx-auto mt-10 mb-20">
      <TransferImage />
      <div className="flex flex-col gap-y-6 w-full">
        <Heading level="h1" className="text-xl text-zinc-900">
          {title}
        </Heading>
        {fragment === undefined ? null : fragment === null || !transferId ? (
          <Text className="text-brand-500">
            Bu bağlantı eksik ya da geçersiz. Lütfen e-postadaki bağlantıyı olduğu gibi açın.
          </Text>
        ) : (
          <>
            <Text className="text-zinc-600">
              Bir hesap, bu e-posta adresiyle verilmiş siparişin kendisine devredilmesini istedi. Talep 7 gün
              geçerlidir.
            </Text>
            <div className="w-full h-px bg-zinc-200" />
            <Text className="text-zinc-600">
              Kabul ederseniz sipariş, talepte bulunan hesaba geçer; bu adresteki sipariş bağlantıları artık
              siparişi açmaz. Siparişin e-postaları, takibi ve değerlendirmesi de yeni sahibinin adresiyle
              yapılır.
            </Text>
            <Text className="text-zinc-600">
              Bu talebi tanımıyorsanız reddedin ya da hiçbir şey yapmayın; sipariş sizde kalır.
            </Text>
            <div className="w-full h-px bg-zinc-200" />
            <TransferActions transferId={transferId} token={fragment.token} />
          </>
        )}
      </div>
    </div>
  )
}
