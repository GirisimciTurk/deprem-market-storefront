/**
 * Ana sayfa karşılama slider'ının görselleri.
 * Kaynak: gorseller/sliders (1024×572, ~16:9). Yeni görsel eklemek için dosyayı
 * public/images/sliders altına koyup buraya bir satır eklemek yeterli.
 */
export type HeroSlide = {
  src: string
  alt: string
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    src: "/images/sliders/slide-1.jpg",
    alt: "Vitrin cephesindeki betonarme kolona karbon fiber sargı uygulayan usta",
  },
  {
    src: "/images/sliders/slide-2.jpg",
    alt: "Karbon fiber güçlendirme uygulaması — şantiye sahası",
  },
  {
    src: "/images/sliders/slide-3.jpg",
    alt: "Açık kat şantiyesinde kolona karbon fiber kumaş uygulaması",
  },
  {
    src: "/images/sliders/slide-4.jpg",
    alt: "Karbon fiber ile yapısal güçlendirme çalışması",
  },
  {
    src: "/images/sliders/slide-5.jpg",
    alt: "Deprem güçlendirmesi için karbon fiber sargı uygulaması",
  },
]
