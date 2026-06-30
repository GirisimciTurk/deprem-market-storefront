import { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import FaqAccordion, {
  type FaqItem,
} from "@modules/common/components/faq-accordion"

// 1) Alışveriş & Sipariş
const SHOPPING_FAQS: FaqItem[] = [
  {
    question:
      "Deprem çantasının içeriği ne sıklıkla güncellenmeli veya kontrol edilmelidir?",
    answer:
      "Deprem çantası içerisindeki gıda malzemeleri, ilk yardım malzemeleri ve suyun son tüketim tarihleri ile pillerin şarj durumları en geç 6 ayda bir kontrol edilmelidir. Bozulmaya yüz tutmuş veya kullanım ömrünü tamamlamış malzemeler yenilenmelidir.",
  },
  {
    question: "Kargom ne zaman kargolanır ve ne kadar sürede elime ulaşır?",
    answer:
      "Hafta içi saat 15:00'e kadar verilen tüm siparişler aynı gün kargoya verilmektedir. İstanbul ve çevre illere teslimat genellikle 1-2 iş günü sürerken, diğer şehirlere teslimat 2-3 iş günü içerisinde gerçekleşmektedir.",
  },
  {
    question:
      "Toplu sipariş ve kurumlar için özel çanta içeriği hazırlıyor musunuz?",
    answer:
      "Evet! Okullar, şirketler, fabrikalar ve sivil toplum kuruluşları için özel logolu, adetli ve istenilen iç donanıma sahip deprem/ilk yardım çantaları tasarlayıp üretmekteyiz. Toplu/kurumsal sipariş talepleriniz için lütfen İletişim sayfamızdan bizimle iletişime geçin.",
  },
  {
    question:
      "Ürünlerinizin kalitesi ve sertifikaları hakkında bilgi alabilir miyim?",
    answer:
      "depremTek Market olarak satışa sunduğumuz tüm ilk yardım malzemeleri T.C. Sağlık Bakanlığı onaylıdır. Çantalarımız su geçirmez, yüksek mukavemetli yırtılmaz kumaşlardan üretilmekte olup; fener, düdük, radyo ve benzeri mekanik/teknolojik ürünlerimiz kalite sertifikalarına sahiptir.",
  },
  {
    question: "İptal, iade ve değişim süreçleri nasıl işlemektedir?",
    answer:
      "Tüketici Kanunu gereği satın aldığınız ürünü teslim aldığınız tarihten itibaren 14 gün içerisinde herhangi bir gerekçe göstermeksizin iade edebilir veya değiştirebilirsiniz. İade edilecek ürünün kullanılmamış, kutusunun ve koruyucu ambalajlarının zarar görmemiş olması gerekmektedir.",
  },
  {
    question: "Hangi ödeme yöntemlerini destekliyorsunuz?",
    answer:
      "E-ticaret platformumuz üzerinden tüm bankaların kredi ve banka kartları ile 3D Secure güvenli ödeme altyapısıyla alışveriş yapabilirsiniz. Ayrıca alışverişlerinizde peşin fiyatına taksit veya havale/EFT seçeneklerimiz de mevcuttur.",
  },
]

// 2) Uzman (İnşaat Mühendisi) Olmak — PDF: Hizmet/Uzman Dizini, doğrulama, üyelik
const EXPERT_FAQS: FaqItem[] = [
  {
    question: "İnşaat mühendisi olarak platforma nasıl katılırım?",
    answer:
      "“Uzman Ol” sayfasındaki ön kayıt formunu doldurmanız yeterli. Uzmanlık alanlarınızı, hizmet bölgenizi ve iletişim bilgilerinizi belirtirsiniz. Bu, doğrulanmış uzman dizinimize ilk adımdır; ücretsiz ve taahhütsüzdür.",
  },
  {
    question: "Profilim doğrulama olmadan yayınlanır mı?",
    answer:
      "Hayır. Süreç şöyle işler: Ön Kayıt → Belge (diploma, oda/İMO kaydı, ilgili lisanslar) → İnceleme (ekibimizce elle) → Onay → Yayın. Bir profil onaylanana kadar halka GÖRÜNMEZ. Tek bir eksik/sahte profil tüm dizinin güvenini bozacağı için doğrulama platformun kalbidir.",
  },
  {
    question: "Hangi uzmanlık alanları var, birden fazla seçebilir miyim?",
    answer:
      "Sabit bir listeden seçersiniz (serbest metin yok, filtreler bozulmasın diye): Bina Risk & Hasar Tespiti, Güçlendirme (Retrofit), Statik/Betonarme Proje, Zemin Etüdü & Geoteknik, Yapı Denetimi, Kentsel Dönüşüm Danışmanlığı ve Deprem Performans Analizi. Birden fazla alan seçebilirsiniz; her uzmanlık ayrı ayrı doğrulanır.",
  },
  {
    question: "Hizmet bölgemi nasıl belirlerim?",
    answer:
      "Hizmet bölgenizi siz seçersiniz, biz dayatmayız. Ana konum (büro/oturduğunuz il + ilçe) zorunludur; dilerseniz ek bölgeler ekleyebilirsiniz. Kapsayabileceğiniz bölge sayısı üyelik paketinize bağlı olacaktır.",
  },
  {
    question: "Üyelik ücreti veya komisyon var mı?",
    answer:
      "Şu an ön kayıt tamamen ücretsizdir. İleride dizinde yer almak için katmanlı bir üyelik planlanıyor (Temel: listede yer al · Üst: öne çık, daha geniş kapsam). Platform işlemin/sözleşmenin içine girmez; komisyon, escrow veya ödeme aracılığı YOKTUR. Tek gelir kalemi uzman üyeliğidir.",
  },
  {
    question: "Müşteriyle iletişim nasıl olacak, telefonum herkese mi açık?",
    answer:
      "Başlangıçta dizin “pasif” çalışır: vatandaş sizi il/ilçe ve uzmanlık filtreleriyle bulur ve belirttiğiniz kanaldan ulaşır. İlerleyen aşamada, telefonunuzu gizli tutabileceğiniz ve taleplerin gelen kutunuza düştüğü bir “talep bırak” formu da eklenecektir.",
  },
]

// 3) Uygulayıcı (Yüklenici) Olmak — fiziki inşaat/güçlendirme uygulaması
const IMPLEMENTER_FAQS: FaqItem[] = [
  {
    question: "Mühendis ile uygulayıcı arasındaki fark nedir?",
    answer:
      "İnşaat mühendisi “beyin”dir: binayı değerlendirir, risk tespiti yapar ve güçlendirme/statik projeyi tasarlar. Uygulayıcı/yüklenici ise “eller”dir: bu projeyi sahada fiziken hayata geçirir (güçlendirme uygulaması, çelik/karbon fiber işçiliği, inşaat, temel-perde vb.). Platform ikisini de ayrı ayrı doğrulanmış dizinlerde buluşturur.",
  },
  {
    question: "Uygulayıcı olarak nasıl katılırım?",
    answer:
      "“Uygulayıcı Ol” sayfasındaki ön kayıt formunu doldurmanız yeterli. Uygulama alanlarınızı, hizmet bölgenizi ve iletişim bilgilerinizi belirtirsiniz. Ön kayıt ücretsiz ve taahhütsüzdür.",
  },
  {
    question: "Profilim doğrulama olmadan yayınlanır mı?",
    answer:
      "Hayır. Süreç: Ön Kayıt → Belge (yetki belgesi, vergi mükellefiyeti, iş referansları) → İnceleme → Onay → Yayın. Onaylanmadan profiliniz halka görünmez; ehliyetsiz/merdiven altı firmalar dizinde yer alamaz.",
  },
  {
    question: "Hangi uygulama alanları var?",
    answer:
      "Güçlendirme Uygulaması (Retrofit), Karbon Fiber/FRP, Çelik Güçlendirme, Temel & Perde/Mantolama, İnşaat/Kaba Yapım, Zemin İyileştirme, Yıkım & Hafriyat, Tadilat & Onarım. Birden fazla alan seçebilirsiniz; her biri ayrı doğrulanır.",
  },
  {
    question: "Ürün de satabilir miyim?",
    answer:
      "Bu dizin hizmet/uygulama içindir; ürün satışı platformda depremTek Market mağazası üzerinden yürür. Siz fiziki uygulama (işçilik/proje) tarafında yer alırsınız.",
  },
]

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata")
  return {
    title: t("faqTitle"),
    description: t("faqDescription"),
  }
}

