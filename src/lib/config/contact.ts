/**
 * Merkezi iletişim bilgileri. Tüm bileşenler (ContactDock, WhatsApp butonu,
 * Organization JSON-LD) buradan okur — numaralar tek yerde yönetilir.
 *
 * Gerçek değerler ENV'den gelir. Çağrı merkezi numarası YALNIZ env ile ayarlanınca
 * gösterilir; ayarlı değilse ilgili UI gizlenir (canlıya asla placeholder/sahte
 * numara düşmesin diye). WhatsApp için makul bir fallback korunur.
 *
 *   NEXT_PUBLIC_WHATSAPP_NUMBER        e.g. 905395741904  (+ ve boşluksuz)
 *   NEXT_PUBLIC_CALL_CENTER_DISPLAY    e.g. 0 (850) 000 00 00
 *   NEXT_PUBLIC_CALL_CENTER_TEL        e.g. +908500000000  (E.164)
 */
const whatsappNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "905395741904").replace(
  /\D/g,
  ""
)

const callDisplay = (process.env.NEXT_PUBLIC_CALL_CENTER_DISPLAY || "").trim()
const callTelEnv = (process.env.NEXT_PUBLIC_CALL_CENTER_TEL || "").trim()

export const SITE_CONTACT = {
  whatsappNumber,
  // Çağrı merkezi ayarlıysa {display, tel}; değilse null → UI gizlenir.
  callCenter: callDisplay
    ? { display: callDisplay, tel: callTelEnv || `+${callDisplay.replace(/\D/g, "")}` }
    : null,
  // Organization schema için telefon (E.164). Çağrı merkezi yoksa WhatsApp numarası.
  get schemaTelephone() {
    return this.callCenter?.tel || `+${whatsappNumber}`
  },
}

export function whatsappUrl(message?: string): string {
  const base = `https://wa.me/${whatsappNumber}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}
