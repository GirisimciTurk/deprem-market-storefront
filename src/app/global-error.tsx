"use client"

import React, { useEffect } from "react"

/**
 * Kök hata sınırı — KÖK LAYOUT'un kendisi patladığında devreye girer.
 *
 * Bu durumda nav/footer, çeviri sağlayıcısı ve tema hiç yüklenmemiş olabilir;
 * o yüzden burada kendi <html>/<body>'sini render eder, hiçbir uygulama
 * bileşenine (LocalizedClientLink, next-intl vb.) bağımlı DEĞİLDİR ve stiller
 * satır içi verilir. Amaç: en kötü senaryoda bile kullanıcı boş/İngilizce bir
 * çökme ekranı yerine anlaşılır bir sayfa görsün.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[Kritik hata]", error)
  }, [error])

  return (
    <html lang="tr">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
          background: "#f8fafc",
          color: "#0f172a",
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 8 }} aria-hidden="true">
            ⚠️
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 12px" }}>
            Site şu anda yanıt veremiyor
          </h1>
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.6,
              color: "#475569",
              margin: "0 0 24px",
            }}
          >
            Beklenmedik bir hata oluştu. Birazdan tekrar denemenizi rica ederiz.
          </p>

          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={reset}
              style={{
                background: "#ea580c",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "10px 24px",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Tekrar dene
            </button>
            <a
              href="/"
              style={{
                background: "#fff",
                color: "#0f172a",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                padding: "10px 24px",
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Ana sayfa
            </a>
          </div>

          {error.digest && (
            <p style={{ marginTop: 24, fontSize: 12, color: "#94a3b8" }}>
              Hata kodu: <span style={{ fontFamily: "monospace" }}>{error.digest}</span>
            </p>
          )}
        </div>
      </body>
    </html>
  )
}
