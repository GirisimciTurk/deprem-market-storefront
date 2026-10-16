/**
 * Hizmet talebinin müşteriye gösterilen sade durumu. Teklif, keşif ve ödeme
 * yüz yüze/telefonla yürür; müşteri iç aşamaları değil yalnız bu beş etiketi görür.
 */
export type CustomerServiceStatus = {
  label: string
  cls: string
  canceled: boolean
}

const RECEIVED: CustomerServiceStatus = {
  label: "Talebiniz alındı",
  cls: "bg-amber-100 text-amber-700 border-amber-200",
  canceled: false,
}
const DISCUSSING: CustomerServiceStatus = {
  label: "Görüşme aşamasında",
  cls: "bg-sky-100 text-sky-700 border-sky-200",
  canceled: false,
}
const APPLYING: CustomerServiceStatus = {
  label: "Uygulama aşamasında",
  cls: "bg-brand-100 text-brand-700 border-brand-200",
  canceled: false,
}
const DONE: CustomerServiceStatus = {
  label: "Tamamlandı",
  cls: "bg-green-100 text-green-700 border-green-200",
  canceled: false,
}
const CANCELED: CustomerServiceStatus = {
  label: "İptal edildi",
  cls: "bg-red-100 text-red-700 border-red-200",
  canceled: true,
}

// Backend durum listesi: deprem-market-backend service_request modeli `status` enum'u.
const BY_STATUS: Record<string, CustomerServiceStatus> = {
  talep: RECEIVED,
  kesif_planlandi: DISCUSSING,
  kesif_yapildi: DISCUSSING,
  teklif_gonderildi: DISCUSSING,
  onaylandi: DISCUSSING,
  tedarik: APPLYING,
  teslim_edildi: APPLYING,
  montaj_planlandi: APPLYING,
  montaj_yapildi: APPLYING,
  tamamlandi: DONE,
  reddedildi: CANCELED,
  iptal: CANCELED,
}

/** Bilinmeyen bir durum, talebin alındığı bilgisini gösterir (iç ad sızmaz). */
export function customerStatusOf(status: string | null | undefined): CustomerServiceStatus {
  return (status && BY_STATUS[status]) || RECEIVED
}
