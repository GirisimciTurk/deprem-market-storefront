"use server"

import { gobitFetch } from "@lib/gobit/client"
import { getAuthHeaders } from "./cookies"
import type { TrackEventType, TrackPayload } from "@lib/util/analytics"

/** Davranış olayı (dtm): müşteri, varsa oturum çerezinden gobit'te belirlenir. */
export async function sendTrack(body: TrackPayload & { type: TrackEventType; session_id: string }): Promise<void> {
  try {
    await gobitFetch("/store/v1/dtm/track", { method: "POST", headers: await getAuthHeaders(), body })
  } catch {
    // Takip hiçbir zaman alışverişi etkilemez.
  }
}
