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
  unbindPushSubscription,
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

/** p verilen sürede çözülmezse null döner (askıda kalmayı engeller). */
function withTimeout<T>(p: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    p,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ])
}

async function getReadyRegistration(
  timeoutMs = 5000
): Promise<ServiceWorkerRegistration | null> {
  if (!isPushSupported()) return null
  try {
    // DİKKAT: `navigator.serviceWorker.ready` kayıtlı SW YOKSA reddetmez —
    // HİÇ ÇÖZÜLMEZ (spec). Bu yüzden try/catch de kurtarmaz; çağıran sonsuza
    // kadar bekler (dev'de serwist kapalı olduğu için tipik durum budur).
    // Önce askıda kalmayan getRegistration()'a bak, sonra ready'yi süreye bağla.
    const existing = await navigator.serviceWorker.getRegistration()
    if (!existing) return null
    return await withTimeout(navigator.serviceWorker.ready, timeoutMs)
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

export type StockAlertResult = {
  ok: boolean
  /** Bildirim izni verilmedi / tarayıcı aboneliği kurulamadı. */
  denied: boolean
  /** Oturum yok veya arada düşmüş → giriş uyarısı gösterilmeli. */
  unauthorized: boolean
  /** Sunucu/ağ hatası (5xx, bağlantı yok). İzin reddiyle KARIŞTIRILMAMALI. */
  failed: boolean
}

/**
 * "Stoğa gelince haber ver": önce push aboneliği sağlar, sonra variant için
 * uyarı kaydı atar.
 *
 * Sonuç üç durumu AYIRIR: izin reddi ile 401 aynı mesaja düşerse oturumu düşmüş
 * kullanıcıya "tarayıcı ayarlarından izin verin" denip yanlış yere yönlendirilir.
 * Çağıranın giriş kontrolünü ÖNCEDEN yapması beklenir (bu fonksiyon push izni
 * ister; misafire hiç sorulmamalı).
 */
export async function requestStockAlert(input: {
  variant_id: string
  product_id?: string
  product_handle?: string
  product_title?: string
  locale?: string
}): Promise<StockAlertResult> {
  const sub = await subscribeToPush(input.locale)
  // Abonelik kurulamadı → izin reddi (ya da tarayıcı/SW engeli). Sunucuya
  // hiç gidilmediği için burada "failed" değil "denied" doğru sınıflandırma.
  if (!sub) return { ok: false, denied: true, unauthorized: false, failed: false }
  const res = await saveStockAlert({
    variant_id: input.variant_id,
    endpoint: sub.endpoint,
    product_id: input.product_id,
    product_handle: input.product_handle,
    product_title: input.product_title,
  })
  return {
    ok: res.success,
    // İzin ZATEN alındı (sub var); buradan sonraki başarısızlık sunucu/ağ
    // kaynaklıdır. Eskiden bu da "izin verilmedi" diye gösteriliyordu.
    denied: false,
    unauthorized: res.unauthorized,
    failed: !res.success && !res.unauthorized,
  }
}

/**
 * Çıkışta çağrılır: bu cihazın push aboneliğini hesaptan çözer.
 *
 * Ortak/aile cihazında kullanıcı çıktıktan sonra eski hesabın sipariş ve stok
 * bildirimleri düşmeye devam etmemeli. Abonelik silinmediği için kampanya
 * bildirimleri çalışır ve yeniden girişte abonelik hesaba geri bağlanır.
 * Abonelik yoksa veya çağrı başarısız olursa sessizce geçer — çıkışı bloklamaz.
 */
export async function unbindPushFromAccount(): Promise<void> {
  const task = (async () => {
    try {
      const sub = await getExistingSubscription()
      if (!sub) return
      await unbindPushSubscription(sub.endpoint)
    } catch {
      /* çıkış her hâlükârda sürmeli */
    }
  })()
  // Bildirim temizliği çıkışı ASLA geciktirmemeli/engellememeli: üst sınır koy.
  await withTimeout(task, 2000)
}

/**
 * Girişten SONRA çağrılır: izin zaten verilmiş ve tarayıcı aboneliği varsa
 * kaydı auth başlığıyla yeniden yazar → çıkışta çözülen hesap bağı geri kurulur.
 *
 * İzin İSTEMEZ (requestPermission çağrılmaz), yani kullanıcıya hiçbir pencere
 * göstermez. Bu olmadan çıkış-giriş yapan kullanıcının sipariş bildirimleri
 * sessizce kesilirdi.
 */
export async function syncPushSubscription(locale?: string): Promise<void> {
  try {
    if (getPermission() !== "granted") return
    const sub = await getExistingSubscription()
    if (!sub) return
    await savePushSubscription(serialize(sub, locale))
  } catch {
    /* senkron hatası sayfayı etkilemesin */
  }
}
