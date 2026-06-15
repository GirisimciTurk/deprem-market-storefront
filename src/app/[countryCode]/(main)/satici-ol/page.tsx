import { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import FaqAccordion, {
  type FaqItem,
} from "@modules/common/components/faq-accordion"
import ResellerForm from "./reseller-form"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata")
  return {
    title: t("dealershipFormTitle"),
    description: t("dealershipFormDescription"),
  }
}

const STEPS = [
  {
    no: "1",
    title: "Başvur",
    desc: "Aşağıdaki formu doldur. Birkaç dakikada başvurunu tamamla.",
  },
  {
    no: "2",
    title: "Onay & Mağaza",
    desc: "Ekibimiz başvurunu inceler; onaylandığında satıcı mağazan açılır.",
  },
  {
    no: "3",
    title: "Ürünlerini Ekle",
    desc: "Panelinden ürünlerini, fiyat ve stoklarını kolayca yükle.",
  },
  {
    no: "4",
    title: "Sat & Kazan",
    desc: "Siparişleri hazırla, kargola; kazancın periyodik olarak hesabına geçsin.",
  },
]

const BENEFITS = [
  {
    icon: "🛒",
    title: "Hazır Müşteri Kitlesi",
    desc: "Afet ve acil durum hazırlığı arayan binlerce ziyaretçiye ilk günden ulaş.",
  },
  {
    icon: "🏪",
    title: "Kolay Mağaza Yönetimi",
    desc: "Ürün, fiyat, stok ve siparişlerini tek panelden dakikalar içinde yönet.",
  },
  {
    icon: "🔒",
    title: "Güvenli & Zamanında Ödeme",
    desc: "Tahsilat altyapısı bizde; hak edişlerin düzenli olarak hesabına aktarılır.",
  },
  {
    icon: "🚚",
    title: "Kargo & Lojistik Kolaylığı",
    desc: "Anlaşmalı kargo ile siparişlerini hızlıca gönder, panelden takip et.",
  },
  {
    icon: "📈",
    title: "Görünürlük & Pazarlama",
    desc: "Kampanya, push bildirim ve öne çıkan ürün alanlarıyla satışını büyüt.",
  },
  {
    icon: "🤝",
    title: "Satıcı Desteği",
    desc: "Başvurudan ilk satışına kadar her adımda ekibimiz yanında.",
  },
]

const FAQS: FaqItem[] = [
  {
    question: "Deprem Market'te nasıl satıcı olurum?",
    answer:
      "Bu sayfadaki başvuru formunu doldurman yeterli. Başvurun ekibimiz tarafından incelenir; uygun bulunduğunda satıcı mağazan açılır, panelinden ürünlerini ekleyip satışa başlarsın.",
  },
  {
    question: "Satıcı olmak için neye ihtiyacım var?",
    answer:
      "Vergi mükellefiyeti (şahıs ya da limited/anonim şirket), geçerli bir vergi numarası ve iletişim bilgilerin yeterli. Onay sürecinde gerekli evraklar tarafına ayrıca iletilir.",
  },
  {
    question: "Komisyon oranı nedir?",
    answer:
      "Komisyon oranı ürün kategorisine göre değişir ve başvurun onaylanırken net olarak seninle paylaşılır. Başvuru ve mağaza açılışı için ücret alınmaz.",
  },
  {
    question: "Ödemelerim ne zaman yapılır?",
    answer:
      "Siparişler müşteriye teslim edilip yasal iade süresi tamamlandıktan sonra, komisyon kesintisi düşülerek hak edişlerin periyodik olarak banka hesabına aktarılır.",
  },
  {
    question: "Hangi ürünleri satabilirim?",
    answer:
      "Deprem çantaları, ilk yardım, aydınlatma, ısınma, güvenlik ve afet/outdoor hazırlığına uygun ürünleri satabilirsin. Mevzuata aykırı ve yasaklı ürünler platformda satılamaz.",
  },
  {
    question: "Siparişleri nasıl kargolarım?",
    answer:
      "Gönderiyi sen yaparsın ve iki seçeneğin olur: (1) Anlaşmalı Kargo — Deprem Market'in anlaşmalı kargosuyla gönderirsin, kargo ücreti hak edişinden düşülür; (2) Kendi Kargon — kendi anlaştığın kargo firmasıyla gönderirsin, bu durumda senden kargo ücreti kesilmez. Her iki seçenekte de panelden kargo firmasını ve takip numarasını girersin; müşteri ve sen süreci takip edersiniz.",
  },
  {
    question: "Kendi kargo anlaşmamla gönderebilir miyim?",
    answer:
      "Evet. 'Kendi Kargom' seçeneğiyle kendi anlaştığın kargo firmasını kullanabilir, panele kargo firmasını ve takip numaranı girebilirsin. Listede olmayan bir firmayla gönderiyorsan takip bağlantısını elle de ekleyebilirsin; müşteri yine 'Kargom Nerede?' bağlantısından gönderisini takip eder.",
  },
  {
    question: "Başvurum ne kadar sürede sonuçlanır?",
    answer:
      "Başvurular genellikle birkaç iş günü içinde değerlendirilir. Sonuç, başvuruda belirttiğin telefon veya e-posta üzerinden iletilir; durumu hesabındaki 'Satıcı Başvurum' sayfasından da takip edebilirsin.",
  },
]

