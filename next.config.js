const checkEnvVariables = require("./check-env-variables")

checkEnvVariables()

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
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // NOT: Optimizasyonu açmak (unoptimized'i kaldırmak) için uygulamadaki TÜM
    // görsel host'ları (ör. Unsplash, S3) remotePatterns'e eklenmeli; aksi halde
    // next/image tanımsız host'ta 500 atıyor. Bu yüzden şimdilik kapalı bırakıldı.
    unoptimized: true,
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
              `connect-src 'self' ${BACKEND_URL} https://paynkolaytest.nkolayislem.com.tr https://paynkolay.nkolayislem.com.tr; ` +
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
}

module.exports = nextConfig
