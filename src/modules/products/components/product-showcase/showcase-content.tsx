import type { ReactNode } from "react"
import {
  Shield,
  Activity,
  BatteryCharging,
  Sun,
  AlertTriangle,
  CheckCircle,
  Flame,
  Crosshair,
  Compass,
  Droplets,
  Volume2,
  Utensils,
  Tent,
} from "lucide-react"

/**
 * Öne çıkan ürünlerin (deprem çantası, ilk yardım, fener vb.) zengin tanıtım
 * içeriği. Eskiden `ProductShowcase` render bileşeninin içinde ~490 satır
 * gömülü `if (handle.includes(...))` bloğuydu; içerik render'dan ayrıldı.
 *
 * Eşleştirme SIRA ÖNEMLİ: ilk eşleşen kazanır (eski ardışık if davranışı).
 * Eşleşme yoksa bileşen kendi dinamik fallback'ini üretir.
 */
export interface ShowcaseFeature {
  icon: ReactNode
  title: string
  desc: string
}
export interface ShowcaseSpec {
  label: string
  value: string
}
export interface ShowcaseHighlight {
  title: string
  desc: string
  image: string
}
export interface ShowcaseContent {
  tagline: string
  title: string
  subtitle: string
  videoUrl: string
  features: ShowcaseFeature[]
  specs: ShowcaseSpec[]
  highlights: ShowcaseHighlight[]
}

type ShowcaseEntry = {
  match: (handle: string) => boolean
  content: ShowcaseContent
}