export default async function SaticiOlPage() {
  const isTr = (await getLocale()) === "tr"

  if (!isTr) {
    return (
      <div className="content-container max-w-4xl py-16 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-ui-fg-base tracking-tight mb-8">
          Become a Seller
        </h1>
        <div className="prose prose-slate max-w-none text-ui-fg-subtle space-y-6">
          <p>
            Sell your earthquake-preparedness and outdoor products to thousands
            of customers on Deprem Market. To apply, please email us at
            destek@ekyp.com.
          </p>
          <div className="pt-8">
            <LocalizedClientLink
              href="/"
              className="text-brand-600 hover:underline font-semibold"
            >
              &larr; Return to Home Page
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="content-container max-w-6xl py-16 px-4 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <span className="text-brand-650 text-xs font-semibold tracking-wider uppercase bg-brand-50 px-3 py-1 rounded-full border border-brand-100">
          Deprem Market Pazaryeri
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ui-fg-base tracking-tight mt-3 mb-4">
          Deprem Market'te Satıcı Ol
        </h1>
        <p className="text-ui-fg-subtle text-sm sm:text-base leading-relaxed">
          Ürünlerini Türkiye'nin afet ve acil durum hazırlık pazaryerinde
          binlerce müşteriye sat. Mağazanı aç, ürünlerini ekle, kazanmaya başla.
        </p>
        <div className="mt-6">
          <a
            href="#basvuru"
            className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-8 rounded-xl text-sm transition-all shadow-md hover:-translate-y-0.5 duration-200"
          >
            Hemen Başvur
          </a>
        </div>
      </div>

      {/* Nasıl çalışır? */}
      <div className="mb-16">
        <h2 className="text-center text-xl font-extrabold text-ui-fg-base mb-8">
          Nasıl Çalışır?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map((s) => (
            <div
              key={s.no}
              className="relative border border-ui-border-base rounded-2xl bg-ui-bg-subtle p-6"
            >
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-600 text-white font-extrabold text-lg mb-4">
                {s.no}
              </span>
              <h3 className="font-bold text-ui-fg-base text-sm mb-1">
                {s.title}
              </h3>
              <p className="text-xs text-ui-fg-muted leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Avantajlar */}
      <div className="mb-16">
        <h2 className="text-center text-xl font-extrabold text-ui-fg-base mb-8">
          Neden Deprem Market'te Satmalısın?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className="border border-ui-border-base rounded-2xl bg-ui-bg-subtle p-6 hover:shadow-md transition-shadow"
            >
              <span className="text-2xl">{b.icon}</span>
              <h3 className="font-bold text-ui-fg-base text-sm mt-3 mb-1">
                {b.title}
              </h3>
              <p className="text-xs text-ui-fg-muted leading-relaxed">
                {b.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Başvuru formu */}
      <div id="basvuru" className="scroll-mt-24 mb-16">
        <div className="max-w-2xl mx-auto border border-ui-border-base rounded-2xl bg-ui-bg-subtle p-6 sm:p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-extrabold text-ui-fg-base">
              Satıcı Başvuru Formu
            </h2>
            <p className="text-xs text-ui-fg-muted mt-1">
              Bilgilerini bırak, ekibimiz en kısa sürede dönüş yapsın.
            </p>
          </div>
          <ResellerForm />
        </div>
      </div>

      {/* SSS — sürecin nasıl işlediği */}
      <div className="max-w-3xl mx-auto mb-12">
        <h2 className="text-center text-xl font-extrabold text-ui-fg-base mb-2">
          Sıkça Sorulan Sorular
        </h2>
        <p className="text-center text-sm text-ui-fg-muted mb-8">
          Satıcılık sürecinin nasıl işlediğine dair en çok merak edilenler.
        </p>
        <FaqAccordion items={FAQS} defaultOpen={0} />
      </div>

      <div className="pt-8 border-t">
        <LocalizedClientLink
          href="/"
          className="text-brand-600 hover:underline font-semibold"
        >
          &larr; Ana Sayfaya Dön
        </LocalizedClientLink>
      </div>
    </div>
  )
}
