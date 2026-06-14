const checkEnvVariables = require("./check-env-variables")

checkEnvVariables()

// next-intl (URL routing'siz mod): dil çerezden okunur, request config src/i18n/request.ts'te.
const createNextIntlPlugin = require("next-intl/plugin")
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts")

// @serwist/next ESM-only; Node 20.19+ require(ESM) ile .default'a erişiyoruz.
// PWA service worker'ı src/app/sw.ts'ten derleyip public/sw.js'e yazar ve
// tarayıcıya otomatik kaydeder (register varsayılan: true).
const withSerwist = require("@serwist/next").default({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  // Dev modunda (next dev) SW'yi kapat: dev chunk'ları sürekli değiştiği için
  // precache önbelleği bayatlar ve HMR'ı bozar. Üretim build'inde aktif.
  disable: process.env.NODE_ENV === "development",
  // Tarayıcı çevrimdışıyken tekrar çevrimiçi olunca sayfayı yenile.
  reloadOnOnline: true,
  // /offline yedek sayfasını precache listesine ekle (sw.ts fallbacks bunu kullanır).
  // revision'ı offline sayfasının içeriği/çevirisi değişince elle artır.
  additionalPrecacheEntries: [{ url: "/offline", revision: "offline-v1" }],
})

/**
 * Medusa Cloud-related environment variables
 */
const S3_HOSTNAME = process.env.MEDUSA_CLOUD_S3_HOSTNAME
const S3_PATHNAME = process.env.MEDUSA_CLOUD_S3_PATHNAME

// Backend origin used in the CSP. Driven by env so production does not stay
// locked to localhost. Falls back to the local dev backend.
const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

// 'unsafe-eval' is only needed by the dev/HMR runtime. Drop it in production so
// the script-src CSP is meaningfully tighter there.
const SCRIPT_SRC_EVAL = process.env.NODE_ENV === "production" ? "" : " 'unsafe-eval'"

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  // SEO/güvenlik: Next.js'in "X-Powered-By" başlığını gönderme (teknoloji ifşası).
  poweredByHeader: false,
  // Docker için bağımsız (standalone) çıktı: .next/standalone içinde minimal bir
  // server.js + sadece gereken node_modules üretilir → çok küçük üretim imajı.
  output: "standalone",
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Tip hataları artık build'i durdurur (gizlenmez). Tüm src tsc'den 0 hata ile
    // geçiyor; yeni bir tip hatası girerse build kırmızıya döner — bilinçli güvenlik tercihi.
    ignoreBuildErrors: false,
  },
  images: {
    // NOT: Optimizasyonu açmak (unoptimized'i kaldırmak) için uygulamadaki TÜM
    // görsel host'ları (ör. Unsplash, S3) remotePatterns'e eklenmeli; aksi halde
    // next/image tanımsız host'ta 500 atıyor. Bu yüzden şimdilik kapalı bırakıldı.
    unoptimized: true,
    // next/image quality={50} kullanıyor; Next.js 16 izin verilen kaliteleri açıkça ister.
    qualities: [50, 75, 100],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "*.s3.*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.s3.amazonaws.com",
      },
      ...(S3_HOSTNAME && S3_PATHNAME
        ? [
            {
              protocol: "https",
              hostname: S3_HOSTNAME,
              pathname: S3_PATHNAME,
            },
          ]
        : []),
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; " +
              `script-src 'self' 'unsafe-inline'${SCRIPT_SRC_EVAL} https://paynkolaytest.nkolayislem.com.tr https://paynkolay.nkolayislem.com.tr; ` +
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
              "font-src 'self' data: https://fonts.gstatic.com; " +
              "img-src 'self' data: blob: https: http:; " +
              `connect-src 'self' ${BACKEND_URL} https://images.unsplash.com https://pub-972575e25eda4755b1250ca6be181153.r2.dev https://cdn.jsdelivr.net https://paynkolaytest.nkolayislem.com.tr https://paynkolay.nkolayislem.com.tr; ` +
              "frame-src 'self' https://paynkolaytest.nkolayislem.com.tr https://paynkolay.nkolayislem.com.tr; " +
              `form-action 'self' ${BACKEND_URL} https://paynkolaytest.nkolayislem.com.tr https://paynkolay.nkolayislem.com.tr; ` +
              "object-src 'none';",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
        ],
      },
    ]
  },
  // "Bayilik" → "Satıcı Ol" yeniden adlandırması: eski URL'ler kalıcı (308)
  // yeni adreslere yönlenir, böylece dış linkler/SEO kırılmaz.
  async redirects() {
    return [
      {
        source: "/:countryCode/bayilik-basvuru-formu",
        destination: "/:countryCode/satici-ol",
        permanent: true,
      },
      {
        source: "/:countryCode/account/bayilik",
        destination: "/:countryCode/account/satici",
        permanent: true,
      },
    ]
  },
}

module.exports = withSerwist(withNextIntl(nextConfig))
