import { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EKYP Deprem Market",
    short_name: "Deprem Market",
    description:
      "Türkiye'nin öncü afet ve acil durum hazırlık marketi. Profesyonel deprem çantaları, ilk yardım setleri ve hayati acil durum ekipmanları.",
    id: "/tr",
    start_url: "/tr",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#E11D48",
    orientation: "portrait-primary",
    categories: ["shopping", "safety", "emergency"],
    // Beyan edilen boyut gerçek üretilen boyutla eşleşmeli (yoksa "Resource size is
    // not correct" uyarısı). "any" = klasik/şeffaf ikon (icon.tsx 512 + /icons/any-192).
    // "maskable" = Android adaptif ikon (kenarda kırpma payı olan varyant, /icons/maskable-*).
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/any-192",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/maskable-192",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    // Yükleme diyaloğunda zengin önizleme (uygulama mağazası benzeri). narrow=mobil,
    // wide=masaüstü. Görseller /screenshots/* route handler'ında üretilir.
    screenshots: [
      {
        src: "/screenshots/narrow",
        sizes: "1080x1920",
        type: "image/png",
        form_factor: "narrow",
        label: "Deprem Market — afet hazırlık marketi",
      },
      {
        src: "/screenshots/wide",
        sizes: "1920x1080",
        type: "image/png",
        form_factor: "wide",
        label: "Deprem Market — afet hazırlık marketi",
      },
    ],
    // Ana ekran ikonuna uzun basınca çıkan hızlı kısayollar (Android/desktop).
    // URL'ler varsayılan TR bölgesine sabit; hepsi mevcut rotalar.
    shortcuts: [
      {
        name: "Tüm Ürünler",
        short_name: "Ürünler",
        url: "/tr/store",
        icons: [{ src: "/icons/any-192", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Sepetim",
        short_name: "Sepet",
        url: "/tr/cart",
        icons: [{ src: "/icons/any-192", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Siparişlerim",
        short_name: "Siparişler",
        url: "/tr/account/orders",
        icons: [{ src: "/icons/any-192", sizes: "192x192", type: "image/png" }],
      },
    ],
  }
}
