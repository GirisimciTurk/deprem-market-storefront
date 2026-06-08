import { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EKYP Deprem Market",
    short_name: "Deprem Market",
    description:
      "Türkiye'nin öncü afet ve acil durum hazırlık marketi. Profesyonel deprem çantaları, ilk yardım setleri ve hayati acil durum ekipmanları.",
    start_url: "/tr",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#E11D48",
    orientation: "portrait-primary",
    categories: ["shopping", "safety", "emergency"],
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/icon",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
