"use client"

import { acceptTransferRequest, declineTransferRequest } from "@lib/data/orders"
import { Button, Heading, Text } from "@modules/common/components/ui"
import { useState } from "react"

type Answer = "accept" | "decline"

/**
 * Devir talebinin kabul/ret düğmeleri. Yalnız düğmeyle çalışır: bağlantıyı
 * izleyen bir e-posta tarayıcısı devri kabul edemez. Jeton gövdede gider.
 */
const TransferActions = ({ transferId, token }: { transferId: string; token: string }) => {
  const [pending, setPending] = useState<Answer | null>(null)
  const [done, setDone] = useState<Answer | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const answer = async (which: Answer) => {
    setPending(which)
    setErrorMessage(null)
    const act = which === "accept" ? acceptTransferRequest : declineTransferRequest
    const { success, error } = await act(transferId, token)
    setPending(null)
    if (success) setDone(which)
    else setErrorMessage(error)
  }

  if (done === "accept") {
    return (
      <div className="flex flex-col gap-y-2" data-testid="transfer-accepted">
        <Heading level="h2" className="text-lg text-emerald-600">
          Sipariş devredildi
        </Heading>
        <Text className="text-zinc-600">
          Sipariş artık talepte bulunan hesaba ait. Bu adresteki sipariş bağlantıları siparişi artık açmaz;
          siparişle ilgili e-postalar yeni sahibinin adresine gider.
        </Text>
      </div>
    )
  }

  if (done === "decline") {
    return (
      <div className="flex flex-col gap-y-2" data-testid="transfer-declined">
        <Heading level="h2" className="text-lg text-emerald-600">
          Devir talebi reddedildi
        </Heading>
        <Text className="text-zinc-600">Sipariş sizde kalmaya devam ediyor; hiçbir şey değişmedi.</Text>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex flex-wrap gap-4">
        <Button
          size="large"
          onClick={() => answer("accept")}
          isLoading={pending === "accept"}
          disabled={pending !== null}
        >
          Devri kabul et
        </Button>
        <Button
          size="large"
          variant="secondary"
          onClick={() => answer("decline")}
          isLoading={pending === "decline"}
          disabled={pending !== null}
        >
          Devri reddet
        </Button>
      </div>
      {errorMessage && <Text className="text-brand-500">{errorMessage}</Text>}
    </div>
  )
}

export default TransferActions
