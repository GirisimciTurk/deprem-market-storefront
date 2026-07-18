/**
 * Merkezi iletişim bilgileri. Tüm bileşenler (ContactDock, WhatsApp butonu,
 * Organization JSON-LD) buradan okur — numaralar tek yerde yönetilir.
 *
 * Varsayılanlar gerçek işletme numaralarıdır; ENV ile override edilebilir.
 * Çağrı merkezi env ile boşaltılırsa (DISPLAY="") ilgili UI gizlenir.
 *
 *   NEXT_PUBLIC_WHATSAPP_NUMBER        e.g. 905446943278  (+ ve boşluksuz)
 *   NEXT_PUBLIC_CALL_CENTER_DISPLAY    e.g. 0850 241 70 00
 *   NEXT_PUBLIC_CALL_CENTER_TEL        e.g. +908502417000  (E.164)
 */
const whatsappNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "905446943278").replace(
  /\D/g,
  ""
)

const callDisplay = (process.env.NEXT_PUBLIC_CALL_CENTER_DISPLAY || "0850 241 70 00").trim()
const callTelEnv = (process.env.NEXT_PUBLIC_CALL_CENTER_TEL || "+908502417000").trim()

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
