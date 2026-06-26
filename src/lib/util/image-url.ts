// Cloudflare R2'nin public geliştirme alan adı (pub-*.r2.dev) Türkiye'de bazı
// internet sağlayıcılarınca SNI bazlı TCP RST ile engellenebiliyor → görseller
// tarayıcıda "ERR_CONNECTION_RESET" verip görünmüyor. Çözüm: bu URL'leri kendi
// alan adımızdaki nginx /r2/ reverse-proxy'si üzerinden sun
// (api.depremtek.market TR'den erişilebilir). Bu yardımcı, hem mevcut hem
// gelecekteki r2.dev görsel URL'lerini render anında erişilebilir hâle getirir.
const R2_PUBLIC_HOST = "pub-972575e25eda4755b1250ca6be181153.r2.dev"

const PROXY_BASE = (
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
).replace(/\/$/, "")

// toReachableImageUrl, bir r2.dev public URL'ini /r2/ proxy URL'ine çevirir;
// diğer (Unsplash, /static, data:, vb.) URL'lere dokunmaz.
export function toReachableImageUrl(
  url?: string | null
): string | undefined {
  if (!url) return undefined
  const marker = `://${R2_PUBLIC_HOST}/`
  const i = url.indexOf(marker)
  if (i === -1) return url
  return `${PROXY_BASE}/r2/${url.slice(i + marker.length)}`
}
