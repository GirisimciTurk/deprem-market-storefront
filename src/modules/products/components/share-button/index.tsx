"use client"

import { useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { Check, Copy, Link2, Mail, Share2 } from "lucide-react"

/**
 * Ürün paylaş butonu.
 *
 * Mobilde (Web Share API varsa) native paylaşım sayfası açılır. Masaüstünde
 * Web Share genelde yoktur — orada bir menü açılır: WhatsApp / X / Facebook /
 * Telegram / E-posta / Bağlantıyı kopyala.
 *
 * ÖNCEKİ SÜRÜMÜN SORUNU: Web Share yoksa sessizce panoya kopyalıyor, tek geri
 * bildirim 2 saniyelik küçük bir tik ikonuydu; üstelik `catch {}` blokları tüm
 * hataları yutuyordu (izin yok / pano erişilemiyor / sayfa odakta değil →
 * kullanıcı için "buton çalışmıyor"). Artık her sonuç görünür: kopyalandıysa
 * "Bağlantı kopyalandı", olmadıysa bağlantı seçilebilir metin olarak sunulur.
 */
const ShareButton = ({ title }: { title: string }) => {
  const t = useTranslations("pwa")
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  const [url, setUrl] = useState("")
  const wrapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // URL yalnız istemcide bilinir; sunucu render'ında boş kalır.
  useEffect(() => {
    setUrl(window.location.href)
  }, [])

  // Dışarı tıklama / Escape menüyü kapatsın.
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2500)
    return () => clearTimeout(timer)
  }, [copied])

  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "")
  const encodedUrl = encodeURIComponent(shareUrl)
  const encodedTitle = encodeURIComponent(title)

  const targets = [
    {
      key: "whatsapp",
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      className: "text-[#25D366]",
    },
    {
      key: "x",
      label: "X (Twitter)",
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      className: "text-slate-900",
    },
    {
      key: "facebook",
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      className: "text-[#1877F2]",
    },
    {
      key: "telegram",
      label: "Telegram",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      className: "text-[#229ED9]",
    },
  ]

  const mailHref = `mailto:?subject=${encodedTitle}&body=${encodedTitle}%20-%20${encodedUrl}`

  /**
   * Panoya kopyala. Clipboard API yoksa/reddederse (HTTP, izin, sayfa odakta
   * değil) execCommand yedeğine düşer; o da olmazsa `copyFailed` ile bağlantıyı
   * seçilebilir kutuda gösteririz — kullanıcı hiçbir durumda boşa tıklamaz.
   */
  const copyLink = async () => {
    setCopyFailed(false)

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        return
      } catch {
        /* yedeğe düş */
      }
    }

    try {
      const ta = document.createElement("textarea")
      ta.value = shareUrl
      // Ekran dışına al ama odaklanabilir bırak (execCommand seçim ister).
      ta.style.position = "fixed"
      ta.style.top = "-1000px"
      ta.setAttribute("readonly", "")
      document.body.appendChild(ta)
      ta.select()
      const succeeded = document.execCommand("copy")
      document.body.removeChild(ta)
      if (succeeded) {
        setCopied(true)
        return
      }
    } catch {
      /* yedeğin de başarısız olduğu son durum aşağıda ele alınır */
    }

    // Kopyalanamadı → bağlantıyı görünür kıl, kullanıcı elle kopyalasın.
    setCopyFailed(true)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  const onButtonClick = async () => {
    // Mobil/native: paylaşım sayfası varsa doğrudan onu aç.
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text: title, url: shareUrl })
        return
      } catch (e) {
        // Kullanıcı iptal ettiyse menü açmaya gerek yok; gerçek hatada menüye düş.
        if ((e as Error)?.name === "AbortError") return
      }
    }
    setOpen((v) => !v)
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={onButtonClick}
        aria-label={t("share")}
        aria-haspopup="menu"
        aria-expanded={open}
        title={t("share")}
        data-testid="share-button"
        className="flex items-center justify-center w-10 h-10 rounded-full text-gray-500 hover:text-brand-600 hover:bg-gray-100 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
      >
        <Share2 className="w-5 h-5" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label={t("share")}
          data-testid="share-menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white py-1.5 shadow-xl"
        >
          {targets.map((target) => (
            <a
              key={target.key}
              role="menuitem"
              href={target.href}
              target="_blank"
              rel="noreferrer noopener"
              onClick={() => setOpen(false)}
              className="flex items-center gap-x-2.5 px-3.5 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Link2 className={`h-4 w-4 shrink-0 ${target.className}`} aria-hidden="true" />
              {target.label}
            </a>
          ))}

          <a
            role="menuitem"
            href={mailHref}
            onClick={() => setOpen(false)}
            className="flex items-center gap-x-2.5 px-3.5 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Mail className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
            E-posta
          </a>

          <div className="my-1 border-t border-gray-100" />

          <button
            type="button"
            role="menuitem"
            onClick={copyLink}
            data-testid="share-copy-link"
            className="flex w-full items-center gap-x-2.5 px-3.5 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 shrink-0 text-green-600" aria-hidden="true" />
                <span className="font-semibold text-green-700">
                  {t("linkCopied")}
                </span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                Bağlantıyı kopyala
              </>
            )}
          </button>

          {copyFailed && (
            <div className="border-t border-gray-100 px-3.5 py-2.5">
              <p className="mb-1.5 text-xs text-slate-500">
                Tarayıcı kopyalamaya izin vermedi. Bağlantıyı elle kopyalayın:
              </p>
              <input
                ref={inputRef}
                readOnly
                value={shareUrl}
                onFocus={(e) => e.currentTarget.select()}
                className="w-full rounded-lg border border-gray-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-700"
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ShareButton
