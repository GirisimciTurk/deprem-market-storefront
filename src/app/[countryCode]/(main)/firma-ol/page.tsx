import { Metadata } from "next"
import { getLocale } from "next-intl/server"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import FaqAccordion, {
  type FaqItem,
} from "@modules/common/components/faq-accordion"
import CollapsibleSection from "@modules/common/components/collapsible-section"
import FirmaForm from "./firma-form"

export const metadata: Metadata = {
  title: "Firmamız Olun | depremTek Market",
  description:
    "Firmanızla depremTek Market'te kendi mağazanızı açın, ürünlerinizi satın. Hizmeti baştan sona siz yürütürsünüz; biz yalnızca sattığınız ürünün komisyonunu alırız.",
}

const STEPS = [
  {
    no: "1",
    title: "Başvurun",
    desc: "Aşağıdaki formu doldurun. Firma bilgilerinizi ve satmak istediğiniz ürünleri birkaç dakikada iletin.",
  },
  {
    no: "2",
    title: "Onay & Mağaza",
    desc: "Başvurunuz onaylandığında kendi satıcı panelize erişim açılır; mağazanız kurulur.",
  },
  {
    no: "3",
    title: "Ürünlerinizi Ekleyin",
    desc: "Panelinizden ürünlerinizi, fiyat ve stoklarınızı kolayca yükleyip satışa çıkarın.",
  },
  {
    no: "4",
    title: "Sat & Hizmeti Kendin Yürüt",
    desc: "Siparişleri siz hazırlayıp gönderirsiniz, varsa hizmeti baştan sona siz yönetirsiniz. Biz yalnızca ürün komisyonunu alırız.",
  },
]

const BENEFITS = [
  {
    icon: "🛒",
    title: "Hazır Müşteri Kitlesi",
    desc: "Afet ve acil durum hazırlığı arayan binlerce müşteriye ilk günden mağazanızla ulaşırsınız.",
  },
  {
    icon: "🏪",
    title: "Kendi Mağazan, Tam Kontrol",
    desc: "Ürün, fiyat, stok ve siparişlerinizi kendi satıcı panelinizden yönetir; süreci baştan sona siz yürütürsünüz.",
  },
  {
    icon: "💸",
    title: "Sadece Ürün Komisyonu",
    desc: "Sizden yalnızca mağazanızda sattığınız ürünün komisyonunu alırız; başvuru ve mağaza açılışı ücretsizdir.",
  },
  {
    icon: "🛠️",
    title: "Hizmeti Kendiniz Yönetirsiniz",
    desc: "Ürününüze bağlı kurulum/hizmeti kendiniz taahhüt eder, müşteriyle süreci doğrudan siz yürütürsünüz.",
  },
  {
    icon: "🔒",
    title: "Güvenli & Zamanında Ödeme",
    desc: "Tahsilat altyapısı bizde; ürün satış hak edişleriniz düzenli olarak hesabınıza aktarılır.",
  },
  {
    icon: "📈",
    title: "Marka Gücü & Pazarlama",
    desc: "depremTek Market markasının güveni, kampanyalar ve bildirimlerle mağazanızın satışını büyütürsünüz.",
  },
]

