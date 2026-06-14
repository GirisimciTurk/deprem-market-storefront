// iOS "Ana Ekrana Ekle" PWA splash (apple-touch-startup-image) cihaz listesi.
// Her giriş hem splash görselinin piksel boyutunu hem eşleşecek media sorgusunu
// belirler. Yalnız portrait; kapsanmayan cihazlar beyaz ekrana düşer (zararsız).
export type AppleSplashDevice = { w: number; h: number; r: number; label: string }

export const APPLE_SPLASH_DEVICES: AppleSplashDevice[] = [
  { w: 430, h: 932, r: 3, label: "iPhone 14/15 Pro Max" },
  { w: 428, h: 926, r: 3, label: "iPhone 12/13 Pro Max, 14 Plus" },
  { w: 393, h: 852, r: 3, label: "iPhone 14 Pro, 15" },
  { w: 390, h: 844, r: 3, label: "iPhone 12/13/14" },
  { w: 375, h: 812, r: 3, label: "iPhone X/XS/11 Pro/mini" },
  { w: 414, h: 896, r: 3, label: "iPhone XS Max/11 Pro Max" },
  { w: 414, h: 896, r: 2, label: "iPhone XR/11" },
  { w: 375, h: 667, r: 2, label: "iPhone SE/8" },
  { w: 768, h: 1024, r: 2, label: "iPad" },
  { w: 834, h: 1194, r: 2, label: 'iPad Pro 11"' },
  { w: 820, h: 1180, r: 2, label: "iPad Air" },
  { w: 1024, h: 1366, r: 2, label: 'iPad Pro 12.9"' },
]

export function splashPixelSize(d: AppleSplashDevice): {
  width: number
  height: number
} {
  return { width: d.w * d.r, height: d.h * d.r }
}

export function splashVariant(d: AppleSplashDevice): string {
  const { width, height } = splashPixelSize(d)
  return `${width}x${height}`
}

export function splashMedia(d: AppleSplashDevice): string {
  return `(device-width: ${d.w}px) and (device-height: ${d.h}px) and (-webkit-device-pixel-ratio: ${d.r}) and (orientation: portrait)`
}