function FaqSection({
  eyebrow,
  title,
  description,
  items,
  cta,
}: {
  eyebrow: string
  title: string
  description: string
  items: FaqItem[]
  cta?: { href: string; label: string }
}) {
  return (
    <section className="mb-12">
      <div className="mb-5">
        <span className="text-brand-650 text-xs font-semibold tracking-wider uppercase">
          {eyebrow}
        </span>
        <h2 className="text-xl sm:text-2xl font-extrabold text-ui-fg-base tracking-tight mt-1">
          {title}
        </h2>
        <p className="text-ui-fg-muted text-sm mt-1">{description}</p>
      </div>
      <div className="space-y-4">
        <FaqAccordion items={items} />
      </div>
      {cta && (
        <div className="mt-5">
          <LocalizedClientLink
            href={cta.href}
            className="inline-flex items-center gap-1 bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 px-6 rounded-lg text-sm transition-colors shadow-sm"
          >
            {cta.label} →
          </LocalizedClientLink>
        </div>
      )}
    </section>
  )
}

export default async function SikcaSorulanSorularPage() {
  const isTr = (await getLocale()) === "tr"

  if (!isTr) {
    return (
      <div className="content-container max-w-4xl py-16 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-ui-fg-base tracking-tight mb-8">
          Frequently Asked Questions
        </h1>
        <div className="prose prose-slate max-w-none text-ui-fg-subtle space-y-6">
          <p>
            Please check our FAQ in Turkish for detailed questions or contact us
            directly at destek@depremtek.market.
          </p>
          <div className="pt-8">
            <LocalizedClientLink href="/" className="text-brand-600 hover:underline font-semibold">
              &larr; Return to Home Page
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="content-container max-w-4xl py-16 px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-brand-650 text-xs font-semibold tracking-wider uppercase bg-brand-50 px-3 py-1 rounded-full border border-brand-100">
          Destek Merkezi
        </span>
        <h1 className="text-3xl font-extrabold text-ui-fg-base tracking-tight mt-3 mb-2">
          Sıkça Sorulan Sorular
        </h1>
        <p className="text-ui-fg-subtle text-sm sm:text-base leading-relaxed">
          Alışveriş, uzman (mühendis) olma ve uygulayıcı (yüklenici) olma
          süreçleri hakkında en çok merak edilenler. Size uygun başlığı inceleyin.
        </p>
      </div>

      {/* Hızlı geçiş sekmeleri */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        <a href="#alisveris" className="text-sm font-semibold px-4 py-1.5 rounded-full border border-ui-border-base hover:border-brand-400 hover:text-brand-600 transition-colors">
          Alışveriş & Sipariş
        </a>
        <a href="#uzman" className="text-sm font-semibold px-4 py-1.5 rounded-full border border-ui-border-base hover:border-brand-400 hover:text-brand-600 transition-colors">
          Uzman (Mühendis) Olmak
        </a>
      </div>

      <div id="alisveris" className="scroll-mt-24">
        <FaqSection
          eyebrow="Halk · Alışveriş"
          title="Alışveriş & Sipariş"
          description="Ürünlerimiz, kargo, iade ve ödeme ile ilgili sorular."
          items={SHOPPING_FAQS}
        />
      </div>

      <div id="uzman" className="scroll-mt-24">
        <FaqSection
          eyebrow="İnşaat Mühendisleri"
          title="Uzman (Mühendis) Olmak"
          description="Doğrulanmış uzman dizinine katılım, belge doğrulama ve üyelik süreci."
          items={EXPERT_FAQS}
          cta={{ href: "/uzman-ol", label: "Uzman Ön Kaydı Yap" }}
        />
      </div>

      <div className="mt-4 p-6 bg-ui-bg-subtle border border-ui-border-base rounded-xl text-center">
        <h3 className="font-bold text-ui-fg-base text-base mb-1">
          Aradığınız cevabı bulamadınız mı?
        </h3>
        <p className="text-sm text-ui-fg-muted mb-4">
          Destek ekibimiz size yardımcı olmak için her zaman hazır.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <LocalizedClientLink
            href="/iletisim"
            className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 px-6 rounded-lg text-sm transition-colors shadow-sm"
          >
            Bize Yazın
          </LocalizedClientLink>
          <a
            href="https://api.whatsapp.com/send?phone=905395741904"
            target="_blank"
            rel="noreferrer"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-6 rounded-lg text-sm transition-colors shadow-sm"
          >
            WhatsApp Destek
          </a>
        </div>
      </div>

      <div className="pt-8 border-t mt-12">
        <LocalizedClientLink href="/" className="text-brand-600 hover:underline font-semibold">
          &larr; Ana Sayfaya Dön
        </LocalizedClientLink>
      </div>
    </div>
  )
}