const SHOWCASE_ENTRIES: ShowcaseEntry[] = [
  // 1. Profesyonel 4 Kişilik Deprem Çantası
  {
    match: (h) =>
      h.includes("profesyonel-deprem-cantasi") || h === "profesyonel-deprem-cantasi-4-kisilik",
    content: {
      tagline: "72 SAAT BOYUNCA 4 KİŞİLİK YAŞAM DESTEĞİ",
      title: "Profesyonel Deprem Çantası (4 Kişilik)",
      subtitle:
        "Afet sonrasındaki ilk kritik 72 saatte 4 kişilik bir ailenin tüm hayati ihtiyaçlarını karşılamak üzere uzmanlar tarafından AFAD ve Kızılay standartlarında tasarlanmıştır.",
      videoUrl: "https://www.youtube.com/embed/Yt7aUepwF4w",
      features: [
        {
          icon: <Shield className="w-8 h-8 text-brand-600" />,
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
          image:
            "https://images.unsplash.com/photo-1609587312208-cea54be969e7?auto=format&fit=crop&w=600&q=80",
        },
        {
          title: "TÜBİTAK Onaylı Dayanıklı Gıdalar",
          desc: "Pişirme gerektirmeyen, yüksek kalori ve vitamin içeren özel vakumlu ambalajlı acil durum gıdaları ve temiz içme suları.",
          image:
            "https://images.unsplash.com/photo-1563822249366-3efb23b8e0c9?auto=format&fit=crop&w=600&q=80",
        },
      ],
    },
  },

  // 2. Bireysel Deprem Çantası (1 Kişilik)
  {
    match: (h) => h.includes("bireysel-deprem-cantasi") || h.includes("mini-deprem-cantasi"),
    content: {
      tagline: "HAFİF, KOMPAKT VE BİREYSEL GÜVENLİK",
      title: "Bireysel Deprem Çantası (1 Kişilik)",
      subtitle:
        "Evde, ofiste, okulda veya arabanızda her an elinizin altında bulunması için tasarlanmış, tek kişinin 72 saatlik temel hayati ihtiyaçlarını karşılayan kompakt deprem seti.",
      videoUrl: "https://www.youtube.com/embed/Yt7aUepwF4w",
      features: [
        {
          icon: <Shield className="w-8 h-8 text-brand-600" />,
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
          image:
            "https://images.unsplash.com/photo-1563822249366-3efb23b8e0c9?auto=format&fit=crop&w=600&q=80",
        },
      ],
    },
  },

  // 3. Kapsamlı İlk Yardım Çantası
  {
    match: (h) => h.includes("ilk-yardim-cantasi") || h.includes("ilk-yardim-kiti"),
    content: {
      tagline: "ANINDA ACİL TIBBİ MÜDAHALE GÜCÜ",
      title: "Kapsamlı İlk Yardım Çantası (120 Parça)",
      subtitle:
        "Ev kazalarından büyük doğal afetlere kadar her türlü yaralanmada hızlı, doğru ve steril müdahale yapabilmeniz için Sağlık Bakanlığı onaylı tıbbi malzemelerle doldurulmuş profesyonel ilk yardım seti.",
      videoUrl: "https://www.youtube.com/embed/Yt7aUepwF4w",
      features: [
        {
          icon: <Activity className="w-8 h-8 text-brand-600" />,
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
          image:
            "https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=600&q=80",
        },
      ],
    },
  },

  // 4. Güneş Enerjili Fener & Radyo
  {
    match: (h) => h.includes("fener-radyo") || h.includes("sarj-edilebilir-fener"),
    content: {
      tagline: "KESİNTİSİZ AYDINLATMA VE İLETİŞİM",
      title: "Güneş Enerjili Acil Durum Feneri & Radyo",
      subtitle:
        "Elektrik kesintilerinde veya şebeke çökmelerinde el dinamosu veya solar panel ile çalışan, hem aydınlatan hem de dünyadan haber almanızı sağlayan hayati cihaz.",
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
          icon: <AlertTriangle className="w-8 h-8 text-brand-500" />,
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
          image:
            "https://images.unsplash.com/photo-1558244661-d248897f7bc4?auto=format&fit=crop&w=600&q=80",
        },
      ],
    },
  },

  // 5. Termal Battaniye (5'li Paket)
  {
    match: (h) => h.includes("battaniyesi"),
    content: {
      tagline: "HİPOTERMİYE KARŞI EN ETKİLİ KALKAN",
      title: "Termal Acil Durum Battaniyesi (5'li Paket)",
      subtitle:
        "NASA uzay teknolojisi kullanılarak üretilen, vücut ısısının %90'ını içeride tutarak dondurucu soğuklarda ve enkaz altında hayat kurtaran koruyucu örtü.",
      videoUrl: "https://www.youtube.com/embed/Yt7aUepwF4w",
      features: [
        {
          icon: <Flame className="w-8 h-8 text-orange-500" />,
          title: "%90 Isı Koruma",
          desc: "Alüminyum kaplamalı Mylar malzeme sayesinde vücuttan yayılan ısıyı geri yansıtarak hipotermiyi önler.",
        },
        {
          icon: <Shield className="w-8 h-8 text-brand-600" />,
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
          image:
            "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=600&q=80",
        },
      ],
    },
  },

  // 6. Taşınabilir Su Filtresi
  {
    match: (h) => h.includes("su-filtresi"),
    content: {
      tagline: "KİRLİ SULARI ANINDA İÇİLEBİLİR HALE GETİRİN",
      title: "Taşınabilir Acil Durum Su Filtresi",
      subtitle:
        "Akarsu, göl veya birikinti suları saniyeler içinde süzerek bakterilerin %99.99999'unu yok eden, afet durumlarında su krizini çözen ultra hafif pipet tipi arıtıcı.",
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
          image:
            "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=600&q=80",
        },
      ],
    },
  },

  // 7. Acil Durum Düdüğü (3'lü Paket)
  {
    match: (h) => h.includes("dudugu"),
    content: {
      tagline: "EN AZ NEFESLE EN YÜKSEK SES GÜCÜ",
      title: "Profesyonel Acil Durum Düdüğü (3'lü Paket)",
      subtitle:
        "Çift tüplü paslanmaz tasarımı ile minimum eforla 120 desibel ses şiddeti üreten, enkaz altında veya uzak mesafelerde konumunuzu bildiren hayati uyarı düdüğü.",
      videoUrl: "https://www.youtube.com/embed/Yt7aUepwF4w",
      features: [
        {
          icon: <Volume2 className="w-8 h-8 text-brand-600" />,
          title: "120 Desibel Ses Gücü",
          desc: "Enkaz altında ses tellerinizi yormadan, hafif bir üflemeyle kilometrelerce uzaktan duyulabilecek frekansta ses çıkarır.",
        },
        {
          icon: <CheckCircle className="w-8 h-8 text-emerald-600" />,
          title: "Paslanmaz Alüminyum Alaşım",
          desc: "Suya, neme ve korozyona dayanıklı metal gövde. İçinde bilye/nohut bulunmadığı için donmaz veya tıkanmaz.",
        },
        {
          icon: <Crosshair className="w-8 h-8 text-orange-500" />,
          title: "Taşıma Kolaylığı",
          desc: "Anahtarlık halkası ve boyun askı ipleri sayesinde çantanıza veya boynunuza sabitleyebilirsiniz.",
        },
      ],
      specs: [
        { label: "Ses Şiddeti", value: "120 dB" },
        { label: "Paket İçeriği", value: "3 Adet Düdük & Boyun Askısı" },
        { label: "Malzeme", value: "Alüminyum Alaşım" },
        { label: "Tasarım", value: "Bilyesiz Çift Kanallı" },
        { label: "Ağırlık", value: "90 g (toplam)" },
      ],
      highlights: [
        {
          title: "Her Hava Koşulunda Çalışır",
          desc: "Bilyesiz tasarımı sayesinde içine su kaçsa veya donsa dahi ses üretmeye devam eder, en kritik anlarda yarı yolda bırakmaz.",
          image:
            "https://images.unsplash.com/photo-1516475429286-465d815a0df7?auto=format&fit=crop&w=600&q=80",
        },
      ],
    },
  },

  // 8. Enerji Barı Seti
  {
    match: (h) => h.includes("enerji-bari"),
    content: {
      tagline: "HIZLI, UZUN ÖMÜRLÜ VE YÜKSEK ENERJİ",
      title: "Uzun Ömürlü Acil Durum Enerji Barı (24'lü Kutu)",
      subtitle:
        "TÜBİTAK standartlarında formüle edilmiş, pişirme gerektirmeyen, vakumlu özel ambalajı sayesinde 5 yıl boyunca taze kalan acil durum gıdası.",
      videoUrl: "https://www.youtube.com/embed/Yt7aUepwF4w",
      features: [
        {
          icon: <Utensils className="w-8 h-8 text-orange-500" />,
          title: "Yüksek Kalori & Besleyicilik",
          desc: "Her bir bar 400 kcal enerji, vitaminler ve mineraller içererek vücut direncini üst seviyede tutar.",
        },
        {
          icon: <Shield className="w-8 h-8 text-brand-600" />,
          title: "5 Yıl Raf Ömrü",
          desc: "Hava ve nem geçirmeyen özel üç katmanlı vakumlu ambalajı sayesinde 5 yıl boyunca bozulmaz.",
        },
        {
          icon: <CheckCircle className="w-8 h-8 text-emerald-600" />,
          title: "Su Tüketimini Artırmaz",
          desc: "Özel formülü sayesinde ağızda kuruluk yapmaz ve susuzluğu tetiklemeyecek şekilde üretilmiştir.",
        },
      ],
      specs: [
        { label: "Paket İçeriği", value: "24 Adet Enerji Barı" },
        { label: "Enerji Değeri", value: "Bar başına 400 kcal (Toplam 9600 kcal)" },
        { label: "Raf Ömrü", value: "5 Yıl (Vakumlu Ambalaj)" },
        { label: "Saklama Sıcaklığı", value: "-30°C ile +65°C arası dayanıklı" },
        { label: "Ağırlık", value: "2.4 Kg" },
      ],
      highlights: [
        {
          title: "Hazırlık Gerektirmeyen Beslenme",
          desc: "Sıcak su veya pişirme imkanının olmadığı afet bölgelerinde, paketi açıp doğrudan tüketerek vücudun ihtiyaç duyduğu tüm enerjiyi saniyeler içinde geri kazanın.",
          image:
            "https://images.unsplash.com/photo-1622484212850-eb596d769edc?auto=format&fit=crop&w=600&q=80",
        },
      ],
    },
  },

  // 9. Güneş Enerjili Powerbank
  {
    match: (h) => h.includes("powerbank"),
    content: {
      tagline: "ZORLU DOĞAL KOŞULLARDA BİTMEYEN ENERJİ",
      title: "Güneş Enerjili Powerbank (10000mAh) - IP67",
      subtitle:
        "Suya, toza ve darbelere karşı tam korumalı askeri standartta tasarımı ve üzerindeki solar paneli ile cep telefonlarınızı her koşulda çalışır tutan acil durum güç kaynağı.",
      videoUrl: "https://www.youtube.com/embed/Yt7aUepwF4w",
      features: [
        {
          icon: <BatteryCharging className="w-8 h-8 text-emerald-500" />,
          title: "10000mAh Li-ion Kapasite",
          desc: "Ortalama bir akıllı telefonu 3-4 kez tam şarj edebilen yüksek kapasiteli güvenli batarya.",
        },
        {
          icon: <Sun className="w-8 h-8 text-amber-500" />,
          title: "Solar Kendi Kendini Şarj",
          desc: "Elektrik şebekesi olmasa dahi üzerindeki solar panel sayesinde gün ışığıyla yavaşça şarj olur.",
        },
        {
          icon: <Shield className="w-8 h-8 text-brand-600" />,
          title: "IP67 Askeri Dayanıklılık",
          desc: "Suya düşmeye, toza ve darbelere karşı ekstra güçlendirilmiş silikon zırh gövde.",
        },
        {
          icon: <Compass className="w-8 h-8 text-blue-500" />,
          title: "Dahili Pusula & SOS Fener",
          desc: "Yolunuzu bulmak için pusula ve gece konum belirtmek için 3 modlu güçlü LED fener.",
        },
      ],
      specs: [
        { label: "Kapasite", value: "10000 mAh" },
        { label: "Su Geçirmezlik", value: "IP67" },
        { label: "Solar Giriş", value: "1.5 W Güneş Paneli" },
        { label: "Portlar", value: "Çift USB Çıkışı" },
        { label: "Ağırlık", value: "320 g" },
      ],
      highlights: [
        {
          title: "Doğa ve Afet Koşullarına Hazır",
          desc: "Yarı yolda bırakmayan darbe emici silikon kaplaması ve askısı ile çantanızın dışına asarak yürürken bile şarj edebilirsiniz.",
          image:
            "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=600&q=80",
        },
      ],
    },
  },

  // 10. Katlanır Çadır
  {
    match: (h) => h.includes("cadiri"),
    content: {
      tagline: "30 SANİYEDE HIZLI VE GÜVENLİ BARINAK",
      title: "Katlanır Acil Durum Çadırı (2 Kişilik)",
      subtitle:
        "Afet sonrasında barınma ihtiyacını anında karşılamak için tasarlanmış, kurulum gerektirmeyen pop-up açılır mekanizmalı rüzgar ve su geçirmez acil durum çadırı.",
      videoUrl: "https://www.youtube.com/embed/Yt7aUepwF4w",
      features: [
        {
          icon: <Tent className="w-8 h-8 text-brand-600" />,
          title: "30 Saniyede Pop-Up Kurulum",
          desc: "Kılıfından çıkardığınız anda otomatik olarak kendi kendine açılır ve kullanıma hazır hale gelir.",
        },
        {
          icon: <Shield className="w-8 h-8 text-emerald-600" />,
          title: "PU 3000mm Su Geçirmezlik",
          desc: "Yoğun yağmur, kar ve rüzgarlara karşı iç kısmı tamamen kuru tutan su geçirmez kaplama kumaş.",
        },
        {
          icon: <Sun className="w-8 h-8 text-blue-500" />,
          title: "Isı Yalıtımlı Çift Katman",
          desc: "İçerideki sıcak havayı muhafaza eden, yoğuşmayı önleyen havalandırma pencerelerine sahip çift katmanlı yapı.",
        },
      ],
      specs: [
        { label: "Kişi Kapasitesi", value: "2 Kişilik" },
        { label: "Kurulum Tipi", value: "Pop-Up (Kendiliğinden)" },
        { label: "Su Direnci", value: "PU 3000 mm" },
        { label: "Malzeme", value: "190T Polyester & Fiberglas" },
        { label: "Ağırlık", value: "1800 g" },
      ],
      highlights: [
        {
          title: "Maksimum Taşınabilirlik",
          desc: "Sadece 1.8 kg ağırlığı ve omuz askılı taşıma çantası sayesinde sırtınızda veya elinizde hiçbir yük oluşturmadan kolayca taşıyın.",
          image:
            "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=600&q=80",
        },
      ],
    },
  },
]

/**
 * Verilen ürün handle'ı için zengin tanıtım içeriğini döndürür; eşleşme yoksa
 * null (bileşen kendi dinamik fallback'ini üretir). İlk eşleşen kazanır.
 */
export function getShowcaseContent(handle: string): ShowcaseContent | null {
  return SHOWCASE_ENTRIES.find((e) => e.match(handle))?.content ?? null
}
