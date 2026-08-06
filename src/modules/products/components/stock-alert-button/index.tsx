"use client"

import { useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { Button } from "@modules/common/components/ui"
import { requestStockAlert, isPushSupported } from "@lib/util/push"
import { useCustomerSession } from "@lib/context/customer-session-context"
import LoginHint from "@modules/common/components/login-hint"

type Props = {
  variantId: string
  productId?: string
  productHandle?: string
  productTitle?: string
  /** Ürün kartı gibi dar alanlar için daha küçük buton + kısa metin. */
  compact?: boolean
}

/**
 * Tükenen ürün/varyant için "Stoğa gelince haber ver" butonu. Tıklayınca push
 * izni ister, aboneliği oluşturur ve backend'e stok uyarısı kaydeder. Ürün
 * yeniden stoğa girdiğinde kullanıcıya bildirim gönderilir.
 *
 * GİRİŞ GEREKİR (favori kalbiyle aynı kural): giriş yoksa sunucuya HİÇ gidilmez
 * ve tarayıcının bildirim izni penceresi AÇILMAZ — butonun altında kısa bir
 * "giriş yapın" uyarısı + bağlantısı çıkar. Kullanıcı baktığı üründen
 * koparılmaz; giriş sayfasına zorla yönlendirmeye bu tercih edildi.
 *
 * Bu garanti istemcideki oturum bayrağına dayanır. Oturum SAYFA AÇIKKEN düşerse
 * (cookie süresi doldu) izin penceresi yine açılabilir; o durumda backend 401
 * döner ve buton "giriş yapın"a düşer.
 *
 * Durum makinesi varyant başınadır — çağıran taraf `key={variantId}` verir,
 * yoksa A varyantı için alınan onay B varyantına yapışır.
 */
const StockAlertButton = ({
  variantId,
  productId,
  productHandle,
  productTitle,
  compact = false,
}: Props) => {
  const t = useTranslations("stockAlert")
  const locale = useLocale()
  const { isLoggedIn } = useCustomerSession()
  const [state, setState] = useState<
    "idle" | "loading" | "done" | "denied" | "unsupported" | "login" | "failed"
  >("idle")

  // Varyant değişirse önceki varyanta ait sonuç ekranda KALMAMALI: "done" erken
  // dönüşü butonu hiç render etmediği için kullanıcı yeni varyant için uyarı
  // kuramaz ama kurduğunu sanır. Çağrı yerleri key veriyor; bu ikinci kemer.
  const [seenVariantId, setSeenVariantId] = useState(variantId)
  if (seenVariantId !== variantId) {
    setSeenVariantId(variantId)
    setState("idle")
  }

  const handleClick = async () => {
    if (!isLoggedIn) {
      setState("login")
      return
    }
    if (!isPushSupported()) {
      setState("unsupported")
      return
    }
    setState("loading")
    try {
      const res = await requestStockAlert({
        variant_id: variantId,
        product_id: productId,
        product_handle: productHandle,
        product_title: productTitle,
        // Abonelik kaydına dil yazılsın: "stoğa geldi" bildirimi kullanıcının
        // dilinde gitsin (eskiden herkese Türkçe gidiyordu).
        locale,
      })
      // Üç başarısızlık nedeni AYRI: oturum düştü (giriş), izin reddi (tarayıcı
      // ayarı), sunucu/ağ hatası (tekrar dene). Tek mesaja indirilirse kullanıcı
      // yanlış yere yönlendirilir.
      setState(
        res.ok
          ? "done"
          : res.unauthorized
            ? "login"
            : res.denied
              ? "denied"
              : "failed"
      )
    } catch {
      // requestStockAlert fırlatırsa (SW kaydı, ağ) buton "Loading..." halinde
      // kilitli kalıyordu — kullanıcı bir daha tıklayamıyordu.
      setState("failed")
    }
  }

  const iconSize = compact ? 15 : 18

  if (state === "done") {
    return (
      <div
        className={
          compact
            ? "w-full min-h-9 py-1.5 px-2 flex items-center justify-center gap-x-1.5 rounded-lg border border-green-200 bg-green-50 text-green-700 text-xs font-semibold leading-tight text-center"
            : "w-full h-11 flex items-center justify-center gap-x-2 rounded-lg border border-green-200 bg-green-50 text-green-700 text-sm font-semibold"
        }
      >
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
          <path d="M20 6 9 17l-5-5" />
        </svg>
        {compact ? t("doneShort") : t("done")}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-y-1.5">
      <Button
        onClick={handleClick}
        variant="secondary"
        className={
          compact
            ? "w-full min-h-9 py-1.5 px-2 font-semibold rounded-lg text-xs leading-tight"
            : "w-full h-11 font-semibold rounded-lg"
        }
        isLoading={state === "loading"}
        data-testid="stock-alert-button"
      >
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 shrink-0">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {compact ? t("ctaShort") : t("cta")}
      </Button>
      {/* Canlı bölge İÇERİKTEN ÖNCE mount olmalı: aksi halde ekran okuyucular
          kutuyla birlikte gelen metni çoğu zaman duyurmaz. Bu yüzden kap her
          zaman DOM'da, yalnız içeriği koşullu. */}
      <div role="status" aria-live="polite">
        {state === "login" && (
          // Uyarı butonun ALTINDA akışta: tam genişlikteki bu butonda hiçbir
          // şeyin üstünü örtmez ve bileşenin diğer uyarılarıyla aynı desende
          // kalır (kalp butonunda yer olmadığı için orada baloncuk kullanılır).
          <div
            className="rounded-lg border border-brand-200 bg-brand-50/60 p-2 text-xs leading-relaxed text-slate-600"
            data-testid="stock-alert-login-hint"
          >
            <LoginHint compact={compact} messageKey="stockAlert" />
          </div>
        )}
        {state === "denied" && (
          <p className="text-xs text-ui-fg-subtle">{t("denied")}</p>
        )}
        {state === "failed" && (
          // İzin reddiyle KARIŞTIRMA: kullanıcı burada tarayıcı ayarlarına
          // gönderilirse hiçbir şey düzelmez, sorun sunucu/ağ tarafında.
          <p className="text-xs text-ui-fg-subtle">{t("failed")}</p>
        )}
        {state === "unsupported" && (
          <p className="text-xs text-ui-fg-subtle">{t("unsupported")}</p>
        )}
      </div>
    </div>
  )
}

export default StockAlertButton
