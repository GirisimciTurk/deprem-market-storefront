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
    title: "Başvurun",
    desc: "Aşağıdaki formu doldurun. Birkaç dakikada bayilik başvurunuzu tamamlayın.",
  },
  {
    no: "2",
    title: "Onay & Bayilik",
    desc: "Ekibimiz başvurunuzu inceler; onaylandığında bayilik paneliniz açılır.",
  },
  {
    no: "3",
    title: "Ürünlerinizi Ekleyin",
    desc: "Panelinizden ürünlerinizi, fiyat ve stoklarınızı kolayca yükleyin.",
  },
  {
    no: "4",
    title: "Satış & Kazanç",
    desc: "Siparişleri hazırlayıp kargolayın; kazancınız periyodik olarak hesabınıza aktarılsın.",
  },
]

const BENEFITS = [
  {
    icon: "🛒",
    title: "Hazır Müşteri Kitlesi",
    desc: "Afet ve acil durum hazırlığı arayan binlerce müşteriye ilk günden ulaşırsınız.",
  },
  {
    icon: "🏪",
    title: "Kolay Bayilik Yönetimi",
    desc: "Ürün, fiyat, stok ve siparişlerinizi tek panelden dakikalar içinde yönetirsiniz.",
  },
  {
    icon: "🔒",
    title: "Güvenli & Zamanında Ödeme",
    desc: "Tahsilat altyapısı bizde; hak edişleriniz düzenli olarak hesabınıza aktarılır.",
  },
  {
    icon: "🚚",
    title: "Kargo & Lojistik Kolaylığı",
    desc: "Anlaşmalı kargo ile siparişlerinizi hızlıca gönderir, panelden takip edersiniz.",
  },
  {
    icon: "📈",
    title: "Marka Gücü & Pazarlama",
    desc: "Deprem Market markasının güveni, kampanyalar ve push bildirimlerle satışınızı büyütürsünüz.",
  },
  {
    icon: "🤝",
    title: "Bayi Desteği",
    desc: "Başvurudan ilk satışınıza kadar her adımda ekibimiz yanınızda.",
  },
]

const FAQS: FaqItem[] = [
  {
    question: "Deprem Market bayisi nasıl olurum?",
    answer:
      "Bu sayfadaki başvuru formunu doldurmanız yeterli. Başvurunuz ekibimiz tarafından incelenir; uygun bulunduğunda bayilik paneliniz açılır, panelinizden ürünlerinizi ekleyip satışa başlarsınız.",
  },
  {
    question: "Bayi olmak için neye ihtiyacım var?",
    answer:
      "Vergi mükellefiyeti (şahıs ya da limited/anonim şirket), geçerli bir vergi numarası ve iletişim bilgileriniz yeterli. Onay sürecinde gerekli evraklar tarafınıza ayrıca iletilir.",
  },
  {
    question: "Bayilik komisyon oranı nedir?",
    answer:
      "Komisyon oranı ürün kategorisine göre değişir ve başvurunuz onaylanırken net olarak sizinle paylaşılır. Başvuru ve bayilik açılışı için herhangi bir ücret alınmaz.",
  },
  {
    question: "Ödemelerim ne zaman yapılır?",
    answer:
      "Siparişler müşteriye teslim edilip yasal iade süresi tamamlandıktan sonra, komisyon kesintisi düşülerek hak edişleriniz periyodik olarak banka hesabınıza aktarılır.",
  },
  {
    question: "Hangi ürünleri satabilirim?",
    answer:
      "Deprem çantaları, ilk yardım, aydınlatma, ısınma, güvenlik ve afet/outdoor hazırlığına uygun ürünleri satabilirsiniz. Mevzuata aykırı ve yasaklı ürünler platformda satılamaz.",
  },
  {
    question: "Siparişleri nasıl kargolarım?",
    answer:
      "Gönderiyi siz yaparsınız ve iki seçeneğiniz olur: (1) Anlaşmalı Kargo — Deprem Market'in anlaşmalı kargosuyla gönderirsiniz, kargo ücreti hak edişinizden düşülür; (2) Kendi Kargonuz — kendi anlaştığınız kargo firmasıyla gönderirsiniz, bu durumda sizden kargo ücreti kesilmez. Her iki seçenekte de panelden kargo firmasını ve takip numarasını girersiniz; müşteri ve siz süreci takip edersiniz.",
  },
  {
    question: "Kendi kargo anlaşmamla gönderebilir miyim?",
    answer:
      "Evet. 'Kendi Kargom' seçeneğiyle kendi anlaştığınız kargo firmasını kullanabilir, panele kargo firmasını ve takip numaranızı girebilirsiniz. Listede olmayan bir firmayla gönderiyorsanız takip bağlantısını elle de ekleyebilirsiniz; müşteri yine 'Kargom Nerede?' bağlantısından gönderisini takip eder.",
  },
  {
    question: "Başvurum ne kadar sürede sonuçlanır?",
    answer:
      "Başvurular genellikle birkaç iş günü içinde değerlendirilir. Sonuç, başvuruda belirttiğiniz telefon veya e-posta üzerinden iletilir; durumu hesabınızdaki 'Bayilik Başvurum' sayfasından da takip edebilirsiniz.",
  },
]

export default async function SaticiOlPage() {
  const isTr = (await getLocale()) === "tr"

  if (!isTr) {
    return (
      <div className="content-container max-w-4xl py-16 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-ui-fg-base tracking-tight mb-8">
          Become Our Dealer
        </h1>
        <div className="prose prose-slate max-w-none text-ui-fg-subtle space-y-6">
          <p>
            Join Deprem Market as an authorized dealer and offer engineered
            earthquake-preparedness and emergency products to thousands of
            customers. To apply, please email us at destek@ekyp.com.
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
          Deprem Market Yetkili Bayilik Programı
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ui-fg-base tracking-tight mt-3 mb-4">
          Deprem Market Bayimiz Olun
        </h1>
        <p className="text-ui-fg-subtle text-sm sm:text-base leading-relaxed">
          Türkiye'nin afet ve acil durum hazırlık platformunda yerinizi alın.
          Bayiliğinizi açın, ürünlerinizi binlerce müşteriye ulaştırın ve
          Deprem Market markasının gücüyle kazanmaya başlayın.
        </p>
        <div className="mt-6">
          <a
            href="#basvuru"
            className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-8 rounded-xl text-sm transition-all shadow-md hover:-translate-y-0.5 duration-200"
          >
            Hemen Başvurun
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
          Bayimiz Olursanız Ne Kazanırsınız?
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
              Bayilik Başvuru Formu
            </h2>
            <p className="text-xs text-ui-fg-muted mt-1">
              Bilgilerinizi bırakın, ekibimiz en kısa sürede dönüş yapsın.
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
          Bayilik sürecinin nasıl işlediğine dair en çok merak edilenler.
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
