"use client"

import { useEffect, useRef } from "react"
import { useLocale } from "next-intl"
import { syncPushSubscription } from "@lib/util/push"

/**
 * Cihazın push aboneliğini hesaba (sessizce) geri bağlar ve dilini tazeler.
 *
 * Çıkışta bağ bilerek çözülüyor (ortak cihazda eski hesabın bildirimleri
 * düşmesin). Simetriği olmadan aynı kullanıcı tekrar girse bile cihaz bağsız
 * kalıyor ve sipariş bildirimleri SESSİZCE kesiliyordu: `customer_id`'yi geri
 * yazan tek yol abonelik kaydının yeniden gönderilmesi, o da yalnız kullanıcı
 * bildirim istemini yeniden tetiklerse oluyordu (izin verilmiş cihazda istem
 * bir daha hiç çıkmaz).
 *
 * Aynı bileşen abonelik DİLİNİ de günceller: dil değiştirici tam yeniden yükleme
 * yapmadığı için (setUserLocale + router.refresh) bu istemci bileşeni sökülmez;
 * tek-seferlik bir bayrak kullanılsa abonelik eski dilde kalır ve backend metni
 * o dile göre kurardı. Bu yüzden bayrak SON SENKRONLANAN DİLİ tutar.
 *
 * İzin İSTEMEZ; yalnız zaten var olan aboneliği tazeler. Görsel çıktısı yok.
 * Misafirde de çalışır (abonelik yoksa no-op; backend hesap bağını aşağı çekmez).
 */
const PushSync = () => {
  const locale = useLocale()
  const syncedLocale = useRef<string | null>(null)

  useEffect(() => {
    if (syncedLocale.current === locale) return
    syncedLocale.current = locale
    void syncPushSubscription(locale)
  }, [locale])

  return null
}

export default PushSync
