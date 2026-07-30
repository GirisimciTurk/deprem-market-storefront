/**
 * Tanıtım videosu popup'ının "gösterildi" işareti.
 *
 * Eskiden sessionStorage kullanılıyordu; o sekme oturumuna bağlı olduğu için yeni
 * sekmede / ertesi gün video tekrar açılıyordu. Artık KALICI ÇEREZ: video kişi
 * başına yalnız ilk ziyarette oynar.
 *
 * Çerez iki yoldan yazılır (bkz. markPromoVideoSeen): `document.cookie` anında
 * yazar, `/api/promo-video-seen` ise aynı çerezi `Set-Cookie` ile sunucudan yazar.
 * İkincisi gerekli çünkü Safari/ITP script ile yazılmış çerezleri 7 güne kırpar —
 * yalnız `document.cookie` kullansaydık video iOS'ta her hafta yeniden açılırdı.
 *
 * Bu çerez işlevsel bir tercihtir (izleme/profilleme yapmaz, yalnız "1" tutar).
 */
export const PROMO_VIDEO_COOKIE = "_dm_promo_video_seen"

/** Çerez ömrü: 1 yıl. Route handler da bu değeri kullanır. */
export const PROMO_VIDEO_MAX_AGE = 60 * 60 * 24 * 365

/** Çerezler tamamen kapalıysa en azından oturum içinde tekrar açılmasın. */
const SESSION_FALLBACK_KEY = "_dm_promo_video_shown"

/**
 * Video daha önce gösterildi mi? Sunucuda (document yok) DAİMA true döner —
 * popup yalnız istemcide, useEffect içinde açılabilir.
 */
export function hasSeenPromoVideo(): boolean {
  if (typeof document === "undefined") return true

  try {
    const seen = document.cookie
      .split(";")
      .map((c) => c.trim())
      .some((c) => {
        const eq = c.indexOf("=")
        if (eq < 0) return false
        return (
          c.slice(0, eq) === PROMO_VIDEO_COOKIE && c.slice(eq + 1).length > 0
        )
      })
    if (seen) return true
  } catch {
    /* çerez okunamıyorsa aşağıdaki yedeğe düş */
  }

  try {
    return !!window.sessionStorage.getItem(SESSION_FALLBACK_KEY)
  } catch {
    return false
  }
}

/**
 * `run`'ı sayfa GERÇEKTEN kullanıcıya görünür olduğunda çalıştırır; şu an gizliyse
 * görünür olana kadar bekler. Döndürdüğü fonksiyon beklemeyi iptal eder.
 *
 * Bu gecikme kritik: "gösterildi" damgası 1 yıllık ve sunucudan kalıcılaştırılıyor,
 * yani yanlışlıkla basılırsa videoyu bir yıl boyunca hiç oynatmaz. Sayfa arka planda
 * yüklenmiş olabilir ve kullanıcı onu hiç görmemiş olabilir:
 *   - Arama sonucundan Ctrl+tık / orta tık ile ARKA PLAN sekmesinde açma: sekme hemen
 *     hydrate olur, zamanlayıcılar (kısılmış da olsa) ateşler, ama kullanıcı görmez.
 *   - Chrome prerender (speculation rules / omnibox): belge önceden işlenir, script
 *     çalışır ve GERÇEK çerez deposuna yazar; prerender atılsa bile çerez kalır.
 * İki durumda da `visibilityState === "hidden"`, aktifleşince `visibilitychange`
 * tetiklenir — tek gösterimi harcamamak için o ana kadar bekliyoruz.
 */
export function whenVisible(run: () => void): () => void {
  if (typeof document === "undefined") return () => {}

  if (document.visibilityState === "visible") {
    run()
    return () => {}
  }

  const onChange = () => {
    if (document.visibilityState !== "visible") return
    document.removeEventListener("visibilitychange", onChange)
    run()
  }

  document.addEventListener("visibilitychange", onChange)
  return () => document.removeEventListener("visibilitychange", onChange)
}

/** Videoyu "gösterildi" olarak işaretle. Hiçbir hata çağıranı etkilemez. */
export function markPromoVideoSeen(): void {
  if (typeof document === "undefined") return

  // 1) Anında istemci tarafında yaz — ağ isteği başarısız olsa da bu ziyarette
  //    ve sonraki sayfa yüklemelerinde tekrar açılmaz.
  try {
    const secure = window.location.protocol === "https:" ? "; Secure" : ""
    document.cookie =
      `${PROMO_VIDEO_COOKIE}=1; path=/; max-age=${PROMO_VIDEO_MAX_AGE}` +
      `; SameSite=Lax${secure}`
  } catch {
    /* yoksay */
  }

  // 2) Sunucudan da yazdır (ITP 7 gün kırpmasını aşmak için). Sonucu beklemiyoruz.
  try {
    void fetch("/api/promo-video-seen", {
      method: "POST",
      keepalive: true,
    }).catch(() => {})
  } catch {
    /* yoksay */
  }

  // 3) Çerezler tamamen kapalıysa oturum içi yedek.
  try {
    window.sessionStorage.setItem(SESSION_FALLBACK_KEY, "1")
  } catch {
    /* yoksay */
  }
}
