/**
 * Tarayıcı tarafı web push yardımcıları (PushManager API).
 *
 * Service worker SADECE üretim build'inde aktiftir (next.config: dev'de serwist
 * `disable`). Bu yüzden `isPushSupported` dev modunda da true dönebilir ama
 * `navigator.serviceWorker.ready` çözülmez → abone olma yalnızca prod build'de
 * (next build && next start) veya gerçek dağıtımda çalışır.
 */
import {
  savePushSubscription,
  removePushSubscription,
  saveStockAlert,
} from "@lib/data/push"

// VAPID PUBLIC anahtarı gizli DEĞİLDİR (tarayıcıya gönderilir). Üretim public
// anahtarını fallback olarak gömüyoruz ki storefront tarafında ayrı .env /
// docker-compose build-arg gerekmesin. Yerelde NEXT_PUBLIC_VAPID_PUBLIC_KEY
// (.env.local) bunu geçersiz kılar. Backend'in private anahtarıyla EŞLEŞMELİ.
const PROD_VAPID_PUBLIC_KEY =
  "BFyThC7n5hu9M5WBhk3_dnC5yn-J04fZKZrmefKOf05lP9cE9Cy1YIIQP-7dR7s76ZrdOKa9w8JsHk5jiT5m9eI"

function getVapidPublicKey(): string {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || PROD_VAPID_PUBLIC_KEY
}

export type PushPermission = "default" | "granted" | "denied" | "unsupported"

export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  )
}

export function getPermission(): PushPermission {
  if (!isPushSupported()) return "unsupported"
  return Notification.permission as PushPermission
}

/** VAPID base64url public key → Uint8Array (applicationServerKey için). */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const raw = window.atob(base64)
  const out = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) {
    out[i] = raw.charCodeAt(i)
  }
  return out
}

async function getReadyRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushSupported()) return null
  try {
    // Üretimde serwist SW'yi otomatik kaydeder; hazır olmasını bekle.
    return await navigator.serviceWorker.ready
  } catch {
    return null
  }
}

/** Mevcut tarayıcı aboneliğini döner (yoksa null). */
export async function getExistingSubscription(): Promise<PushSubscription | null> {
  const reg = await getReadyRegistration()
  if (!reg) return null
  return await reg.pushManager.getSubscription()
}

function serialize(sub: PushSubscription, locale?: string) {
  const json = sub.toJSON()
  return {
    endpoint: sub.endpoint,
    keys: {
      p256dh: json.keys?.p256dh ?? "",
      auth: json.keys?.auth ?? "",
    },
    locale,
  }
}

/**
 * İzin ister (gerekirse), PushManager aboneliği oluşturur ve backend'e kaydeder.
 * Başarılıysa PushSubscription döner, aksi halde null.
 */
export async function subscribeToPush(
  locale?: string
): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null

  const vapidKey = getVapidPublicKey()
  if (!vapidKey) {
    console.warn("[push] VAPID public anahtarı yok.")
    return null
  }

  // İzin
  let permission = Notification.permission
  if (permission === "default") {
    permission = await Notification.requestPermission()
  }
  if (permission !== "granted") return null

  const reg = await getReadyRegistration()
  if (!reg) return null

  // Var olan aboneliği yeniden kullan, yoksa yeni oluştur.
  let sub = await reg.pushManager.getSubscription()
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      // TS 5.7 Uint8Array<ArrayBufferLike> ↔ BufferSource katılığını aş.
      applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
    })
  }

  await savePushSubscription(serialize(sub, locale))
  return sub
}

/** Aboneliği backend'den siler ve tarayıcıdan kaldırır. */
export async function unsubscribeFromPush(): Promise<boolean> {
  const sub = await getExistingSubscription()
  if (!sub) return true
  try {
    await removePushSubscription(sub.endpoint)
  } catch {
    /* backend silme hatası olsa da tarayıcı aboneliğini kaldır */
  }
  return await sub.unsubscribe()
}

/**
 * "Stoğa gelince haber ver": önce push aboneliği sağlar, sonra variant için
 * uyarı kaydı atar. İzin verilmezse false döner.
 */
export async function requestStockAlert(input: {
  variant_id: string
  product_id?: string
  product_handle?: string
  product_title?: string
  locale?: string
}): Promise<boolean> {
  const sub = await subscribeToPush(input.locale)
  if (!sub) return false
  const res = await saveStockAlert({
    variant_id: input.variant_id,
    endpoint: sub.endpoint,
    product_id: input.product_id,
    product_handle: input.product_handle,
    product_title: input.product_title,
  })
  return res.success
}
