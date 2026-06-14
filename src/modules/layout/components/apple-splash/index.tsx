import {
  APPLE_SPLASH_DEVICES,
  splashMedia,
  splashVariant,
} from "@lib/util/apple-splash"

// iOS "Ana Ekrana Ekle" PWA'sı açılırken gösterilen splash görselleri için
// <link rel="apple-touch-startup-image"> etiketleri. React 19 bu link'leri
// otomatik <head>'e taşır. media sorgusu cihazı seçer, href splash görselini.
export default function AppleSplash() {
  return (
    <>
      {APPLE_SPLASH_DEVICES.map((d) => (
        <link
          key={`${d.w}x${d.h}@${d.r}`}
          rel="apple-touch-startup-image"
          media={splashMedia(d)}
          href={`/splash/${splashVariant(d)}`}
        />
      ))}
    </>
  )
}
