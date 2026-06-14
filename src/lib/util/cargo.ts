/**
 * Kargo (carrier) takip URL üretimi — storefront tarafı.
 * Backend src/lib/cargo.ts ile aynı mantık (provider_id'den firma + takip linki).
 */

interface CarrierDef {
  name: string
  trackingUrlTemplate: string
}

// Backend src/lib/cargo.ts ile aynı firma listesi/kodları (senkron tutulmalı).
const CARRIERS: Record<string, CarrierDef> = {
  yurtici: {
    name: "Yurtiçi Kargo",
    trackingUrlTemplate:
      "https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code={code}",
  },
  aras: {
    name: "Aras Kargo",
    trackingUrlTemplate: "https://kargotakip.araskargo.com.tr/?code={code}",
  },
  mng: {
    name: "MNG Kargo",
    trackingUrlTemplate:
      "https://service.mngkargo.com.tr/iframe/iframe.aspx?KODNO={code}",
  },
  surat: {
    name: "Sürat Kargo",
    trackingUrlTemplate:
      "https://www.suratkargo.com.tr/KargoTakip/?kargotakipno={code}",
  },
  ptt: {
    name: "PTT Kargo",
    trackingUrlTemplate: "https://gonderitakip.ptt.gov.tr/Track/Verify?q={code}",
  },
  ups: {
    name: "UPS Kargo",
    trackingUrlTemplate: "https://www.ups.com/track?loc=tr_TR&tracknum={code}",
  },
  sendeo: {
    name: "Sendeo",
    trackingUrlTemplate: "https://www.sendeo.com.tr/gonderi-takip?code={code}",
  },
  hepsijet: {
    name: "Hepsijet",
    trackingUrlTemplate: "https://www.hepsijet.com/gonderi-takibi?code={code}",
  },
  // "Diğer": takip linki yok; satıcının girdiği tracking_url kullanılır.
  diger: {
    name: "Diğer",
    trackingUrlTemplate: "",
  },
}

const DEFAULT_CARRIER = "yurtici"

export function resolveCarrier(providerId?: string | null): CarrierDef {
  if (providerId) {
    const prefix = providerId.split("_")[0]
    if (prefix && CARRIERS[prefix]) return CARRIERS[prefix]
  }
  return CARRIERS[DEFAULT_CARRIER]
}

export function getCarrierName(providerId?: string | null): string {
  return resolveCarrier(providerId).name
}

export function getTrackingUrl(
  trackingNumber: string,
  providerId?: string | null
): string | null {
  const code = (trackingNumber || "").trim()
  if (!code) return null
  const carrier = resolveCarrier(providerId)
  if (!carrier.trackingUrlTemplate) return null
  return carrier.trackingUrlTemplate.replace("{code}", encodeURIComponent(code))
}