const FAQS: FaqItem[] = [
  {
    question: "'Firmamız Ol' ile 'Bayimiz Ol' arasındaki fark nedir?",
    answer:
      "Firmamız Ol; kendi mağazasını açıp ÜRÜN satan, varsa hizmeti de baştan sona kendi yürüten firmalar içindir — biz yalnızca sattığınız ürünün komisyonunu alırız. Bayimiz Ol ise ürün satmaktan çok HİZMET veren, bunu bizimle ortak yürüten ve müşterisini bizim yönlendirdiğimiz iş ortakları içindir. Ürün satmak istiyorsanız Firmamız Ol doğru seçenektir.",
  },
  {
    question: "Firma olmak için neye ihtiyacım var?",
    answer:
      "Vergi mükellefiyeti (şahıs ya da limited/anonim şirket), geçerli bir vergi numarası ve iletişim bilgileriniz yeterli. Onay sürecinde gerekli evraklar tarafınıza ayrıca iletilir.",
  },
  {
    question: "Komisyon nasıl işliyor?",
    answer:
      "Sizden yalnızca mağazanızda sattığınız ürünün komisyonunu keseriz. Komisyon oranı ürün kategorisine göre değişir ve başvurunuz onaylanırken net olarak paylaşılır. Başvuru ve mağaza açılışı için ücret alınmaz.",
  },
  {
    question: "Ürünüme bağlı hizmeti/kurulumu kim yürütür?",
    answer:
      "Hizmeti/kurulumu baştan sona siz taahhüt eder ve müşteriyle süreci doğrudan siz yönetirsiniz. Biz bu hizmet sürecine karışmayız; yalnızca ürün satışından komisyon alırız.",
  },
  {
    question: "Siparişleri nasıl kargolarım?",
    answer:
      "Gönderiyi siz yaparsınız: (1) Anlaşmalı Kargo — depremTek Market'in anlaşmalı kargosuyla gönderirsiniz, ücreti hak edişinizden düşülür; (2) Kendi Kargonuz — kendi anlaştığınız firmayla gönderirsiniz. Her iki durumda da panelden kargo firmasını ve takip numarasını girersiniz.",
  },
  {
    question: "Başvurum ne kadar sürede sonuçlanır?",
    answer:
      "Başvurular genellikle birkaç iş günü içinde değerlendirilir. Sonuç, başvuruda belirttiğiniz telefon veya e-posta üzerinden iletilir.",
  },
]

export default async function FirmaOlPage() {
  const isTr = (await getLocale()) === "tr"

  if (!isTr) {
    return (
      <div className="content-container max-w-4xl py-16 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-ui-fg-base tracking-tight mb-8">
          Open Your Store
        </h1>
        <div className="prose prose-slate max-w-none text-ui-fg-subtle space-y-6">
          <p>
            Open your own store on depremTek Market and sell your products to
            thousands of customers. You run any related service end-to-end
            yourself; we only take a commission on the products you sell. To
            apply, please email us at destek@depremtek.market.
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
      {/* Hero (sade) */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ui-fg-base tracking-tight">
          Türkiye Deprem Sektörü Firma Rehberimize
          <span className="block mt-2 font-serif italic font-medium text-brand-600 text-3xl sm:text-4xl">
            Hoş Geldiniz
          </span>
        </h1>
        <p className="text-ui-fg-subtle text-sm sm:text-base leading-relaxed mt-4">
          Deprem ile ilgili her türlü ürün ve hizmet üreten, satan veya hizmet
          veren işletmenizi tek tıkla ücretsiz kaydedin. Türkiye&apos;nin en
          kapsamlı deprem firma rehberinde yerinizi alın.
        </p>
      </div>

      {/* Başvuru formu — en üstte */}
      <div id="basvuru" className="scroll-mt-24 mb-10">
        <div className="max-w-2xl mx-auto border border-ui-border-base rounded-2xl bg-ui-bg-subtle p-6 sm:p-8">
          <FirmaForm />
        </div>
      </div>

      {/* Bilgi bölümleri — açılır kartlar */}
      <div className="max-w-3xl mx-auto space-y-4 mb-12">
        <CollapsibleSection
          title="Nasıl Çalışır?"
          subtitle="4 adımda mağazanızı açın"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </CollapsibleSection>

        <CollapsibleSection
          title="Firmamız Olursanız Ne Kazanırsınız?"
          subtitle="Avantajlarınız"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </CollapsibleSection>

        <CollapsibleSection
          title="Sıkça Sorulan Sorular"
          subtitle="Firma (satıcı) süreci hakkında en çok merak edilenler"
        >
          <FaqAccordion items={FAQS} defaultOpen={null} />
        </CollapsibleSection>
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
