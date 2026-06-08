"use client"

import React, { useState } from "react"
import {
  Shield,
  Activity,
  BatteryCharging,
  Sun,
  AlertTriangle,
  CheckCircle,
  Video,
  Flame,
  Crosshair,
  Compass,
  Droplets,
  Volume2,
  Utensils,
  Tent,
  X,
  Maximize2,
  Eye
} from "lucide-react"
import { HttpTypes } from "@medusajs/types"

interface ShowcaseProps {
  product: HttpTypes.StoreProduct
  images?: HttpTypes.StoreProductImage[]
}

export default function ProductShowcase({ product, images }: ShowcaseProps) {
  const [activeImage, setActiveImage] = useState<string | null>(null)

  if (!product) return null

  // Define custom content for each key product, normalizing the handle to support flexible matching
  const getProductData = () => {
    const handle = product.handle || ""

    // 1. Profesyonel 4 Kişilik Deprem Çantası
    if (handle.includes("profesyonel-deprem-cantasi") || handle === "profesyonel-deprem-cantasi-4-kisilik") {
      return {
        tagline: "72 SAAT BOYUNCA 4 KİŞİLİK YAŞAM DESTEĞİ",
        title: "Profesyonel Deprem Çantası (4 Kişilik)",
        subtitle: "Afet sonrasındaki ilk kritik 72 saatte 4 kişilik bir ailenin tüm hayati ihtiyaçlarını karşılamak üzere uzmanlar tarafından AFAD ve Kızılay standartlarında tasarlanmıştır.",
        videoUrl: "https://www.youtube.com/embed/Yt7aUepwF4w",
        features: [
          {
            icon: <Shield className="w-8 h-8 text-rose-600" />,
            title: "Askeri Standartta Sırt Çantası",
            desc: "Su geçirmez, yırtılmaz Oxford 1000D Cordura naylon kumaş. Ergonomik sırt desteği ve geniş 40L hacim.",
          },
          {
            icon: <Activity className="w-8 h-8 text-emerald-600" />,
            title: "72 Parça Medikal İlk Yardım Seti",
            desc: "Pansuman malzemeleri, turnike, yanık jeli, ateller ve acil müdahale ekipmanları.",
          },
          {
            icon: <BatteryCharging className="w-8 h-8 text-amber-500" />,
            title: "Çok İşlevli Radyo & Fener",
            desc: "Güneş enerjisi ve el dinamosu ile şarj olan, telefon şarj destekli AM/FM radyo.",
          },
          {
            icon: <Flame className="w-8 h-8 text-orange-500" />,
            title: "Termal Koruma Ekipmanları",
            desc: "Vücut ısısını %90 koruyan termal battaniyeler, yağmurluklar ve acil durum çadırı.",
          },
        ],
        specs: [
          { label: "Kişi Kapasitesi", value: "4 Kişilik" },
          { label: "Toplam Ekipman", value: "98 Parça" },
          { label: "Çanta Hacmi", value: "40 Litre" },
          { label: "Raf Ömrü (Gıda/Su)", value: "5 Yıl (TÜBİTAK Onaylı)" },
          { label: "Malzeme", value: "1000D Cordura Naylon" },
          { label: "Toplam Ağırlık", value: "5.2 Kg" },
        ],
        highlights: [
          {
            title: "Düzenli ve Hızlı Erişim Cepleri",
            desc: "Afet anındaki panik durumunda aradığınız ekipmana saniyeler içinde ulaşabilmeniz için özel tasarlanmış iç cepler ve etiketli gözler.",
            image: "https://images.unsplash.com/photo-1609587312208-cea54be969e7?auto=format&fit=crop&w=600&q=80",
          },
          {
            title: "TÜBİTAK Onaylı Dayanıklı Gıdalar",
            desc: "Pişirme gerektirmeyen, yüksek kalori ve vitamin içeren özel vakumlu ambalajlı acil durum gıdaları ve temiz içme suları.",
            image: "https://images.unsplash.com/photo-1563822249366-3efb23b8e0c9?auto=format&fit=crop&w=600&q=80",
          },
        ],
      }
    }

    // 2. Bireysel Deprem Çantası (1 Kişilik)
    if (handle.includes("bireysel-deprem-cantasi") || handle.includes("mini-deprem-cantasi")) {
      return {
        tagline: "HAFİF, KOMPAKT VE BİREYSEL GÜVENLİK",
        title: "Bireysel Deprem Çantası (1 Kişilik)",
        subtitle: "Evde, ofiste, okulda veya arabanızda her an elinizin altında bulunması için tasarlanmış, tek kişinin 72 saatlik temel hayati ihtiyaçlarını karşılayan kompakt deprem seti.",
        videoUrl: "https://www.youtube.com/embed/Yt7aUepwF4w",
        features: [
          {
            icon: <Shield className="w-8 h-8 text-rose-600" />,
            title: "Kompakt 15L Sırt Çantası",
            desc: "Su geçirmez 600D Polyester kumaş. Ultra hafif ve kolay taşınabilir tasarım.",
          },
          {
            icon: <Activity className="w-8 h-8 text-emerald-600" />,
            title: "32 Parça İlk Yardım Kiti",
            desc: "Temel pansuman malzemeleri, yara bantları, sargı bezleri ve hijyen ürünleri.",
          },
          {
            icon: <BatteryCharging className="w-8 h-8 text-amber-500" />,
            title: "LED Fener & Acil Durum Düdüğü",
            desc: "Karanlıkta yolunuzu bulmanızı ve enkaz altında konumunuzu bildiren 120dB düdük.",
          },
          {
            icon: <Flame className="w-8 h-8 text-orange-500" />,
            title: "Termal Battaniye & Yağmurluk",
            desc: "Hipotermiye karşı koruma sağlayan alüminyum battaniye ve rüzgar/su geçirmez yağmurluk.",
          },
        ],
        specs: [
          { label: "Kişi Kapasitesi", value: "1 Kişilik" },
          { label: "Toplam Ürün Adedi", value: "32 Parça" },
          { label: "Çanta Hacmi", value: "15 Litre" },
          { label: "Malzeme", value: "600D Polyester" },
          { label: "Ağırlık", value: "2.1 Kg" },
          { label: "Su Direnci", value: "Suya Dayanıklı" },
        ],
        highlights: [
          {
            title: "Her Zaman Yanınızda",
            desc: "Araba bagajı, ofis çekmecesi veya ev girişine kolayca sığabilen boyutlarıyla depreme her an hazırlıklı olmanızı sağlar.",
            image: "https://images.unsplash.com/photo-1563822249366-3efb23b8e0c9?auto=format&fit=crop&w=600&q=80",
          },
        ],
      }
    }

    // 3. Kapsamlı İlk Yardım Çantası
    if (handle.includes("ilk-yardim-cantasi") || handle.includes("ilk-yardim-kiti")) {
      return {
        tagline: "ANINDA ACİL TIBBİ MÜDAHALE GÜCÜ",
        title: "Kapsamlı İlk Yardım Çantası (120 Parça)",
        subtitle: "Ev kazalarından büyük doğal afetlere kadar her türlü yaralanmada hızlı, doğru ve steril müdahale yapabilmeniz için Sağlık Bakanlığı onaylı tıbbi malzemelerle doldurulmuş profesyonel ilk yardım seti.",
        videoUrl: "https://www.youtube.com/embed/Yt7aUepwF4w",
        features: [
          {
            icon: <Activity className="w-8 h-8 text-rose-600" />,
            title: "120 Parça Steril Ekipman",
            desc: "Turnikeler, ateller, yanık kompresleri, göz solüsyonu, bandajlar ve steril sargı bezleri.",
          },
          {
            icon: <CheckCircle className="w-8 h-8 text-emerald-600" />,
            title: "TSE ve CE Standartlarında",
            desc: "Set içerisindeki tüm tıbbi sarf malzemeleri CE sertifikalı ve uluslararası standartlara uygundur.",
          },
          {
            icon: <Crosshair className="w-8 h-8 text-blue-500" />,
            title: "Düzenli İç Düzenleme",
            desc: "Kanama veya yaralanma anında paniklemeden aradığınız malzemeyi saniyeler içinde bulmanızı sağlayan bölmeli tasarım.",
          },
        ],
        specs: [
          { label: "Toplam Parça Sayısı", value: "120 Adet" },
          { label: "Çanta Malzemesi", value: "Su Geçirmez Oxford Kumaş" },
          { label: "Standartlar", value: "TSE / CE / ISO 13485" },
          { label: "Ağırlık", value: "980 g" },
          { label: "Boyut Seçenekleri", value: "Standart (120 Parça) / Büyük (200 Parça)" },
        ],
        highlights: [
          {
            title: "Kritik Dakikalarda Hızlı Erişim",
            desc: "Fermuarlı katlanabilir cepler sayesinde acil tıbbi müdahale gerektiren durumlarda malzemelere en hızlı ve steril şekilde erişin.",
            image: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=600&q=80",
          },
        ],
      }
    }

    // 4. Güneş Enerjili Fener & Radyo
    if (handle.includes("fener-radyo") || handle.includes("sarj-edilebilir-fener")) {
      return {
        tagline: "KESİNTİSİZ AYDINLATMA VE İLETİŞİM",
        title: "Güneş Enerjili Acil Durum Feneri & Radyo",
        subtitle: "Elektrik kesintilerinde veya şebeke çökmelerinde el dinamosu veya solar panel ile çalışan, hem aydınlatan hem de dünyadan haber almanızı sağlayan hayati cihaz.",
        videoUrl: "https://www.youtube.com/embed/Yt7aUepwF4w",
        features: [
          {
            icon: <Sun className="w-8 h-8 text-amber-500" />,
            title: "Üçlü Şarj Teknolojisi",
            desc: "Güneş enerjisi (Solar), el dinamosu (Krank) ve USB kablosu ile her durumda şarj edilebilir.",
          },
          {
            icon: <BatteryCharging className="w-8 h-8 text-emerald-600" />,
            title: "2000mAh Güç Bankası",
            desc: "Dahili bataryası sayesinde cep telefonlarınızı acil durumlarda şarj etmenize olanak tanır.",
          },
          {
            icon: <Activity className="w-8 h-8 text-blue-500" />,
            title: "AM/FM Radyo Alıcısı",
            desc: "Afet sonrasında yetkililerin yapacağı acil durum anonslarını ve haberleri takip edebilmeniz için hassas radyo alıcısı.",
          },
          {
            icon: <AlertTriangle className="w-8 h-8 text-rose-500" />,
            title: "SOS Işıklı Alarm Modu",
            desc: "Yardım çağırmak amacıyla yüksek sesli siren ve kırmızı-mavi flaşör ışık yayar.",
          },
        ],
        specs: [
          { label: "Batarya Kapasitesi", value: "2000 mAh" },
          { label: "Şarj Yöntemleri", value: "Güneş Paneli, Dinamo Krank, USB" },
          { label: "Aydınlatma Süresi", value: "48 Saate Kadar" },
          { label: "Radyo Bantları", value: "AM / FM" },
          { label: "Su Geçirmezlik", value: "IPX4" },
          { label: "Ağırlık", value: "380 g" },
        ],
        highlights: [
          {
            title: "Sonsuz Enerji Kaynağı",
            desc: "Piliniz bitse bile el dinamosunu 1 dakika çevirerek 15 dakika fener kullanımı veya 5 dakika radyo dinleme süresi elde edebilirsiniz.",
            image: "https://images.unsplash.com/photo-1558244661-d248897f7bc4?auto=format&fit=crop&w=600&q=80",
          },
        ],
      }
    }

    // 5. Termal Battaniye (5'li Paket)
    if (handle.includes("battaniyesi")) {
      return {
        tagline: "HİPOTERMİYE KARŞI EN ETKİLİ KALKAN",
        title: "Termal Acil Durum Battaniyesi (5'li Paket)",
        subtitle: "NASA uzay teknolojisi kullanılarak üretilen, vücut ısısının %90'ını içeride tutarak dondurucu soğuklarda ve enkaz altında hayat kurtaran koruyucu örtü.",
        videoUrl: "https://www.youtube.com/embed/Yt7aUepwF4w",
        features: [
          {
            icon: <Flame className="w-8 h-8 text-orange-500" />,
            title: "%90 Isı Koruma",
            desc: "Alüminyum kaplamalı Mylar malzeme sayesinde vücuttan yayılan ısıyı geri yansıtarak hipotermiyi önler.",
          },
          {
            icon: <Shield className="w-8 h-8 text-rose-600" />,
            title: "%100 Rüzgar ve Su Geçirmez",
            desc: "Yağmur, kar ve fırtınalı hava şartlarında mükemmel yalıtım sağlar.",
          },
          {
            icon: <Sun className="w-8 h-8 text-blue-500" />,
            title: "Yüksek Görünürlük",
            desc: "Yansıtıcı parlak gümüş yüzeyi, arama kurtarma helikopterleri ve ekipleri için mükemmel bir konum belirticidir.",
          },
        ],
        specs: [
          { label: "Paket İçeriği", value: "5 Adet Battaniye" },
          { label: "Açık Boyut", value: "210 x 160 cm" },
          { label: "Malzeme", value: "Vakumlu Alüminyum Mylar Film" },
          { label: "Ağırlık", value: "450 g (toplam)" },
          { label: "Katlanmış Boyut", value: "9 x 12 cm (Cepte taşınabilir)" },
          { label: "Koruma Derecesi", value: "%100 Rüzgar ve Su Geçirmez" },
        ],
        highlights: [
          {
            title: "Çok Amaçlı Acil Durum Kullanımı",
            desc: "Sadece battaniye olarak değil, yağmur suyu toplamak için gergi tentesi veya rüzgar kırıcı sığınak yapımında da kullanılabilir.",
            image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=600&q=80",
          },
        ],
      }
    }

    // 6. Taşınabilir Su Filtresi
    if (handle.includes("su-filtresi")) {
      return {
        tagline: "KİRLİ SULARI ANINDA İÇİLEBİLİR HALE GETİRİN",
        title: "Taşınabilir Acil Durum Su Filtresi",
        subtitle: "Akarsu, göl veya birikinti suları saniyeler içinde süzerek bakterilerin %99.99999'unu yok eden, afet durumlarında su krizini çözen ultra hafif pipet tipi arıtıcı.",
        videoUrl: "https://www.youtube.com/embed/Yt7aUepwF4w",
        features: [
          {
            icon: <Droplets className="w-8 h-8 text-blue-600" />,
            title: "0.01 Mikron Filtrasyon",
            desc: "Hollow Fiber Membran teknolojisiyle en küçük mikropları, bakterileri ve parazitleri süzerek temiz su sağlar.",
          },
          {
            icon: <CheckCircle className="w-8 h-8 text-emerald-600" />,
            title: "4000 Litre Kapasite",
            desc: "Tek bir filtre pipeti ile 4000 litreye kadar kirli suyu güvenle içme suyuna dönüştürebilirsiniz.",
          },
          {
            icon: <Shield className="w-8 h-8 text-amber-500" />,
            title: "Kimyasal İçermez",
            desc: "Aktif karbon ve fiber filtreleme ile klor veya kimyasal madde kullanmadan doğal arıtma yapar.",
          },
        ],
        specs: [
          { label: "Filtrasyon Hassasiyeti", value: "0.01 Mikron" },
          { label: "Arıtma Kapasitesi", value: "4000 Litre" },
          { label: "Kullanım Şekli", value: "Doğrudan Pipet veya Şişe Adaptörlü" },
          { label: "Ağırlık", value: "65 g" },
          { label: "Malzeme", value: "BPA İçermez Gıda Sınıfı Plastik" },
          { label: "Filtre Ömrü", value: "Kuru halde sınırsız raf ömrü" },
        ],
        highlights: [
          {
            title: "Doğrudan Kaynaktan Güvenle İçin",
            desc: "Herhangi bir bardağa veya su birikintisine pipeti daldırarak doğrudan temiz su çekebilir, ya da standart pet şişe ağızlarına vidalayabilirsiniz.",
            image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=600&q=80",
          },
        ],
      }
    }

    // 7. Acil Durum Düdüğü (3'lü Paket)
    if (handle.includes("dudugu")) {
      return {
        tagline: "EN AZ NEFESLE EN YÜKSEK SES GÜCÜ",
        title: "Profesyonel Acil Durum Düdüğü (3'lü Paket)",
        subtitle: "Çift tüplü paslanmaz tasarımı ile minimum eforla 120 desibel ses şiddeti üreten, enkaz altında veya uzak mesafelerde konumunuzu bildiren hayati uyarı düdüğü.",
        videoUrl: "https://www.youtube.com/embed/Yt7aUepwF4w",
        features: [
          {
            icon: <Volume2 className="w-8 h-8 text-rose-600" />,
            title: "120 Desibel Ses Gücü",
            desc: "Enkaz altında ses tellerinizi yormadan, hafif bir üflemeyle kilometrelerce uzaktan duyulabilecek frekansta ses çıkarır."
          },
          {
            icon: <CheckCircle className="w-8 h-8 text-emerald-600" />,
            title: "Paslanmaz Alüminyum Alaşım",
            desc: "Suya, neme ve korozyona dayanıklı metal gövde. İçinde bilye/nohut bulunmadığı için donmaz veya tıkanmaz."
          },
          {
            icon: <Crosshair className="w-8 h-8 text-orange-500" />,
            title: "Taşıma Kolaylığı",
            desc: "Anahtarlık halkası ve boyun askı ipleri sayesinde çantanıza veya boynunuza sabitleyebilirsiniz."
          }
        ],
        specs: [
          { label: "Ses Şiddeti", value: "120 dB" },
          { label: "Paket İçeriği", value: "3 Adet Düdük & Boyun Askısı" },
          { label: "Malzeme", value: "Alüminyum Alaşım" },
          { label: "Tasarım", value: "Bilyesiz Çift Kanallı" },
          { label: "Ağırlık", value: "90 g (toplam)" }
        ],
        highlights: [
          {
            title: "Her Hava Koşulunda Çalışır",
            desc: "Bilyesiz tasarımı sayesinde içine su kaçsa veya donsa dahi ses üretmeye devam eder, en kritik anlarda yarı yolda bırakmaz.",
            image: "https://images.unsplash.com/photo-1516475429286-465d815a0df7?auto=format&fit=crop&w=600&q=80"
          }
        ]
      }
    }

    // 8. Enerji Barı Seti
    if (handle.includes("enerji-bari")) {
      return {
        tagline: "HIZLI, UZUN ÖMÜRLÜ VE YÜKSEK ENERJİ",
        title: "Uzun Ömürlü Acil Durum Enerji Barı (24'lü Kutu)",
        subtitle: "TÜBİTAK standartlarında formüle edilmiş, pişirme gerektirmeyen, vakumlu özel ambalajı sayesinde 5 yıl boyunca taze kalan acil durum gıdası.",
        videoUrl: "https://www.youtube.com/embed/Yt7aUepwF4w",
        features: [
          {
            icon: <Utensils className="w-8 h-8 text-orange-500" />,
            title: "Yüksek Kalori & Besleyicilik",
            desc: "Her bir bar 400 kcal enerji, vitaminler ve mineraller içererek vücut direncini üst seviyede tutar."
          },
          {
            icon: <Shield className="w-8 h-8 text-rose-600" />,
            title: "5 Yıl Raf Ömrü",
            desc: "Hava ve nem geçirmeyen özel üç katmanlı vakumlu ambalajı sayesinde 5 yıl boyunca bozulmaz."
          },
          {
            icon: <CheckCircle className="w-8 h-8 text-emerald-600" />,
            title: "Su Tüketimini Artırmaz",
            desc: "Özel formülü sayesinde ağızda kuruluk yapmaz ve susuzluğu tetiklemeyecek şekilde üretilmiştir."
          }
        ],
        specs: [
          { label: "Paket İçeriği", value: "24 Adet Enerji Barı" },
          { label: "Enerji Değeri", value: "Bar başına 400 kcal (Toplam 9600 kcal)" },
          { label: "Raf Ömrü", value: "5 Yıl (Vakumlu Ambalaj)" },
          { label: "Saklama Sıcaklığı", value: "-30°C ile +65°C arası dayanıklı" },
          { label: "Ağırlık", value: "2.4 Kg" }
        ],
        highlights: [
          {
            title: "Hazırlık Gerektirmeyen Beslenme",
            desc: "Sıcak su veya pişirme imkanının olmadığı afet bölgelerinde, paketi açıp doğrudan tüketerek vücudun ihtiyaç duyduğu tüm enerjiyi saniyeler içinde geri kazanın.",
            image: "https://images.unsplash.com/photo-1622484212850-eb596d769edc?auto=format&fit=crop&w=600&q=80"
          }
        ]
      }
    }

    // 9. Güneş Enerjili Powerbank
    if (handle.includes("powerbank")) {
      return {
        tagline: "ZORLU DOĞAL KOŞULLARDA BİTMEYEN ENERJİ",
        title: "Güneş Enerjili Powerbank (10000mAh) - IP67",
        subtitle: "Suya, toza ve darbelere karşı tam korumalı askeri standartta tasarımı ve üzerindeki solar paneli ile cep telefonlarınızı her koşulda çalışır tutan acil durum güç kaynağı.",
        videoUrl: "https://www.youtube.com/embed/Yt7aUepwF4w",
        features: [
          {
            icon: <BatteryCharging className="w-8 h-8 text-emerald-500" />,
            title: "10000mAh Li-ion Kapasite",
            desc: "Ortalama bir akıllı telefonu 3-4 kez tam şarj edebilen yüksek kapasiteli güvenli batarya."
          },
          {
            icon: <Sun className="w-8 h-8 text-amber-500" />,
            title: "Solar Kendi Kendini Şarj",
            desc: "Elektrik şebekesi olmasa dahi üzerindeki solar panel sayesinde gün ışığıyla yavaşça şarj olur."
          },
          {
            icon: <Shield className="w-8 h-8 text-rose-600" />,
            title: "IP67 Askeri Dayanıklılık",
            desc: "Suya düşmeye, toza ve darbelere karşı ekstra güçlendirilmiş silikon zırh gövde."
          },
          {
            icon: <Compass className="w-8 h-8 text-blue-500" />,
            title: "Dahili Pusula & SOS Fener",
            desc: "Yolunuzu bulmak için pusula ve gece konum belirtmek için 3 modlu güçlü LED fener."
          }
        ],
        specs: [
          { label: "Kapasite", value: "10000 mAh" },
          { label: "Su Geçirmezlik", value: "IP67" },
          { label: "Solar Giriş", value: "1.5 W Güneş Paneli" },
          { label: "Portlar", value: "Çift USB Çıkışı" },
          { label: "Ağırlık", value: "320 g" }
        ],
        highlights: [
          {
            title: "Doğa ve Afet Koşullarına Hazır",
            desc: "Yarı yolda bırakmayan darbe emici silikon kaplaması ve askısı ile çantanızın dışına asarak yürürken bile şarj edebilirsiniz.",
            image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=600&q=80"
          }
        ]
      }
    }

    // 10. Katlanır Çadır
    if (handle.includes("cadiri")) {
      return {
        tagline: "30 SANİYEDE HIZLI VE GÜVENLİ BARINAK",
        title: "Katlanır Acil Durum Çadırı (2 Kişilik)",
        subtitle: "Afet sonrasında barınma ihtiyacını anında karşılamak için tasarlanmış, kurulum gerektirmeyen pop-up açılır mekanizmalı rüzgar ve su geçirmez acil durum çadırı.",
        videoUrl: "https://www.youtube.com/embed/Yt7aUepwF4w",
        features: [
          {
            icon: <Tent className="w-8 h-8 text-rose-600" />,
            title: "30 Saniyede Pop-Up Kurulum",
            desc: "Kılıfından çıkardığınız anda otomatik olarak kendi kendine açılır ve kullanıma hazır hale gelir."
          },
          {
            icon: <Shield className="w-8 h-8 text-emerald-600" />,
            title: "PU 3000mm Su Geçirmezlik",
            desc: "Yoğun yağmur, kar ve rüzgarlara karşı iç kısmı tamamen kuru tutan su geçirmez kaplama kumaş."
          },
          {
            icon: <Sun className="w-8 h-8 text-blue-500" />,
            title: "Isı Yalıtımlı Çift Katman",
            desc: "İçerideki sıcak havayı muhafaza eden, yoğuşmayı önleyen havalandırma pencerelerine sahip çift katmanlı yapı."
          }
        ],
        specs: [
          { label: "Kişi Kapasitesi", value: "2 Kişilik" },
          { label: "Kurulum Tipi", value: "Pop-Up (Kendiliğinden)" },
          { label: "Su Direnci", value: "PU 3000 mm" },
          { label: "Malzeme", value: "190T Polyester & Fiberglas" },
          { label: "Ağırlık", value: "1800 g" }
        ],
        highlights: [
          {
            title: "Maksimum Taşınabilirlik",
            desc: "Sadece 1.8 kg ağırlığı ve omuz askılı taşıma çantası sayesinde sırtınızda veya elinizde hiçbir yük oluşturmadan kolayca taşıyın.",
            image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=600&q=80"
          }
        ]
      }
    }

    // --- Dynamic Fallback Generator ---
    const categoryNames = product.categories?.map((c: any) => c.name).join(", ") || "Deprem Hazırlığı"
    const parsedWeight = product.weight ? (product.weight >= 1000 ? (product.weight / 1000).toFixed(1) + " kg" : product.weight + " g") : ""
    const defaultSpecs = [
      { label: "Ürün Adı", value: product.title },
      ...(product.material ? [{ label: "Malzeme", value: product.material }] : []),
      ...(parsedWeight ? [{ label: "Ağırlık", value: parsedWeight }] : []),
      { label: "Kategori", value: categoryNames },
      { label: "Durum", value: "Stokta Var / Orijinal" }
    ]

    const fallbackFeatures = [
      {
        icon: <Shield className="w-8 h-8 text-rose-600" />,
        title: "Güvenilir Kalite",
        desc: "Afet ve acil durum koşulları göz önüne alınarak test edilmiş, dayanıklı malzemeden üretilmiştir."
      },
      {
        icon: <Activity className="w-8 h-8 text-emerald-600" />,
        title: "Afet Uyumlu Tasarım",
        desc: "Enkaz, deprem ve diğer acil durumlarda pratik, hızlı ve kolay kullanım sunacak şekilde tasarlanmıştır."
      },
      {
        icon: <CheckCircle className="w-8 h-8 text-amber-500" />,
        title: "Temel Yaşam Desteği",
        desc: "Afet sonrasındaki ilk kritik saatlerde güvenliğinizi ve hazırlığınızı artırmak için ideal bir yardımcıdır."
      }
    ]

    // Use product images for dynamic highlights
    const prodImages = images || product.images || []
    const fallbackHighlights = prodImages.slice(0, 3).map((img: any, index: number) => ({
      title: `${product.title} - Görsel ${index + 1}`,
      desc: product.description || "Ürünün detaylı tasarım detayları ve acil durum uyumluluğu.",
      image: img.url
    }))

    return {
      tagline: "ACİL DURUM VE AFET HAZIRLIĞI",
      title: product.title,
      subtitle: product.subtitle || product.description || "Afet sonrasında güvenliğinizi ve hazırlığınızı en üst seviyeye çıkarmak için üretilmiştir.",
      videoUrl: (product.metadata as any)?.video_url || "",
      features: fallbackFeatures,
      specs: defaultSpecs,
      highlights: fallbackHighlights.length > 0 ? fallbackHighlights : [
        {
          title: product.title,
          desc: product.description || "Detaylı ürün bilgisi.",
          image: product.thumbnail || "https://images.unsplash.com/photo-1508873696983-2df519f0397e?auto=format&fit=crop&w=600&q=80"
        }
      ]
    }
  }

  const data = getProductData()
  if (!data) return null

  // Collect all images for the dynamic high-res gallery (product.images and images combined, filter duplicates)
  const allProductImages = [
    ...(product.thumbnail ? [{ url: product.thumbnail }] : []),
    ...(images || []),
    ...(product.images || [])
  ].reduce((acc: any[], current: any) => {
    const x = acc.find(item => item.url === current.url)
    if (!x && current.url) {
      return acc.concat([current])
    } else {
      return acc
    }
  }, [])

  return (
    <div className="bg-slate-50 border-t border-slate-200 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <span className="text-xs font-bold text-rose-600 tracking-widest uppercase block mb-3">
            {data.tagline}
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-6 uppercase">
            {data.title}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            {data.subtitle}
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-20">
          {data.features.map((feature, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-200"
            >
              <div className="mb-5 inline-block bg-slate-50 p-3 rounded-xl">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Image / Text Highlights Section */}
        {data.highlights && data.highlights.length > 0 && (
          <div className="space-y-12 sm:space-y-16 mb-20">
            {data.highlights.map((item, idx) => (
              <div
                key={idx}
                className={`flex flex-col lg:flex-row items-center gap-8 lg:gap-16 ${
                  idx % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div className="w-full lg:w-1/2">
                  <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm relative group">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-[300px] sm:h-[400px] object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div 
                      onClick={() => setActiveImage(item.image)}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity duration-300"
                    >
                      <button className="bg-white text-slate-900 px-4 py-2 rounded-full font-semibold flex items-center gap-x-2 text-sm shadow-lg">
                        <Maximize2 className="w-4 h-4" /> Büyük Resmi Gör
                      </button>
                    </div>
                  </div>
                </div>
                <div className="w-full lg:w-1/2 space-y-4 text-center lg:text-left">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 uppercase">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-base sm:text-lg">
                    {item.desc}
                  </p>
                  <div className="pt-2 flex justify-center lg:justify-start gap-x-2">
                    <div className="h-1 w-12 bg-rose-600 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Video Presentation Section */}
        {data.videoUrl && (
          <div className="mb-20 bg-slate-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(244,63,94,0.08),transparent)] pointer-events-none" />
            
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 relative z-10">
              <div className="w-full lg:w-5/12 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-x-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 px-3 py-1 rounded-full text-xs font-semibold">
                  <Video className="w-3.5 h-3.5" /> GÖRSEL ANLATIM VE REHBER
                </div>
                <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                  Nasıl Kullanılır ve Hazırlanır?
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  Deprem ve afet çantasının doğru kullanımı, acil durumlarda saniyeler kazandırır. Uzmanlarımızın hazırladığı detaylı video rehberimizi izleyin.
                </p>
              </div>
              <div className="w-full lg:w-7/12">
                <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-black">
                  <iframe
                    className="w-full h-full"
                    src={data.videoUrl}
                    title="Product Usage Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Image Gallery Grid (farklı büyük resimlerini oluşturabilecek) */}
        {allProductImages.length > 0 && (
          <div className="mb-20">
            <div className="text-center max-w-xl mx-auto mb-10">
              <h3 className="text-2xl font-black text-slate-950 uppercase tracking-tight mb-2">
                DETAYLI ÜRÜN GALERİSİ
              </h3>
              <p className="text-sm text-slate-500">
                Ekipman kalitesini, dikiş ve malzeme detaylarını yakından incelemek için resimlere tıklayarak büyütebilirsiniz.
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {allProductImages.map((img: any, idx: number) => (
                <div 
                  key={idx}
                  onClick={() => setActiveImage(img.url)}
                  className="group relative cursor-pointer aspect-square bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200"
                >
                  <img
                    src={img.url}
                    alt={`${product.title} galeri görsel ${idx}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                    <div className="bg-white/90 backdrop-blur-sm p-2 rounded-full text-slate-800 shadow">
                      <Eye className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Technical Specs Table */}
        <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
          <h3 className="text-xl sm:text-2xl font-black text-slate-950 uppercase tracking-tight mb-6 pb-4 border-b border-slate-100">
            TEKNİK ÖZELLİKLER VE DETAYLAR
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
            {data.specs.map((spec, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-3 border-b border-slate-100 text-sm sm:text-base"
              >
                <span className="font-semibold text-slate-500">{spec.label}</span>
                <span className="font-bold text-slate-900 text-right">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Lightbox / Modal for Large Images */}
      {activeImage && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300"
          onClick={() => setActiveImage(null)}
        >
          <div className="absolute top-4 right-4 z-50">
            <button 
              onClick={() => setActiveImage(null)}
              className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div 
            className="relative max-w-5xl max-h-[85vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={activeImage}
              alt="Büyük ürün görseli"
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl animate-fade-in"
            />
          </div>
        </div>
      )}
    </div>
  )
}
