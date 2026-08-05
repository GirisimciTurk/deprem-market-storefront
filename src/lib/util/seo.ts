/**
 * SEO'da "birincil" olarak kabul edilen bölge öneki.
 *
 * URL'deki önek DİL değil BÖLGE'dir (Medusa region → ülke kodu). Dil seçimi
 * cookie tabanlı, yani /tr, /de, /fr … hepsi AYNI Türkçe içeriği sunar; yalnız
 * fiyat/bölge bağlamı değişir. Bu yüzden arama motorlarına tek bir sürüm
 * gösterilir: canonical ve sitemap birincil bölgeye sabitlenir.
 *
 * Aksi halde her sayfa ülke sayısı kadar (canlıda 8) kopya olarak indekslenir;
 * her kopya kendini canonical gösterdiği için Google bunları ayrı özgün sayfa
 * sanar → sıralama sinyalleri bölünür, tarama bütçesi boşa gider.
 */
export const PRIMARY_REGION = (
  process.env.NEXT_PUBLIC_DEFAULT_REGION || "tr"
).toLowerCase()

/**
 * Bölge önekinden bağımsız canonical yol üretir.
 * `canonicalPath("/products/kask")` → `/tr/products/kask`
 *
 * Yol başında "/" beklenir; metadataBase'e göre çözülür.
 */
export function canonicalPath(pathWithoutRegion: string): string {
  const clean = pathWithoutRegion.startsWith("/")
    ? pathWithoutRegion
    : `/${pathWithoutRegion}`
  return `/${PRIMARY_REGION}${clean}`
}

/**
 * Metadata `alternates` bloğu: canonical + hreflang birlikte üretilir ki ikisi
 * birbiriyle çelişmesin (önceki halinde canonical kendini, hreflang ise /tr'yi
 * gösteriyordu — birbirini yalanlayan iki sinyal).
 */
export function seoAlternates(pathWithoutRegion: string) {
  const primary = canonicalPath(pathWithoutRegion)
  return {
    canonical: primary,
    languages: {
      tr: primary,
      "x-default": primary,
    },
  }
}
